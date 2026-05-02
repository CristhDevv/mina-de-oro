'use client'

import { useState } from 'react'
import { ShoppingCart, Plus, Minus, Truck, ShieldCheck, RefreshCcw, CheckCircle2, Lock } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Product } from '@/types'

interface ProductDetailProps {
  product: Product
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const addItem = useCartStore((state) => state.addItem)
  const router = useRouter()
  const accent = product.brand_color || '#1B2B5E'

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['/images/placeholder.svg']

  const handleAddToCart = () => {
    addItem(product, quantity)
  }

  const handleBuyNow = () => {
    addItem(product, quantity)
    router.push('/carrito')
  }

  return (
    <div className="pb-8 bg-white" style={{ '--accent': accent } as React.CSSProperties}>
      {/* 1. Galería de Imágenes - Estilo Amazon con Thumbnails */}
      <div className="w-full max-w-lg mx-auto bg-white pt-2">
        <div className="relative aspect-square w-full">
          <Image
            src={images[activeImage]}
            alt={product.name}
            fill
            className="object-contain p-4"
            priority
          />
        </div>
        
        {/* Selector de imágenes en miniatura */}
        {images.length > 1 && (
          <div className="flex gap-2 justify-center px-4 mt-3">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all`}
                style={{ borderColor: idx === activeImage ? accent : 'transparent' }}
              >
                <Image src={img} alt="" fill className="object-contain p-1" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
        {/* 2. Información Principal (Sin categoría ni rating) */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold leading-tight" style={{ color: accent }}>
            {product.name}
          </h1>
          
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black" style={{ color: accent }}>
              ${product.price.toLocaleString('es-CO')}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ${product.originalPrice.toLocaleString('es-CO')}
              </span>
            )}
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase ml-auto">
                Solo {product.stock} disponibles
              </span>
            )}
          </div>
        </div>

        {/* 3. Selector de Cantidad */}
        <div className="bg-transparent rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: accent }}>
              Cantidad
            </span>
          </div>
          <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-1">
            <button 
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center active:scale-90 transition-all"
              style={{ color: accent }}
            >
              <Minus size={16} />
            </button>
            <span className="font-bold w-4 text-center" style={{ color: accent }}>
              {quantity}
            </span>
            <button 
              onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
              className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center active:scale-90 transition-all disabled:opacity-30"
              style={{ color: accent }}
              disabled={quantity >= product.stock}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* 4. Botones de Acción Inline */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-14 h-14 bg-white rounded-2xl font-bold flex items-center justify-center shadow-sm border border-gray-200 active:scale-95 transition-all hover:bg-gray-50"
              style={{ color: accent }}
              title="Añadir al carrito"
            >
              <ShoppingCart size={22} />
            </button>
            <button 
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="flex-1 h-14 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale uppercase tracking-wide"
              style={{ backgroundColor: accent }}
            >
              {product.stock > 0 ? 'Comprar ahora' : 'Agotado'}
            </button>
          </div>
        </div>

        {/* 5. Badges de Confianza - Estilo Amazon (Blanco y Negro) */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 py-4 border-y border-gray-100">
          <div className="flex items-center gap-2">
            <Truck size={15} className="text-gray-600" />
            <span className="text-[11px] font-medium text-gray-600">Envío gratis</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-gray-600" />
            <span className="text-[11px] font-medium text-gray-600">Garantía 12m</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCcw size={15} className="text-gray-600" />
            <span className="text-[11px] font-medium text-gray-600">30 días devolución</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock size={15} className="text-gray-600" />
            <span className="text-[11px] font-medium text-gray-600">Pago seguro</span>
          </div>
        </div>

        {/* 6. Descripción sutil */}
        <div className="space-y-1">
          <p className="text-sm text-gray-600 leading-relaxed">
            {product.description || 'Sin descripción disponible.'}
          </p>
        </div>

        {/* 7. Características Destacadas - Más sutiles */}
        {product.features && product.features.length > 0 && (
          <section className="space-y-2 pt-2 border-t border-gray-50">
            <h2 className="sr-only">Características destacadas</h2>
            <ul className="grid grid-cols-1 gap-2.5">
              {product.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={14} className="text-gray-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-sm text-gray-600 leading-tight">{feature}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 8. Especificaciones Técnicas - Tabla minimalista sin título visible */}
        {product.specifications && product.specifications.length > 0 && (
          <section className="pt-2 border-t border-gray-50">
            <h2 className="sr-only">Especificaciones técnicas</h2>
            <dl className="divide-y divide-gray-50">
              {product.specifications.map((spec, i) => (
                <div key={i} className="flex items-center py-2.5 text-sm">
                  <dt className="w-1/3 text-gray-400 text-xs">{spec.label}</dt>
                  <dd className="flex-1 text-gray-700 font-medium text-xs">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* 9. Descripción Detallada (Rich Content) */}
        {product.rich_content && product.rich_content.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-gray-100 pb-10">
            {product.rich_content.map((block, i) => (
              <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75">
                {block.type === 'heading' ? (
                  block.level === 1 ? (
                    <h1 className="text-2xl font-black mb-4 mt-6" style={{ color: accent }}>{block.content}</h1>
                  ) : block.level === 2 ? (
                    <h2 className="text-xl font-bold mb-3 mt-5" style={{ color: accent }}>{block.content}</h2>
                  ) : (
                    <h3 className="text-lg font-bold mb-2 mt-4" style={{ color: accent }}>{block.content}</h3>
                  )
                ) : block.type === 'text' ? (
                  <p className={`text-base text-gray-700 leading-[1.6] whitespace-pre-wrap px-1 ${block.bold ? 'font-bold' : ''}`}>
                    {block.content}
                  </p>
                ) : (
                  <div className="relative w-full aspect-[16/10] sm:aspect-video rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50 my-4">
                    <Image
                      src={block.url}
                      alt={block.alt || product.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 512px) 100vw, 512px"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 10. Preguntas Frecuentes (GEO Optimized) */}
        {product.faq && product.faq.length > 0 && (
          <section className="space-y-4 pt-8 border-t border-gray-100 pb-10">
            <h2 className="text-lg font-bold px-1" style={{ color: accent }}>Preguntas Frecuentes</h2>
            <div className="space-y-4">
              {product.faq.map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <h3 className="text-sm font-bold mb-2" style={{ color: accent }}>{item.question}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
