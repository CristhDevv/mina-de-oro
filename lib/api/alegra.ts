/**
 * lib/api/alegra.ts
 *
 * Cliente de frontend para llamar a las rutas internas /api/alegra/*.
 * Estos helpers son para uso en componentes cliente (admin panel).
 * NO llaman a api.alegra.com directamente — eso solo lo hace lib/alegra/client.ts en servidor.
 */

// ─── Tipos de respuesta ───────────────────────────────────────────────────────

export interface WarehouseData {
  id: string
  name: string
  address: string | null
  active: boolean
  alegra_warehouse_id: number | null
  created_at: string
  updated_at: string
}

export interface SyncLogEntry {
  id: string
  idempotency_key: string
  product_id: string
  alegra_item_id: number
  alegra_warehouse_id: number | null
  quantity: number
  operation_type: string
  result: 'pending' | 'success' | 'error'
  alegra_adjustment_id: number | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface OrderSyncStatus {
  order_id: string
  summary: { total: number; success: number; pending: number; error: number }
  logs: SyncLogEntry[]
}

export interface DeliveryConfirmResult {
  ok: boolean
  result: {
    order_id: string
    success: Array<{ product_id: string; alegra_item_id: number; quantity: number; recovered_from_pending: boolean }>
    failed: Array<{ product_id: string; alegra_item_id: number; quantity: number; error: string }>
    omitted: Array<{ product_id: string; reason: string }>
    pending_unresolved: Array<{ product_id: string; alegra_item_id: number; reason: string }>
  }
}

export interface ProductLinkStatus {
  product_id: string
  product_name: string
  linked: boolean
  alegra_item_id: number | null
  alegra_reference: string | null
  alegra_item_name: string | null
}

// ─── Warehouses ───────────────────────────────────────────────────────────────

export async function getWarehouses(onlyActive = true): Promise<WarehouseData[]> {
  const res = await fetch(`/api/alegra/warehouses?active=${onlyActive}`)
  if (!res.ok) throw new Error(await res.text())
  const { warehouses } = await res.json()
  return warehouses
}

export async function createWarehouse(data: {
  name: string
  address?: string
  alegra_warehouse_id?: number | null
}): Promise<WarehouseData> {
  const res = await fetch('/api/alegra/warehouses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  const { warehouse } = await res.json()
  return warehouse
}

export async function updateWarehouse(data: {
  id: string
  name?: string
  address?: string
  active?: boolean
  alegra_warehouse_id?: number | null
}): Promise<WarehouseData> {
  const res = await fetch('/api/alegra/warehouses', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  const { warehouse } = await res.json()
  return warehouse
}

export async function deleteWarehouse(id: string): Promise<void> {
  const res = await fetch(`/api/alegra/warehouses?id=${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(await res.text())
}

// ─── Vinculación de productos ─────────────────────────────────────────────────

export async function getProductLinkStatus(productId: string): Promise<ProductLinkStatus> {
  const res = await fetch(`/api/alegra/link-product?product_id=${productId}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function linkProductToAlegra(data: {
  product_id: string
  alegra_item_id: number
  alegra_reference?: string | null
}): Promise<{ ok: boolean; alegra_item_name: string; inventory_available: number | null }> {
  const res = await fetch('/api/alegra/link-product', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function unlinkProductFromAlegra(productId: string): Promise<void> {
  const res = await fetch(`/api/alegra/link-product?product_id=${productId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(await res.text())
}

// ─── Sincronización de stock ──────────────────────────────────────────────────

export async function triggerStockSync(): Promise<{
  ok: boolean
  total: number
  success: number
  failed: number
  sync_interval_ms: number
}> {
  const res = await fetch('/api/alegra/sync-stock', { method: 'POST' })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getSyncConfig(): Promise<{ sync_interval_ms: number; sync_interval_seconds: number }> {
  const res = await fetch('/api/alegra/sync-stock')
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ─── Confirmación de entrega ──────────────────────────────────────────────────

export async function confirmDeliveryAndDeductStock(
  orderId: string,
  retryFailedOnly = false
): Promise<DeliveryConfirmResult> {
  const res = await fetch('/api/alegra/confirm-delivery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId, retry_failed_only: retryFailedOnly }),
  })
  // 207 (partial) también se considera respuesta válida — no lanzar error
  if (!res.ok && res.status !== 207) throw new Error(await res.text())
  return res.json()
}

export async function getOrderSyncStatus(orderId: string): Promise<OrderSyncStatus> {
  const res = await fetch(`/api/alegra/confirm-delivery?order_id=${orderId}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
