/**
 * lib/alegra/index.ts
 *
 * Barril de exportaciones del módulo Alegra.
 * Importar desde '@/lib/alegra' en lugar de rutas internas.
 *
 * Solo correr en el servidor (Node.js). No importar desde componentes cliente.
 */

export { alegraRequest, getAlegraRateLimitState, AlegraConfigError, AlegraApiError } from './client'
export type { AlegraRequestOptions } from './client'

export { runStockSyncCycle, getCachedStockForProduct, getCachedStockByWarehouse, getSyncIntervalMs } from './stock-sync'

export { resolveProductStock } from './resolve-stock'
export type { StockResolution } from './resolve-stock'

export { confirmarEntregaYDescontarStock } from './delivery-sync'
export type { ConfirmarEntregaOptions } from './delivery-sync'

export type {
  AlegraWarehouseStock,
  AlegraItemInventory,
  AlegraInventoryAdjustment,
  AlegraStockCacheRow,
  AlegraSyncLogRow,
  WarehouseRow,
  DeliveryStockResult,
  DeliverySuccessItem,
  DeliveryFailedItem,
  DeliveryOmittedItem,
  DeliveryPendingUnresolved,
} from './types'

