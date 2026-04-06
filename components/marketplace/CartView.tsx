'use client'
import { useCartStore } from '@/store/cart'
import { Trash2, Plus, Minus } from 'lucide-react'
import Link from 'next/link'

function formatCOP(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)
}

export default function CartView() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 px-8 text-center">
        <span className="text-6xl">🛒</span>
        <h2 className="text-lg font-bold text-[#1B2B5E]">Tu carrito está vacío</h2>
        <p className="text-sm text-gray-500">Agrega productos para comenzar tu compra</p>
        <Link
          href="/"
          className="mt-2 bg-[#1B2B5E] text-white text-sm font-semibold px-6 py-3 rounded-2xl"
        >
          Ver productos
        </Link>
      </div>
    )
  }

  return (
    <div className="pb-36">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h1 className="text-lg font-bold text-[#1B2B5E]">Mi Carrito</h1>
        <button
          onClick={clearCart}
          className="text-xs text-red-400 font-medium"
        >
          Vaciar
        </button>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-3 px-4">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-3">

            {/* Image */}
            <div className="w-20 h-20 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
              <span className="text-3xl">🛍️</span>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col gap-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-800 leading-tight truncate">
                {product.name}
              </h3>
              <span className="text-base font-bold text-[#1B2B5E]">
                {formatCOP(product.price)}
              </span>

              {/* Quantity + Delete */}
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-bold text-gray-900 w-4 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="w-7 h-7 rounded-full bg-[#1B2B5E] flex items-center justify-center text-white"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <button onClick={() => removeItem(product.id)}>
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Fixed bottom summary */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-xl font-bold text-[#1B2B5E]">{formatCOP(totalPrice())}</span>
        </div>
        <button className="w-full h-12 bg-[#C9A84C] text-white font-semibold text-sm rounded-2xl">
          Proceder al pago
        </button>
      </div>

    </div>
  )
}
