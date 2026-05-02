'use client'
import { useState, useRef, useMemo } from 'react'
import { 
  X, ImagePlus, Trash2, Loader2, Plus, CheckCircle2, 
  ChevronUp, ChevronDown, Info, Tag, Layers, 
  HelpCircle, List, Type, Heading1, Heading2, 
  Heading3, Bold, ImageIcon, Eye, Settings
} from 'lucide-react'
import { Product, Category, ProductFAQ, ProductOption, RichContentBlock } from '@/types'
import { supabase } from '@/lib/supabase'
import { uploadProductImage, deleteProductImage } from '@/lib/api/storage'
import Image from 'next/image'

interface Props {
  product: Product | null
  categories: Category[]
  onCancel: () => void
  onSaved: () => void
}

export default function ProductForm({ product, categories, onCancel, onSaved }: Props) {
  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product?.price?.toString() ?? '')
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice?.toString() ?? '')
  const [categorySlug, setCategorySlug] = useState(product?.category ?? categories[0]?.slug ?? '')
  const [stock, setStock] = useState(product?.stock?.toString() ?? '')
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [faq, setFaq] = useState<ProductFAQ[]>(product?.faq ?? [])
  const [options, setOptions] = useState<ProductOption[]>(product?.options ?? [])
  const [featured, setFeatured] = useState(product?.featured ?? false)
  const [features, setFeatures] = useState<string[]>(product?.features ?? [])
  const [newFeature, setNewFeature] = useState('')
  const [specifications, setSpecifications] = useState<{label: string, value: string}[]>(product?.specifications ?? [])
  const [richContent, setRichContent] = useState<RichContentBlock[]>(product?.rich_content ?? [])
  const [brandColor, setBrandColor] = useState(product?.brand_color ?? '#1B2B5E')

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

  // Features handlers
  function addFeature() {
    if (!newFeature.trim()) return
    setFeatures(prev => [...prev, newFeature.trim()])
    setNewFeature('')
  }
  function removeFeature(i: number) { setFeatures(prev => prev.filter((_, idx) => idx !== i)) }

  // Specifications handlers
  function addSpec() { setSpecifications(prev => [...prev, { label: '', value: '' }]) }
  function updateSpec(i: number, field: 'label' | 'value', val: string) {
    setSpecifications(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))
  }
  function removeSpec(i: number) { setSpecifications(prev => prev.filter((_, idx) => idx !== i)) }

  // Rich Content handlers
  function addRichText() { setRichContent(prev => [...prev, { type: 'text', content: '', bold: false }]) }
  function addRichHeading(level: number) { setRichContent(prev => [...prev, { type: 'heading', content: '', level }]) }
  
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

  function updateRichBlock(i: number, val: string | boolean, field: 'content' | 'bold' | 'level' = 'content') {
    setRichContent(prev => prev.map((b, idx) => idx === i ? { ...b, [field]: val } : b))
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
      features,
      specifications,
      rich_content: richContent,
      featured,
      brand_color: brandColor,
    }
    const { error: dbError } = product
      ? await supabase.from('products').update(payload).eq('id', product.id)
      : await supabase.from('products').insert(payload)
    if (dbError) { setError(dbError.message); setSaving(false); return }
    onSaved()
  }

  const SectionHeader = ({ icon: Icon, title, description }: { icon: any, title: string, description?: string }) => (
    <div className="flex flex-col gap-1 mb-4 mt-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#1B2B5E]">
          <Icon size={16} />
        </div>
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{title}</h3>
      </div>
      {description && <p className="text-[10px] text-gray-400 font-medium ml-10">{description}</p>}
    </div>
  )

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-[40px] shadow-xl flex flex-col my-8 border border-gray-100">
      {/* Header Fixed */}
      <div className="px-8 pt-8 pb-4 bg-white rounded-t-[40px] shrink-0 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-[#1B2B5E]">
              {product ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <p className="text-xs text-gray-400 font-medium">Completa los detalles para publicar en la tienda</p>
          </div>
          <button 
            onClick={onCancel}
            className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 px-8 py-8">
        <div className="flex flex-col gap-10">
          
          {/* Section: Media */}
          <section>
            <SectionHeader icon={ImagePlus} title="Galería de Imágenes" description="Sube hasta 10 fotos. La primera será la principal." />
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
              {images.map((url, index) => (
                <div key={index} className="group relative aspect-square rounded-[24px] overflow-hidden border border-gray-100 shadow-sm transition-all hover:shadow-md">
                  <Image src={url} alt="Producto" fill className="object-cover" sizes="120px" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => handleRemoveImage(url)} 
                      className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {index === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#C9A84C] text-white text-[8px] font-black uppercase rounded-full">Principal</div>
                  )}
                </div>
              ))}
              {images.length < 10 && (
                <button 
                  onClick={() => fileRef.current?.click()} 
                  disabled={uploading}
                  className="aspect-square rounded-[24px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#C9A84C] hover:text-[#C9A84C] hover:bg-blue-50/50 transition-all active:scale-95 disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
                  <span className="text-[10px] font-black uppercase tracking-widest">{uploading ? 'Subiendo' : 'Agregar'}</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleImageUpload} />
          </section>

          {/* Section: Basic Info */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <SectionHeader icon={Info} title="Información General" />
            </div>
            
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre del Producto *</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Ej: Anillo de Oro 18k con Diamante"
                className="h-12 px-5 rounded-2xl border border-gray-100 text-sm font-bold outline-none focus:border-[#1B2B5E] focus:ring-4 focus:ring-blue-50 transition-all bg-gray-50/30" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoría *</label>
              <select 
                value={categorySlug} 
                onChange={(e) => setCategorySlug(e.target.value)}
                className="h-12 px-5 rounded-2xl border border-gray-100 text-sm font-bold outline-none focus:border-[#1B2B5E] focus:ring-4 focus:ring-blue-50 transition-all bg-white appearance-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between px-5 h-12 rounded-2xl border border-gray-100 bg-gray-50/30">
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-[#C9A84C]" />
                <span className="text-xs font-bold text-[#1B2B5E]">Destacado</span>
              </div>
              <button 
                type="button"
                onClick={() => setFeatured(!featured)}
                className={`w-10 h-5 rounded-full transition-colors relative ${featured ? 'bg-[#C9A84C]' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${featured ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between px-5 h-12 rounded-2xl border border-gray-100 bg-gray-50/30">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: brandColor }}
                />
                <span className="text-xs font-bold text-[#1B2B5E]">Color de marca</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 font-mono uppercase">{brandColor}</span>
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent p-0 overflow-hidden"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Breve Descripción *</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Una frase corta que defina el producto..."
                rows={2}
                className="px-5 py-4 rounded-2xl border border-gray-100 text-sm font-medium outline-none focus:border-[#1B2B5E] focus:ring-4 focus:ring-blue-50 transition-all bg-gray-50/30 resize-none" 
              />
            </div>
          </section>

          {/* Section: Price & Inventory */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-blue-50/30 rounded-[32px] border border-blue-100/50">
            <div className="md:col-span-3">
              <SectionHeader icon={Tag} title="Precio e Inventario" />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Precio Actual *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input 
                  type="number" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  placeholder="0"
                  className="w-full h-12 pl-8 pr-5 rounded-2xl border border-gray-100 text-sm font-black outline-none focus:border-[#1B2B5E] transition-all bg-white" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Precio Original</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input 
                  type="number" 
                  value={originalPrice} 
                  onChange={(e) => setOriginalPrice(e.target.value)} 
                  placeholder="0"
                  className="w-full h-12 pl-8 pr-5 rounded-2xl border border-gray-100 text-sm font-bold text-gray-400 outline-none focus:border-[#1B2B5E] transition-all bg-white" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock Disponible *</label>
              <input 
                type="number" 
                value={stock} 
                onChange={(e) => setStock(e.target.value)} 
                placeholder="0"
                className="h-12 px-5 rounded-2xl border border-gray-100 text-sm font-black outline-none focus:border-[#1B2B5E] transition-all bg-white" 
              />
            </div>
          </section>

          {/* Section: Customization */}
          <section className="space-y-8">
            <SectionHeader icon={Layers} title="Personalización y Atributos" description="Configura tallas, colores y detalles técnicos." />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <List size={14} className="text-[#1B2B5E]" />
                    <span className="text-xs font-bold text-gray-600 uppercase">Variantes</span>
                  </div>
                  <button onClick={addOption} className="text-[10px] font-black text-[#1B2B5E] uppercase bg-gray-100 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                    + Nueva Opción
                  </button>
                </div>
                <div className="space-y-3">
                  {options.map((opt, i) => (
                    <div key={i} className="group flex flex-col gap-2 p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all relative">
                      <input 
                        value={opt.name} 
                        onChange={(e) => updateOptionName(i, e.target.value)} 
                        placeholder="Ej: Talla o Color"
                        className="bg-transparent text-xs font-black uppercase tracking-wider outline-none text-[#1B2B5E]" 
                      />
                      <input 
                        value={opt.values.join(', ')} 
                        onChange={(e) => updateOptionValues(i, e.target.value)}
                        placeholder="S, M, L, XL"
                        className="bg-transparent text-[11px] font-medium text-gray-500 outline-none" 
                      />
                      <button onClick={() => removeOption(i)} className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {options.length === 0 && <p className="text-[10px] text-gray-400 italic px-2">Sin variantes configuradas.</p>}
                </div>
              </div>

              {/* Specs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Settings size={14} className="text-[#1B2B5E]" />
                    <span className="text-xs font-bold text-gray-600 uppercase">Especificaciones</span>
                  </div>
                  <button onClick={addSpec} className="text-[10px] font-black text-[#1B2B5E] uppercase bg-gray-100 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                    + Agregar
                  </button>
                </div>
                <div className="space-y-3">
                  {specifications.map((spec, i) => (
                    <div key={i} className="group flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all relative">
                      <input 
                        value={spec.label} 
                        onChange={(e) => updateSpec(i, 'label', e.target.value)} 
                        placeholder="Ej: Material"
                        className="flex-1 bg-transparent text-[11px] font-bold text-gray-400 uppercase outline-none" 
                      />
                      <div className="w-px h-4 bg-gray-200" />
                      <input 
                        value={spec.value} 
                        onChange={(e) => updateSpec(i, 'value', e.target.value)} 
                        placeholder="100% Cuero"
                        className="flex-1 bg-transparent text-[11px] font-black text-[#1B2B5E] outline-none" 
                      />
                      <button onClick={() => removeSpec(i)} className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {specifications.length === 0 && <p className="text-[10px] text-gray-400 italic px-2">Sin especificaciones técnicas.</p>}
                </div>
              </div>

            </div>

            {/* Features List */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Características Clave (Checklist)</label>
              <div className="flex items-center gap-2">
                <input 
                  value={newFeature} 
                  onChange={(e) => setNewFeature(e.target.value)} 
                  placeholder="Ej: Resistente al agua"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  className="flex-1 h-12 px-5 rounded-2xl border border-gray-100 text-sm font-medium outline-none focus:border-[#C9A84C] transition-all bg-gray-50/30" 
                />
                <button 
                  onClick={addFeature} 
                  className="h-12 w-12 bg-[#1B2B5E] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-900/10 active:scale-95 transition-transform"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100/50">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <CheckCircle2 size={16} className="text-[#C9A84C] shrink-0" />
                      <span className="text-[11px] font-bold text-gray-700 truncate">{feature}</span>
                    </div>
                    <button onClick={() => removeFeature(i)} className="text-gray-300 hover:text-red-500 transition-colors ml-2">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section: Rich Content */}
          <section className="space-y-6 pt-6 border-t border-gray-100">
            <div className="flex flex-col gap-1">
              <SectionHeader icon={Type} title="Contenido Detallado" description="Diseña la descripción extendida del producto." />
              <div className="flex flex-wrap gap-2 mt-2">
                <button onClick={() => addRichHeading(1)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-xl text-[10px] font-black text-[#1B2B5E] uppercase border border-gray-100 hover:border-[#C9A84C] transition-all">
                  <Heading1 size={14} /> Título H1
                </button>
                <button onClick={() => addRichHeading(2)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-xl text-[10px] font-black text-[#1B2B5E] uppercase border border-gray-100 hover:border-[#C9A84C] transition-all">
                  <Heading2 size={14} /> Título H2
                </button>
                <button onClick={addRichText} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-xl text-[10px] font-black text-[#1B2B5E] uppercase border border-gray-100 hover:border-[#C9A84C] transition-all">
                  <Type size={14} /> Párrafo
                </button>
                <button onClick={() => richFileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-xl text-[10px] font-black text-[#1B2B5E] uppercase border border-gray-100 hover:border-[#C9A84C] transition-all">
                  <ImageIcon size={14} /> Imagen
                </button>
                <input ref={richFileRef} type="file" className="hidden" onChange={addRichImage} />
              </div>
            </div>

            <div className="space-y-4">
              {richContent.map((block, i) => (
                <div key={i} className="group relative bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#C9A84C]/30 transition-all flex gap-4">
                  
                  {/* Move Controls */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => moveRichBlock(i, 'up')} className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#1B2B5E] hover:text-white transition-all"><ChevronUp size={14} /></button>
                    <button onClick={() => moveRichBlock(i, 'down')} className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#1B2B5E] hover:text-white transition-all"><ChevronDown size={14} /></button>
                  </div>

                  {/* Content Editor */}
                  <div className="flex-1 min-w-0">
                    {block.type === 'heading' && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-[#C9A84C] uppercase tracking-[0.2em]">Título H{block.level}</span>
                        </div>
                        <input 
                          value={block.content} 
                          onChange={(e) => updateRichBlock(i, e.target.value)}
                          placeholder="Escribe el título aquí..."
                          className={`w-full bg-transparent outline-none font-black text-[#1B2B5E] ${block.level === 1 ? 'text-xl' : block.level === 2 ? 'text-lg' : 'text-base'}`}
                        />
                      </div>
                    )}

                    {block.type === 'text' && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">Párrafo</span>
                          <button 
                            onClick={() => updateRichBlock(i, !block.bold, 'bold')}
                            className={`flex items-center gap-1 text-[9px] font-black uppercase px-2 py-1 rounded-md transition-all ${block.bold ? 'bg-[#1B2B5E] text-white' : 'bg-gray-100 text-gray-400'}`}
                          >
                            <Bold size={10} /> Negrita
                          </button>
                        </div>
                        <textarea 
                          value={block.content} 
                          onChange={(e) => updateRichBlock(i, e.target.value)}
                          placeholder="Escribe el contenido descriptivo..."
                          rows={3}
                          className={`w-full bg-transparent outline-none text-sm leading-relaxed text-gray-600 resize-none ${block.bold ? 'font-bold' : 'font-medium'}`}
                        />
                      </div>
                    )}

                    {block.type === 'image' && (
                      <div className="flex flex-col gap-3">
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">Imagen de Contenido</span>
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
                          <Image src={block.url} alt="Bloque" fill className="object-cover" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delete */}
                  <button 
                    onClick={() => removeRichBlock(i)} 
                    className="absolute -right-2 -top-2 w-8 h-8 bg-white shadow-xl rounded-full flex items-center justify-center text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {richContent.length === 0 && (
                <div className="p-10 border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                    <Layers size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Sin contenido extendido</p>
                    <p className="text-[10px] text-gray-300">Usa los botones superiores para diseñar la página del producto.</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section: FAQ */}
          <section className="space-y-6 pb-10">
            <SectionHeader icon={HelpCircle} title="Preguntas Frecuentes" description="Resuelve dudas comunes sobre este producto." />
            <div className="space-y-3">
              {faq.map((f, i) => (
                <div key={i} className="group flex flex-col gap-3 p-5 bg-gray-50 rounded-[32px] border border-transparent hover:border-gray-200 transition-all relative">
                  <input 
                    value={f.question} 
                    onChange={(e) => updateFaq(i, 'question', e.target.value)} 
                    placeholder="¿Pregunta frecuente?"
                    className="bg-transparent text-sm font-bold text-[#1B2B5E] outline-none" 
                  />
                  <textarea 
                    value={f.answer} 
                    onChange={(e) => updateFaq(i, 'answer', e.target.value)} 
                    placeholder="Escribe la respuesta aquí..."
                    rows={2}
                    className="bg-transparent text-[11px] font-medium text-gray-500 outline-none resize-none" 
                  />
                  <button onClick={() => removeFaq(i)} className="absolute top-4 right-5 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button 
                onClick={addFaq}
                className="w-full h-12 rounded-[24px] border-2 border-dashed border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-[#1B2B5E] hover:text-[#1B2B5E] transition-all"
              >
                + Agregar Pregunta
              </button>
            </div>
          </section>

        </div>
      </div>

      {/* Footer Fixed */}
      <div className="sticky bottom-0 left-0 right-0 p-8 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex items-center justify-between gap-4 rounded-b-[40px] z-10">
        <div className="hidden sm:block">
          {error && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight max-w-[200px] truncate">{error}</p>}
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={onCancel}
            className="flex-1 sm:flex-none h-12 px-8 rounded-2xl font-bold text-sm text-gray-400 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving || uploading}
            className="flex-1 sm:flex-none h-12 px-10 bg-[#1B2B5E] text-white font-bold text-sm rounded-2xl shadow-xl shadow-blue-900/20 disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                {product ? 'Actualizar Producto' : 'Publicar Producto'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
