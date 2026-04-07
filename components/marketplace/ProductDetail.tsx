'use client'
import { Product } from '@/types'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { ArrowLeft, Star, ShoppingCart, Plus, Minus, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { getRelatedProducts } from '@/lib/api/products'
import ProductCard from './ProductCard'

interface Props { product: Product }

function formatCOP(price: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)
}

function getDiscount(original: number, current: number) {
  return Math.round((1 - current / original) * 100)
}

export default function ProductDetail({ product }: Props) {
  const router = useRouter()
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [related, setRelated] = useState<Product[]>([])
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const discount = product.originalPrice ? getDiscount(product.originalPrice, product.price) : null
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    getRelatedProducts(product.category, product.id).then(setRelated).catch(() => {})
  }, [product.id, product.category])

  function handleAdd() {
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="pb-32">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-2 px-4 pt-4 pb-2 text-[#1B2B5E]">
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Volver</span>
      </button>

      {/* Imagen principal */}
      <div className="mx-4 rounded-2xl bg-gray-50 aspect-[4/3] flex items-center justify-center relative overflow-hidden">
        {product.images?.[activeImage] ? (
          <Image src={product.images[activeImage]} alt={product.name} fill className="object-contain rounded-2xl" sizes="(max-width: 768px) 100vw, 500px" />
        ) : (
          <span className="text-8xl">🛍️</span>
        )}
      </div>

      {/* Miniaturas */}
      {product.images?.length > 1 && (
        <div className="flex gap-2 px-4 mt-3 overflow-x-auto pb-1">
          {product.images.map((img, i) => (
            <button key={i} onClick={() => setActiveImage(i)}
              className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${activeImage === i ? 'border-[#1B2B5E]' : 'border-transparent'}`}>
              <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="px-4 pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">{product.category}</span>
          <div className="flex items-center gap-1">
            <Star size={13} className="fill-[#C9A84C] text-[#C9A84C]" />
            <span className="text-xs font-semibold text-gray-700">{product.rating}</span>
            <span className="text-xs text-gray-400">({product.reviewCount} reseñas)</span>
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900 leading-tight">{product.name}</h1>
        <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>

        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold text-[#1B2B5E]">{formatCOP(product.price)}</span>
          {product.originalPrice && (
            <div className="flex flex-col">
              <span className="text-sm text-gray-400 line-through">{formatCOP(product.originalPrice)}</span>
              {discount && <span className="text-xs font-bold text-[#C9A84C]">Ahorras {discount}%</span>}
            </div>
          )}
        </div>

        <p className="text-xs text-green-600 font-medium">✓ {product.stock} unidades disponibles</p>

        {/* Opciones */}
        {product.options?.length > 0 && (
          <div className="flex flex-col gap-3">
            {product.options.map((opt) => (
              <div key={opt.name}>
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  {opt.name}{selectedOptions[opt.name] ? `: ${selectedOptions[opt.name]}` : ''}
                </p>
                <div className="flex flex-wrap gap-2">
                  {opt.values.map((val) => (
                    <button key={val} onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: val }))}
                      className={`px-3 py-1.5 rounded-xl border text-sm transition-all ${
                        selectedOptions[opt.name] === val
                          ? 'bg-[#1B2B5E] text-white border-[#1B2B5E]'
                          : 'border-gray-200 text-gray-700'
                      }`}>
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="h-px bg-gray-100" />

        {/* Cantidad */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Cantidad</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 active:bg-gray-100">
              <Minus size={14} />
            </button>
            <span className="text-base font-bold text-gray-900 w-4 text-center">{quantity}</span>
            <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              className="w-8 h-8 rounded-full bg-[#1B2B5E] flex items-center justify-center text-white active:opacity-80">
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* FAQ */}
        {product.faq?.length > 0 && (
          <div className="flex flex-col gap-2 pt-2">
            <p className="text-sm font-bold text-gray-900">Preguntas frecuentes</p>
            {product.faq.map((f, i) => (
              <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left">
                  <span className="text-sm font-medium text-gray-800">{f.question}</span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform shrink-0 ml-2 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-3">
                    <p className="text-sm text-gray-500 leading-relaxed">{f.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Productos relacionados */}
        {related.length > 0 && (
          <div className="pt-4">
            <h2 className="text-base font-bold text-gray-900 mb-3">También te puede gustar</h2>
            <div className="grid grid-cols-2 gap-3">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* CTA fijo */}
      <div className="fixed bottom-16 left-0 right-0 px-4 py-3 bg-white border-t border-gray-100 max-w-lg mx-auto">
        <button onClick={handleAdd}
          className={`w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition-colors ${
            added ? 'bg-green-500 text-white' : 'bg-[#1B2B5E] text-white active:opacity-80'
          }`}>
          <ShoppingCart size={18} />
          {added ? '¡Agregado al carrito!' : `Agregar al carrito · ${formatCOP(product.price * quantity)}`}
        </button>
      </div>
    </div>
  )
}
