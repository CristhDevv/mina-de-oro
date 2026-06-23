/**
 * lib/alegra/types.ts
 *
 * Tipos TypeScript para la integración con la API de Alegra.
 * Solo contiene los campos que el proyecto consume; Alegra tiene más campos
 * que se omiten intencionalmente para no acoplar el dominio a la API externa.
 */

// ─── Respuestas de la API de Alegra ──────────────────────────────────────────

/** Información de inventario de un ítem por bodega, tal como Alegra la devuelve. */
export interface AlegraWarehouseStock {
  id: number           // id de la bodega en Alegra
  name: string
  initialQuantity: number
  quantity: number     // stock actual
  minQuantity?: number
  maxQuantity?: number
  isDefault?: boolean
  status?: string
}

/** Respuesta parcial de GET /items/{id}?fields=inventory */
export interface AlegraItemInventory {
  id: number
  name: string
  reference?: string
  inventory?: {
    unit?: string
    availableQuantity?: number       // total sumado de todas las bodegas
    warehouses?: AlegraWarehouseStock[]
  }
}

/** Respuesta de POST /inventory-adjustments */
export interface AlegraInventoryAdjustment {
  id: number
  type: string           // 'out' | 'in'
  date: string
  observations?: string
  status?: string
  inventories?: Array<{
    id: number
    itemId: number
    warehouseId: number
    quantity: number
    unitCost?: number
  }>
}

// ─── Tipos internos del dominio ───────────────────────────────────────────────

/** Fila de la tabla alegra_stock_cache en Supabase */
export interface AlegraStockCacheRow {
  id: string
  product_id: string
  alegra_item_id: number
  warehouse_id: string | null
  alegra_warehouse_id: number | null
  quantity: number
  synced_at: string
}

/** Fila de la tabla alegra_sync_log en Supabase */
export interface AlegraSyncLogRow {
  id: string
  idempotency_key: string
  order_id: string
  product_id: string
  warehouse_id: string | null
  alegra_item_id: number
  alegra_warehouse_id: number | null
  quantity: number
  operation_type: 'out' | 'in'
  result: 'pending' | 'success' | 'error'
  alegra_adjustment_id: number | null
  error_message: string | null
  created_at: string
  updated_at: string
}

/** Fila de la tabla warehouses en Supabase */
export interface WarehouseRow {
  id: string
  name: string
  address: string | null
  active: boolean
  alegra_warehouse_id: number | null
  created_at: string
  updated_at: string
}

// ─── Tipos del flujo de entrega ───────────────────────────────────────────────

export interface DeliverySuccessItem {
  product_id: string
  alegra_item_id: number
  quantity: number
  /** true si el éxito se recuperó verificando Alegra (pending vencido que sí se había aplicado) */
  recovered_from_pending: boolean
}

export interface DeliveryFailedItem {
  product_id: string
  alegra_item_id: number
  quantity: number
  error: string
}

export interface DeliveryOmittedItem {
  product_id: string
  reason: 'no_alegra_link' | 'retry_link_removed' | 'already_success'
}

export interface DeliveryPendingUnresolved {
  product_id: string
  alegra_item_id: number
  reason: string
}

/**
 * Resultado completo de confirmarEntregaYDescontarStock.
 * El caller puede inspeccionarlo para saber exactamente qué pasó
 * con cada producto de la orden.
 */
export interface DeliveryStockResult {
  order_id: string
  /** Ajustes completados (incluye recovered_from_pending) */
  success: DeliverySuccessItem[]
  /** Ajustes que fallaron definitivamente */
  failed: DeliveryFailedItem[]
  /**
   * Productos omitidos: sin vínculo Alegra, vínculo removido durante reintento,
   * o ya tenían éxito previo registrado.
   */
  omitted: DeliveryOmittedItem[]
  /**
   * Pendientes no resueltos: la verificación contra Alegra falló (Alegra no respondió).
   * Se quedan en pending para que el siguiente ciclo lo reintente.
   * NO se cuentan como error.
   */
  pending_unresolved: DeliveryPendingUnresolved[]
}
