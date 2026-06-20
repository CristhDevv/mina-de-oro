'use client'

import { useState, useEffect } from 'react'
import { Plus, Minus, Truck, ShieldCheck, RefreshCcw, Lock, CheckCircle2 } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Product } from '@/types'

interface ProductDetailProps {
  product: Product
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [activeMedia, setActiveMedia] = useState<'video' | number>(product.video_url ? 'video' : 0)
  const [isMuted, setIsMuted] = useState(true)
  const addItem = useCartStore((state) => state.addItem)
  const router = useRouter()

  // 1. Extraer configuraciones de la landing o asignar valores por defecto (Retrocompatibilidad)
  const landingConfig = product.landing_config || {}
  const colors = landingConfig.colors || {}
  const sections = landingConfig.sections || {}

  const primaryColor = colors.primary || '#2C3E50'
  const accentColor = colors.accent || '#A0856A'
  const ctaColor = colors.cta || '#D4691E'
  const redColor = colors.red || '#7B2020'
  const bgColor = colors.bg || '#F5F5F0'

  const showHero = sections.hero?.active !== false
  const heroSubtitle = sections.hero?.subtitle || product.description
  const showUrgency = sections.urgency?.active !== false
  const urgencyDuration = sections.urgency?.duration_hours || 24
  const showProblem = sections.problem?.active !== false
  const problemTitle = sections.problem?.title || ''
  const problemCopy = sections.problem?.copy || ''
  const problemImage = sections.problem?.image_url || null
  const showBenefits = sections.benefits?.active !== false
  const benefitsTitle = sections.benefits?.title || 'Todo lo que necesitas. Nada que no necesitas.'
  const showSpecs = sections.specs?.active !== false
  const showTestimonials = sections.testimonials?.active !== false
  const testimonialsTitle = sections.testimonials?.title || 'Lo que dicen quienes ya lo tienen'
  const showPricing = sections.pricing?.active !== false

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['/images/placeholder.svg']

  // 2. Cronómetro Regresivo por Sesión (localStorage)
  const [timeLeft, setTimeLeft] = useState('00h 00m 00s')
  useEffect(() => {
    if (!showUrgency) return
    const timerKey = `countdown_timer_${product.id}`
    let durationSeconds = urgencyDuration * 3600
    
    const savedTime = localStorage.getItem(timerKey)
    if (savedTime) {
      const parsed = parseInt(savedTime, 10)
      if (!isNaN(parsed) && parsed > 0) {
        durationSeconds = parsed
      }
    }

    const interval = setInterval(() => {
      durationSeconds--
      if (durationSeconds <= 0) {
        durationSeconds = urgencyDuration * 3600 // Reiniciar
      }
      localStorage.setItem(timerKey, durationSeconds.toString())

      const hours = Math.floor(durationSeconds / 3600)
      const minutes = Math.floor((durationSeconds % 3600) / 60)
      const seconds = durationSeconds % 60

      const pad = (num: number) => String(num).padStart(2, '0')
      setTimeLeft(`${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`)
    }, 1000)

    return () => clearInterval(interval)
  }, [product.id, urgencyDuration, showUrgency])

  // 3. Popup de Actividad Simulada (ciudades colombianas)
  const [popupText, setPopupText] = useState('')
  const [showPopup, setShowPopup] = useState(false)
  useEffect(() => {
    const ciudades = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Pereira', 'Manizales', 'Cartagena', 'Cúcuta', 'Ibagué', 'Pasto', 'Villavicencio']
    const mensajes = [
      'acaba de hacer su pedido',
      'pidió la opción más popular',
      'dejó sus datos para recibir el suyo',
      'está mirando esta página ahora mismo',
      'acaba de pedir el suyo'
    ]

    const mostrarPopup = () => {
      const ciudad = ciudades[Math.floor(Math.random() * ciudades.length)]
      const msg = mensajes[Math.floor(Math.random() * mensajes.length)]
      setPopupText(`Alguien de ${ciudad} ${msg}`)
      setShowPopup(true)
      setTimeout(() => { setShowPopup(false) }, 5000)
    }

    const timer = setTimeout(() => {
      mostrarPopup()
      const interval = setInterval(mostrarPopup, Math.random() * 20000 + 25000)
      return () => clearInterval(interval)
    }, 8000)

    return () => clearTimeout(timer)
  }, [])

  const handleBuyNow = () => {
    addItem(product, quantity)
    router.push('/carrito')
  }

  return (
    <div 
      className="pb-8 min-h-screen font-sans" 
      style={{ 
        '--primary': primaryColor, 
        '--accent': accentColor, 
        '--cta': ctaColor, 
        '--red': redColor, 
        '--bg': bgColor,
        backgroundColor: 'var(--bg)' 
      } as React.CSSProperties}
    >
      {/* Barra superior de anuncios */}
      <div className="w-full text-center py-2.5 px-4 text-xs font-bold text-white uppercase tracking-wider" style={{ backgroundColor: 'var(--primary)' }}>
        🚚 ENVÍO A TODO COLOMBIA · Pagas al recibir en casa · Sin riesgos 🏠
      </div>

      {/* 1. Hero Section (Imagen + Datos principales) */}
      {showHero && (
        <section className="bg-white pb-6 rounded-b-[2.5rem] shadow-sm">
          {/* Galería de Imágenes y Video */}
          <div className="w-full max-w-lg mx-auto pt-2 bg-white">
            <div className="relative aspect-square w-full">
              {activeMedia === 'video' && product.video_url ? (
                <div className="relative w-full h-full p-2">
                  <video
                    src={product.video_url}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="w-full h-full object-cover rounded-2xl shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute bottom-6 right-6 z-20 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full transition-all backdrop-blur-sm active:scale-95 flex items-center justify-center shadow-lg"
                  >
                    {isMuted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                    )}
                  </button>
                </div>
              ) : (
                <Image
                  src={images[activeMedia as number]}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                  priority
                />
              )}
            </div>
            
            {(images.length > 1 || product.video_url) && (
              <div className="flex gap-2 justify-center px-4 mt-2 overflow-x-auto no-scrollbar">
                {product.video_url && (
                  <button
                    onClick={() => setActiveMedia('video')}
                    className="relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all bg-black flex items-center justify-center shrink-0 group shadow-sm"
                    style={{ borderColor: activeMedia === 'video' ? 'var(--accent)' : '#eee' }}
                  >
                    {images[0] && (
                      <Image src={images[0]} alt="" fill className="object-contain p-1 opacity-60 group-hover:opacity-40" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center text-white bg-black/20 group-hover:bg-black/40 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </button>
                )}
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveMedia(idx)}
                    className="relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all bg-white shrink-0 shadow-sm"
                    style={{ borderColor: typeof activeMedia === 'number' && idx === activeMedia ? 'var(--accent)' : '#eee' }}
                  >
                    <Image src={img} alt="" fill className="object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información principal */}
          <div className="max-w-lg mx-auto px-5 pt-6 space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex text-amber-400 text-sm">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <div className="inline-block bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold" style={{ color: 'var(--accent)', backgroundColor: 'rgba(232, 98, 26, 0.1)' }}>
                  Más de 2.300 hogares ya lo tienen
                </div>
              </div>
              <h1 className="text-2xl font-black leading-tight" style={{ color: 'var(--primary)' }}>
                {product.name}
              </h1>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                {heroSubtitle}
              </p>
            </div>

            {/* Precios */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-black" style={{ color: 'var(--cta)' }}>
                ${product.price.toLocaleString('es-CO')}
              </span>
              {product.originalPrice && (
                <span className="text-base text-gray-400 line-through">
                  ${product.originalPrice.toLocaleString('es-CO')}
                </span>
              )}
            </div>

            {/* Selector de cantidad */}
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-2xl bg-gray-50/50">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Cantidad</span>
              <div className="flex items-center gap-4 bg-white rounded-xl p-1 shadow-sm">
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center active:scale-90 transition-all font-bold"
                  style={{ color: 'var(--primary)' }}
                >
                  <Minus size={14} />
                </button>
                <span className="font-bold w-4 text-center text-sm" style={{ color: 'var(--primary)' }}>
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                  className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center active:scale-90 transition-all font-bold"
                  style={{ color: 'var(--primary)' }}
                  disabled={quantity >= product.stock}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* CTAs de acción */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="w-full h-14 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale uppercase tracking-wide"
                style={{ backgroundColor: 'var(--cta)' }}
              >
                {product.stock > 0 ? '⚡ Pedir Ahora - Pago Contraentrega' : 'Agotado'}
              </button>
              
              <a
                href={`https://wa.me/57${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '3117284178'}?text=Hola,%20quiero%20información%20sobre%20*${encodeURIComponent(product.name)}*`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all active:scale-[0.98] bg-white"
                style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
              >
                💬 Preguntar por WhatsApp
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 2. Barra de Urgencia */}
      {showUrgency && (
        <section className="my-5 p-4 text-center rounded-2xl max-w-lg mx-auto shadow-sm text-white" style={{ backgroundColor: 'var(--red)' }}>
          <div className="text-xs uppercase tracking-widest font-black opacity-90">🔥 Oferta por tiempo limitado</div>
          <div className="text-lg font-bold my-1">
            Solo quedan <span className="underline decoration-2 font-black">{product.stock} unidades</span> en promoción
          </div>
          <div className="text-2xl font-mono font-bold tracking-wider my-2 text-yellow-300">
            {timeLeft}
          </div>
          <div className="text-xs opacity-75">El precio regresará a su valor regular al finalizar la cuenta regresiva.</div>
        </section>
      )}

      {/* 3. Antes vs Después */}
      {showProblem && problemImage && (problemTitle || problemCopy) && (
        <section className="bg-white py-8 my-5 rounded-3xl max-w-lg mx-auto px-5 shadow-sm space-y-5">
          <h2 className="text-xl font-bold text-center leading-tight" style={{ color: 'var(--primary)' }}>
            {problemTitle}
          </h2>
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-md">
            <span className="absolute top-3 left-3 z-10 bg-red-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg">❌ Antes</span>
            <span className="absolute top-3 right-3 z-10 bg-green-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg">✅ Después</span>
            <Image
              src={problemImage}
              alt="Comparativa de producto"
              fill
              className="object-cover"
            />
          </div>
          <p className="text-sm text-gray-600 text-center font-medium italic px-2">
            {problemCopy}
          </p>
        </section>
      )}

      {/* 4. Grid de Beneficios */}
      {showBenefits && product.features && product.features.length > 0 && (
        <section className="bg-white py-8 my-5 rounded-3xl max-w-lg mx-auto px-5 shadow-sm space-y-6">
          <h2 className="text-xl font-black text-center" style={{ color: 'var(--primary)' }}>
            {benefitsTitle}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {product.features.map((feature, i) => (
              <div key={i} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col gap-2 shadow-sm">
                <span className="text-2xl">⚡</span>
                <span className="text-sm font-bold text-gray-800 leading-snug">{feature}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Especificaciones Técnicas */}
      {showSpecs && product.specifications && product.specifications.length > 0 && (
        <section className="bg-white py-8 my-5 rounded-3xl max-w-lg mx-auto px-5 shadow-sm space-y-5">
          <h2 className="text-xl font-black" style={{ color: 'var(--primary)' }}>
            Especificaciones técnicas
          </h2>
          <dl className="divide-y divide-gray-100">
            {product.specifications.map((spec, i) => (
              <div key={i} className="flex items-center justify-between py-3 text-sm">
                <dt className="text-gray-400 font-medium">{spec.label}</dt>
                <dd className="text-gray-800 font-bold">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* 5.5 Contenido Detallado (Rich Content) */}
      {((product.rich_content && product.rich_content.length > 0) || product.rich_content_video_url) && (
        <section className="bg-white py-8 my-5 rounded-3xl max-w-lg mx-auto px-5 shadow-sm space-y-6">
          <div className="space-y-4">
            {product.rich_content_video_url && (
              <div className="w-full rounded-2xl overflow-hidden my-4 bg-black">
                <video
                  src={product.rich_content_video_url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full object-cover rounded-2xl"
                />
              </div>
            )}
            {product.rich_content && product.rich_content.map((block, i) => {
              if (block.type === 'text') {
                return (
                  <p 
                    key={i} 
                    className={`text-sm text-gray-700 leading-relaxed ${block.bold ? 'font-black' : 'font-medium'}`}
                  >
                    {block.content}
                  </p>
                )
              }
              if (block.type === 'heading') {
                const sizeClass = 
                  block.level === 1 ? 'text-2xl font-black' : 
                  block.level === 2 ? 'text-xl font-extrabold' : 
                  'text-lg font-bold'
                return (
                  <h3 
                    key={i} 
                    className={`${sizeClass} leading-tight text-gray-900 mt-6 first:mt-0`}
                    style={{ color: 'var(--primary)' }}
                  >
                    {block.content}
                  </h3>
                )
              }
              if (block.type === 'image') {
                return (
                  <div key={i} className="relative w-full rounded-2xl overflow-hidden shadow-sm my-4 bg-gray-50 flex items-center justify-center">
                    <img
                      src={block.url}
                      alt={block.alt || 'Detalle del producto'}
                      className="max-w-full max-h-full object-contain rounded-2xl"
                    />
                  </div>
                )
              }
              return null
            })}
          </div>
        </section>
      )}

      {/* 6. Testimonios */}
      {showTestimonials && ((sections.testimonials as any)?.items || (product.reviews && product.reviews.length > 0)) && (
        <section className="bg-white py-8 my-5 rounded-3xl max-w-lg mx-auto px-5 shadow-sm space-y-5">
          <h2 className="text-xl font-black text-center" style={{ color: 'var(--primary)' }}>
            {testimonialsTitle} ⭐⭐⭐⭐⭐
          </h2>
          <div className="space-y-4">
            {(((sections.testimonials as any)?.items && (sections.testimonials as any).items.length > 0)
              ? (sections.testimonials as any).items
              : (product.reviews || [])
            ).map((review: any, i: number) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {review.avatar ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden relative border border-gray-100 shadow-inner flex-shrink-0">
                        <Image
                          src={review.avatar}
                          alt={review.author || 'Cliente'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-inner flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }}>
                        {(review.author || 'C').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-gray-800">{review.author || 'Cliente Satisfecho'}</div>
                      <div className="text-[10px] text-gray-400">
                        {review.city ? `${review.city} · ` : ''}Compra verificada
                      </div>
                    </div>
                  </div>
                  <div className="flex text-yellow-400 text-sm">
                    {'★'.repeat(review.rating || 5)}
                  </div>
                </div>
                <p className="text-xs text-gray-600 italic leading-relaxed">
                  "{review.comment}"
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Sección de Pricing */}
      {showPricing && (
        <section className="my-5 p-6 rounded-3xl max-w-lg mx-auto text-center shadow-sm text-white" style={{ backgroundColor: 'var(--primary)' }}>
          {/* Garantías y Confianza */}
          <div className="bg-green-900/40 border border-green-800/50 rounded-2xl p-4 text-left space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏠</span>
              <div>
                <h4 className="font-bold text-sm text-white">Pago Contra Entrega</h4>
                <p className="text-xs text-white/80 leading-relaxed">Pagas al mensajero cuando entregue el paquete en la puerta de tu casa.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-white/10">
              <span className="flex items-center gap-1.5 text-white/95 font-semibold">✅ Cero riesgos</span>
              <span className="flex items-center gap-1.5 text-white/95 font-semibold">🔒 Transacción segura</span>
            </div>
          </div>

          <button
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            className="w-full h-14 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-wide"
            style={{ backgroundColor: 'var(--cta)' }}
          >
            📦 Pedir Ahora - Pago Contraentrega
          </button>
          
          <div className="flex justify-center gap-4 text-[10px] opacity-75 mt-4">
            <span className="flex items-center gap-1"><Truck size={12} /> Envío gratis</span>
            <span className="flex items-center gap-1"><ShieldCheck size={12} /> Garantía 12m</span>
            <span className="flex items-center gap-1"><Lock size={12} /> Pago Seguro</span>
          </div>
        </section>
      )}

      {/* Badges de confianza Colombia fijos en el layout */}
      <section className="bg-white py-6 my-5 rounded-3xl max-w-lg mx-auto px-5 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <Truck size={15} />, text: 'Envío a todo Colombia' },
            { icon: <ShieldCheck size={15} />, text: 'Garantía 12 meses' },
            { icon: <RefreshCcw size={15} />, text: '30 días devolución' },
            { icon: <Lock size={15} />, text: 'Pago seguro Wompi' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-gray-500">{icon}</span>
              <span className="text-[11px] font-semibold text-gray-600">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Flotante Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-2xl z-50 md:hidden">
        <button
          onClick={handleBuyNow}
          disabled={product.stock <= 0}
          className="w-full h-14 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-wide"
          style={{ backgroundColor: 'var(--cta)' }}
        >
          {product.stock > 0 ? `⚡ Comprar ahora · $${product.price.toLocaleString('es-CO')}` : 'Agotado'}
        </button>
      </div>

      {/* Popup de Actividad en tiempo real */}
      <div 
        id="activity-popup" 
        className="fixed bottom-24 left-4 z-50 bg-white rounded-2xl p-4 shadow-2xl max-w-[280px] border-l-4 border-gray-900 transition-all duration-500 ease-out flex items-center gap-3"
        style={{ 
          display: showPopup ? 'flex' : 'none', 
          borderColor: 'var(--primary)',
          transform: showPopup ? 'translateX(0)' : 'translateX(-100%)',
          opacity: showPopup ? 1 : 0
        }}
      >
        <span className="text-2xl">🛒</span>
        <div>
          <div className="font-bold text-xs text-gray-800 leading-snug" id="popup-text">
            {popupText}
          </div>
          <div className="text-[9px] text-gray-400 mt-0.5">Hace 2 minutos</div>
        </div>
        <button 
          onClick={() => setShowPopup(false)}
          className="text-gray-400 hover:text-gray-600 text-sm font-bold ml-auto"
        >
          ×
        </button>
      </div>
    </div>
  )
}
