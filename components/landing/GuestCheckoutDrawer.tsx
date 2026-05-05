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
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out max-h-[92dvh] flex flex-col ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-black text-base" style={{ color: accent }}>
            Finalizar pedido
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-90 transition-all"
            aria-label="Cerrar"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Content — scrollable */}
        <div className="overflow-y-auto flex-1 px-5 py-4">

          {/* ── STEP: FORM ── */}
          {(step === 'form' || step === 'loading') && (
            <form id="guest-checkout-form" onSubmit={handleSubmit} className="space-y-4">

              {/* Resumen del producto */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 text-white flex items-center justify-center text-xs font-black"
                  style={{ backgroundColor: accent }}
                >
                  ×{form.quantity}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">${product.price.toLocaleString('es-CO')} c/u</p>
                </div>
                <p className="font-black text-base flex-shrink-0" style={{ color: accent }}>
                  ${total.toLocaleString('es-CO')}
                </p>
              </div>

              {/* Selector de cantidad */}
              <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                <span className="text-sm font-bold text-gray-700">Cantidad</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center active:scale-90 transition-all"
                    style={{ color: accent }}
                    aria-label="Reducir cantidad"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="font-black w-5 text-center" style={{ color: accent }}>
                    {form.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, quantity: Math.min(product.stock, p.quantity + 1) }))}
                    disabled={form.quantity >= product.stock}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center active:scale-90 transition-all disabled:opacity-30"
                    style={{ color: accent }}
                    aria-label="Aumentar cantidad"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              {/* Separador */}
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 pt-1">
                Datos de envío
              </p>

              {/* Nombre */}
              <div className="space-y-1">
                <label htmlFor="checkout-name" className="text-xs font-semibold text-gray-600">
                  Nombre completo *
                </label>
                <input
                  id="checkout-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Juan García"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-current focus:bg-white transition-all"
                  style={{ '--tw-ring-color': accent } as React.CSSProperties}
                  onFocus={e => e.target.style.borderColor = accent}
                  onBlur={e => e.target.style.borderColor = ''}
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-1">
                <label htmlFor="checkout-phone" className="text-xs font-semibold text-gray-600">
                  WhatsApp / Teléfono *
                </label>
                <input
                  id="checkout-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="3001234567"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all"
                  onFocus={e => e.target.style.borderColor = accent}
                  onBlur={e => e.target.style.borderColor = ''}
                />
              </div>

              {/* Ciudad */}
              <div className="space-y-1">
                <label htmlFor="checkout-city" className="text-xs font-semibold text-gray-600">
                  Ciudad *
                </label>
                <input
                  id="checkout-city"
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Bogotá"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all"
                  onFocus={e => e.target.style.borderColor = accent}
                  onBlur={e => e.target.style.borderColor = ''}
                />
              </div>

              {/* Dirección */}
              <div className="space-y-1">
                <label htmlFor="checkout-address" className="text-xs font-semibold text-gray-600">
                  Dirección de entrega *
                </label>
                <input
                  id="checkout-address"
                  name="address"
                  type="text"
                  autoComplete="street-address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Calle 80 #45-23, Apto 301"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all"
                  onFocus={e => e.target.style.borderColor = accent}
                  onBlur={e => e.target.style.borderColor = ''}
                />
              </div>

              {/* Badges de confianza */}
              <div className="flex items-center justify-center gap-5 py-2">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Truck size={13} />
                  <span className="text-[11px]">Envío gratis</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <ShieldCheck size={13} />
                  <span className="text-[11px]">Pago contra entrega</span>
                </div>
              </div>

              {/* Spacer para que el botón sticky no tape el contenido */}
              <div className="h-2" />
            </form>
          )}

          {/* ── STEP: SUCCESS ── */}
          {step === 'success' && (
            <div className="flex flex-col items-center text-center py-6 space-y-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${accent}15` }}
              >
                <CheckCircle2 size={36} style={{ color: accent }} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black" style={{ color: accent }}>¡Pedido recibido!</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Nos comunicaremos contigo pronto para coordinar la entrega.
                </p>
              </div>
              {reference && (
                <div className="bg-gray-50 rounded-2xl px-4 py-3 w-full">
                  <p className="text-xs text-gray-400 mb-1">Número de referencia</p>
                  <p className="font-mono text-sm font-bold text-gray-700 break-all">{reference}</p>
                </div>
              )}
              <button
                onClick={onClose}
                className="w-full h-12 rounded-2xl font-bold text-sm text-white mt-2"
                style={{ backgroundColor: accent }}
              >
                Cerrar
              </button>
            </div>
          )}

          {/* ── STEP: ERROR ── */}
          {step === 'error' && (
            <div className="flex flex-col items-center text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle size={36} className="text-red-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-gray-900">Algo salió mal</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{errorMsg}</p>
              </div>
              <button
                onClick={() => setStep('form')}
                className="w-full h-12 rounded-2xl font-bold text-sm text-white"
                style={{ backgroundColor: accent }}
              >
                Intentar de nuevo
              </button>
            </div>
          )}
        </div>

        {/* Footer sticky — solo visible en el form */}
        {(step === 'form' || step === 'loading') && (
          <div className="px-5 pb-6 pt-3 border-t border-gray-100 flex-shrink-0 bg-white">
            <button
              type="submit"
              form="guest-checkout-form"
              disabled={!isValid || step === 'loading'}
              className="w-full h-14 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ backgroundColor: accent }}
            >
              {step === 'loading' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
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
