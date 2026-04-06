import { supabase } from '@/lib/supabase'

export async function getAdminStats() {
  const [{ data: products }, { data: orders }, { data: users }] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact' }),
    supabase.from('orders').select('id, total, status'),
    supabase.from('profiles').select('id', { count: 'exact' }),
  ])

  const totalRevenue = orders?.reduce((sum, o) => sum + o.total, 0) ?? 0
  const pendingOrders = orders?.filter(o => o.status === 'pending').length ?? 0

  return {
    totalProducts: products?.length ?? 0,
    totalOrders: orders?.length ?? 0,
    totalUsers: users?.length ?? 0,
    totalRevenue,
    pendingOrders,
  }
}

export async function getAllOrders() {
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

export async function updateOrderStatus(orderId: string, status: string) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) throw error
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function updateUserRole(userId: string, role: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) throw error
}
