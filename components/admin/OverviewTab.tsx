'use client'

import { DollarSign, Clock, Package, Users, TrendingUp, ShoppingBag, ArrowRight, Plus, Settings } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface OverviewTabProps {
  stats: any
  recentOrders: any[]
  onViewAllOrders: () => void
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

export default function OverviewTab({ stats, recentOrders, onViewAllOrders }: OverviewTabProps) {
  const statCards = [
    { 
      label: 'Ingresos Totales', 
      value: formatCurrency(stats?.totalRevenue ?? 0), 
      icon: DollarSign, 
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50'
    },
    { 
      label: 'Pendientes', 
      value: stats?.pendingOrders ?? 0, 
      icon: Clock, 
      color: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50'
    },
    { 
      label: 'Productos Activos', 
      value: stats?.totalProducts ?? 0, 
      icon: Package, 
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      label: 'Clientes Registrados', 
      value: stats?.totalUsers ?? 0, 
      icon: Users, 
      color: 'from-indigo-500 to-indigo-600',
      bg: 'bg-indigo-50'
    },
  ]

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full ${stat.bg} opacity-50 group-hover:scale-110 transition-transform`} />
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3 shadow-lg shadow-black/5`}>
              <stat.icon size={20} />
            </div>
            <p className="text-xl font-black text-gray-900 truncate">{stat.value}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-[#1B2B5E]" size={18} />
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Actividad Reciente</h2>
            </div>
            <button 
              onClick={onViewAllOrders}
              className="text-xs font-bold text-[#1B2B5E] hover:underline flex items-center gap-1 group"
            >
              Ver todos <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="flex-1 divide-y divide-gray-50">
            {recentOrders.length === 0 ? (
              <div className="p-10 text-center text-gray-400 italic text-sm">No hay pedidos recientes</div>
            ) : (
              recentOrders.slice(0, 6).map((order) => (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${order.status === 'pending' ? 'bg-amber-400 animate-pulse' : 'bg-gray-200'}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {new Date(order.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })} • {order.shipping_address?.name || 'Cliente'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-gray-900">{formatCurrency(order.total)}</p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Tips / Actions */}
        <div className="space-y-4">
          <div className="bg-[#1B2B5E] rounded-3xl p-6 text-white shadow-xl shadow-[#1B2B5E]/20 relative overflow-hidden">
            <TrendingUp className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10" />
            <h3 className="text-lg font-bold mb-2">Resumen Semanal</h3>
            <p className="text-xs text-white/70 mb-4 font-medium leading-relaxed">
              Tus ventas han aumentado un <span className="text-emerald-400 font-bold">12%</span> respecto a la semana pasada. ¡Sigue así!
            </p>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: '65%' }} />
            </div>
            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Meta de Ventas: 65%</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Atajos Rápidos</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Publicar', icon: Plus, bg: 'bg-blue-50 text-blue-600' },
                { label: 'Stock', icon: Package, bg: 'bg-amber-50 text-amber-600' },
                { label: 'Clientes', icon: Users, bg: 'bg-purple-50 text-purple-600' },
                { label: 'Ajustes', icon: Settings, bg: 'bg-gray-50 text-gray-600' },
              ].map((item) => (
                <button key={item.label} className="flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-50 hover:border-gray-100 hover:bg-gray-50 transition-all gap-2 group">
                  <div className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}

