'use client'
import { useState, useRef } from 'react'
import { 
  X, ImagePlus, Trash2, Loader2, Plus, CheckCircle2, 
  ChevronUp, ChevronDown, Info, Tag, Layers, 
  HelpCircle, List, Type, Heading1, Heading2, 
  Heading3, Bold, ImageIcon, Eye, Settings, Layout, ArrowLeft, ArrowRight
} from 'lucide-react'
import { Product, Category, ProductFAQ, ProductOption, RichContentBlock, LandingConfig } from '@/types'
import { supabase } from '@/lib/supabase'
import { uploadProductImage, deleteProductImage } from '@/lib/api/storage'
import LandingConfigEditor from '@/components/admin/LandingConfigEditor'
import ProductPreview from '@/components/admin/ProductPreview'

interface Props {
  product: Product | null
  categories: Category[]
  onCancel: () => void
  onSaved: () => void
}

const STEPS = [
  { id: 1, label: 'Información' },
  { id: 2, label: 'Imágenes' },
  { id: 3, label: 'Diseño' },
  { id: 4, label: 'Testimonios' },
  { id: 5, label: 'Revisión' },
]

export default function ProductForm({ product, categories, onCancel, onSaved }: Props) {
  // Stepper state
  const [step, setStep] = useState(1)
  
  // Collapsible section state for Step 1
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null)

  // Mobile preview overlay toggle
  const [showMobilePreview, setShowMobilePreview] = useState(false)

  // Fields state
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
  
  // Initialize landingConfig safely
  const rawLandingConfig = (product?.landing_config as LandingConfig) ?? {}
  const [landingConfig, setLandingConfig] = useState<LandingConfig>({
    colors: rawLandingConfig.colors ?? {
      primary: '#1B2B5E',
      accent: '#C9A84C',
      cta: '#D4691E',
      red: '#7B2020',
      bg: '#F5F5F0',
    },
    sections: rawLandingConfig.sections ?? {
      hero: { active: true, subtitle: '' },
      urgency: { active: true, duration_hours: 24 },
      problem: { active: true, title: '¿Cansado de lo mismo?', copy: '' },
      benefits: { active: true, title: 'Todo lo que necesitas' },
      specs: { active: true },
      testimonials: { active: true, title: 'Lo que dicen quienes ya lo tienen', items: [] },
      pricing: { active: true }
    }
  })

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const richFileRef = useRef<HTMLInputElement>(null)

  function generateSlug(text: string) {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  // Next step click
  function handleNext() {
    setError('')
    if (step === 1) {
      if (!name.trim()) {
        setError('El nombre del producto es obligatorio')
        return
      }
      if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
        setError('El precio debe ser un número mayor a 0')
        return
      }
      if (!stock.trim() || isNaN(Number(stock)) || Number(stock) < 0) {
        setError('El stock debe ser un número mayor o igual a 0')
        return
      }
      if (!categorySlug) {
        setError('Selecciona una categoría')
        return
      }
    }
    setStep(prev => Math.min(prev + 1, 5))
  }

  // Prev step click
  function handlePrev() {
    setError('')
    setStep(prev => Math.max(prev - 1, 1))
  }

  // Toggle Accordion in Step 1
  function toggleAccordion(id: string) {
    setActiveAccordion(prev => prev === id ? null : id)
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

  function handleMakePrimary(index: number) {
    if (index === 0) return
    const newImages = [...images]
    const item = newImages.splice(index, 1)[0]
    newImages.unshift(item)
    setImages(newImages)
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
      landing_config: landingConfig,
    }
    const { error: dbError } = product
      ? await supabase.from('products').update(payload).eq('id', product.id)
      : await supabase.from('products').insert(payload)
    if (dbError) { setError(dbError.message); setSaving(false); return }
    onSaved()
  }

  const SectionHeader = ({ icon: Icon, title, description }: { icon: any, title: string, description?: string }) => (
    <div className="flex flex-col gap-1 mb-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#1B2B5E]">
          <Icon size={16} />
        </div>
        <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">{title}</h3>
      </div>
      {description && <p className="text-[10px] text-gray-400 font-semibold ml-10 leading-tight">{description}</p>}
    </div>
  )

  return (
    <div className="w-full min-h-screen bg-[#F8F9FD] flex flex-col">
      {/* Upper Navigation & Stepper Header */}
      <div className="bg-white border-b border-gray-150 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-[#1B2B5E] tracking-tight">
              {product ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </h2>
            <p className="text-[11px] text-gray-400 font-semibold">Completa los pasos para una landing de alta conversión</p>
          </div>

          {/* Stepper Indicators */}
          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto py-1 no-scrollbar select-none">
            {STEPS.map((s, idx) => (
              <div key={s.id} className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (s.id < step || (s.id > step && name && price && stock)) {
                      setStep(s.id)
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    step === s.id
                      ? 'bg-[#1B2B5E] border-[#1B2B5E] text-white shadow-md'
                      : s.id < step
                      ? 'bg-emerald-50 border-emerald-150 text-emerald-700 hover:bg-emerald-100/50'
                      : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100/30'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                    step === s.id ? 'bg-white text-[#1B2B5E]' : s.id < step ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {s.id < step ? '✓' : s.id}
                  </span>
                  {s.label}
                </button>
                {idx < STEPS.length - 1 && (
                  <span className="text-gray-300 text-xs font-semibold mx-1 shrink-0">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="max-w-7xl mx-auto w-full px-6 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Focused Form Steps (60% / 7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* STEP 1: INFORMACIÓN BÁSICA */}
          {step === 1 && (
            <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <SectionHeader icon={Info} title="Información General" description="Datos esenciales y descripción del producto." />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre del Producto *</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Ej: Anillo de Oro 18k con Diamante"
                    className="h-11 px-4 rounded-2xl border border-gray-200 text-xs font-bold outline-none focus:border-[#1B2B5E] focus:ring-4 focus:ring-blue-50/50 transition-all bg-gray-50/30" 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoría *</label>
                  <select 
                    value={categorySlug} 
                    onChange={(e) => setCategorySlug(e.target.value)}
                    className="h-11 px-4 rounded-2xl border border-gray-200 text-xs font-bold outline-none focus:border-[#1B2B5E] transition-all bg-white cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between px-4 h-11 rounded-2xl border border-gray-200 bg-gray-50/30">
                  <div className="flex items-center gap-2">
                    <Eye size={14} className="text-[#C9A84C]" />
                    <span className="text-xs font-bold text-[#1B2B5E]">Destacar Producto</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFeatured(!featured)}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${featured ? 'bg-[#C9A84C]' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${featured ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Precio de Venta *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input 
                      type="number" 
                      value={price} 
                      onChange={(e) => setPrice(e.target.value)} 
                      placeholder="0"
                      className="w-full h-11 pl-8 pr-4 rounded-2xl border border-gray-200 text-xs font-black outline-none focus:border-[#1B2B5E] transition-all bg-white" 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Precio Original (Descuento)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input 
                      type="number" 
                      value={originalPrice} 
                      onChange={(e) => setOriginalPrice(e.target.value)} 
                      placeholder="0"
                      className="w-full h-11 pl-8 pr-4 rounded-2xl border border-gray-200 text-xs font-bold text-gray-400 outline-none focus:border-[#1B2B5E] transition-all bg-white" 
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
                    className="h-11 px-4 rounded-2xl border border-gray-200 text-xs font-black outline-none focus:border-[#1B2B5E] transition-all bg-white" 
                  />
                </div>

                <div className="flex items-center justify-between px-4 h-11 rounded-2xl border border-gray-200 bg-gray-50/30">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-gray-250 shadow-inner" style={{ backgroundColor: brandColor }} />
                    <span className="text-xs font-bold text-[#1B2B5E]">Color de Marca</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-mono uppercase">{brandColor}</span>
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent p-0 overflow-hidden"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Breve Descripción *</label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Una frase corta que defina el producto..."
                    rows={2}
                    className="px-4 py-3 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#1B2B5E] transition-all bg-gray-50/30 resize-none" 
                  />
                </div>
              </div>

              {/* Collapsible Sections (Accordions) */}
              <div className="border-t border-gray-150 pt-6 space-y-3">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Atributos Avanzados</h4>
                
                {/* 1. Variantes */}
                <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('variants')}
                    className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <List size={15} className="text-[#1B2B5E]" />
                      <span className="text-xs font-black text-gray-700 uppercase">Variantes y Opciones ({options.length})</span>
                    </div>
                    {activeAccordion === 'variants' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                  {activeAccordion === 'variants' && (
                    <div className="p-5 border-t border-gray-100 bg-white space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-gray-400">Configura tallas, colores o tipos del producto.</p>
                        <button type="button" onClick={addOption} className="text-[9px] font-black text-[#1B2B5E] uppercase bg-gray-100 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer">
                          + Nueva Opción
                        </button>
                      </div>
                      <div className="space-y-3">
                        {options.map((opt, i) => (
                          <div key={i} className="group flex flex-col gap-2.5 p-4 bg-gray-50 rounded-2xl border border-gray-150 relative">
                            <input 
                              value={opt.name} 
                              onChange={(e) => updateOptionName(i, e.target.value)} 
                              placeholder="Ej: Talla"
                              className="bg-transparent text-xs font-black uppercase tracking-wider outline-none text-[#1B2B5E]" 
                            />
                            <input 
                              value={opt.values.join(', ')} 
                              onChange={(e) => updateOptionValues(i, e.target.value)}
                              placeholder="Ej: S, M, L (Separados por coma)"
                              className="bg-transparent text-[11px] font-semibold text-gray-500 outline-none" 
                            />
                            <button type="button" onClick={() => removeOption(i)} className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 transition-colors cursor-pointer">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                        {options.length === 0 && <p className="text-[10px] text-gray-400 italic px-1">Sin variantes configuradas.</p>}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Características Clave */}
                <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('features')}
                    className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 size={15} className="text-[#1B2B5E]" />
                      <span className="text-xs font-black text-gray-700 uppercase">Características Clave ({features.length})</span>
                    </div>
                    {activeAccordion === 'features' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                  {activeAccordion === 'features' && (
                    <div className="p-5 border-t border-gray-100 bg-white space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center gap-2">
                        <input 
                          value={newFeature} 
                          onChange={(e) => setNewFeature(e.target.value)} 
                          placeholder="Ej: Resistente al agua"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                          className="flex-1 h-10 px-4 rounded-xl border border-gray-200 text-xs font-medium outline-none focus:border-[#C9A84C] bg-gray-50/20" 
                        />
                        <button 
                          type="button"
                          onClick={addFeature} 
                          className="h-10 w-10 bg-[#1B2B5E] rounded-xl flex items-center justify-center text-white active:scale-95 transition-transform cursor-pointer"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {features.map((feature, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <CheckCircle2 size={14} className="text-[#C9A84C] shrink-0" />
                              <span className="text-[11px] font-bold text-gray-700 truncate">{feature}</span>
                            </div>
                            <button type="button" onClick={() => removeFeature(i)} className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Especificaciones */}
                <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('specs')}
                    className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Settings size={15} className="text-[#1B2B5E]" />
                      <span className="text-xs font-black text-gray-700 uppercase">Especificaciones ({specifications.length})</span>
                    </div>
                    {activeAccordion === 'specs' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                  {activeAccordion === 'specs' && (
                    <div className="p-5 border-t border-gray-100 bg-white space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-gray-400">Detalles de material, dimensiones, etc.</p>
                        <button type="button" onClick={addSpec} className="text-[9px] font-black text-[#1B2B5E] uppercase bg-gray-100 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer">
                          + Agregar Spec
                        </button>
                      </div>
                      <div className="space-y-2.5">
                        {specifications.map((spec, i) => (
                          <div key={i} className="group flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-150 relative">
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
                              placeholder="Ej: Oro 18k"
                              className="flex-1 bg-transparent text-[11px] font-black text-[#1B2B5E] outline-none" 
                            />
                            <button type="button" onClick={() => removeSpec(i)} className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Contenido Detallado */}
                <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('rich')}
                    className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Type size={15} className="text-[#1B2B5E]" />
                      <span className="text-xs font-black text-gray-700 uppercase">Contenido Detallado ({richContent.length})</span>
                    </div>
                    {activeAccordion === 'rich' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                  {activeAccordion === 'rich' && (
                    <div className="p-5 border-t border-gray-100 bg-white space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => addRichHeading(1)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-[9px] font-black text-[#1B2B5E] border border-gray-150 cursor-pointer">
                          <Heading1 size={13} /> Título H1
                        </button>
                        <button type="button" onClick={() => addRichHeading(2)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-[9px] font-black text-[#1B2B5E] border border-gray-150 cursor-pointer">
                          <Heading2 size={13} /> Título H2
                        </button>
                        <button type="button" onClick={addRichText} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-[9px] font-black text-[#1B2B5E] border border-gray-150 cursor-pointer">
                          <Type size={13} /> Párrafo
                        </button>
                        <button type="button" onClick={() => richFileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-[9px] font-black text-[#1B2B5E] border border-gray-150 cursor-pointer">
                          <ImageIcon size={13} /> Imagen
                        </button>
                        <input ref={richFileRef} type="file" className="hidden" onChange={addRichImage} />
                      </div>

                      <div className="space-y-4">
                        {richContent.map((block, i) => (
                          <div key={i} className="group relative bg-white rounded-2xl p-4 border border-gray-150 shadow-sm flex gap-3">
                            <div className="flex flex-col gap-1 shrink-0">
                              <button type="button" onClick={() => moveRichBlock(i, 'up')} className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#1B2B5E] hover:text-white transition-all cursor-pointer"><ChevronUp size={12} /></button>
                              <button type="button" onClick={() => moveRichBlock(i, 'down')} className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#1B2B5E] hover:text-white transition-all cursor-pointer"><ChevronDown size={12} /></button>
                            </div>

                            <div className="flex-1 min-w-0">
                              {block.type === 'heading' && (
                                <input 
                                  value={block.content} 
                                  onChange={(e) => updateRichBlock(i, e.target.value)}
                                  placeholder={`Título Nivel ${block.level}...`}
                                  className={`w-full bg-transparent outline-none font-black text-[#1B2B5E] ${block.level === 1 ? 'text-base' : 'text-sm'}`}
                                />
                              )}

                              {block.type === 'text' && (
                                <textarea 
                                  value={block.content} 
                                  onChange={(e) => updateRichBlock(i, e.target.value)}
                                  placeholder="Escribe el párrafo aquí..."
                                  rows={2}
                                  className="w-full bg-transparent outline-none text-xs leading-relaxed text-gray-600 resize-none font-medium"
                                />
                              )}

                              {block.type === 'image' && (
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                                  <img src={block.url} alt="Contenido" className="object-cover w-full h-full" />
                                </div>
                              )}
                            </div>

                            <button 
                              type="button" 
                              onClick={() => removeRichBlock(i)}
                              className="w-6 h-6 bg-white border border-gray-150 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: GALERÍA DE IMÁGENES */}
          {step === 2 && (
            <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <SectionHeader icon={ImagePlus} title="Galería del Producto" description="Sube fotos llamativas. La primera imagen será la portada." />
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5 mt-2">
                {images.map((url, index) => (
                  <div key={index} className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-150 shadow-sm transition-all hover:shadow-md">
                    <img src={url} alt="Producto" className="object-cover w-full h-full" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 text-center">
                      <button 
                        type="button"
                        onClick={() => handleMakePrimary(index)} 
                        className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg text-white transition-colors cursor-pointer ${index === 0 ? 'bg-[#C9A84C] cursor-default' : 'bg-white/20 hover:bg-[#C9A84C]'}`}
                      >
                        {index === 0 ? 'Portada' : 'Usar Portada'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleRemoveImage(url)} 
                        className="w-8 h-8 bg-white/20 hover:bg-rose-600 rounded-xl flex items-center justify-center text-white transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    {index === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#C9A84C] text-white text-[8px] font-black uppercase rounded-full tracking-wider shadow-sm">Portada</div>
                    )}
                  </div>
                ))}
                {images.length < 10 && (
                  <button 
                    type="button"
                    onClick={() => fileRef.current?.click()} 
                    disabled={uploading}
                    className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#C9A84C] hover:text-[#C9A84C] hover:bg-blue-50/10 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {uploading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                    <span className="text-[9px] font-black uppercase tracking-wider">{uploading ? 'Subiendo' : 'Añadir Foto'}</span>
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleImageUpload} />
            </div>
          )}

          {/* STEP 3: ESTÉTICA Y SECCIONES LANDING */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
              <LandingConfigEditor
                value={landingConfig}
                onChange={setLandingConfig}
                step={3}
              />
            </div>
          )}

          {/* STEP 4: TESTIMONIOS */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
              <LandingConfigEditor
                value={landingConfig}
                onChange={setLandingConfig}
                step={4}
              />
            </div>
          )}

          {/* STEP 5: REVISIÓN Y PUBLICACIÓN */}
          {step === 5 && (
            <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <SectionHeader icon={CheckCircle2} title="Revisión y Lanzamiento" description="Valida el resumen de tu producto antes de guardar." />

              <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-150 space-y-4 text-xs font-semibold">
                <div className="flex justify-between border-b border-gray-150/50 pb-2.5">
                  <span className="text-gray-400">Producto</span>
                  <span className="font-bold text-gray-800">{name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-150/50 pb-2.5">
                  <span className="text-gray-400">Precio Oficial</span>
                  <span className="font-bold text-gray-800">${Number(price).toLocaleString('es-CO')} COP</span>
                </div>
                {originalPrice && (
                  <div className="flex justify-between border-b border-gray-150/50 pb-2.5">
                    <span className="text-gray-400">Precio Original</span>
                    <span className="font-bold text-gray-400 line-through">${Number(originalPrice).toLocaleString('es-CO')} COP</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-gray-150/50 pb-2.5">
                  <span className="text-gray-400">Inventario / Stock</span>
                  <span className="font-bold text-gray-800">{stock} unidades</span>
                </div>
                <div className="flex justify-between border-b border-gray-150/50 pb-2.5">
                  <span className="text-gray-400">Galería</span>
                  <span className="font-bold text-gray-800">{images.length} fotos cargadas</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-gray-400">Color Primario</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-gray-500 uppercase">{landingConfig.colors?.primary}</span>
                    <div className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: landingConfig.colors?.primary }} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-amber-50 border border-amber-150 p-4 text-xs text-amber-700 font-semibold leading-relaxed">
                ¡Tu página de producto está lista! En cuanto hagas click en el botón de abajo, la landing page se generará al instante con los colores de marca y testimonios configurados.
              </div>
            </div>
          )}

          {/* Stepper Footer Controls */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-150">
            {error && (
              <p className="text-[10.5px] text-red-500 font-bold uppercase tracking-tight max-w-[280px] bg-red-50 px-3 py-2 rounded-xl border border-red-150">
                ⚠️ {error}
              </p>
            )}
            <div className="flex gap-3 ml-auto w-full sm:w-auto">
              {step > 1 && (
                <button 
                  type="button"
                  onClick={handlePrev}
                  className="flex-1 sm:flex-none h-11 px-6 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Anterior
                </button>
              )}
              {step < 5 ? (
                <button 
                  type="button"
                  onClick={handleNext} 
                  className="flex-1 sm:flex-none h-11 px-7 bg-[#1B2B5E] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-900/10 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Siguiente <ArrowRight size={14} />
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={handleSave} 
                  disabled={saving || uploading}
                  className="flex-1 sm:flex-none h-11 px-8 bg-[#C9A84C] text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-amber-600/10 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      {product ? 'Guardar Cambios' : 'Publicar Producto'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Live Mobile Preview (40% / 5 Cols) */}
        <div className="hidden lg:block lg:col-span-5 sticky top-24 self-start">
          <div className="flex items-center gap-2 mb-3.5 ml-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vista Previa Real (Shopify Style)</span>
          </div>
          <div className="overflow-auto max-h-[660px] no-scrollbar">
            <ProductPreview
              name={name}
              description={description}
              price={price}
              originalPrice={originalPrice}
              images={images}
              features={features}
              landingConfig={landingConfig}
              specifications={specifications}
              faq={faq}
              brandColor={brandColor}
            />
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile Preview */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setShowMobilePreview(true)}
          className="w-14 h-14 bg-[#1B2B5E] hover:bg-[#C9A84C] rounded-full flex items-center justify-center text-white shadow-2xl transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Eye size={22} />
        </button>
      </div>

      {/* Mobile Preview Overlay Modal */}
      {showMobilePreview && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-[360px] mx-auto animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowMobilePreview(false)}
              className="absolute -top-12 right-0 w-8 h-8 rounded-full bg-white text-gray-800 flex items-center justify-center shadow-lg font-black text-sm hover:scale-105 transition-all cursor-pointer"
            >
              ✕
            </button>
            <ProductPreview
              name={name}
              description={description}
              price={price}
              originalPrice={originalPrice}
              images={images}
              features={features}
              landingConfig={landingConfig}
              specifications={specifications}
              faq={faq}
              brandColor={brandColor}
            />
          </div>
        </div>
      )}
    </div>
  )
}
