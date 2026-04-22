'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, Package, MapPin, CreditCard, Truck, Calendar, ShoppingBag } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface OrdersTabProps {
  orders: any[]
  onStatusChange: (orderId: string, status: string, trackingNumber?: string) => Promise<void>
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
}

const PAYMENT_LABELS: Record<string, string> = {
  wompi: 'Tarjeta / PSE / Nequi',
  contraentrega: 'Contraentrega',
}

export default function OrdersTab({ orders, onStatusChange }: OrdersTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-900">Gestión de Pedidos</h2>
        <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
          {orders.length} pedidos
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            <ShoppingBag className="text-gray-300" size={32} />
          </div>
          <p className="text-gray-500 font-medium">No hay pedidos registrados aún</p>
        </div>
      ) : (
        orders.map((order) => (
          <div 
            key={order.id} 
            className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${
              expandedId === order.id ? 'border-[#1B2B5E] shadow-xl shadow-[#1B2B5E]/5' : 'border-gray-100 shadow-sm'
            }`}
          >
            {/* Order Summary Header */}
            <button
              onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  expandedId === order.id ? 'bg-[#1B2B5E] text-white' : 'bg-gray-50 text-gray-400'
                }`}>
                  <Package size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar size={12} className="text-gray-400" />
                    <p className="text-[11px] text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(order.total)}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{PAYMENT_LABELS[order.payment_method || 'wompi']}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  {expandedId === order.id ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                </div>
              </div>
            </button>

            {/* Expanded Content */}
            {expandedId === order.id && (
              <div className="px-5 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
                <div className="h-px bg-gray-100 mb-5" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Info */}
                  <div className="space-y-5">
                    <div className="bg-gray-50/50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={14} className="text-[#1B2B5E]" />
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Información de Envío</h4>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{order.shipping_address?.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{order.shipping_address?.address}</p>
                      <p className="text-xs text-gray-500">{order.shipping_address?.city}</p>
                      <p className="text-xs font-semibold text-[#1B2B5E] mt-2">{order.shipping_address?.phone}</p>
                    </div>

                    <div className="bg-gray-50/50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CreditCard size={14} className="text-[#1B2B5E]" />
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pago y Total</h4>
                      </div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">Método:</span>
                        <span className="text-xs font-bold text-gray-900">{PAYMENT_LABELS[order.payment_method || 'wompi']}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Total pagado:</span>
                        <span className="text-sm font-black text-[#1B2B5E]">{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Items and Actions */}
                  <div className="space-y-5">
                    <div className="bg-white border border-gray-100 rounded-2xl p-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Resumen de Productos</h4>
                      <div className="space-y-2">
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center text-xs py-1.5 border-b border-gray-50 last:border-0">
                            <span className="text-gray-700 font-medium">{item.products?.name} <span className="text-gray-400 ml-1">×{item.quantity}</span></span>
                            <span className="font-bold text-gray-900">{formatCurrency(item.unit_price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Acciones de Gestión</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Actualizar Estado</label>
                          <select
                            value={order.status}
                            onChange={(e) => onStatusChange(order.id, e.target.value, order.tracking_number)}
                            className="h-11 px-4 rounded-2xl border border-gray-200 text-sm bg-white outline-none focus:border-[#1B2B5E] focus:ring-4 focus:ring-[#1B2B5E]/5 transition-all"
                          >
                            {Object.entries(STATUS_LABELS).map(([val, label]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>
                        </div>
                        
                        {order.status === 'shipped' && (
                          <div className="flex flex-col gap-1.5 animate-in slide-in-from-left-2 duration-300">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Número de Guía</label>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Ej: ABC123456"
                                defaultValue={order.tracking_number}
                                onBlur={(e) => onStatusChange(order.id, order.status, e.target.value)}
                                className="w-full h-11 px-10 rounded-2xl border border-gray-200 text-sm outline-none focus:border-[#1B2B5E] focus:ring-4 focus:ring-[#1B2B5E]/5 transition-all"
                              />
                              <Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

