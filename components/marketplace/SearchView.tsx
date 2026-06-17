'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X, Loader2, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { searchProducts } from '@/lib/api/products'
import { Product } from '@/types'
import ProductGrid from './ProductGrid'

const CATEGORIES = [
  { slug: '', name: 'Todas' },
  { slug: 'belleza', name: 'Belleza' },
  { slug: 'cocina', name: 'Cocina' },
  { slug: 'electronica', name: 'Electrónica' },
  { slug: 'hogar', name: 'Hogar' },
  { slug: 'juguetes', name: 'Juguetes' },
  { slug: 'ropa', name: 'Ropa' },
]

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'rating', label: 'Mejor calificados' },
]

type SortBy = 'relevance' | 'price_asc' | 'price_desc' | 'rating'

export default function SearchView() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const [categorySlug, setCategorySlug] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState<SortBy>('relevance')

  const hasActiveFilters = categorySlug || minPrice || maxPrice || minRating > 0 || sortBy !== 'relevance'

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim() && !hasActiveFilters) {
      setResults([])
      setSearched(false)
      return
    }
    setLoading(true)
    try {
      const data = await searchProducts(q, {
        categorySlug: categorySlug || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minRating: minRating > 0 ? minRating : undefined,
        sortBy,
      })
      setResults(data)
      setSearched(true)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [categorySlug, minPrice, maxPrice, minRating, sortBy, hasActiveFilters])

  useEffect(() => {
    const timeout = setTimeout(() => runSearch(query), 400)
    return () => clearTimeout(timeout)
  }, [query, runSearch])

  const clearAll = () => {
    setQuery('')
    setCategorySlug('')
    setMinPrice('')
    setMaxPrice('')
    setMinRating(0)
    setSortBy('relevance')
    setResults([])
    setSearched(false)
  }

  return (
    <div className="pb-6">
      {/* Search input */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center bg-gray-100 rounded-2xl px-4 h-12 gap-3">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos, categorías..."
            autoFocus
            className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400"
          />
          {loading && <Loader2 size={16} className="text-gray-400 animate-spin shrink-0" />}
          {!loading && query.length > 0 && (
            <button onClick={() => setQuery('')}>
              <X size={16} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Filter toggle */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border transition-all ${
            hasActiveFilters
              ? 'bg-[#1B2B5E] text-white border-[#1B2B5E]'
              : 'text-gray-600 border-gray-200'
          }`}
        >
          <SlidersHorizontal size={14} />
          Filtros
          {hasActiveFilters && (
            <span className="bg-white text-[#1B2B5E] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              !
            </span>
          )}
          <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
        {hasActiveFilters && (
          <button onClick={clearAll} className="text-xs text-gray-400 underline">
            Limpiar todo
          </button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mx-4 mb-3 p-4 bg-gray-50 rounded-2xl flex flex-col gap-4">

          {/* Categoría */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Categoría</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setCategorySlug(cat.slug)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    categorySlug === cat.slug
                      ? 'bg-[#1B2B5E] text-white border-[#1B2B5E]'
                      : 'text-gray-600 border-gray-200 bg-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Precio */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Rango de precio (COP)</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Mín"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none bg-white"
              />
              <span className="text-gray-400 text-xs">—</span>
              <input
                type="number"
                placeholder="Máx"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none bg-white"
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Calificación mínima</p>
            <div className="flex gap-2">
              {[0, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    minRating === r
                      ? 'bg-[#1B2B5E] text-white border-[#1B2B5E]'
                      : 'text-gray-600 border-gray-200 bg-white'
                  }`}
                >
                  {r === 0 ? 'Todas' : `${r}★ +`}
                </button>
              ))}
            </div>
          </div>

          {/* Ordenar */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Ordenar por</p>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value as SortBy)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    sortBy === opt.value
                      ? 'bg-[#1B2B5E] text-white border-[#1B2B5E]'
                      : 'text-gray-600 border-gray-200 bg-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Initial state */}
      {!query && !hasActiveFilters && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-8">
          <span className="text-5xl">🔍</span>
          <p className="text-sm font-semibold text-gray-700">¿Qué estás buscando?</p>
          <p className="text-xs text-gray-400">Escribe el nombre de un producto o usa los filtros</p>
        </div>
      )}

      {/* Empty results */}
      {searched && !loading && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-8">
          <span className="text-5xl">😔</span>
          <p className="text-sm font-semibold text-gray-700">Sin resultados</p>
          <p className="text-xs text-gray-400">Intenta con otros términos o filtros</p>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <>
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-500">
              {results.length} resultado{results.length !== 1 ? 's' : ''}
              {query && (
                <> para <span className="font-semibold text-[#1B2B5E]">&quot;{query}&quot;</span></>
              )}
            </p>
          </div>
          <ProductGrid products={results} />
        </>
      )}
    </div>
  )
}
