'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Loader2 } from 'lucide-react'
import { createOrder } from '@/lib/api/orders'
import { useCartStore } from '@/store/cart'
import { CartItem } from '@/types'

interface Props {
  items: CartItem[]
}

export default function CheckoutForm({ items }: Props) {
  const router = useRouter()
  const clearCart = useCartStore(state => state.clearCart)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: ''
  })

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    if (!form.name || !form.phone || !form.address || !form.city) {
      setError('Completa todos los campos')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const order = await createOrder(items, form)
      clearCart()
      router.push(`/pedido/${order.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Datos de envío</h2>

      {['name', 'phone', 'address', 'city'].map(field => (
        <input
          key={field}
          name={field}
          value={form[field as keyof typeof form]}
          onChange={handleChange}
          placeholder={
            field === 'name' ? 'Nombre completo' :
            field === 'phone' ? 'Teléfono' :
            field === 'address' ? 'Dirección' : 'Ciudad'
          }
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ))}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="border-t pt-4">
        <div className="flex justify-between text-sm mb-4">
          <span className="text-gray-600">Total a pagar</span>
          <span className="font-bold text-gray-900">
            ${total.toLocaleString('es-CO')}
          </span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading
            ? <><Loader2 size={18} className="animate-spin" /> Procesando...</>
            : <><ShoppingBag size={18} /> Confirmar pedido</>
          }
        </button>
      </div>
    </div>
  )
}
