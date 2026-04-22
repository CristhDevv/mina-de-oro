'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Loader2, CreditCard, Banknote } from 'lucide-react'
import { createOrder, sendWhatsAppConfirmation } from '@/lib/api/orders'
import { useCartStore } from '@/store/cart'
import { CartItem } from '@/types'
import { baseUrl, generateReference, getWompiSignature, openWompiCheckout } from '@/lib/api/wompi'

interface Props {
  items: CartItem[]
}

const FORM_KEY = 'checkout_form_data'

export default function CheckoutForm({ items }: Props) {
  const router = useRouter()
  const clearCart = useCartStore(state => state.clearCart)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'wompi' | 'contraentrega'>('wompi')
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

      const digits = form.phone.replace(/\D/g, '')
      const normalizedPhone = digits.startsWith('57') ? `+${digits}` : `+57${digits}`
      const order = await createOrder(items, { ...form, phone: normalizedPhone }, paymentMethod)

      if (paymentMethod === 'contraentrega') {
        // Ejecutar WhatsApp en segundo plano para no bloquear al usuario
        sendWhatsAppConfirmation(order.id).catch(console.error)
        
        clearCart()
        sessionStorage.removeItem(FORM_KEY)
        
        // Pequeña espera para asegurar que el estado local se limpie antes de navegar
        setTimeout(() => {
          router.replace(`/pedido/${order.id}?status=confirmed`)
        }, 100)
        return
      }

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
      
      <h2 className="text-lg font-semibold text-gray-900 mt-6">Método de pago</h2>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setPaymentMethod('wompi')}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
            paymentMethod === 'wompi' ? 'border-[#1B2B5E] bg-blue-50' : 'border-gray-100 bg-white'
          }`}
        >
          <CreditCard className={paymentMethod === 'wompi' ? 'text-[#1B2B5E]' : 'text-gray-400'} />
          <span className="text-xs font-bold text-center">Tarjeta, PSE o Nequi</span>
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod('contraentrega')}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
            paymentMethod === 'contraentrega' ? 'border-[#C9A84C] bg-amber-50' : 'border-gray-100 bg-white'
          }`}
        >
          <Banknote className={paymentMethod === 'contraentrega' ? 'text-[#C9A84C]' : 'text-gray-400'} />
          <span className="text-xs font-bold">Contraentrega</span>
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      <p className="text-sm text-gray-500 text-center px-4">
        {paymentMethod === 'wompi' 
          ? 'Paga de forma segura con tu tarjeta, cuenta de ahorros (PSE) o Nequi.' 
          : 'Pagas en efectivo al recibir tu pedido en la puerta de tu casa.'}
      </p>
      <button onClick={handleSubmit} disabled={loading}
        className={`w-full text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors ${
          paymentMethod === 'wompi' ? 'bg-[#1B2B5E]' : 'bg-[#C9A84C]'
        }`}
      >
        {loading ? <Loader2 size={20} className="animate-spin" /> : <ShoppingBag size={20} />}
        {loading ? 'Procesando...' : (
          paymentMethod === 'wompi' 
            ? `Pagar ${total.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}`
            : `Confirmar pedido por ${total.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}`
        )}
      </button>
    </div>
  )
}
