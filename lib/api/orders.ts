import { supabase } from '@/lib/supabase'
import { CartItem } from '@/types'

export async function createOrder(
  items: CartItem[],
  shippingAddress: {
    name: string
    phone: string
    address: string
    city: string
  }
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
      status: 'pending'
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
