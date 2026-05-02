import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip, 5, 60000)) {
    return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 })
  }

  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { items, shippingAddress, paymentMethod } = await req.json()

  // Validar y recalcular precios desde la DB — nunca confiar en el cliente
  const productIds = items.map((i: any) => i.product.id)
  const { data: products, error } = await supabase
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

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ user_id: user.id, total, shipping_address: shippingAddress, status: 'pending', payment_method: paymentMethod })
    .select().single()

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })

  const orderItems = items.map((item: any) => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    unit_price: products.find(p => p.id === item.product.id)!.price
  }))

  await supabase.from('order_items').insert(orderItems)

  return NextResponse.json({ order })
}
