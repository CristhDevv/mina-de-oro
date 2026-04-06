'use client'
import { useState, useEffect } from 'react'
import { Plus, Package, Tag } from 'lucide-react'
import { getProducts } from '@/lib/api/products'
import { getCategories } from '@/lib/api/categories'
import { Product, Category } from '@/types'
import ProductFormModal from './ProductFormModal'

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)

  async function load() {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([getProducts(), getCategories()])
      setProducts(p)
      setCategories(c)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function formatCOP(price: number) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="pb-8">

      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#1B2B5E]">Panel Admin</h1>
          <p className="text-xs text-gray-500">La Mina de Oro</p>
        </div>
        <button
          onClick={() => { setEditProduct(null); setShowForm(true) }}
          className="flex items-center gap-2 bg-[#1B2B5E] text-white text-sm font-semibold px-4 py-2 rounded-2xl"
        >
          <Plus size={16} />
          Producto
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 px-4 mb-5">
        <div className="bg-[#EFF6FF] rounded-2xl p-4 flex items-center gap-3">
          <Package size={20} className="text-[#1B2B5E]" />
          <div>
            <p className="text-2xl font-bold text-[#1B2B5E]">{products.length}</p>
            <p className="text-xs text-gray-500">Productos</p>
          </div>
        </div>
        <div className="bg-[#EFF6FF] rounded-2xl p-4 flex items-center gap-3">
          <Tag size={20} className="text-[#1B2B5E]" />
          <div>
            <p className="text-2xl font-bold text-[#1B2B5E]">{categories.length}</p>
            <p className="text-xs text-gray-500">Categorías</p>
          </div>
        </div>
      </div>

      {/* Product list */}
      <div className="px-4">
        <h2 className="text-sm font-bold text-gray-700 mb-3">Productos</h2>

        {loading && (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    <span className="text-lg">🛍️</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                    <p className="text-xs text-[#C9A84C] font-medium">{formatCOP(product.price)}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setEditProduct(product); setShowForm(true) }}
                  className="text-xs text-[#1B2B5E] font-semibold shrink-0 ml-2"
                >
                  Editar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <ProductFormModal
          product={editProduct}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load() }}
        />
      )}

    </div>
  )
}
