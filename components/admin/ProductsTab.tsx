'use client'

import { Package, Plus, Edit2, ExternalLink, Tag } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Product } from '@/types'
import { useRouter } from 'next/navigation'

interface ProductsTabProps {
  products: Product[]
}

export default function ProductsTab({ products }: ProductsTabProps) {
  const router = useRouter()
  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Catálogo de Productos</h2>
          <p className="text-xs text-gray-500">{products.length} productos publicados</p>
        </div>
        <button
          onClick={() => router.push('/admin/productos/nuevo')}
          className="flex items-center gap-2 bg-[#1B2B5E] text-white text-xs font-bold h-10 px-4 rounded-2xl hover:shadow-lg hover:shadow-[#1B2B5E]/20 transition-all active:scale-95"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Nuevo Producto</span>
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Color</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 overflow-hidden relative shrink-0 border border-gray-100">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="opacity-50 text-sm flex items-center justify-center w-full h-full">🛍️</span>
                        )}
                        {product.originalPrice && (
                          <div className="absolute top-0 right-0 p-0.5">
                            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                      <p className="font-bold text-gray-900 group-hover:text-[#1B2B5E] transition-colors">{product.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-black text-[#1B2B5E]">{formatCurrency(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-[10px] text-gray-400 line-through font-medium">{formatCurrency(product.originalPrice)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className="font-bold text-gray-700">{product.stock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-200" 
                        style={{ backgroundColor: product.brand_color || '#1B2B5E' }} 
                      />
                      <span className="text-xs text-gray-500 font-mono">{product.brand_color || '#1B2B5E'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => router.push(`/admin/productos/${product.id}/editar`)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#1B2B5E] hover:bg-[#1B2B5E]/5 transition-all"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <a 
                        href={`/producto/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                        title="Ver en tienda"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
