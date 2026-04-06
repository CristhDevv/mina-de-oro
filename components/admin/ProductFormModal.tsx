'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { Product, Category } from '@/types'
import { supabase } from '@/lib/supabase'

interface Props {
  product: Product | null
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}

export default function ProductFormModal({ product, categories, onClose, onSaved }: Props) {
  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product?.price?.toString() ?? '')
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice?.toString() ?? '')
  const [categorySlug, setCategorySlug] = useState(product?.category ?? categories[0]?.slug ?? '')
  const [stock, setStock] = useState(product?.stock?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  async function handleSave() {
    if (!name || !description || !price || !stock || !categorySlug) {
      setError('Completa todos los campos obligatorios')
      return
    }

    setSaving(true)
    setError('')

    const payload = {
      name,
      description,
      price: parseInt(price),
      original_price: originalPrice ? parseInt(originalPrice) : null,
      category_slug: categorySlug,
      stock: parseInt(stock),
      slug: product?.slug ?? generateSlug(name),
      active: true,
    }

    const { error: dbError } = product
      ? await supabase.from('products').update(payload).eq('id', product.id)
      : await supabase.from('products').insert(payload)

    if (dbError) {
      setError(dbError.message)
      setSaving(false)
      return
    }

    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl px-4 pt-5 pb-10 max-h-[90vh] overflow-y-auto">

        {/* Handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[#1B2B5E]">
            {product ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">

          {[
            { label: 'Nombre *', value: name, onChange: setName, placeholder: 'Ej: Camiseta Básica', type: 'text' },
            { label: 'Descripción *', value: description, onChange: setDescription, placeholder: 'Descripción del producto', type: 'text' },
            { label: 'Precio COP *', value: price, onChange: setPrice, placeholder: 'Ej: 15900', type: 'number' },
            { label: 'Precio original COP', value: originalPrice, onChange: setOriginalPrice, placeholder: 'Ej: 25000', type: 'number' },
            { label: 'Stock *', value: stock, onChange: setStock, placeholder: 'Ej: 50', type: 'number' },
          ].map(({ label, value, onChange, placeholder, type }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
              <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-11 px-4 rounded-2xl border border-gray-200 text-sm outline-none focus:border-[#1B2B5E] transition-colors"
              />
            </div>
          ))}

          {/* Category select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Categoría *</label>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="h-11 px-4 rounded-2xl border border-gray-200 text-sm outline-none focus:border-[#1B2B5E] transition-colors bg-white"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="h-12 bg-[#1B2B5E] text-white font-semibold text-sm rounded-2xl disabled:opacity-50 mt-1"
          >
            {saving ? 'Guardando...' : product ? 'Guardar cambios' : 'Crear producto'}
          </button>

        </div>
      </div>
    </div>
  )
}
