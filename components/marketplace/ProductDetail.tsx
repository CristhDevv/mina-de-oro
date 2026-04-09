'use client'

import { useState } from 'react'
import { ShoppingCart, Plus, Minus, ArrowLeft, Heart, Share2, Star, Truck, ShieldCheck, RefreshCcw, CheckCircle2 } from 'lucide-react'
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

  // Helper para renderizar estrellas
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={14}
            className={s <= Math.round(rating) ? 'fill-[#C9A84C] text-[#C9A84C]' : 'text-gray-300'}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="pb-28">
      {/* Header flotante */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-16 pointer-events-none">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center pointer-events-auto active:scale-95 transition-all"
        >
          <ArrowLeft size={20} className="text-[#1B2B5E]" />
        </button>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center pointer-events-auto active:scale-95 transition-all text-gray-400">
            <Heart size={20} />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center pointer-events-auto active:scale-95 transition-all text-gray-400">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Galería de Imágenes */}
      <div className="relative aspect-square bg-white w-full max-w-lg mx-auto">
        <Image
          src={images[activeImage]}
          alt={product.name}
          fill
          className="object-contain p-4"
          priority
        />
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === activeImage ? 'bg-[#C9A84C] w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Información del Producto */}
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-8">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-[#1B2B5E] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {product.category || 'Producto'}
              </span>
              {product.stock <= 5 && product.stock > 0 && (
                <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Últimas {product.stock} unidades
                </span>
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#1B2B5E] leading-tight mb-2">
            {product.name}
          </h1>
          
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#C9A84C]">
                ${product.price.toLocaleString('es-CO')}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ${product.originalPrice.toLocaleString('es-CO')}
                </span>
              )}
            </div>
            
            {/* TAREA 4: RATING */}
            <div className="flex items-center gap-2">
              {renderStars(product.rating)}
              <span className="text-xs font-medium text-gray-500">
                ({product.reviewCount})
              </span>
            </div>
          </div>
        </div>

        {/* BADGES DE CONFIANZA - NO CARDS VERSION */}
        <div className="flex items-center justify-between py-4 border-y border-gray-100">
          <div className="flex items-center gap-2">
            <Truck size={15} className="text-green-500" />
            <span className="text-[11px] font-bold text-gray-600">Envío gratis</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-blue-500" />
            <span className="text-[11px] font-bold text-gray-600">Garantía 12m</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCcw size={15} className="text-purple-500" />
            <span className="text-[11px] font-bold text-gray-600">30 días devolución</span>
          </div>
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#1B2B5E] uppercase tracking-wider">
            Descripción
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {product.description || 'Sin descripción disponible.'}
          </p>
        </div>

        {/* TAREA 4: CARACTERÍSTICAS (FEATURES) */}
        {product.features && product.features.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#1B2B5E] uppercase tracking-wider">
              Características destacadas
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {product.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#C9A84C] shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAREA 4: ESPECIFICACIONES (TABLE) */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#1B2B5E] uppercase tracking-wider">
              Especificaciones técnicas
            </h3>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
              {product.specifications.map((spec, i) => (
                <div key={i} className="flex items-center px-4 py-3 text-sm">
                  <span className="w-1/3 text-gray-400 font-medium">{spec.label}</span>
                  <span className="flex-1 text-[#1B2B5E] font-semibold">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selector de Cantidad */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-[#1B2B5E] uppercase tracking-wider block">
              Cantidad
            </span>
            <span className="text-[10px] text-gray-400">
              Disponible: {product.stock}
            </span>
          </div>
          <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-1">
            <button 
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#1B2B5E] active:scale-90 transition-all"
            >
              <Minus size={16} />
            </button>
            <span className="font-bold text-[#1B2B5E] w-4 text-center">
              {quantity}
            </span>
            <button 
              onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
              className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#1B2B5E] active:scale-90 transition-all disabled:opacity-30"
              disabled={quantity >= product.stock}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Botón flotante de acción - TAREA 4: COMPRAR AHORA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-100 z-40">
        <div className="max-w-lg mx-auto flex gap-3">
          <button 
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="w-14 h-14 bg-gray-50 text-[#1B2B5E] rounded-2xl font-bold flex items-center justify-center shadow-sm border border-gray-100 active:scale-95 transition-all text-gray-400"
            title="Añadir al carrito"
          >
            <ShoppingCart size={22} />
          </button>
          <button 
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            className="flex-1 h-14 bg-[#1B2B5E] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
          >
            {product.stock > 0 ? 'Comprar ahora' : 'Agotado'}
          </button>
        </div>
      </div>
    </div>
  )
}
