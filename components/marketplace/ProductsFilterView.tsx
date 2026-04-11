'use client'

import { Category, Product } from '@/types'
import { useState, useEffect } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import ProductGrid from './ProductGrid'
import { searchProducts } from '@/lib/api/products'

interface Props {
  initialProducts: Product[]
  categories: Category[]
}

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating'

const sortLabels: Record<SortOption, string> = {
  relevance: 'Más recientes',
  price_asc: 'Menor precio',
  price_desc: 'Mayor precio',
  rating: 'Mejor valorados',
}

const priceRanges = [
  { label: 'Todos los precios', min: undefined, max: undefined },
  { label: 'Menos de $50.000', min: undefined, max: 50000 },
  { label: '$50.000 - $200.000', min: 50000, max: 200000 },
  { label: '$200.000 - $500.000', min: 200000, max: 500000 },
  { label: 'Más de $500.000', min: 500000, max: undefined },
]

export default function ProductsFilterView({ initialProducts, categories }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  
  // Estados de filtros
  const [categorySlug, setCategorySlug] = useState<string>('')
  const [rangeIndex, setRangeIndex] = useState<number>(0)
  const [sortBy, setSortBy] = useState<SortOption>('relevance')

  useEffect(() => {
    async function updateProducts() {
      setLoading(true)
      try {
        const range = priceRanges[rangeIndex]
        const results = await searchProducts('', {
          categorySlug: categorySlug || undefined,
          minPrice: range.min,
          maxPrice: range.max,
          sortBy: sortBy
        })
        setProducts(results)
      } catch (err) {
        console.error('Error al filtrar productos:', err)
      } finally {
        setLoading(false)
      }
    }
    
    updateProducts()
  }, [categorySlug, rangeIndex, sortBy])

  function formatCOP(price: number) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="pb-20 min-h-screen bg-white">
      {/* Header Fijo (Sin botón de retroceso) */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-xl font-black text-[#1B2B5E] uppercase tracking-tight pl-1">Productos</h1>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            showFilters ? 'bg-[#1B2B5E] text-white shadow-lg shadow-blue-900/20' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <SlidersHorizontal size={18} />
          <span className="text-xs font-bold uppercase tracking-wide">Filtros</span>
          {(categorySlug || rangeIndex > 0) && (
            <span className="w-2 h-2 rounded-full bg-[#C9A84C]" />
          )}
        </button>
      </div>

      {/* Panel de Filtros Desplegable con Separadores */}
      {showFilters && (
        <div className="bg-white border-b border-gray-100 px-4 py-6 space-y-7 animate-in slide-in-from-top duration-300">
          
          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Categoría</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategorySlug('')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  categorySlug === '' ? 'bg-[#1B2B5E] text-white border-[#1B2B5E]' : 'bg-white text-gray-600 border-gray-100'
                }`}
              >
                Todas
              </button>
              {categories.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => setCategorySlug(cat.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    categorySlug === cat.slug ? 'bg-[#1B2B5E] text-white border-[#1B2B5E]' : 'bg-white text-gray-600 border-gray-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100" /> {/* Separador */}

          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Ordenar por</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(sortLabels) as SortOption[]).map(key => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={`px-4 py-3 rounded-xl text-[11px] font-bold transition-all border text-left ${
                    sortBy === key ? 'bg-[#1B2B5E] text-white border-[#1B2B5E]' : 'bg-white text-gray-600 border-gray-100'
                  }`}
                >
                  {sortLabels[key]}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100" /> {/* Separador */}

          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Rango de Precio</p>
            <div className="flex flex-wrap gap-2">
              {priceRanges.map((range, index) => (
                <button
                  key={index}
                  onClick={() => setRangeIndex(index)}
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                    rangeIndex === index 
                      ? 'bg-[#1B2B5E] text-white border-[#1B2B5E]' 
                      : 'bg-white text-gray-600 border-gray-100'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => setShowFilters(false)}
            className="w-full py-4 bg-[#1B2B5E] text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-[0.98] transition-all"
          >
            Ver Resultados
          </button>
        </div>
      )}

      {/* Grid de Productos */}
      <div className="px-4 py-4 bg-gray-50/50 flex justify-between items-center">
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">
          {products.length} productos encontrados
        </p>
        {loading && <div className="w-4 h-4 border-2 border-[#1B2B5E] border-t-transparent rounded-full animate-spin" />}
      </div>

      <div className={`transition-opacity duration-300 ${loading ? 'opacity-40' : 'opacity-100'}`}>
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="py-24 text-center space-y-5 h-full">
            <p className="font-black text-[#1B2B5E] uppercase text-sm">Sin coincidencias</p>
            <button 
              onClick={() => { setCategorySlug(''); setRangeIndex(0); setSortBy('relevance'); }}
              className="px-8 py-3 bg-gray-100 text-[#1B2B5E] rounded-2xl text-[11px] font-black uppercase"
            >
              Reiniciar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
