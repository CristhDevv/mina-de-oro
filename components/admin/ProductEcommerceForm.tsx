'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { 
  X, ImagePlus, Trash2, Loader2, Plus, CheckCircle2, 
  ArrowLeft, Info, Tag, Layers, Settings, Save
} from 'lucide-react'
import { Product, Category } from '@/types'
import { uploadProductImage, deleteProductImage } from '@/lib/api/storage'
import { useProductDraft } from '@/hooks/useProductDraft'

interface Props {
  product: Product | null
  categories: Category[]
  draftKey?: string
  onCancel: () => void
  onSaved: () => void
}

export default function ProductEcommerceForm({ product, categories, draftKey, onCancel, onSaved }: Props) {
  // Fields state
  const [name, setName] = useState(product?.name ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product?.price?.toString() ?? '')
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice?.toString() ?? '')
  const [categorySlug, setCategorySlug] = useState(product?.category ?? categories[0]?.slug ?? '')
  const [stock, setStock] = useState(product?.stock?.toString() ?? '10')
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [active, setActive] = useState(product?.active ?? true)
  const [featured, setFeatured] = useState(product?.featured ?? false)
  const [specifications, setSpecifications] = useState<{label: string, value: string}[]>(product?.specifications ?? [])

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Draft autosave logic
  const { saveDraft, loadDraft, clearDraft } = useProductDraft(draftKey)
  const [restoredFromDraft, setRestoredFromDraft] = useState(false)
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null)
  const isInitializing = useRef(true)

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft()
    if (draft) {
      setName(draft.name)
      setSlug(draft.slug)
      setDescription(draft.description)
      setPrice(draft.price)
      setOriginalPrice(draft.originalPrice)
      setCategorySlug(draft.categorySlug)
      setStock(draft.stock)
      setImages(draft.images)
      setFeatured(draft.featured)
      setSpecifications(draft.specifications)
      setRestoredFromDraft(true)
      setDraftSavedAt(draft.savedAt)
    }
    isInitializing.current = false
  }, [loadDraft])

  // Trigger autosave when fields change
  useEffect(() => {
    if (isInitializing.current) return
    if (product) return // Don't autosave when editing an existing product

    const timer = setTimeout(() => {
      saveDraft({
        step: 1,
        name,
        slug,
        description,
        price,
        originalPrice,
        categorySlug,
        stock,
        images,
        featured,
        specifications,
        // Fill other fields with empty defaults to satisfy TS interface
        videoUrl: null,
        faq: [],
        options: [],
        features: [],
        richContent: [],
        richContentVideoUrl: null,
        brandColor: '#1B2B5E',
        landingConfig: { colors: {}, sections: {} }
      })
      setDraftSavedAt(new Date().toLocaleTimeString())
    }, 1000)

    return () => clearTimeout(timer)
  }, [name, slug, description, price, originalPrice, categorySlug, stock, images, featured, specifications, product, saveDraft])

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  // Update slug automatically when name changes, if user hasn't touched the slug
  const handleNameChange = (val: string) => {
    setName(val)
    if (!product) {
      setSlug(generateSlug(val))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError('')
    const tempSlug = slug.trim() || 'temp-product'

    try {
      const urls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const url = await uploadProductImage(files[i], tempSlug)
        urls.push(url)
      }
      setImages((prev) => [...prev, ...urls])
    } catch (err: any) {
      setError(err.message || 'Error al subir las imágenes')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removeImage = async (urlToRemove: string) => {
    try {
      setImages((prev) => prev.filter((img) => img !== urlToRemove))
      await deleteProductImage(urlToRemove)
    } catch (err: any) {
      console.error('Error deleting image:', err)
    }
  }

  const addSpec = () => {
    setSpecifications([...specifications, { label: '', value: '' }])
  }

  const updateSpec = (index: number, key: 'label' | 'value', val: string) => {
    const next = [...specifications]
    next[index][key] = val
    setSpecifications(next)
  }

  const removeSpec = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index))
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('El nombre del producto es obligatorio')
      return
    }
    if (!slug.trim()) {
      setError('El slug del producto es obligatorio')
      return
    }
    if (!price || isNaN(Number(price))) {
      setError('Introduce un precio válido')
      return
    }
    if (!stock || isNaN(Number(stock))) {
      setError('Introduce un stock válido')
      return
    }
    if (images.length === 0) {
      setError('Sube al menos una imagen para el producto')
      return
    }

    setSaving(true)
    setError('')

    const payload = {
      name,
      slug: slug.trim(),
      description,
      price: parseInt(price),
      original_price: originalPrice ? parseInt(originalPrice) : null,
      category_slug: categorySlug,
      stock: parseInt(stock),
      images,
      active,
      featured,
      specifications,
      product_type: 'ecommerce',
      faq: [],
      options: [],
      features: [],
      rich_content: [],
      landing_config: {}
    }

    try {
      const res = await fetch('/api/products', {
        method: product ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product ? { id: product.id, ...payload } : payload),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al guardar el producto')
        setSaving(false)
        return
      }

      clearDraft()
      onSaved()
    } catch {
      setError('Error de conexión al guardar el producto')
      setSaving(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#F8F9FD] flex flex-col">
      {/* Header Fijo */}
      <div className="bg-white border-b border-gray-150 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-[#1B2B5E] tracking-tight">
              {product ? 'Editar Producto Ecommerce' : 'Crear Producto Ecommerce'}
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              Flujo rápido · Sin landing sections
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="px-5 py-2.5 text-xs font-black text-white bg-[#1B2B5E] hover:bg-[#253974] rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {product ? 'Guardar Cambios' : 'Publicar Producto'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {/* Status de Borrador */}
        {restoredFromDraft && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Se restauró un borrador guardado localmente ({draftSavedAt})</span>
            <button 
              onClick={() => { clearDraft(); setName(''); setSlug(''); setPrice(''); setOriginalPrice(''); setImages([]); setSpecifications([]); setRestoredFromDraft(false); }}
              className="ml-auto text-[10px] font-black uppercase text-emerald-700 hover:underline"
            >
              Descartar
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna Principal - Formulario */}
          <div className="md:col-span-2 space-y-6">
            {/* Info Básica */}
            <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2 pb-3 border-b border-gray-100">
                <Tag size={16} className="text-[#1B2B5E]" />
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Información Básica</h3>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre del Producto *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => handleNameChange(e.target.value)} 
                  placeholder="Ej: Reloj Rolex Submariner"
                  className="h-11 px-4 rounded-2xl border border-gray-200 text-xs font-bold outline-none focus:border-[#1B2B5E] focus:ring-4 focus:ring-blue-50/50 transition-all bg-gray-50/30" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Slug único *</label>
                  <input 
                    type="text" 
                    value={slug} 
                    onChange={(e) => setSlug(generateSlug(e.target.value))} 
                    placeholder="reloj-rolex-submariner"
                    className="h-11 px-4 rounded-2xl border border-gray-200 text-xs font-bold outline-none focus:border-[#1B2B5E] focus:ring-4 focus:ring-blue-50/50 transition-all bg-gray-50/30" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoría *</label>
                  <select 
                    value={categorySlug} 
                    onChange={(e) => setCategorySlug(e.target.value)} 
                    className="h-11 px-4 rounded-2xl border border-gray-200 text-xs font-bold outline-none focus:border-[#1B2B5E] focus:ring-4 focus:ring-blue-50/50 transition-all bg-gray-50/30"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descripción del Producto</label>
                <textarea 
                  rows={4}
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Detalles sobre el producto, características principales, etc..."
                  className="p-4 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#1B2B5E] focus:ring-4 focus:ring-blue-50/50 transition-all bg-gray-50/30 resize-none" 
                />
              </div>
            </div>

            {/* Precios y Stock */}
            <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2 pb-3 border-b border-gray-100">
                <Layers size={16} className="text-[#1B2B5E]" />
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Inventario & Precios</h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Precio ($) *</label>
                  <input 
                    type="number" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    placeholder="250000"
                    className="h-11 px-4 rounded-2xl border border-gray-200 text-xs font-bold outline-none focus:border-[#1B2B5E] focus:ring-4 focus:ring-blue-50/50 transition-all bg-gray-50/30" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Precio Comparación ($)</label>
                  <input 
                    type="number" 
                    value={originalPrice} 
                    onChange={(e) => setOriginalPrice(e.target.value)} 
                    placeholder="320000"
                    className="h-11 px-4 rounded-2xl border border-gray-200 text-xs font-bold outline-none focus:border-[#1B2B5E] focus:ring-4 focus:ring-blue-50/50 transition-all bg-gray-50/30" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock disponible *</label>
                  <input 
                    type="number" 
                    value={stock} 
                    onChange={(e) => setStock(e.target.value)} 
                    placeholder="10"
                    className="h-11 px-4 rounded-2xl border border-gray-200 text-xs font-bold outline-none focus:border-[#1B2B5E] focus:ring-4 focus:ring-blue-50/50 transition-all bg-gray-50/30" 
                  />
                </div>
              </div>
            </div>

            {/* Especificaciones Técnicas */}
            <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Settings size={16} className="text-[#1B2B5E]" />
                  <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Especificaciones</h3>
                </div>
                <button 
                  type="button" 
                  onClick={addSpec} 
                  className="text-[9px] font-black text-[#1B2B5E] uppercase bg-gray-50 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  + Agregar Spec
                </button>
              </div>

              <div className="space-y-2.5">
                {specifications.length === 0 ? (
                  <p className="text-[11px] text-gray-400 text-center py-4">Sin especificaciones técnicas definidas.</p>
                ) : (
                  specifications.map((spec, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-150">
                      <input 
                        value={spec.label} 
                        onChange={(e) => updateSpec(i, 'label', e.target.value)} 
                        placeholder="Ej: Material"
                        className="flex-1 bg-transparent text-[11px] font-bold text-gray-500 uppercase outline-none" 
                      />
                      <div className="w-px h-4 bg-gray-200" />
                      <input 
                        value={spec.value} 
                        onChange={(e) => updateSpec(i, 'value', e.target.value)} 
                        placeholder="Ej: Acero Inoxidable"
                        className="flex-1 bg-transparent text-[11px] font-black text-[#1B2B5E] outline-none" 
                      />
                      <button 
                        type="button" 
                        onClick={() => removeSpec(i)} 
                        className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Columna Lateral - Imágenes & Configuración */}
          <div className="space-y-6">
            {/* Galería de imágenes */}
            <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ImagePlus size={16} className="text-[#1B2B5E]" />
                  <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Imágenes *</h3>
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="text-[9px] font-black text-[#1B2B5E] uppercase bg-gray-50 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  Subir
                </button>
              </div>

              <input 
                ref={fileRef} 
                type="file" 
                accept="image/jpeg,image/png,image/webp" 
                multiple 
                className="hidden" 
                onChange={handleImageUpload} 
              />

              {uploading && (
                <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 rounded-2xl text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  <Loader2 size={12} className="animate-spin text-[#1B2B5E]" /> Subiendo...
                </div>
              )}

              {images.length === 0 ? (
                <div 
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-[#1B2B5E] rounded-3xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-gray-50/20"
                >
                  <ImagePlus size={24} className="text-gray-300" />
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">Subir imágenes</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-150 group bg-gray-50">
                      <img src={img} alt="" className="object-contain w-full h-full p-2" />
                      <button
                        type="button"
                        onClick={() => removeImage(img)}
                        className="absolute top-2 right-2 p-1.5 rounded-xl bg-white/80 hover:bg-red-500 hover:text-white text-gray-500 shadow-sm backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ajustes de Estado */}
            <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <Info size={16} className="text-[#1B2B5E]" />
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Ajustes de visibilidad</h3>
              </div>

              <div className="flex items-center justify-between p-1">
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Producto Activo</span>
                  <span className="text-[10px] text-gray-400 font-medium">Visible en el catálogo público</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActive(!active)}
                  className={`w-11 h-6 rounded-full transition-all relative ${active ? 'bg-emerald-505 bg-emerald-500' : 'bg-gray-200'}`}
                  style={{ backgroundColor: active ? '#10B981' : '#E5E7EB' }}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm ${active ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-1 pt-3 border-t border-gray-50">
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Destacado</span>
                  <span className="text-[10px] text-gray-400 font-medium">Mostrar en la sección home</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFeatured(!featured)}
                  className={`w-11 h-6 rounded-full transition-all relative ${featured ? 'bg-amber-500' : 'bg-gray-200'}`}
                  style={{ backgroundColor: featured ? '#F59E0B' : '#E5E7EB' }}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm ${featured ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info footer */}
        {draftSavedAt && (
          <div className="mt-8 flex items-center justify-center gap-1.5 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
            <CheckCircle2 size={10} className="text-emerald-500" />
            <span>Borrador guardado localmente a las {draftSavedAt}</span>
          </div>
        )}
      </div>
    </div>
  )
}
