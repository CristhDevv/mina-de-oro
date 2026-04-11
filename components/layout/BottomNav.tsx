'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Grid2x2, ShoppingCart, User } from 'lucide-react'

const links = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/productos', label: 'Productos', icon: Grid2x2 },
  { href: '/carrito', label: 'Carrito', icon: ShoppingCart },
  { href: '/cuenta', label: 'Cuenta', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  if (pathname.startsWith('/producto/')) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-md">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 flex-1 py-2"
            >
              <Icon
                size={20}
                className={active ? 'text-[#1B2B5E]' : 'text-gray-400'}
              />
              <span className={`text-[10px] font-medium ${active ? 'text-[#1B2B5E]' : 'text-gray-400'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
