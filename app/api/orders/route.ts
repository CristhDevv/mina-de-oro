import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip, 5, 60000)) {
    return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 })
  }

  // Intentar obtener usuario — puede ser null (guest), no bloquear
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Admin client para los INSERTs — bypasea RLS (válido en server-side)
  const admin = createAdminClient()

  const { items, shippingAddress, paymentMethod } = await req.json()

  // Validar y recalcular precios desde la DB — nunca confiar en el cliente
  const productIds = items.map((i: any) => i.product.id)
  const { data: products, error } = await admin
    .from('products')
    .select('id, price, stock')
    .in('id', productIds)

  if (error || !products) return NextResponse.json({ error: 'Error validando productos' }, { status: 500 })

  for (const item of items) {
    const dbProduct = products.find(p => p.id === item.product.id)
    if (!dbProduct) return NextResponse.json({ error: `Producto no encontrado` }, { status: 400 })
    if (dbProduct.stock < item.quantity) return NextResponse.json({ error: `Stock insuficiente` }, { status: 400 })
  }

  // Total calculado en servidor
  const total = items.reduce((sum: number, item: any) => {
    const dbProduct = products.find(p => p.id === item.product.id)!
    return sum + dbProduct.price * item.quantity
  }, 0)

  const reference = `minadeoro-${crypto.randomUUID().slice(0, 8)}-${Date.now()}`

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      user_id: user?.id ?? null,   // null para guests — columna ya es nullable
      total,
      shipping_address: shippingAddress,
      status: 'pending',
      payment_method: paymentMethod ?? 'wompi',
      reference,
    })
    .select()
    .single()

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })

  const orderItems = items.map((item: any) => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    unit_price: products.find(p => p.id === item.product.id)!.price,
  }))

  await admin.from('order_items').insert(orderItems)

  return NextResponse.json({ order, reference })
}
