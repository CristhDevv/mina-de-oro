'use client'
import { Product } from '@/types'
import Image from 'next/image'
import { useState } from 'react'
import { ArrowLeft, Star, ShoppingCart, Plus, Minus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'

interface Props {
  product: Product
}

function formatCOP(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)
}

function getDiscount(original: number, current: number) {
  return Math.round((1 - current / original) * 100)
}

export default function ProductDetail({ product }: Props) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const discount = product.originalPrice
    ? getDiscount(product.originalPrice, product.price)
    : null

  const addItem = useCartStore((state) => state.addItem)

  function handleAdd() {
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="pb-32">

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 px-4 pt-4 pb-2 text-[#1B2B5E]"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Volver</span>
      </button>

      {/* Image */}
      <div className="mx-4 rounded-2xl bg-gray-50 aspect-square flex items-center justify-center relative overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover rounded-2xl"
            sizes="(max-width: 768px) 100vw, 500px"
          />
        ) : (
          <span className="text-8xl">🛍️</span>
        )}
      </div>

      {/* Info */}
      <div className="px-4 pt-4 flex flex-col gap-3">

        {/* Category + Rating */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
            {product.category}
          </span>
          <div className="flex items-center gap-1">
            <Star size={13} className="fill-[#C9A84C] text-[#C9A84C]" />
            <span className="text-xs font-semibold text-gray-700">{product.rating}</span>
            <span className="text-xs text-gray-400">({product.reviewCount} reseñas)</span>
          </div>
        </div>

        {/* Name */}
        <h1 className="text-xl font-bold text-gray-900 leading-tight">
          {product.name}
        </h1>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold text-[#1B2B5E]">
            {formatCOP(product.price)}
          </span>
          {product.originalPrice && (
            <div className="flex flex-col">
              <span className="text-sm text-gray-400 line-through">
                {formatCOP(product.originalPrice)}
              </span>
              {discount && (
                <span className="text-xs font-bold text-[#C9A84C]">
                  Ahorras {discount}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stock */}
        <p className="text-xs text-green-600 font-medium">
          ✓ {product.stock} unidades disponibles
        </p>

        {/* Divider */}
        <div className="h-px bg-gray-100" />

        {/* Quantity selector */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Cantidad</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 active:bg-gray-100"
            >
              <Minus size={14} />
            </button>
            <span className="text-base font-bold text-gray-900 w-4 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              className="w-8 h-8 rounded-full bg-[#1B2B5E] flex items-center justify-center text-white active:opacity-80"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 px-4 py-3 bg-white border-t border-gray-100 max-w-lg mx-auto">
        <button
          onClick={handleAdd}
          className={`w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition-colors ${
            added
              ? 'bg-green-500 text-white'
              : 'bg-[#1B2B5E] text-white active:opacity-80'
          }`}
        >
          <ShoppingCart size={18} />
          {added ? '¡Agregado al carrito!' : `Agregar al carrito · ${formatCOP(product.price * quantity)}`}
        </button>
      </div>

    </div>
  )
}
