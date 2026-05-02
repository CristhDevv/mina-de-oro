'use client'

import { useState, useEffect } from 'react'
import {
  Package, ShoppingBag, Users, DollarSign,
  Clock, ChevronRight, Plus, ArrowLeft, Tag,
  BarChart2, Settings, LogOut
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
import { useRouter } from 'next/navigation'

import OverviewTab from './OverviewTab'
import OrdersTab from './OrdersTab'
import ProductsTab from './ProductsTab'
import UsersTab from './UsersTab'
import CategoriesTab from './CategoriesTab'

type Tab = 'dashboard' | 'orders' | 'products' | 'inventory' | 'users' | 'categories' | 'settings'

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [stats, setStats] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
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
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleStatusChange(orderId: string, status: string, trackingNumber?: string) {
    try {
      await updateOrderStatus(orderId, status, trackingNumber)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, tracking_number: trackingNumber } : o))
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  async function handleRoleChange(userId: string, role: string) {
    try {
      await updateUserRole(userId, role)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
    } catch (error) {
      console.error('Error updating role:', error)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navItems = [
    { id: 'dashboard' as Tab, label: 'Resumen', icon: BarChart2 },
    { id: 'orders' as Tab, label: 'Pedidos', icon: ShoppingBag },
    { id: 'products' as Tab, label: 'Productos', icon: Package },
    { id: 'inventory' as Tab, label: 'Stock', icon: Tag },
    { id: 'users' as Tab, label: 'Usuarios', icon: Users },
    { id: 'categories' as Tab, label: 'Categorías', icon: Settings },
    { id: 'settings' as Tab, label: 'Ajustes', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col md:flex-row">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-[56px] hover:w-[220px] group transition-all duration-300 ease-in-out bg-[#1B2B5E] text-white flex-col sticky top-0 h-screen shrink-0 z-20 overflow-hidden">
        <div className="h-24 flex flex-col justify-center px-4 whitespace-nowrap">
          <div className="block group-hover:hidden text-center text-xl font-black w-full -ml-1">M</div>
          <div className="hidden group-hover:block">
            <h1 className="text-xl font-black tracking-tighter">MINA DE ORO</h1>
            <p className="text-[10px] text-white/50 font-bold tracking-[0.2em] mt-1 uppercase">Admin Central</p>
          </div>
        </div>
        
        <nav className="flex-1 px-2 group-hover:px-4 space-y-1 transition-all">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                tab === id ? 'bg-white text-[#1B2B5E] shadow-xl shadow-black/10' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              title={label}
            >
              <Icon size={18} className="shrink-0" />
              <span className="hidden group-hover:block">{label}</span>
            </button>
          ))}
        </nav>

        <div className="p-2 group-hover:p-4 border-t border-white/5 transition-all">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all font-bold text-sm whitespace-nowrap"
            title="Cerrar Sesión"
          >
            <LogOut size={18} className="shrink-0" />
            <span className="hidden group-hover:block">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-[#1B2B5E] text-white px-6 pt-10 pb-6 rounded-b-[40px] shadow-2xl shadow-[#1B2B5E]/20 shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-black tracking-tight">Admin Panel</h1>
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-0.5">La Mina de Oro</p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-rose-400"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-4 md:p-10 w-full pb-32 md:pb-10 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
              <div className="w-12 h-12 border-4 border-[#1B2B5E] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Sincronizando datos...</p>
            </div>
          ) : (
            <div className="w-full">
              {tab === 'dashboard' && stats && (
                <OverviewTab 
                  stats={stats} 
                  recentOrders={orders} 
                  onViewAllOrders={() => setTab('orders')} 
                  onNavigate={(t: Tab) => setTab(t)}
                />
              )}
              {tab === 'orders' && <OrdersTab orders={orders} onStatusChange={handleStatusChange} />}
              {tab === 'products' && (
                <ProductsTab 
                  products={products} 
                  onEdit={(p: Product) => { setEditProduct(p); setShowForm(true) }} 
                  onAdd={() => { setEditProduct(null); setShowForm(true) }} 
                />
              )}
              {tab === 'inventory' && <InventoryView />}
              {tab === 'users' && <UsersTab users={users} onRoleChange={handleRoleChange} />}
              {tab === 'categories' && (
                <CategoriesTab 
                  categories={categories} 
                  onEdit={(c: Category) => { setEditCategory(c); setShowCategoryForm(true) }} 
                  onDelete={async (id: string) => { try { await deleteCategory(id); load() } catch(e) { console.error(e) } }}
                  onAdd={() => { setEditCategory(null); setShowCategoryForm(true) }}
                />
              )}
              {tab === 'settings' && <SettingsView />}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/10 rounded-[32px] p-2 flex items-center justify-between z-50 overflow-x-auto no-scrollbar">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all shrink-0 ${
              tab === id ? 'bg-[#1B2B5E] text-white shadow-lg shadow-[#1B2B5E]/20' : 'text-gray-400'
            }`}
          >
            <Icon size={18} />
            <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
          </button>
        ))}
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

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
