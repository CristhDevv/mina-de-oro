'use client'

import { ShoppingBag, Clock, Star, Zap, ChevronLeft, Heart, Share2, MessageCircle, CheckCircle2, List } from 'lucide-react'
import { LandingConfig, ProductOption, ProductFAQ, RichContentBlock } from '@/types'
import Image from 'next/image'

interface ProductPreviewProps {
  name: string
  description: string
  price: string
  originalPrice: string
  images: string[]
  features: string[]
  landingConfig: LandingConfig
  specifications: { label: string; value: string }[]
  faq: ProductFAQ[]
  brandColor: string
  videoUrl?: string | null
}

export default function ProductPreview({
  name,
  description,
  price,
  originalPrice,
  images,
  features,
  landingConfig,
  specifications,
  faq,
  brandColor,
  videoUrl,
}: ProductPreviewProps) {
  const colors = landingConfig?.colors || {}
  const sections = landingConfig?.sections || {}

  const primary = colors.primary || '#2C3E50'
  const accent = colors.accent || '#A0856A'
  const cta = colors.cta || '#D4691E'
  const red = colors.red || '#7B2020'
  const bg = colors.bg || '#F5F5F0'

  const formattedPrice = price
    ? `$${Number(price).toLocaleString('es-CO')}`
    : '$129.900'
  const formattedOriginal = originalPrice
    ? `$${Number(originalPrice).toLocaleString('es-CO')}`
    : null

  const coverImage = images && images.length > 0 ? images[0] : null
  const testimonialsItems = (sections.testimonials as any)?.items || []
  const testimonialsTitle = (sections.testimonials as any)?.title || 'Reseñas ⭐⭐⭐⭐⭐'

  return (
    <div className="w-full max-w-[360px] mx-auto bg-gray-950 rounded-[50px] p-3 border-4 border-gray-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/5 relative overflow-hidden select-none">
      {/* Speaker and Camera Notch */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-full z-50 flex items-center justify-between px-4">
        <div className="w-3 h-3 bg-gray-900 rounded-full border border-gray-800/40" />
        <div className="w-12 h-1 bg-gray-900 rounded-full" />
      </div>

      {/* Screen Container */}
      <div 
        className="w-full rounded-[38px] overflow-hidden flex flex-col max-h-[640px] min-h-[580px] bg-white no-scrollbar overflow-y-auto pb-16 relative pt-6 text-xs text-gray-800"
        style={{ backgroundColor: bg }}
      >
        {/* Announcement Bar */}
        <div 
          className="py-2 px-3 text-center text-[9px] font-black text-white uppercase tracking-wider shrink-0 transition-colors duration-300"
          style={{ backgroundColor: primary }}
        >
          🚚 ENVÍO A TODO COLOMBIA · Sin riesgos
        </div>

        {/* Top Header */}
        <div className="h-12 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 shrink-0 sticky top-0 z-40">
          <ChevronLeft size={16} className="text-gray-600" />
          <span className="font-black text-[10px] uppercase tracking-wider text-[#1B2B5E]" style={{ color: primary }}>
            Tienda Oficial
          </span>
          <div className="flex gap-2.5">
            <Heart size={15} className="text-gray-400" />
            <Share2 size={15} className="text-gray-400" />
          </div>
        </div>

        {/* Hero Section */}
        {sections.hero?.active !== false && (
          <div className="bg-white px-4 pb-4 pt-3 rounded-b-3xl shadow-sm border-b border-gray-100 shrink-0">
            {/* Gallery Image */}
            <div className="aspect-square rounded-2xl bg-gray-50 mb-3.5 relative overflow-hidden flex items-center justify-center border border-gray-100/50">
              {videoUrl ? (
                <video 
                  src={videoUrl} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="object-cover w-full h-full animate-fade-in"
                />
              ) : coverImage ? (
                <img 
                  src={coverImage} 
                  alt={name} 
                  className="object-cover w-full h-full animate-fade-in"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-300 gap-2">
                  <ShoppingBag size={48} className="stroke-[1.25]" style={{ color: accent }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Sin imagen</span>
                </div>
              )}
              {images && images.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  1 / {images.length}
                </div>
              )}
            </div>

            {/* Badge */}
            <div 
              className="text-[9px] font-black px-2.5 py-1 rounded-full inline-flex items-center gap-1 mb-2 bg-opacity-10 transition-colors duration-300"
              style={{ color: accent, backgroundColor: `${accent}18` }}
            >
              ⭐ Más de 2.300 clientes felices
            </div>

            {/* Title */}
            <h1 className="text-sm font-black leading-snug mb-1 transition-colors duration-300" style={{ color: primary }}>
              {name || 'Nombre del Producto'}
            </h1>

            {/* Subtitle / Description */}
            <p className="text-[10px] text-gray-400 leading-relaxed mb-3">
              {sections.hero?.subtitle || description || 'Subtítulo o descripción corta del producto.'}
            </p>

            {/* Pricing block */}
            <div className="flex items-baseline gap-2.5">
              <span className="text-lg font-black transition-colors duration-300" style={{ color: cta }}>
                {formattedPrice}
              </span>
              {formattedOriginal && (
                <span className="text-[11px] text-gray-400 line-through font-bold">
                  {formattedOriginal}
                </span>
              )}
              {formattedOriginal && (
                <span className="text-[9px] font-black text-emerald-500 uppercase">
                  Ahorra {(Math.round((1 - Number(price) / Number(originalPrice)) * 100))}%
                </span>
              )}
            </div>
          </div>
        )}

        {/* Urgency Counter */}
        {sections.urgency?.active !== false && (
          <div 
            className="mx-3.5 my-3 rounded-2xl px-4 py-3 flex items-center gap-3 transition-colors duration-300" 
            style={{ backgroundColor: `${red}10`, borderLeft: `4px solid ${red}` }}
          >
            <Clock size={16} className="animate-pulse" style={{ color: red }} />
            <div>
              <div className="text-[9px] font-black uppercase tracking-wider" style={{ color: red }}>
                ¡Quedan pocas unidades en stock!
              </div>
              <div className="text-[8px] font-bold mt-0.5" style={{ color: red }}>
                ⏱ Oferta finaliza en: {sections.urgency?.duration_hours || 24} horas
              </div>
            </div>
          </div>
        )}

        {/* Problem Section */}
        {sections.problem?.active !== false && (
          <div className="mx-3.5 my-2.5 bg-white rounded-2xl p-4 shadow-sm border border-gray-100/40">
            <h3 className="text-[10px] font-black uppercase mb-1.5 transition-colors duration-300" style={{ color: primary }}>
              {sections.problem?.title || '¿Tienes este problema?'}
            </h3>
            <p className="text-[9px] text-gray-500 leading-relaxed">
              {sections.problem?.copy || 'Escribe sobre la necesidad que resuelve este producto.'}
            </p>
          </div>
        )}

        {/* Benefits Grid */}
        {sections.benefits?.active !== false && (
          <div className="mx-3.5 my-2.5 bg-white rounded-2xl p-4 shadow-sm border border-gray-100/40">
            <h3 className="text-[10px] font-black uppercase text-center mb-3 transition-colors duration-300" style={{ color: primary }}>
              {sections.benefits?.title || 'Beneficios principales'}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {features && features.length > 0 ? (
                features.map((feature, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-2 flex items-start gap-1.5">
                    <CheckCircle2 size={11} className="mt-0.5 shrink-0" style={{ color: accent }} />
                    <span className="text-[9px] font-bold text-gray-700 leading-tight">{feature}</span>
                  </div>
                ))
              ) : (
                ['Envío rápido', 'Calidad premium', 'Garantía oficial', 'Pago seguro'].map((b, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-2 flex items-start gap-1.5">
                    <CheckCircle2 size={11} className="mt-0.5 shrink-0" style={{ color: accent }} />
                    <span className="text-[9px] font-bold text-gray-600 leading-tight">{b}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Specs Table */}
        {sections.specs?.active !== false && specifications && specifications.length > 0 && (
          <div className="mx-3.5 my-2.5 bg-white rounded-2xl p-4 shadow-sm border border-gray-100/40">
            <h3 className="text-[10px] font-black uppercase mb-3.5 transition-colors duration-300" style={{ color: primary }}>
              Especificaciones Técnicas
            </h3>
            <div className="space-y-2">
              {specifications.map((spec, i) => (
                <div key={i} className="flex justify-between py-1 border-b border-gray-50 last:border-0 text-[9px]">
                  <span className="text-gray-400 font-medium">{spec.label}</span>
                  <span className="font-bold text-gray-800" style={{ color: primary }}>{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials Carousel */}
        {sections.testimonials?.active !== false && (
          <div className="mx-3.5 my-2.5 bg-white rounded-2xl p-4 shadow-sm border border-gray-100/40 space-y-3">
            <h3 className="text-[10px] font-black uppercase text-center transition-colors duration-300" style={{ color: primary }}>
              {testimonialsTitle}
            </h3>
            <div className="space-y-2.5">
              {testimonialsItems.length > 0 ? (
                testimonialsItems.slice(0, 3).map((item: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1.5 border border-gray-100/10">
                    <div className="flex items-center gap-2">
                      {item.avatar ? (
                        <div className="w-5 h-5 rounded-full overflow-hidden relative border border-gray-200">
                          <img src={item.avatar} alt={item.author} className="object-cover w-full h-full" />
                        </div>
                      ) : (
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] text-white font-black uppercase tracking-wider"
                          style={{ backgroundColor: accent }}
                        >
                          {(item.author || 'C').charAt(0)}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-800 leading-none">{item.author || 'Cliente'}</span>
                        <span className="text-[7px] text-gray-400 leading-none mt-0.5">{item.city || 'Colombia'}</span>
                      </div>
                      <div className="text-[8px] text-yellow-500 ml-auto flex leading-none">
                        {'★'.repeat(item.rating || 5)}
                      </div>
                    </div>
                    <p className="text-[9px] text-gray-600 italic leading-relaxed">
                      «{item.comment || '¡Excelente compra! Me encantó el producto.'}»
                    </p>
                  </div>
                ))
              ) : (
                <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] text-white font-black" style={{ backgroundColor: accent }}>
                      C
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gray-800">Carlos M.</span>
                      <span className="text-[7px] text-gray-400">Bogotá</span>
                    </div>
                    <div className="text-[8px] text-yellow-500 ml-auto">★★★★★</div>
                  </div>
                  <p className="text-[9px] text-gray-600 italic">
                    «Excelente producto, la calidad supera las expectativas. El envío fue súper rápido.»
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating / Sticky Checkout Bar (Fixed relative to the phone screen) */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-3 flex items-center justify-between gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] z-40 shrink-0">
          <div className="flex flex-col">
            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider leading-none">Total</span>
            <span className="text-sm font-black mt-0.5 leading-none" style={{ color: primary }}>{formattedPrice}</span>
          </div>
          <button 
            type="button"
            className="flex-1 py-3 px-4 rounded-xl text-center text-[9px] font-black text-white shadow-md shadow-amber-900/10 active:scale-95 transition-all uppercase tracking-widest duration-300"
            style={{ backgroundColor: cta }}
          >
            Comprar ahora
          </button>
        </div>
      </div>
    </div>
  )
}
