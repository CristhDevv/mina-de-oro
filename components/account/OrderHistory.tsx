'use client'
import { useEffect, useState } from 'react'
import { getUserOrders } from '@/lib/api/orders'
import { Package, ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type OrderItem = {
  id: string
  quantity: number
  unit_price: number
  products: { name: string; images: string[] }
}

type Order = {
  id: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  created_at: string
  order_items: OrderItem[]
}

const STATUS_LABEL: Record<Order['status'], string> = {
  pending:   'Pendiente',
  confirmed: 'Confirmado',
  shipped:   'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const STATUS_COLOR: Record<Order['status'], string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped:   'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getUserOrders()
      .then(setOrders)
      .catch(err => setError(err instanceof Error ? err.message : 'Error al cargar pedidos'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-12">
      <Loader2 size={24} className="animate-spin text-gray-400" />
    </div>
  )

  if (error) return (
    <p className="text-center text-sm text-red-500 py-8">{error}</p>
  )

  if (orders.length === 0) return (
    <div className="text-center py-12">
      <Package size={40} className="text-gray-300 mx-auto mb-3" />
      <p className="text-sm text-gray-500">Aún no tienes pedidos</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {orders.map(order => (
        <Link
          key={order.id}
          href={`/pedido/${order.id}`}
          className="block bg-white border border-gray-100 rounded-2xl p-4 active:bg-gray-50"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-gray-400">#{order.id.slice(0, 8)}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status]}`}>
              {STATUS_LABEL[order.status]}
            </span>
          </div>

          {/* Miniaturas de productos */}
          {order.order_items?.length > 0 && (
            <div className="flex gap-2 mb-3">
              {order.order_items.slice(0, 3).map(item => (
                <div key={item.id} className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {item.products?.images?.[0] && (
                    <Image
                      src={item.products.images[0]}
                      alt={item.products.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
              ))}
              {order.order_items.length > 3 && (
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="text-xs text-gray-500 font-semibold">+{order.order_items.length - 3}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">
                {new Date(order.created_at).toLocaleDateString('es-CO', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-900 text-sm">
                ${order.total.toLocaleString('es-CO')}
              </span>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
