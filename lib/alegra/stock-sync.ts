/**
 * lib/alegra/stock-sync.ts
 *
 * Servicio de sincronización de stock desde Alegra hacia la caché local.
 *
 * Responsabilidades:
 * - Consultar GET /items/{id}?fields=inventory para cada producto vinculado a Alegra
 * - Guardar (upsert) el stock por bodega en la tabla alegra_stock_cache de Supabase
 * - El intervalo de sondeo se define en ALEGRA_SYNC_INTERVAL_SECONDS (env), nunca hardcodeado
 * - No modifica la columna stock de products bajo ninguna circunstancia
 *
 * IMPORTANTE: Este módulo solo corre en el lado servidor (Node.js / Edge Runtime).
 * NO importar desde componentes cliente.
 */

import { alegraRequest } from './client'
import type { AlegraItemInventory } from './types'
import { createAdminClient } from '@/lib/supabase/admin'

// ─── Configuración ────────────────────────────────────────────────────────────

/**
 * Intervalo de sondeo en segundos, leído desde la variable de entorno.
 * Default: 120 segundos. El operador ajusta el valor sin tocar código.
 */
export function getSyncIntervalMs(): number {
  const raw = process.env.ALEGRA_SYNC_INTERVAL_SECONDS
  const seconds = raw ? parseInt(raw, 10) : 120
  return (isNaN(seconds) || seconds < 10 ? 120 : seconds) * 1000
}

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface ProductWithAlegraLink {
  id: string
  alegra_item_id: number
}

interface SyncResult {
  product_id: string
  alegra_item_id: number
  success: boolean
  warehouses_updated: number
  error?: string
}

// ─── Lectura de productos vinculados ─────────────────────────────────────────

/**
 * Lee desde Supabase todos los productos que tienen alegra_item_id configurado.
 * Usa el cliente admin (service_role) para leer sin restricciones de RLS.
 */
async function fetchLinkedProducts(): Promise<ProductWithAlegraLink[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('products')
    .select('id, alegra_item_id')
    .not('alegra_item_id', 'is', null)
    .eq('active', true)

  if (error) {
    console.error('[Alegra Sync] Error al leer productos vinculados:', error.message)
    return []
  }

  return (data ?? []) as ProductWithAlegraLink[]
}

// ─── Sincronización de un producto ───────────────────────────────────────────

/**
 * Consulta el inventario de un ítem en Alegra y actualiza la caché local.
 *
 * @param product - Producto con su alegra_item_id
 * @returns Resultado de la operación para logging
 */
async function syncProductStock(product: ProductWithAlegraLink): Promise<SyncResult> {
  const { id: product_id, alegra_item_id } = product
  const supabase = createAdminClient()

  let itemInventory: AlegraItemInventory
  try {
    itemInventory = await alegraRequest<AlegraItemInventory>(
      `/items/${alegra_item_id}`,
      { params: { fields: 'id,name,inventory' } }
    )
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(`[Alegra Sync] Error al consultar ítem ${alegra_item_id}:`, errorMsg)
    return { product_id, alegra_item_id, success: false, warehouses_updated: 0, error: errorMsg }
  }

  const warehouses = itemInventory.inventory?.warehouses ?? []

  if (warehouses.length === 0) {
    // El ítem existe pero no tiene bodegas configuradas en Alegra — no es error
    return { product_id, alegra_item_id, success: true, warehouses_updated: 0 }
  }

  // Upsert en alegra_stock_cache: una fila por (alegra_item_id, alegra_warehouse_id)
  const upsertRows = warehouses.map(wh => ({
    product_id,
    alegra_item_id,
    alegra_warehouse_id: wh.id,
    quantity: wh.quantity,
    synced_at: new Date().toISOString(),
  }))

  const { error: upsertError } = await supabase
    .from('alegra_stock_cache')
    .upsert(upsertRows, {
      onConflict: 'alegra_item_id,alegra_warehouse_id',
      ignoreDuplicates: false, // actualizar siempre, no ignorar
    })

  if (upsertError) {
    console.error(
      `[Alegra Sync] Error al hacer upsert en caché para ítem ${alegra_item_id}:`,
      upsertError.message
    )
    return {
      product_id,
      alegra_item_id,
      success: false,
      warehouses_updated: 0,
      error: upsertError.message,
    }
  }

  return { product_id, alegra_item_id, success: true, warehouses_updated: warehouses.length }
}

// ─── Ciclo completo de sincronización ────────────────────────────────────────

/**
 * Ejecuta un ciclo completo de sincronización de stock para todos los productos vinculados.
 * Procesa secuencialmente para no saturar el rate-limit de Alegra.
 *
 * @returns Resumen del ciclo: total, éxitos y fallos
 */
export async function runStockSyncCycle(): Promise<{
  total: number
  success: number
  failed: number
  results: SyncResult[]
}> {
  const products = await fetchLinkedProducts()

  if (products.length === 0) {
    return { total: 0, success: 0, failed: 0, results: [] }
  }

  const results: SyncResult[] = []

  for (const product of products) {
    const result = await syncProductStock(product)
    results.push(result)
    // Pequeña pausa entre items para ser amable con el rate-limit
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  const success = results.filter(r => r.success).length
  const failed = results.length - success

  if (failed > 0) {
    console.warn(`[Alegra Sync] Ciclo completado con ${failed} fallo(s) de ${results.length} productos.`)
  }

  return { total: results.length, success, failed, results }
}

// ─── Lectura de stock desde caché ────────────────────────────────────────────

/**
 * Lee el stock total de un producto desde la caché local de Alegra.
 * Suma las cantidades de todas las bodegas del producto.
 *
 * Retorna null si el producto no tiene filas en la caché
 * (puede significar que nunca se sincronizó o que no tiene vínculo).
 */
export async function getCachedStockForProduct(
  productId: string
): Promise<number | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('alegra_stock_cache')
    .select('quantity')
    .eq('product_id', productId)

  if (error || !data || data.length === 0) return null

  return data.reduce((sum: number, row: { quantity: number }) => sum + row.quantity, 0)
}

/**
 * Lee el stock de un producto en una bodega específica desde la caché local.
 *
 * @param productId - UUID del producto en Supabase
 * @param alegraWarehouseId - ID numérico de la bodega en Alegra
 */
export async function getCachedStockByWarehouse(
  productId: string,
  alegraWarehouseId: number
): Promise<number | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('alegra_stock_cache')
    .select('quantity, synced_at')
    .eq('product_id', productId)
    .eq('alegra_warehouse_id', alegraWarehouseId)
    .single()

  if (error || !data) return null
  return (data as { quantity: number }).quantity
}
