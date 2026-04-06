'use client'
import Link from 'next/link'
import { ShoppingCart, Search } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Header() {
  const totalItems = useCartStore((state) => state.totalItems())
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) router.push(`/buscar?q=${encodeURIComponent(q)}`)
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-1 shrink-0">
          <span className="text-lg font-bold text-[#1B2B5E]">La Mina</span>
          <span className="text-lg font-bold text-[#C9A84C]">de Oro</span>
        </Link>
        <form onSubmit={handleSearch} className="flex-1 flex items-center bg-gray-100 rounded-full px-3 h-9 gap-2">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="bg-transparent text-sm w-full outline-none text-gray-700 placeholder:text-gray-400"
          />
        </form>
        <Link href="/carrito" className="relative shrink-0">
          <ShoppingCart size={22} className="text-[#1B2B5E]" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#C9A84C] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
