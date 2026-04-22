'use client'
import { useMemo } from 'react'
import { User } from '@/types'
import { ShoppingBag, Heart, MapPin, HelpCircle, LogOut, ChevronRight, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import PushNotificationToggle from '@/components/ui/PushNotificationToggle'

interface Props {
  user: User
}

const menuItems = [
  { icon: ShoppingBag, label: 'Mis pedidos', description: 'Revisa el estado de tus compras', href: '/cuenta/pedidos' },
  { icon: Heart, label: 'Favoritos', description: 'Productos que guardaste', href: null },
  { icon: MapPin, label: 'Mis direcciones', description: 'Gestiona tus direcciones de envío', href: null },
  { icon: HelpCircle, label: 'Ayuda', description: 'Centro de soporte', href: null },
]

export default function UserView({ user }: Props) {
  const supabase = useMemo(() => createClient(), [])
  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="pb-6">
      <div className="bg-[#1B2B5E] px-4 pt-8 pb-10 flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-[#C9A84C] flex items-center justify-center">
          <span className="text-2xl font-bold text-white uppercase">
            {user.name.charAt(0)}
          </span>
        </div>
        <div className="text-center">
          <h2 className="text-white font-bold text-lg capitalize">{user.name}</h2>
          <p className="text-white/60 text-sm">{user.email}</p>
        </div>
      </div>

      <div className="mx-4 -mt-5 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {user.role === 'admin' && (
          <Link
            href="/admin"
            className="w-full flex items-center gap-3 px-4 py-4 text-left border-b border-gray-100 bg-[#FFF9EC] active:bg-yellow-50"
          >
            <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/20 flex items-center justify-center shrink-0">
              <LayoutDashboard size={16} className="text-[#C9A84C]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#C9A84C]">Panel de administración</p>
              <p className="text-xs text-gray-400">Gestiona productos, pedidos y usuarios</p>
            </div>
            <ChevronRight size={16} className="text-[#C9A84C] shrink-0" />
          </Link>
        )}
        {menuItems.map(({ icon: Icon, label, description, href }, index) => {
          const inner = (
            <>
              <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
                <Icon size={16} className="text-[#1B2B5E]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{description}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0" />
            </>
          )
          const cls = `w-full flex items-center gap-3 px-4 py-4 text-left active:bg-gray-50 ${
            index < menuItems.length - 1 ? 'border-b border-gray-100' : ''
          }`
          return href
            ? <Link key={label} href={href} className={cls}>{inner}</Link>
            : <button key={label} className={cls}>{inner}</button>
        })}
      </div>

      <div className="px-4 mt-4 flex flex-col gap-3">
        <PushNotificationToggle userId={user.id} />
        <button
          onClick={handleLogout}
          className="w-full h-12 rounded-2xl border border-red-200 text-red-500 text-sm font-semibold flex items-center justify-center gap-2 active:bg-red-50"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
