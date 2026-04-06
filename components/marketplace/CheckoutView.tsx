'use client'
import { useCartStore } from '@/store/cart'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import CheckoutForm from './CheckoutForm'
export default function CheckoutView() {
  const items = useCartStore(state => state.items)
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (items.length === 0) router.replace('/carrito')
  }, [items, router])

  useEffect(() => {
    if (!loading && !user) router.replace('/cuenta')
  }, [user, loading, router])

  if (items.length === 0) return null
  if (loading || !user) return null

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
