'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Category } from '@/types'
import { createCategory, updateCategory } from '@/lib/api/categories'

interface Props {
  category: Category | null
  onClose: () => void
  onSaved: () => void
}

const ICONS = [
  '👕','👖','👗','👠','👟','🧥','👜','💍','⌚',
  '🛋️','🪑','🛏️','🚿','🪞','🪴','🏺','🕯️','🖼️',
  '🍳','🥘','☕','🍽️','🥄','🔪','🫙','🧺','🧹',
  '📱','💻','🖥️','⌨️','🖱️','📷','🎮','🎧','📺',
  '🧴','💄','🧼','🪥','💅','🧖','🪒','👓','🕶️',
  '⚽','🏀','🎾','🏋️','🧘','🚴','🏊','🎯','🎲',
  '🌿','🌸','🌊','🏔️','🌙','⭐','🔥','💎','🎁',
]

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function CategoryFormModal({ category, onClose, onSaved }: Props) {
  const [name, setName] = useState(category?.name ?? '')
  const [icon, setIcon] = useState(category?.icon ?? '🛍️')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!name.trim()) { setError('El nombre es obligatorio'); return }
    setSaving(true)
    setError('')
    try {
      const payload = { name: name.trim(), slug: generateSlug(name), icon }
      if (category) {
        await updateCategory(category.id, payload)
      } else {
        await createCategory(payload)
      }
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl px-4 pt-5 pb-10 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[#1B2B5E]">
            {category ? 'Editar categoría' : 'Nueva categoría'}
          </h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nombre *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="Ej: Ropa, Cocina, Hogar..."
              className="h-11 px-4 rounded-2xl border border-gray-200 text-sm outline-none focus:border-[#1B2B5E] transition-colors"
            />
          </div>

          {/* Icono seleccionado */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Ícono seleccionado</label>
            <div className="flex items-center gap-3 bg-[#EFF6FF] rounded-2xl px-4 py-3">
              <span className="text-3xl">{icon}</span>
              <span className="text-sm text-gray-600 font-medium">{name || 'Sin nombre'}</span>
            </div>
          </div>

          {/* Grid de íconos */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Elige un ícono</label>
            <div className="grid grid-cols-9 gap-1 bg-gray-50 rounded-2xl p-3">
              {ICONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all ${
                    icon === emoji
                      ? 'bg-[#1B2B5E] scale-110 shadow-sm'
                      : 'hover:bg-gray-200 active:scale-95'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="h-12 bg-[#1B2B5E] text-white font-semibold text-sm rounded-2xl disabled:opacity-50 mt-1"
          >
            {saving ? 'Guardando...' : category ? 'Guardar cambios' : 'Crear categoría'}
          </button>
        </div>
      </div>
    </div>
  )
}
