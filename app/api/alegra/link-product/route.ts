/**
 * app/api/alegra/link-product/route.ts
 *
 * Vincula o desvincula un producto del catálogo local con un ítem de Alegra.
 *
 * POST /api/alegra/link-product
 * Body: { product_id, alegra_item_id, alegra_reference? }
 * → Establece el vínculo escribiendo ambas columnas en products.
 *
 * DELETE /api/alegra/link-product?product_id=...
 * → Desvincula (pone alegra_item_id y alegra_reference a null).
 *   No borra datos históricos del sync_log ni de la caché.
 *
 * GET /api/alegra/link-product?product_id=...
 * → Devuelve el estado de vínculo actual de un producto.
 *
 * Solo accesible por admins autenticados.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { alegraRequest } from '@/lib/alegra/client'
import type { AlegraItemInventory } from '@/lib/alegra/types'

async function requireAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}

// ─── GET: estado de vínculo de un producto ────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('product_id')
  if (!productId) {
    return NextResponse.json({ error: 'product_id es requerido' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: product, error } = await supabase
    .from('products')
    .select('id, name, alegra_item_id, alegra_reference')
    .eq('id', productId)
    .single()

  if (error || !product) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }

  const linked = product.alegra_item_id !== null

  // Si está vinculado, obtener el nombre del ítem en Alegra para confirmación visual
  let alegraItemName: string | null = null
  if (linked) {
    try {
      const item = await alegraRequest<AlegraItemInventory>(
        `/items/${product.alegra_item_id}`,
        { params: { fields: 'id,name,reference' } }
      )
      alegraItemName = item.name ?? null
    } catch {
      // No crítico: si Alegra no responde, devolvemos lo que tenemos localmente
    }
  }

  return NextResponse.json({
    product_id: product.id,
    product_name: product.name,
    linked,
    alegra_item_id: product.alegra_item_id,
    alegra_reference: product.alegra_reference,
    alegra_item_name: alegraItemName,
  })
}

// ─── POST: vincular producto con ítem de Alegra ───────────────────────────────

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    product_id?: string
    alegra_item_id?: number
    alegra_reference?: string | null
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  const { product_id, alegra_item_id, alegra_reference } = body

  if (!product_id || typeof product_id !== 'string') {
    return NextResponse.json({ error: 'product_id es requerido' }, { status: 400 })
  }
  if (!alegra_item_id || typeof alegra_item_id !== 'number') {
    return NextResponse.json({ error: 'alegra_item_id (número) es requerido' }, { status: 400 })
  }

  // Verificar que el ítem existe en Alegra antes de guardar el vínculo
  let alegraItem: AlegraItemInventory
  try {
    alegraItem = await alegraRequest<AlegraItemInventory>(
      `/items/${alegra_item_id}`,
      { params: { fields: 'id,name,reference,inventory' } }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: `No se pudo verificar el ítem ${alegra_item_id} en Alegra: ${message}` },
      { status: 422 }
    )
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('products')
    .update({
      alegra_item_id,
      alegra_reference: alegra_reference ?? alegraItem.reference ?? null,
    })
    .eq('id', product_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({
    ok: true,
    product_id,
    alegra_item_id,
    alegra_item_name: alegraItem.name,
    alegra_reference: alegra_reference ?? alegraItem.reference ?? null,
    inventory_available: alegraItem.inventory?.availableQuantity ?? null,
  })
}

// ─── DELETE: desvincular producto ─────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('product_id')
  if (!productId) {
    return NextResponse.json({ error: 'product_id es requerido' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Desvincular: poner ambas columnas a null
  const { error } = await supabase
    .from('products')
    .update({ alegra_item_id: null, alegra_reference: null })
    .eq('id', productId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Limpiar la caché de stock de este producto (ya no hay vínculo activo)
  await supabase.from('alegra_stock_cache').delete().eq('product_id', productId)

  return NextResponse.json({
    ok: true,
    product_id: productId,
    note: 'Vínculo removido. El historial de alegra_sync_log se conserva para auditoría.',
  })
}
