/**
 * lib/alegra/delivery-sync.ts
 *
 * Implementación de confirmarEntregaYDescontarStock.
 *
 * Descuenta inventario en Alegra por cada producto de una orden que tenga vínculo
 * (alegra_item_id configurado). Solo corre en servidor. No importar desde cliente.
 *
 * Garantías:
 * - Idempotente: la clave `adj_{order_id}_{product_id}` impide doble descuento.
 * - Sin inconsistencia silenciosa: cada resultado (success, failed, omitted, pending_unresolved)
 *   está explícitamente categorizado en el objeto de retorno.
 * - Fallo parcial: los productos procesados con éxito no se revierten; el log
 *   expone exactamente qué falta para corrección manual o reintento.
 * - Pending vencido: se verifica contra Alegra antes de reintentar para evitar
 *   doble descuento ante cortes de red en la respuesta de vuelta.
 */

import { alegraRequest, AlegraApiError } from './client'
import { createAdminClient } from '@/lib/supabase/admin'
import type {
  AlegraSyncLogRow,
  AlegraInventoryAdjustment,
  DeliveryStockResult,
  DeliverySuccessItem,
  DeliveryFailedItem,
  DeliveryOmittedItem,
  DeliveryPendingUnresolved,
} from './types'

// ─── Configuración ────────────────────────────────────────────────────────────

/**
 * Tiempo en minutos tras el cual un pending se considera vencido y
 * elegible para verificación contra Alegra. Configurable, nunca hardcodeado.
 */
function getPendingTimeoutMs(): number {
  const raw = process.env.ALEGRA_PENDING_TIMEOUT_MINUTES
  const minutes = raw ? parseInt(raw, 10) : 5
  return (isNaN(minutes) || minutes < 1 ? 5 : minutes) * 60 * 1000
}

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface OrderItemWithLink {
  id: string            // order_item.id (no se usa en llave, solo para referencia)
  product_id: string
  quantity: number
  unit_price: number
  alegra_item_id: number | null
  alegra_reference: string | null
}

interface WarehouseLink {
  warehouse_id: string
  alegra_warehouse_id: number
}

/** Respuesta parcial del endpoint GET /inventory-adjustments de Alegra */
interface AlegraAdjustmentListItem {
  id: number
  date: string
  type: string
  status?: string
  inventories?: Array<{
    itemId: number
    warehouseId: number
    quantity: number
  }>
}

// ─── Helpers de configuración ────────────────────────────────────────────────

/**
 * Clave de idempotencia única por (order, product).
 * Formato: `adj_{order_id}_{product_id}`
 * Esta clave identifica un ajuste de inventario en toda la vida del sistema.
 */
function buildIdempotencyKey(orderId: string, productId: string): string {
  return `adj_${orderId}_${productId}`
}

// ─── Lectura de datos de orden ────────────────────────────────────────────────

async function fetchOrderItems(orderId: string): Promise<OrderItemWithLink[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('order_items')
    .select(`
      id,
      product_id,
      quantity,
      unit_price,
      products (
        alegra_item_id,
        alegra_reference
      )
    `)
    .eq('order_id', orderId)

  if (error) throw new Error(`Error al leer order_items: ${error.message}`)
  if (!data || data.length === 0) return []

  return data.map((item: any) => ({
    id: item.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    alegra_item_id: item.products?.alegra_item_id ?? null,
    alegra_reference: item.products?.alegra_reference ?? null,
  }))
}

/**
 * Busca la bodega por defecto activa para el despacho.
 * Si hay solo una bodega con alegra_warehouse_id, la usa.
 * Si hay múltiples, usa la marcada como active = true con alegra_warehouse_id.
 * Retorna null si no hay ninguna configurada.
 */
async function resolveDispatchWarehouse(): Promise<WarehouseLink | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('warehouses')
    .select('id, alegra_warehouse_id')
    .eq('active', true)
    .not('alegra_warehouse_id', 'is', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (error || !data) return null
  return { warehouse_id: data.id, alegra_warehouse_id: data.alegra_warehouse_id! }
}

// ─── Lectura y escritura del sync log ────────────────────────────────────────

async function getLogEntry(idempotencyKey: string): Promise<AlegraSyncLogRow | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('alegra_sync_log')
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle()
  return data as AlegraSyncLogRow | null
}

async function insertPendingLog(params: {
  idempotencyKey: string
  orderId: string
  productId: string
  warehouse: WarehouseLink
  alegraItemId: number
  quantity: number
}): Promise<void> {
  const supabase = createAdminClient()
  await supabase.from('alegra_sync_log').insert({
    idempotency_key: params.idempotencyKey,
    order_id: params.orderId,
    product_id: params.productId,
    warehouse_id: params.warehouse.warehouse_id,
    alegra_warehouse_id: params.warehouse.alegra_warehouse_id,
    alegra_item_id: params.alegraItemId,
    quantity: params.quantity,
    operation_type: 'out',
    result: 'pending',
  })
}

async function updateLog(
  idempotencyKey: string,
  update: {
    result: 'success' | 'error'
    alegra_adjustment_id?: number | null
    error_message?: string | null
  }
): Promise<void> {
  const supabase = createAdminClient()
  await supabase
    .from('alegra_sync_log')
    .update({
      result: update.result,
      alegra_adjustment_id: update.alegra_adjustment_id ?? null,
      error_message: update.error_message ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('idempotency_key', idempotencyKey)
}

// ─── Verificación de pending vencido contra Alegra ───────────────────────────

/**
 * Consulta el historial de ajustes de inventario en Alegra para determinar si
 * un ajuste de salida ya fue aplicado (aunque el log local quedó en pending).
 *
 * Busca ajustes de tipo 'out' para el ítem y bodega, creados cerca del timestamp
 * del registro pending, y verifica que la cantidad coincida.
 *
 * @returns 'found' si hay evidencia clara del ajuste ya aplicado,
 *          'not_found' si no hay evidencia (proceder a reintentar),
 *          'verification_failed' si Alegra no respondió (mantener en pending)
 */
async function verifyAdjustmentInAlegra(params: {
  alegraItemId: number
  alegraWarehouseId: number
  quantity: number
  pendingCreatedAt: string
}): Promise<'found' | 'not_found' | 'verification_failed'> {
  const { alegraItemId, alegraWarehouseId, quantity, pendingCreatedAt } = params

  // Ventana de búsqueda: desde 1 minuto antes del pending hasta ahora
  const pendingDate = new Date(pendingCreatedAt)
  const windowStart = new Date(pendingDate.getTime() - 60 * 1000)
  const windowEnd = new Date(pendingDate.getTime() + getPendingTimeoutMs() + 60 * 1000)

  // Formato fecha para la API de Alegra: YYYY-MM-DD
  const dateFrom = windowStart.toISOString().split('T')[0]
  const dateTo = windowEnd.toISOString().split('T')[0]

  try {
    // GET /inventory-adjustments filtrando por ítem, tipo salida y rango de fechas.
    // La API de Alegra acepta `type=out`, `itemId` y `dateFrom`/`dateTo` como query params.
    const adjustments = await alegraRequest<AlegraAdjustmentListItem[]>(
      '/inventory-adjustments',
      {
        params: {
          type: 'out',
          'inventory[0][itemId]': String(alegraItemId),
          dateFrom,
          dateTo,
        },
      }
    )

    if (!Array.isArray(adjustments) || adjustments.length === 0) {
      return 'not_found'
    }

    // Buscar si algún ajuste de la ventana contiene el ítem/bodega/cantidad esperados
    const found = adjustments.some(adj => {
      if (!adj.inventories) return false
      return adj.inventories.some(
        inv =>
          inv.itemId === alegraItemId &&
          inv.warehouseId === alegraWarehouseId &&
          inv.quantity === quantity
      )
    })

    return found ? 'found' : 'not_found'
  } catch (err) {
    // Alegra no respondió o devolvió error — no podemos decidir → mantener pending
    const message = err instanceof Error ? err.message : String(err)
    console.warn(
      `[delivery-sync] Verificación de pending fallida para ítem ${alegraItemId}: ${message}. Mantiene pending.`
    )
    return 'verification_failed'
  }
}

// ─── Llamada de escritura a Alegra ───────────────────────────────────────────

async function postInventoryAdjustment(params: {
  alegraItemId: number
  alegraWarehouseId: number
  quantity: number
  orderId: string
}): Promise<AlegraInventoryAdjustment> {
  const { alegraItemId, alegraWarehouseId, quantity, orderId } = params

  // Formato de ajuste de salida según la API de Alegra.
  // `observations` sirve como referencia trazable al número de orden interno.
  return await alegraRequest<AlegraInventoryAdjustment>('/inventory-adjustments', {
    method: 'POST',
    body: {
      date: new Date().toISOString().split('T')[0],
      type: 'out',
      observations: `Entrega orden ${orderId.slice(0, 8).toUpperCase()}`,
      inventories: [
        {
          item: { id: alegraItemId },
          warehouse: { id: alegraWarehouseId },
          quantity,
        },
      ],
    },
  })
}

// ─── Procesamiento de un item individual ─────────────────────────────────────

/**
 * Determina el estado previo de un item en el log y decide la acción:
 * - Sin log → insertar pending, ejecutar ajuste
 * - Log success → ya procesado, agregar a omitted
 * - Log error → reintentable (si retryFailedOnly, validar vínculo vigente)
 * - Log pending → si vencido: verificar en Alegra antes de decidir
 *                 si no vencido: omitir (hay llamada en vuelo activa)
 */
type ItemDecision =
  | { action: 'attempt'; logExists: boolean }
  | { action: 'skip_already_success' }
  | { action: 'skip_in_flight' }            // pending no vencido — llamada activa
  | { action: 'recover_to_success' }        // pending vencido verificado como exitoso en Alegra
  | { action: 'pending_unresolved'; reason: string } // verificación fallida
  | { action: 'skip_link_removed' }         // retryFailedOnly y el vínculo ya no existe

async function resolveItemDecision(params: {
  logEntry: AlegraSyncLogRow | null
  alegraItemId: number | null
  retryFailedOnly: boolean
}): Promise<ItemDecision> {
  const { logEntry, alegraItemId, retryFailedOnly } = params

  // retryFailedOnly: si el vínculo fue removido desde el intento original → omitir
  if (retryFailedOnly && !alegraItemId) {
    return { action: 'skip_link_removed' }
  }

  if (!logEntry) {
    // Primera vez → proceder normalmente
    return { action: 'attempt', logExists: false }
  }

  if (logEntry.result === 'success') {
    return { action: 'skip_already_success' }
  }

  if (logEntry.result === 'error') {
    // Error confirmado → reintentable (la decisión de si reintentar o no la toma el caller)
    return { action: 'attempt', logExists: true }
  }

  // result === 'pending'
  const pendingDate = new Date(logEntry.created_at).getTime()
  const age = Date.now() - pendingDate

  if (age < getPendingTimeoutMs()) {
    // Pending reciente → puede haber una llamada activa, no tocar
    return { action: 'skip_in_flight' }
  }

  // Pending vencido → verificar contra Alegra antes de cualquier decisión
  if (!logEntry.alegra_warehouse_id) {
    // No tenemos bodega registrada para verificar → tratar como no resuelto
    return {
      action: 'pending_unresolved',
      reason: 'pending vencido sin alegra_warehouse_id para verificar',
    }
  }

  const verification = await verifyAdjustmentInAlegra({
    alegraItemId: logEntry.alegra_item_id,
    alegraWarehouseId: logEntry.alegra_warehouse_id,
    quantity: logEntry.quantity,
    pendingCreatedAt: logEntry.created_at,
  })

  if (verification === 'found') {
    return { action: 'recover_to_success' }
  }
  if (verification === 'not_found') {
    return { action: 'attempt', logExists: true }
  }
  // verification_failed
  return {
    action: 'pending_unresolved',
    reason: 'verificación contra Alegra falló — Alegra no respondió',
  }
}

// ─── Función principal exportada ─────────────────────────────────────────────

export interface ConfirmarEntregaOptions {
  /**
   * Si true, solo procesa items de la orden que tienen result='error' o
   * pending vencido en el log. Items sin log o con result='success' se omiten.
   * Usar para reintentar una orden parcialmente fallida.
   */
  retryFailedOnly?: boolean
}

/**
 * Descuenta inventario en Alegra por cada producto de una orden que tenga
 * alegra_item_id configurado. Idempotente por diseño.
 *
 * @param orderId - UUID de la orden en Supabase
 * @param options - Opciones de comportamiento (retryFailedOnly)
 * @returns DeliveryStockResult con la categorización exacta de cada producto
 */
export async function confirmarEntregaYDescontarStock(
  orderId: string,
  options: ConfirmarEntregaOptions = {}
): Promise<DeliveryStockResult> {
  const { retryFailedOnly = false } = options

  const result: DeliveryStockResult = {
    order_id: orderId,
    success: [],
    failed: [],
    omitted: [],
    pending_unresolved: [],
  }

  // 1. Resolver bodega de despacho
  const warehouse = await resolveDispatchWarehouse()
  if (!warehouse) {
    throw new Error(
      '[delivery-sync] No hay ninguna bodega activa con alegra_warehouse_id configurado. ' +
      'Configura al menos una bodega en la tabla warehouses antes de sincronizar inventario.'
    )
  }

  // 2. Leer items de la orden con sus vínculos a Alegra
  const items = await fetchOrderItems(orderId)
  if (items.length === 0) return result

  // 3. Procesar cada item secuencialmente
  for (const item of items) {
    const { product_id, quantity, alegra_item_id } = item
    const idempotencyKey = buildIdempotencyKey(orderId, product_id)

    // Producto sin vínculo → omitir silenciosamente (con registro en omitted)
    if (!alegra_item_id) {
      result.omitted.push({ product_id, reason: 'no_alegra_link' })
      continue
    }

    // Leer estado previo del log para este par (order, product)
    const logEntry = await getLogEntry(idempotencyKey)

    // Determinar qué hacer con este item
    const decision = await resolveItemDecision({
      logEntry,
      alegraItemId: alegra_item_id,
      retryFailedOnly,
    })

    // ── Manejar cada decisión ──────────────────────────────────────────────

    if (decision.action === 'skip_already_success') {
      result.omitted.push({ product_id, reason: 'already_success' })
      continue
    }

    if (decision.action === 'skip_in_flight') {
      // Hay un pending reciente — contarlo como pending_unresolved sin alterar el log
      result.pending_unresolved.push({
        product_id,
        alegra_item_id,
        reason: 'pending reciente (posible llamada en vuelo), no se modifica',
      })
      continue
    }

    if (decision.action === 'skip_link_removed') {
      result.omitted.push({ product_id, reason: 'retry_link_removed' })
      continue
    }

    if (decision.action === 'pending_unresolved') {
      result.pending_unresolved.push({
        product_id,
        alegra_item_id,
        reason: decision.reason,
      })
      continue
    }

    if (decision.action === 'recover_to_success') {
      // Alegra confirma que el ajuste sí se aplicó — corregir el log sin nueva llamada
      await updateLog(idempotencyKey, {
        result: 'success',
        alegra_adjustment_id: null, // no tenemos el id del ajuste original, pero el ajuste existe
        error_message: null,
      })
      result.success.push({
        product_id,
        alegra_item_id,
        quantity: logEntry!.quantity,
        recovered_from_pending: true,
      })
      continue
    }

    // ── action === 'attempt' ──────────────────────────────────────────────
    // Ejecutar ajuste de salida en Alegra.

    // Si el log no existe aún, insertar como pending ANTES de llamar a Alegra.
    // Esto garantiza que cualquier corte posterior de red deje un pending observable.
    if (!decision.logExists) {
      await insertPendingLog({
        idempotencyKey,
        orderId,
        productId: product_id,
        warehouse,
        alegraItemId: alegra_item_id,
        quantity,
      })
    }

    try {
      const adjustment = await postInventoryAdjustment({
        alegraItemId: alegra_item_id,
        alegraWarehouseId: warehouse.alegra_warehouse_id,
        quantity,
        orderId,
      })

      await updateLog(idempotencyKey, {
        result: 'success',
        alegra_adjustment_id: adjustment.id ?? null,
        error_message: null,
      })

      result.success.push({
        product_id,
        alegra_item_id,
        quantity,
        recovered_from_pending: false,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)

      // 401 / 403 / 404 no tienen sentido reintentar (AlegraApiError sin retry)
      // Los registramos como error definitivo.
      await updateLog(idempotencyKey, {
        result: 'error',
        alegra_adjustment_id: null,
        error_message: errorMessage,
      })

      result.failed.push({
        product_id,
        alegra_item_id,
        quantity,
        error: errorMessage,
      })

      console.error(
        `[delivery-sync] Fallo al descontar stock para product_id=${product_id} ` +
        `(alegra_item_id=${alegra_item_id}) en orden ${orderId}: ${errorMessage}`
      )
    }

    // Pausa mínima entre items para no saturar el rate-limit
    await new Promise(resolve => setTimeout(resolve, 150))
  }

  // 4. Log de resumen del resultado completo
  const { success, failed, omitted, pending_unresolved } = result
  console.info(
    `[delivery-sync] Orden ${orderId.slice(0, 8).toUpperCase()} — ` +
    `success: ${success.length}, failed: ${failed.length}, ` +
    `omitted: ${omitted.length}, pending_unresolved: ${pending_unresolved.length}`
  )

  return result
}
