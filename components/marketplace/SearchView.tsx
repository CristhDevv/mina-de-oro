'use client'
import { useState, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { searchProducts } from '@/lib/api/products'
import { Product } from '@/types'
import ProductGrid from './ProductGrid'

export default function SearchView() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setResults([])
      setSearched(false)
      return
    }

    const timeout = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchProducts(q)
        setResults(data)
        setSearched(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(timeout)
  }, [query])

  const showEmpty = searched && !loading && results.length === 0
  const showResults = !loading && results.length > 0

  return (
    <div className="pb-6">

      {/* Search input */}
      <div className="px-4 pt-4 pb-3">
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

      {/* Initial state */}
      {!query && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-8">
          <span className="text-5xl">🔍</span>
          <p className="text-sm font-semibold text-gray-700">¿Qué estás buscando?</p>
          <p className="text-xs text-gray-400">Escribe el nombre de un producto o categoría</p>
        </div>
      )}

      {/* Empty results */}
      {showEmpty && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-8">
          <span className="text-5xl">😔</span>
          <p className="text-sm font-semibold text-gray-700">Sin resultados para &quot;{query}&quot;</p>
          <p className="text-xs text-gray-400">Intenta con otro término</p>
        </div>
      )}

      {/* Results */}
      {showResults && (
        <>
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-500">
              {results.length} resultado{results.length !== 1 ? 's' : ''} para{' '}
              <span className="font-semibold text-[#1B2B5E]">&quot;{query}&quot;</span>
            </p>
          </div>
          <ProductGrid products={results} />
        </>
      )}

    </div>
  )
}
