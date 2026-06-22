'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Plus, Minus, ShoppingCart, Zap, Truck, ShieldCheck, RefreshCcw } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { Product } from '@/types'

interface ProductEcommerceViewProps {
  product: Product
}

/**
 * Render de catálogo simple para productos tipo 'ecommerce'.
 * Sin landing_config, sin urgencia, sin testimonios, sin popup de actividad simulada.
 * Comparte el mismo store/cart.ts sin modificaciones.
 */
export default function ProductEcommerceView({ product }: ProductEcommerceViewProps) {
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const addItem = useCartStore((state) => state.addItem)
  const router = useRouter()

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
    <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pb-10">
      {/* Breadcrumb */}
      <nav className="max-w-4xl mx-auto px-4 pt-4 pb-2">
        <ol className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
          <li>
            <a href="/" className="hover:text-gray-700 transition-colors">Inicio</a>
          </li>
          <li className="text-gray-300">/</li>
          <li>
            <a
              href={`/categorias/${product.category}`}
              className="hover:text-gray-700 transition-colors capitalize"
            >
              {product.category.replace(/-/g, ' ')}
            </a>
          </li>
          <li className="text-gray-300">/</li>
          <li className="text-gray-600 truncate max-w-[160px]">{product.name}</li>
        </ol>
      </nav>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="md:grid md:grid-cols-2 md:gap-10">

          {/* ─── Galería de imágenes ─── */}
          <div className="space-y-3">
            {/* Imagen principal */}
            <div className="relative aspect-square w-full bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <Image
                src={images[activeImage]}
                alt={product.name}
                fill
                className="object-contain p-6"
                priority
              />
              {product.originalPrice && (
                <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 bg-white transition-all ${
                      idx === activeImage
                        ? 'border-[#1B2B5E] shadow-md'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-contain p-1.5" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Información del producto ─── */}
          <div className="mt-6 md:mt-0 space-y-5">
            {/* Categoría + Nombre */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#1B2B5E]/60 mb-1.5 capitalize">
                {product.category.replace(/-/g, ' ')}
              </p>
              <h1 className="text-2xl font-black text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              {product.rating > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex text-amber-400 text-sm">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={star <= Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  {product.reviewCount > 0 && (
                    <span className="text-xs text-gray-400 font-medium">
                      ({product.reviewCount} reseñas)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Precios */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-[#1B2B5E]">
                ${product.price.toLocaleString('es-CO')}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through font-medium">
                  ${product.originalPrice.toLocaleString('es-CO')}
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="text-sm font-semibold text-gray-600">
                {product.stock > 0
                  ? `${product.stock} unidades disponibles`
                  : 'Agotado'}
              </span>
            </div>

            {/* Selector de cantidad */}
            <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Cantidad</span>
              <div className="flex items-center gap-3 ml-auto">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-all text-gray-700"
                >
                  <Minus size={14} />
                </button>
                <span className="font-black text-gray-900 w-6 text-center text-base">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                  disabled={quantity >= product.stock}
                  className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-all text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="w-full h-14 bg-[#1B2B5E] hover:bg-[#243a7d] text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
              >
                <Zap size={18} />
                {product.stock > 0 ? `Comprar ahora · $${product.price.toLocaleString('es-CO')}` : 'Agotado'}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full h-12 bg-white hover:bg-gray-50 text-[#1B2B5E] border-2 border-[#1B2B5E] rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <ShoppingCart size={16} />
                Agregar al carrito
              </button>
            </div>

            {/* Badges de confianza */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { icon: <Truck size={14} />, text: 'Envío Colombia' },
                { icon: <ShieldCheck size={14} />, text: 'Garantía 12m' },
                { icon: <RefreshCcw size={14} />, text: '30d devolución' },
              ].map(({ icon, text }) => (
                <div
                  key={text}
                  className="flex flex-col items-center gap-1 bg-white rounded-2xl border border-gray-100 px-2 py-3 text-center shadow-sm"
                >
                  <span className="text-[#1B2B5E]/60">{icon}</span>
                  <span className="text-[10px] font-semibold text-gray-500 leading-tight">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Descripción ─── */}
        {product.description && (
          <section className="mt-10 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-black text-gray-900 mb-3">Descripción</h2>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              {product.description}
            </p>
          </section>
        )}

        {/* ─── Especificaciones técnicas ─── */}
        {product.specifications && product.specifications.length > 0 && (
          <section className="mt-5 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-black text-gray-900 mb-4">Especificaciones</h2>
            <dl className="divide-y divide-gray-50">
              {product.specifications.map((spec, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <dt className="text-sm text-gray-400 font-medium">{spec.label}</dt>
                  <dd className="text-sm text-gray-900 font-bold">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>

      {/* ─── CTA flotante mobile ─── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-2xl z-50 md:hidden">
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="flex-none w-12 h-12 bg-gray-50 border border-gray-200 text-[#1B2B5E] rounded-2xl flex items-center justify-center active:scale-90 transition-all disabled:opacity-50"
          >
            <ShoppingCart size={18} />
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            className="flex-1 h-12 bg-[#1B2B5E] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Zap size={16} />
            {product.stock > 0 ? `Comprar · $${product.price.toLocaleString('es-CO')}` : 'Agotado'}
          </button>
        </div>
      </div>
    </div>
  )
}
