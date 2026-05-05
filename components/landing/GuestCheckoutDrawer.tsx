'use client'

import { useState, useEffect } from 'react'
import { X, Minus, Plus, Loader2, CheckCircle2, AlertCircle, ShieldCheck, Truck } from 'lucide-react'
import { Product } from '@/types'

interface GuestCheckoutDrawerProps {
  product: Product
  open: boolean
  onClose: () => void
}

interface FormData {
  name: string
  phone: string
  address: string
  city: string
  quantity: number
}

type Step = 'form' | 'loading' | 'success' | 'error'

export default function GuestCheckoutDrawer({ product, open, onClose }: GuestCheckoutDrawerProps) {
  const accent = product.brand_color || '#1B2B5E'

  const [form, setForm] = useState<FormData>({
    name: '',
    phone: '',
    address: '',
    city: '',
    quantity: 1,
  })
  const [step, setStep] = useState<Step>('form')
  const [errorMsg, setErrorMsg] = useState('')
  const [reference, setReference] = useState('')

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      // Reset al cerrar
      setTimeout(() => {
        setStep('form')
        setErrorMsg('')
        setReference('')
      }, 300)
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const total = product.price * form.quantity

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const isValid = form.name.trim().length >= 2
    && form.phone.trim().length >= 7
    && form.address.trim().length >= 5
    && form.city.trim().length >= 2

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setStep('loading')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ product: { id: product.id }, quantity: form.quantity }],
          shippingAddress: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
          },
          paymentMethod: 'contraentrega',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Error al procesar el pedido')
        setStep('error')
        return
      }

      setReference(data.reference)
      setStep('success')
    } catch {
      setErrorMsg('Error de conexión. Intenta de nuevo.')
      setStep('error')
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Finalizar compra"
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out h-[90vh] flex flex-col overflow-hidden ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-1 flex-shrink-0">
          <div className="w-8 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header Compacto */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-bold text-sm" style={{ color: accent }}>
            {product.name} · ${product.price.toLocaleString('es-CO')}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
            aria-label="Cerrar"
          >
            <X size={14} className="text-gray-500" />
          </button>
        </div>

        {/* Content — No scroll */}
        <div className="flex-1 px-4 py-3 overflow-hidden">

          {/* ── STEP: FORM ── */}
          {(step === 'form' || step === 'loading') && (
            <form id="guest-checkout-form" onSubmit={handleSubmit} className="space-y-3">
              
              {/* Selector de cantidad y Título datos */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Datos de envío</span>
                <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                    className="w-6 h-6 rounded bg-white shadow-sm flex items-center justify-center text-xs"
                    style={{ color: accent }}
                  >
                    <Minus size={12} />
                  </button>
                  <span className="font-bold text-xs min-w-[12px] text-center" style={{ color: accent }}>
                    {form.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, quantity: Math.min(product.stock, p.quantity + 1) }))}
                    disabled={form.quantity >= product.stock}
                    className="w-6 h-6 rounded bg-white shadow-sm flex items-center justify-center text-xs disabled:opacity-30"
                    style={{ color: accent }}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Campos en columna única - Compactos */}
              <div className="space-y-2">
                <div>
                  <input
                    id="checkout-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nombre completo"
                    required
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <input
                    id="checkout-phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="WhatsApp / Teléfono"
                    required
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <input
                    id="checkout-city"
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Ciudad"
                    required
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <input
                    id="checkout-address"
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Dirección de entrega"
                    required
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Badges de confianza ultra-compactos */}
              <div className="flex items-center justify-center gap-4 py-1">
                <div className="flex items-center gap-1 text-gray-400 text-[10px]">
                  <Truck size={12} />
                  <span>Envío gratis</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-[10px]">
                  <ShieldCheck size={12} />
                  <span>Pago contra entrega</span>
                </div>
              </div>
            </form>
          )}

          {/* ── STEP: SUCCESS ── */}
          {step === 'success' && (
            <div className="flex flex-col items-center text-center py-4 space-y-3">
              <CheckCircle2 size={40} style={{ color: accent }} />
              <div className="space-y-1">
                <h3 className="text-base font-bold" style={{ color: accent }}>¡Pedido recibido!</h3>
                <p className="text-xs text-gray-600">Nos comunicaremos pronto para coordinar.</p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl font-bold text-sm text-white mt-2"
                style={{ backgroundColor: accent }}
              >
                Cerrar
              </button>
            </div>
          )}

          {/* ── STEP: ERROR ── */}
          {step === 'error' && (
            <div className="flex flex-col items-center text-center py-4 space-y-3">
              <AlertCircle size={40} className="text-red-500" />
              <h3 className="text-base font-bold text-gray-900">Algo salió mal</h3>
              <p className="text-xs text-gray-500">{errorMsg}</p>
              <button
                onClick={() => setStep('form')}
                className="w-full py-3 rounded-xl font-bold text-sm text-white"
                style={{ backgroundColor: accent }}
              >
                Reintentar
              </button>
            </div>
          )}
        </div>

        {/* Footer sticky — Siempre visible */}
        {(step === 'form' || step === 'loading') && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex-shrink-0 bg-white">
            <button
              type="submit"
              form="guest-checkout-form"
              disabled={!isValid || step === 'loading'}
              className="w-full h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 shadow-lg"
              style={{ backgroundColor: accent }}
            >
              {step === 'loading' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Procesando…
                </>
              ) : (
                <>
                  Confirmar pedido · ${total.toLocaleString('es-CO')}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
