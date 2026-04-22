import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
import { CartItem } from '@/types'

export async function createOrder(
  items: CartItem[],
  shippingAddress: {
    name: string
    phone: string
    address: string
    city: string
  },
  paymentMethod: 'wompi' | 'contraentrega' = 'wompi'
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 0
  )

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total,
      shipping_address: shippingAddress,
      status: 'pending',
      payment_method: paymentMethod
    })
    .select()
    .single()

  if (orderError) throw orderError

  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    unit_price: item.product.price
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) throw itemsError

  return order
}

export async function getUserOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (name, images)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getOrderById(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (name, images)
      )
    `)
    .eq('id', orderId)
    .single()

  if (error) throw error
  return data
}

export async function sendOrderEmail(orderId: string) {
  const order = await getOrderById(orderId)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const res = await supabase.functions.invoke('send-order-email', {
    body: {
      orderId: order.id,
      userEmail: user.email,
      userName: order.shipping_address.name,
      total: order.total,
      items: order.order_items,
      shippingAddress: order.shipping_address,
    }
  })

  if (res.error) throw res.error
  return res.data
}

export async function sendWhatsAppConfirmation(orderId: string) {
  const order = await getOrderById(orderId)

  await fetch('/api/whatsapp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: order.shipping_address.phone,
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      name: order.shipping_address.name,
      total: order.total,
      items: order.order_items.map((i: { products: { name: string }; quantity: number; unit_price: number }) => ({
        name: i.products.name,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
    }),
  })
}
