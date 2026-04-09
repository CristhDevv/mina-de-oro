'use client'

import { useState, useEffect } from 'react'
import {
  Package, ShoppingBag, Users, DollarSign,
  Clock, ChevronRight, Plus, ArrowLeft, Tag
} from 'lucide-react'
import { getAdminStats, getAllOrders, updateOrderStatus, getAllUsers, updateUserRole } from '@/lib/api/admin'
import { getProducts } from '@/lib/api/products'
import { getCategories, deleteCategory } from '@/lib/api/categories'
import { Product, Category } from '@/types'
import ProductFormModal from './ProductFormModal'
import CategoryFormModal from './CategoryFormModal'
import InventoryView from './InventoryView'
import SettingsView from './SettingsView'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Tab = 'dashboard' | 'orders' | 'products' | 'inventory' | 'users' | 'categories' | 'settings'

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
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getAdminStats>> | null>(null)
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof getAllOrders>>>([])
  const [users, setUsers] = useState<Awaited<ReturnType<typeof getAllUsers>>>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)

  const router = useRouter()
  const supabase = createClient()

  async function load() {
    setLoading(true)
    try {
      const [s, o, u, p, c] = await Promise.all([
        getAdminStats(), getAllOrders(), getAllUsers(), getProducts(), getCategories()
      ])
      setStats(s); setOrders(o ?? []); setUsers(u ?? [])
      setProducts(p ?? []); setCategories(c ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleStatusChange(orderId: string, status: string) {
    await updateOrderStatus(orderId, status)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
  }

  async function handleRoleChange(userId: string, role: string) {
    await updateUserRole(userId, role)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Resumen', icon: DollarSign },
    { id: 'orders' as Tab, label: 'Pedidos', icon: ShoppingBag },
    { id: 'products' as Tab, label: 'Productos', icon: Package },
    { id: 'inventory' as Tab, label: 'Inventario', icon: BarChart2 },
    { id: 'users' as Tab, label: 'Usuarios', icon: Users },
    { id: 'categories' as Tab, label: 'Categorías', icon: Tag },
    { id: 'settings' as Tab, label: 'Ajustes', icon: Settings },
  ]

  return (
    <div className="pb-24 min-h-screen bg-gray-50">
      <div className="bg-[#1B2B5E] px-4 pt-8 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-lg">Panel Admin</h1>
          <p className="text-white/60 text-xs">La Mina de Oro</p>
        </div>
        <button 
          onClick={handleLogout}
          className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 transition-all active:scale-90"
          title="Cerrar Sesión"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100 sticky top-0 z-10">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-colors ${
              tab === id ? 'text-[#1B2B5E] border-b-2 border-[#1B2B5E]' : 'text-gray-400'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 pt-5">

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div className="flex flex-col gap-4">
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Ingresos totales', value: formatCOP(stats?.totalRevenue ?? 0), icon: DollarSign, color: 'bg-green-50 text-green-700' },
                    { label: 'Pedidos pendientes', value: stats?.pendingOrders ?? 0, icon: Clock, color: 'bg-yellow-50 text-yellow-700' },
                    { label: 'Productos', value: stats?.totalProducts ?? 0, icon: Package, color: 'bg-blue-50 text-blue-700' },
                    { label: 'Usuarios', value: stats?.totalUsers ?? 0, icon: Users, color: 'bg-purple-50 text-purple-700' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${color}`}>
                        <Icon size={16} />
                      </div>
                      <p className="text-lg font-bold text-gray-900">{value}</p>
                      <p className="text-xs text-gray-500">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-700">Últimos pedidos</h2>
                    <button onClick={() => setTab('orders')} className="text-xs text-[#1B2B5E] font-semibold">Ver todos</button>
                  </div>
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-xs font-semibold text-gray-800">#{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-800">{formatCOP(order.total)}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-500 font-medium">{orders.length} pedidos en total</p>
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="w-full flex items-center justify-between px-4 py-3"
                >
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-800">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                    <ChevronRight size={14} className={`text-gray-300 transition-transform ${expandedOrder === order.id ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {expandedOrder === order.id && (
                  <div className="border-t border-gray-100 px-4 py-3 flex flex-col gap-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Envío a</p>
                      <p className="text-xs text-gray-700">{order.shipping_address?.name}</p>
                      <p className="text-xs text-gray-500">{order.shipping_address?.address}, {order.shipping_address?.city}</p>
                      <p className="text-xs text-gray-500">{order.shipping_address?.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Productos</p>
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-xs text-gray-700 py-1 border-b border-gray-50 last:border-0">
                          <span>{item.products?.name} × {item.quantity}</span>
                          <span className="font-semibold">{formatCOP(item.unit_price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-gray-800">Total: {formatCOP(order.total)}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <p className="text-xs font-semibold text-gray-500">Cambiar estado</p>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="h-10 px-3 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:border-[#1B2B5E]"
                      >
                        {Object.entries(STATUS_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setEditProduct(null); setShowForm(true) }}
              className="flex items-center justify-center gap-2 bg-[#1B2B5E] text-white text-sm font-semibold h-11 rounded-2xl w-full"
            >
              <Plus size={16} /> Nuevo producto
            </button>
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 text-lg">🛍️</div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                    <p className="text-xs text-[#C9A84C] font-medium">{formatCOP(product.price)}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setEditProduct(product); setShowForm(true) }}
                  className="text-xs text-[#1B2B5E] font-semibold shrink-0 ml-2"
                >
                  Editar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* INVENTARIO */}
        {tab === 'inventory' && <InventoryView />}

        {/* USERS */}
        {tab === 'users' && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-500 font-medium">{users.length} usuarios registrados</p>
            {users.map((user) => (
              <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#1B2B5E] flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-bold uppercase">{user.name?.charAt(0) ?? '?'}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.name ?? 'Sin nombre'}</p>
                    <p className="text-xs text-gray-400 truncate">{user.id.slice(0, 16)}...</p>
                  </div>
                </div>
                <select
                  value={user.role ?? 'customer'}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="h-8 px-2 rounded-xl border border-gray-200 text-xs bg-white outline-none focus:border-[#1B2B5E] shrink-0"
                >
                  <option value="customer">Cliente</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            ))}
          </div>
        )}

        {/* CATEGORIES */}
        {tab === 'categories' && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setEditCategory(null); setShowCategoryForm(true) }}
              className="flex items-center justify-center gap-2 bg-[#1B2B5E] text-white text-sm font-semibold h-11 rounded-2xl w-full"
            >
              <Plus size={16} /> Nueva categoría
            </button>
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <p className="text-sm font-semibold text-gray-800">{cat.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setEditCategory(cat); setShowCategoryForm(true) }}
                    className="text-xs text-[#1B2B5E] font-semibold"
                  >
                    Editar
                  </button>
                  <button
                    onClick={async () => { await deleteCategory(cat.id); load() }}
                    className="text-xs text-red-400 font-semibold"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'settings' && <SettingsView />}
      </div>

      {showForm && (
        <ProductFormModal
          product={editProduct}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load() }}
        />
      )}

      {showCategoryForm && (
        <CategoryFormModal
          category={editCategory}
          onClose={() => setShowCategoryForm(false)}
          onSaved={() => { setShowCategoryForm(false); load() }}
        />
      )}
    </div>
  )
}
