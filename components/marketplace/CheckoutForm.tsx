'use client'
import { useState } from 'react'
import { ShoppingBag, Loader2 } from 'lucide-react'
import { createOrder } from '@/lib/api/orders'
import { useCartStore } from '@/store/cart'
import { CartItem } from '@/types'
import { baseUrl, generateReference, getWompiSignature, openWompiCheckout } from '@/lib/api/wompi'

interface Props {
  items: CartItem[]
}

export default function CheckoutForm({ items }: Props) {
  const clearCart = useCartStore(state => state.clearCart)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '' })

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const amountInCents = total * 100

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
      // 1. Crear orden en Supabase con status pending
      const order = await createOrder(items, form)

      // 2. Generar referencia y firma
      const reference = generateReference(order.id)
      const signature = await getWompiSignature(reference, amountInCents)

      // 3. Redirigir a Wompi
      openWompiCheckout({
        publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY!,
        reference,
        amountInCents,
        currency: 'COP',
        signature,
        redirectUrl: `${baseUrl}/pedido/${order.id}`,
        customerEmail: form.name,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pedido')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Datos de envío</h2>

      {[
        { name: 'name', placeholder: 'Nombre completo' },
        { name: 'phone', placeholder: 'Teléfono' },
        { name: 'address', placeholder: 'Dirección' },
        { name: 'city', placeholder: 'Ciudad' },
      ].map(({ name, placeholder }) => (
        <input
          key={name}
          name={name}
          value={form[name as keyof typeof form]}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2B5E]"
        />
      ))}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="border-t pt-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Total a pagar</span>
          <span className="font-bold text-gray-900">${total.toLocaleString('es-CO')}</span>
        </div>
        <p className="text-xs text-gray-400 mb-4">Serás redirigido a Wompi para completar el pago de forma segura.</p>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#1B2B5E] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading
            ? <><Loader2 size={18} className="animate-spin" /> Procesando...</>
            : <><ShoppingBag size={18} /> Pagar con Wompi</>
          }
        </button>
      </div>
    </div>
  )
}
