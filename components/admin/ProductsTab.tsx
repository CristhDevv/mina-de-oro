'use client'

import { Package, Plus, Edit2, ExternalLink, Tag } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Product } from '@/types'

interface ProductsTabProps {
  products: Product[]
  onEdit: (product: Product) => void
  onAdd: () => void
}

export default function ProductsTab({ products, onEdit, onAdd }: ProductsTabProps) {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Catálogo de Productos</h2>
          <p className="text-xs text-gray-500">{products.length} productos publicados</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-[#1B2B5E] text-white text-xs font-bold h-10 px-4 rounded-2xl hover:shadow-lg hover:shadow-[#1B2B5E]/20 transition-all active:scale-95"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Nuevo Producto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="group bg-white border border-gray-100 rounded-3xl p-3 flex items-center justify-between gap-3 shadow-sm hover:shadow-md hover:border-[#1B2B5E]/20 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 text-2xl overflow-hidden relative border border-gray-50">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="opacity-50 text-xl">🛍️</span>
                )}
                {product.originalPrice && (
                  <div className="absolute top-0 right-0 p-1">
                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate group-hover:text-[#1B2B5E] transition-colors">{product.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-black text-[#1B2B5E]">{formatCurrency(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-[10px] text-gray-400 line-through font-medium">{formatCurrency(product.originalPrice)}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{product.stock} disponibles</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(product)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#1B2B5E] hover:bg-[#1B2B5E]/5 transition-all"
                title="Editar"
              >
                <Edit2 size={16} />
              </button>
              <a 
                href={`/producto/${product.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                title="Ver en tienda"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
