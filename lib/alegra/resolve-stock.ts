/**
 * lib/alegra/resolve-stock.ts
 *
 * Función helper para resolver el stock efectivo de un producto.
 *
 * Regla crítica:
 *   - Si el producto tiene alegra_item_id → leer desde alegra_stock_cache
 *   - Si el producto NO tiene alegra_item_id → usar el campo stock del producto (comportamiento actual)
 *
 * Esta función solo corre en el servidor (Server Components, API routes, Server Actions).
 * NUNCA importar desde componentes cliente.
 */

import { getCachedStockForProduct } from './stock-sync'

export interface StockResolution {
  /** Stock efectivo a mostrar */
  quantity: number
  /** 'alegra' si viene de la caché de Alegra, 'local' si viene del campo stock del producto */
  source: 'alegra' | 'local'
  /** Si la caché de Alegra no tenía datos y se cayó al fallback local */
  usedFallback: boolean
}

/**
 * Resuelve el stock de un producto priorizando la caché de Alegra cuando existe vínculo.
 *
 * @param productId - UUID del producto en Supabase
 * @param localStock - Valor del campo stock del producto (siempre disponible)
 * @param alegraItemId - ID del ítem en Alegra (null si no tiene vínculo)
 * @returns Objeto con quantity, source y usedFallback
 */
export async function resolveProductStock(
  productId: string,
  localStock: number,
  alegraItemId: number | null | undefined
): Promise<StockResolution> {
  // Sin vínculo a Alegra → comportamiento 100% igual al actual
  if (!alegraItemId) {
    return { quantity: localStock, source: 'local', usedFallback: false }
  }

  // Con vínculo → intentar leer desde caché
  const cachedStock = await getCachedStockForProduct(productId)

  if (cachedStock !== null) {
    return { quantity: cachedStock, source: 'alegra', usedFallback: false }
  }

  // Caché vacía (aún no se ha sincronizado o falló el último ciclo) → fallback a stock local
  console.warn(
    `[resolveProductStock] Sin caché de Alegra para product_id=${productId} (alegra_item_id=${alegraItemId}). Usando stock local como fallback.`
  )
  return { quantity: localStock, source: 'local', usedFallback: true }
}
