'use client'
import { useCartStore } from '@/store/cart'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import CheckoutForm from './CheckoutForm'

export default function CheckoutView() {
  const items = useCartStore(state => state.items)
  const router = useRouter()
  const { user, loading } = useAuth()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/cuenta')
      return
    }
    if (items.length === 0) {
      router.replace('/carrito')
      return
    }
    setReady(true)
  }, [user, loading, items, router])

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-[#1B2B5E] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Cargando checkout...</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Finalizar pedido</h1>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <p className="text-sm text-gray-500 mb-3">
          {items.length} producto{items.length > 1 ? 's' : ''} en tu carrito
        </p>
        {items.map(item => (
          <div key={item.product.id} className="flex justify-between text-sm py-1">
            <span className="text-gray-700">{item.product.name} x{item.quantity}</span>
            <span className="font-medium">
              ${(item.product.price * item.quantity).toLocaleString('es-CO')}
            </span>
          </div>
        ))}
      </div>
      <CheckoutForm items={items} />
    </div>
  )
}
