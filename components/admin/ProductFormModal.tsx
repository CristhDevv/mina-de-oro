'use client'
import { useState, useRef } from 'react'
import { X, ImagePlus, Trash2, Loader2, Plus, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react'
import { Product, Category, ProductFAQ, ProductOption, RichContentBlock } from '@/types'
import { supabase } from '@/lib/supabase'
import { uploadProductImage, deleteProductImage } from '@/lib/api/storage'
import Image from 'next/image'

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
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [faq, setFaq] = useState<ProductFAQ[]>(product?.faq ?? [])
  const [options, setOptions] = useState<ProductOption[]>(product?.options ?? [])
  
  // TAREA 6: NUEVOS ESTADOS
  const [features, setFeatures] = useState<string[]>(product?.features ?? [])
  const [newFeature, setNewFeature] = useState('')
  const [specifications, setSpecifications] = useState<{label: string, value: string}[]>(product?.specifications ?? [])
  const [richContent, setRichContent] = useState<RichContentBlock[]>(product?.rich_content ?? [])

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const richFileRef = useRef<HTMLInputElement>(null)

  function generateSlug(text: string) {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (images.length + files.length > 10) {
      setError('Máximo 10 imágenes por producto')
      return
    }
    setUploading(true)
    setError('')
    try {
      const slug = product?.slug ?? generateSlug(name || 'producto')
      const urls = await Promise.all(files.map((f) => uploadProductImage(f, slug)))
      setImages((prev) => [...prev, ...urls])
    } catch {
      setError('Error al subir imagen. Intenta de nuevo.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleRemoveImage(url: string) {
    await deleteProductImage(url)
    setImages((prev) => prev.filter((u) => u !== url))
  }

  // FAQ handlers
  function addFaq() { setFaq(prev => [...prev, { question: '', answer: '' }]) }
  function updateFaq(i: number, field: 'question' | 'answer', val: string) {
    setFaq(prev => prev.map((f, idx) => idx === i ? { ...f, [field]: val } : f))
  }
  function removeFaq(i: number) { setFaq(prev => prev.filter((_, idx) => idx !== i)) }

  // Options handlers
  function addOption() { setOptions(prev => [...prev, { name: '', values: [] }]) }
  function updateOptionName(i: number, val: string) {
    setOptions(prev => prev.map((o, idx) => idx === i ? { ...o, name: val } : o))
  }
  function updateOptionValues(i: number, val: string) {
    setOptions(prev => prev.map((o, idx) => idx === i ? { ...o, values: val.split(',').map(v => v.trim()).filter(Boolean) } : o))
  }
  function removeOption(i: number) { setOptions(prev => prev.filter((_, idx) => idx !== i)) }

  // TAREA 6: HANDLERS DE FEATURES
  function addFeature() {
    if (!newFeature.trim()) return
    setFeatures(prev => [...prev, newFeature.trim()])
    setNewFeature('')
  }
  function removeFeature(i: number) {
    setFeatures(prev => prev.filter((_, idx) => idx !== i))
  }

  // TAREA 6: HANDLERS DE SPECIFICATIONS
  function addSpec() { setSpecifications(prev => [...prev, { label: '', value: '' }]) }
  function updateSpec(i: number, field: 'label' | 'value', val: string) {
    setSpecifications(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))
  }
  function removeSpec(i: number) { setSpecifications(prev => prev.filter((_, idx) => idx !== i)) }

  // Rich Content handlers
  function addRichText() { setRichContent(prev => [...prev, { type: 'text', content: '' }]) }
  
  async function addRichImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const slug = product?.slug ?? generateSlug(name || 'producto')
      const url = await uploadProductImage(file, slug)
      setRichContent(prev => [...prev, { type: 'image', url }])
    } catch {
      setError('Error al subir imagen del contenido.')
    } finally {
      setUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  function updateRichBlock(i: number, val: string) {
    setRichContent(prev => prev.map((b, idx) => idx === i ? { ...b, content: val } : b))
  }

  function removeRichBlock(i: number) { setRichContent(prev => prev.filter((_, idx) => idx !== i)) }

  function moveRichBlock(i: number, direction: 'up' | 'down') {
    const nextIdx = direction === 'up' ? i - 1 : i + 1
    if (nextIdx < 0 || nextIdx >= richContent.length) return
    const newContent = [...richContent]
    ;[newContent[i], newContent[nextIdx]] = [newContent[nextIdx], newContent[i]]
    setRichContent(newContent)
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
      images,
      active: true,
      faq,
      options,
      // TAREA 6: PAYLOAD UPDATE
      features,
      specifications,
      rich_content: richContent,
    }
    const { error: dbError } = product
      ? await supabase.from('products').update(payload).eq('id', product.id)
      : await supabase.from('products').insert(payload)
    if (dbError) { setError(dbError.message); setSaving(false); return }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl px-4 pt-5 pb-10 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[#1B2B5E]">
            {product ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Imágenes */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Imágenes (máx. 10)</label>
            <div className="grid grid-cols-4 gap-2">
              {images.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                  <Image src={url} alt="Producto" fill className="object-cover" sizes="80px" />
                  <button onClick={() => handleRemoveImage(url)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <Trash2 size={10} className="text-white" />
                  </button>
                </div>
              ))}
              {images.length < 10 && (
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 active:bg-gray-50 disabled:opacity-50">
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
                  <span className="text-[10px]">{uploading ? 'Subiendo' : 'Agregar'}</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleImageUpload} />
          </div>

          {/* Campos básicos */}
          {[
            { label: 'Nombre *', value: name, onChange: setName, placeholder: 'Ej: Camiseta Básica', type: 'text' },
            { label: 'Descripción *', value: description, onChange: setDescription, placeholder: 'Descripción del producto', type: 'text' },
            { label: 'Precio COP *', value: price, onChange: setPrice, placeholder: 'Ej: 15900', type: 'number' },
            { label: 'Precio original COP', value: originalPrice, onChange: setOriginalPrice, placeholder: 'Ej: 25000', type: 'number' },
            { label: 'Stock *', value: stock, onChange: setStock, placeholder: 'Ej: 50', type: 'number' },
          ].map(({ label, value, onChange, placeholder, type }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
              <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
                className="h-11 px-4 rounded-2xl border border-gray-200 text-sm outline-none focus:border-[#1B2B5E] transition-colors" />
            </div>
          ))}

          {/* Categoría */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Categoría *</label>
            <select value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)}
              className="h-11 px-4 rounded-2xl border border-gray-200 text-sm outline-none focus:border-[#1B2B5E] transition-colors bg-white">
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          {/* Opciones */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Opciones (color, talla, etc.)</label>
              <button onClick={addOption} className="flex items-center gap-1 text-xs text-[#1B2B5E] font-semibold">
                <Plus size={12} /> Agregar
              </button>
            </div>
            {options.map((opt, i) => (
              <div key={i} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-2">
                  <input value={opt.name} onChange={(e) => updateOptionName(i, e.target.value)} placeholder="Ej: Color"
                    className="flex-1 h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none" />
                  <button onClick={() => removeOption(i)}><X size={16} className="text-gray-400" /></button>
                </div>
                <input value={opt.values.join(', ')} onChange={(e) => updateOptionValues(i, e.target.value)}
                  placeholder="Valores separados por coma: Rojo, Azul, Verde"
                  className="h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none" />
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Preguntas frecuentes</label>
              <button onClick={addFaq} className="flex items-center gap-1 text-xs text-[#1B2B5E] font-semibold">
                <Plus size={12} /> Agregar
              </button>
            </div>
            {faq.map((f, i) => (
              <div key={i} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-2">
                  <input value={f.question} onChange={(e) => updateFaq(i, 'question', e.target.value)} placeholder="Pregunta"
                    className="flex-1 h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none" />
                  <button onClick={() => removeFaq(i)}><X size={16} className="text-gray-400" /></button>
                </div>
                <textarea value={f.answer} onChange={(e) => updateFaq(i, 'answer', e.target.value)} placeholder="Respuesta"
                  rows={2} className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none resize-none" />
              </div>
            ))}
          </div>

          {/* TAREA 6: SECCIÓN FEATURES */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Características destacadas</label>
            <div className="flex items-center gap-2">
              <input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="Ej: Material impermeable"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className="flex-1 h-11 px-4 rounded-xl border border-gray-200 text-sm outline-none" />
              <button onClick={addFeature} className="h-11 w-11 bg-gray-100 rounded-xl flex items-center justify-center text-[#1B2B5E]">
                <Plus size={20} />
              </button>
            </div>
            {features.map((feature, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 overflow-hidden">
                  <CheckCircle2 size={14} className="text-[#C9A84C] shrink-0" />
                  <span className="text-sm text-gray-600 truncate">{feature}</span>
                </div>
                <button onClick={() => removeFeature(i)}><X size={16} className="text-gray-400" /></button>
              </div>
            ))}
          </div>

          {/* TAREA 6: SECCIÓN SPECIFICATIONS */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Especificaciones técnicas</label>
              <button onClick={addSpec} className="flex items-center gap-1 text-xs text-[#1B2B5E] font-semibold">
                <Plus size={12} /> Agregar
              </button>
            </div>
            {specifications.map((spec, i) => (
              <div key={i} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-2">
                  <input value={spec.label} onChange={(e) => updateSpec(i, 'label', e.target.value)} placeholder="Etiqueta (Ej: Material)"
                    className="flex-1 h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none" />
                  <button onClick={() => removeSpec(i)}><X size={16} className="text-gray-400" /></button>
                </div>
                <input value={spec.value} onChange={(e) => updateSpec(i, 'value', e.target.value)} placeholder="Valor (Ej: 100% Algodón)"
                  className="h-9 px-3 rounded-xl border border-gray-200 text-sm outline-none font-semibold" />
              </div>
            ))}
          </div>

          {/* Rich Content Section */}
          <div className="flex flex-col gap-3 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Descripción Detallada (Rich Content)</label>
              <div className="flex gap-2">
                <button onClick={addRichText} className="text-[10px] bg-gray-100 px-2 py-1 rounded-lg font-bold text-[#1B2B5E]">
                  + Texto
                </button>
                <button onClick={() => richFileRef.current?.click()} className="text-[10px] bg-gray-100 px-2 py-1 rounded-lg font-bold text-[#1B2B5E]">
                  + Imagen
                </button>
                <input ref={richFileRef} type="file" className="hidden" onChange={addRichImage} />
              </div>
            </div>
            
            <div className="space-y-3">
              {richContent.map((block, i) => (
                <div key={i} className="relative group bg-gray-50 rounded-2xl p-3 border border-transparent hover:border-gray-200 transition-all">
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => moveRichBlock(i, 'up')} className="bg-white shadow-md p-1 rounded-full"><ChevronUp size={12} className="text-[#1B2B5E]" /></button>
                    <button onClick={() => moveRichBlock(i, 'down')} className="bg-white shadow-md p-1 rounded-full"><ChevronDown size={12} className="text-[#1B2B5E]" /></button>
                  </div>
                  
                  {block.type === 'text' ? (
                    <textarea 
                      value={block.content} 
                      onChange={(e) => updateRichBlock(i, e.target.value)}
                      placeholder="Escribe contenido descriptivo..."
                      className="w-full bg-transparent text-sm outline-none resize-none"
                      rows={3}
                    />
                  ) : (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-200">
                      <Image src={block.url} alt="Bloque" fill className="object-cover" />
                    </div>
                  )}
                  
                  <button onClick={() => removeRichBlock(i)} className="absolute -right-2 -top-2 bg-white shadow-md p-1.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          <button onClick={handleSave} disabled={saving || uploading}
            className="h-12 bg-[#1B2B5E] text-white font-semibold text-sm rounded-2xl disabled:opacity-50 mt-1">
            {saving ? 'Guardando...' : product ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </div>
    </div>
  )
}
