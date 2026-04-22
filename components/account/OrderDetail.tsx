'use client'
import { useEffect, useState } from 'react'
import { getOrderById } from '@/lib/api/orders'
import { Loader2, Package, MapPin, ChevronLeft, CheckCircle, Clock, Truck, XCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

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
  shipping_address: {
    name: string
    phone: string
    address: string
    city: string
  }
  tracking_number?: string
  order_items: OrderItem[]
}

const TIMELINE = [
  { status: 'pending',   label: 'Pedido recibido',   icon: Clock },
  { status: 'confirmed', label: 'Confirmado',         icon: CheckCircle },
  { status: 'shipped',   label: 'En camino',          icon: Truck },
  { status: 'delivered', label: 'Entregado',          icon: Package },
]

const STATUS_ORDER = ['pending', 'confirmed', 'shipped', 'delivered']

export default function OrderDetail({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrderById(orderId)
      .then(setOrder)
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 size={24} className="animate-spin text-gray-400" />
    </div>
  )

  if (!order) return (
    <p className="text-center text-sm text-red-500 py-8">Pedido no encontrado.</p>
  )

  const currentStep = STATUS_ORDER.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/cuenta/pedidos" className="text-gray-400">
          <ChevronLeft size={22} />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Pedido #{order.id.slice(0, 8)}</h1>
          <p className="text-xs text-gray-400">
            {new Date(order.created_at).toLocaleDateString('es-CO', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Timeline */}
      {!isCancelled ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
          <p className="text-xs font-semibold text-gray-500 mb-4">Estado del pedido</p>
          <div className="flex items-start justify-between relative">
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100 z-0" />
            <div
              className="absolute top-4 left-4 h-0.5 bg-[#1B2B5E] z-0 transition-all"
              style={{ width: `${(currentStep / (TIMELINE.length - 1)) * 100}%` }}
            />
            {TIMELINE.map((step, i) => {
              const Icon = step.icon
              const done = i <= currentStep
              return (
                <div key={step.status} className="flex flex-col items-center gap-1 z-10 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    done ? 'bg-[#1B2B5E] text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon size={14} />
                  </div>
                  <span className={`text-[10px] text-center leading-tight ${
                    done ? 'text-[#1B2B5E] font-semibold' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
      
      {/* Tracking Number (Nuevo) */}
      {order.tracking_number && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <Truck size={20} className="text-[#1B2B5E] shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[#1B2B5E] uppercase tracking-wide">Número de guía</p>
            <p className="text-sm font-bold text-gray-900">{order.tracking_number}</p>
          </div>
        </div>
      )}

      {/* Productos */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
        <p className="text-xs font-semibold text-gray-500 mb-3">Productos</p>
        <div className="space-y-3">
          {order.order_items.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                {item.products?.images?.[0] && (
                  <Image
                    src={item.products.images[0]}
                    alt={item.products.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.products?.name}</p>
                <p className="text-xs text-gray-400">Cantidad: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 shrink-0">
                ${(item.unit_price * item.quantity).toLocaleString('es-CO')}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
          <span className="text-sm font-semibold text-gray-700">Total</span>
          <span className="text-sm font-bold text-gray-900">${order.total.toLocaleString('es-CO')}</span>
        </div>
      </div>

      {/* Dirección */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={14} className="text-gray-400" />
          <p className="text-xs font-semibold text-gray-500">Dirección de envío</p>
        </div>
        <p className="text-sm font-medium text-gray-800">{order.shipping_address.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">{order.shipping_address.address}</p>
        <p className="text-xs text-gray-500">{order.shipping_address.city}</p>
        <p className="text-xs text-gray-500">{order.shipping_address.phone}</p>
      </div>
    </div>
  )
}
