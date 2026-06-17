'use client'

import { Tag, Plus, Edit2, Trash2 } from 'lucide-react'
import { Category } from '@/types'

interface CategoriesTabProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (id: string) => Promise<void>
  onAdd: () => void
}

export default function CategoriesTab({ categories, onEdit, onDelete, onAdd }: CategoriesTabProps) {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-900">Categorías</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-[#1B2B5E] text-white text-xs font-bold h-10 px-4 rounded-2xl hover:shadow-lg hover:shadow-[#1B2B5E]/20 transition-all active:scale-95"
        >
          <Plus size={16} /> Nueva Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            className="group bg-white border border-gray-100 rounded-3xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{cat.name}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{cat.slug}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(cat)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#1B2B5E] hover:bg-[#1B2B5E]/5 transition-all"
                title="Editar"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => {
                  if (confirm('¿Estás seguro de eliminar esta categoría?')) {
                    onDelete(cat.id)
                  }
                }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
