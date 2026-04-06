'use client'
import { User } from '@/types'
import { ShoppingBag, Heart, MapPin, HelpCircle, LogOut, ChevronRight } from 'lucide-react'

interface Props {
  user: User
  onLogout: () => void
}

const menuItems = [
  { icon: ShoppingBag, label: 'Mis pedidos', description: 'Revisa el estado de tus compras' },
  { icon: Heart, label: 'Favoritos', description: 'Productos que guardaste' },
  { icon: MapPin, label: 'Mis direcciones', description: 'Gestiona tus direcciones de envío' },
  { icon: HelpCircle, label: 'Ayuda', description: 'Centro de soporte' },
]

export default function UserView({ user, onLogout }: Props) {
  return (
    <div className="pb-6">

      {/* Profile header */}
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

      {/* Menu */}
      <div className="mx-4 -mt-5 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {menuItems.map(({ icon: Icon, label, description }, index) => (
          <button
            key={label}
            className={`w-full flex items-center gap-3 px-4 py-4 text-left active:bg-gray-50 ${
              index < menuItems.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
              <Icon size={16} className="text-[#1B2B5E]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{label}</p>
              <p className="text-xs text-gray-400">{description}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 shrink-0" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="px-4 mt-4">
        <button
          onClick={onLogout}
          className="w-full h-12 rounded-2xl border border-red-200 text-red-500 text-sm font-semibold flex items-center justify-center gap-2 active:bg-red-50"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>

    </div>
  )
}
