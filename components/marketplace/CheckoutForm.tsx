'use client'
import { useState, useEffect } from 'react'
import { ShoppingBag, Loader2 } from 'lucide-react'
import { createOrder } from '@/lib/api/orders'
import { useCartStore } from '@/store/cart'
import { CartItem } from '@/types'
import { baseUrl, generateReference, getWompiSignature, openWompiCheckout } from '@/lib/api/wompi'

interface Props {
  items: CartItem[]
}

const FORM_KEY = 'checkout_form_data'

export default function CheckoutForm({ items }: Props) {
  const clearCart = useCartStore(state => state.clearCart)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '' })

  // Restaurar datos del form si el usuario retrocedió desde Wompi
  useEffect(() => {
    const saved = sessionStorage.getItem(FORM_KEY)
    if (saved) {
      try { setForm(JSON.parse(saved)) } catch { /* ignore */ }
    }
  }, [])

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
      // Guardar datos del form antes de salir
      sessionStorage.setItem(FORM_KEY, JSON.stringify(form))

      const order = await createOrder(items, form)
      const reference = generateReference(order.id)
      const signature = await getWompiSignature(reference, amountInCents)

      openWompiCheckout({
        publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY!,
        reference,
        amountInCents,
        currency: 'COP',
        signature,
        redirectUrl: `${baseUrl}/pedido/${order.id}?confirmed=true`,
        customerEmail: form.phone,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pedido')
      sessionStorage.removeItem(FORM_KEY)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Datos de envío</h2>
      <input name="name" placeholder="Nombre completo" value={form.name} onChange={handleChange}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#1B2B5E]" />
      <input name="phone" placeholder="Teléfono / WhatsApp" value={form.phone} onChange={handleChange}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#1B2B5E]" />
      <input name="address" placeholder="Dirección" value={form.address} onChange={handleChange}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#1B2B5E]" />
      <input name="city" placeholder="Ciudad" value={form.city} onChange={handleChange}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#1B2B5E]" />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <p className="text-sm text-gray-500 text-center">
        Serás redirigido a Wompi para completar el pago de forma segura.
      </p>
      <button onClick={handleSubmit} disabled={loading}
        className="w-full bg-[#1B2B5E] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
        {loading ? <Loader2 size={20} className="animate-spin" /> : <ShoppingBag size={20} />}
        {loading ? 'Procesando...' : `Pagar $${total.toLocaleString('es-CO')} con Wompi`}
      </button>
    </div>
  )
}
