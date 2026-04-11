'use client'
import { Category, Product } from '@/types'
import { useState } from 'react'
import { ArrowLeft, SlidersHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ProductGrid from './ProductGrid'

interface Props {
  category: Category
  products: Product[]
}

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating'

const sortLabels: Record<SortOption, string> = {
  relevance: 'Relevancia',
  price_asc: 'Menor precio',
  price_desc: 'Mayor precio',
  rating: 'Mejor valorado',
}

export default function CategoryView({ category, products }: Props) {
  const router = useRouter()
  const [sort, setSort] = useState<SortOption>('relevance')
  const [maxPrice, setMaxPrice] = useState<number>(200000)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = products
    .filter((p) => p.price <= maxPrice)
    .sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price
      if (sort === 'price_desc') return b.price - a.price
      if (sort === 'rating') return b.rating - a.rating
      return 0
    })

  function formatCOP(price: number) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="pb-6">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#1B2B5E]"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Categorías</span>
        </button>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-medium text-[#1B2B5E]"
        >
          <SlidersHorizontal size={16} />
          Filtros
        </button>
      </div>

      {/* Category title */}
      <div className="flex items-center gap-3 px-4 pb-4">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
          {category.icon}
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#1B2B5E]">{category.name}</h1>
          <p className="text-xs text-gray-500">{filtered.length} productos</p>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mx-4 mb-4 p-4 bg-[#EFF6FF] rounded-2xl flex flex-col gap-4">

          {/* Sort */}
          <div>
            <p className="text-xs font-semibold text-[#1B2B5E] mb-2 uppercase tracking-wide">Ordenar por</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSort(key as SortOption)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                    sort === key
                      ? 'bg-[#1B2B5E] text-white border-[#1B2B5E]'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {sortLabels[key as SortOption]}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-[#1B2B5E] uppercase tracking-wide">Precio máximo</p>
              <span className="text-xs font-bold text-[#C9A84C]">{formatCOP(maxPrice)}</span>
            </div>
            <input
              type="range"
              min={5000}
              max={200000}
              step={5000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#1B2B5E]"
            />
          </div>

        </div>
      )}

      {/* Products or empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-8">
          <span className="text-5xl">🔍</span>
          <p className="text-sm font-semibold text-gray-700">No hay productos con estos filtros</p>
          <p className="text-xs text-gray-400">Intenta ajustar el precio máximo</p>
        </div>
      ) : (
        <ProductGrid products={filtered} />
      )}

    </div>
  )
}
