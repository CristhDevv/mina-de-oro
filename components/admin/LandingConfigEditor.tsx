'use client'

import { useState, useRef } from 'react'
import { LandingConfig } from '@/types'
import { Palette, Eye, Clock, Zap, Star, BarChart2, ShoppingBag, ChevronDown, ChevronUp, Trash2, Plus, Loader2, ImagePlus, MessageCircle } from 'lucide-react'
import { uploadProductImage } from '@/lib/api/storage'

interface Props {
  value: LandingConfig
  onChange: (config: LandingConfig) => void
  step: number
}

// ─── Color Swatch Picker ────────────────────────────────────────────────────
const PRESETS = [
  '#2C3E50', '#1B2B5E', '#1A1A2E', '#2D4059', '#0F3460',
  '#A0856A', '#C9A84C', '#D4691E', '#7B2020', '#B5451B',
  '#2ECC71', '#16A085', '#8E44AD', '#E74C3C', '#F5F5F0',
]

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="w-8 h-8 rounded-xl border border-gray-200 shadow-sm flex-shrink-0" style={{ backgroundColor: value }} />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-8 rounded-lg border-0 cursor-pointer bg-transparent p-0"
        />
        <span className="font-mono text-[11px] text-gray-500 uppercase tracking-wider">{value}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            title={c}
            className="w-6 h-6 rounded-lg border-2 transition-all hover:scale-110 active:scale-95 cursor-pointer"
            style={{
              backgroundColor: c,
              borderColor: value === c ? '#1B2B5E' : 'transparent',
              boxShadow: value === c ? '0 0 0 2px #fff, 0 0 0 3px #1B2B5E' : undefined,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Section Toggle Row ────────────────────────────────────────────────────
function SectionToggle({
  icon: Icon, label, active, onToggle, children,
}: {
  icon: any; label: string; active: boolean; onToggle: () => void; children?: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className={`rounded-2xl border transition-all ${active ? 'border-gray-200 bg-white' : 'border-dashed border-gray-100 bg-gray-50/50 opacity-60'}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${active ? 'bg-[#1B2B5E] text-white' : 'bg-gray-100 text-gray-400'}`}>
          <Icon size={13} />
        </div>
        <span className={`text-xs font-black uppercase tracking-wide flex-1 ${active ? 'text-gray-800' : 'text-gray-400'}`}>{label}</span>
        {children && active && (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
        <button
          type="button"
          onClick={onToggle}
          className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 cursor-pointer ${active ? 'bg-[#C9A84C]' : 'bg-gray-200'}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${active ? 'right-0.5' : 'left-0.5'}`} />
        </button>
      </div>
      {children && active && open && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-50 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function LandingConfigEditor({ value, onChange, step }: Props) {
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)
  const fileInputsRef = useRef<Record<number, HTMLInputElement | null>>({})

  const colors = value?.colors || {}
  const sections = value?.sections || {}

  const testimonialsItems = (sections.testimonials as { items?: any[] } | undefined)?.items || []

  function updateTestimonials(newItems: any[]) {
    onChange({
      ...value,
      colors,
      sections: {
        ...sections,
        testimonials: {
          ...(sections.testimonials as object || {}),
          items: newItems,
        },
      },
    })
  }

  function addTestimonial() {
    const newItem = { author: '', city: 'Bogotá', rating: 5, comment: '', avatar: '' }
    updateTestimonials([...testimonialsItems, newItem])
  }

  function removeTestimonial(idx: number) {
    updateTestimonials(testimonialsItems.filter((_, i) => i !== idx))
  }

  function updateTestimonialItem(idx: number, field: string, val: any) {
    const newItems = testimonialsItems.map((item, i) => i === idx ? { ...item, [field]: val } : item)
    updateTestimonials(newItems)
  }

  async function handleAvatarUpload(idx: number, file: File) {
    setUploadingIdx(idx)
    try {
      const url = await uploadProductImage(file, 'testimonial-avatar')
      updateTestimonialItem(idx, 'avatar', url)
    } catch (err) {
      alert('Error al subir el avatar')
    } finally {
      setUploadingIdx(null)
    }
  }

  function setColor(key: keyof NonNullable<LandingConfig['colors']>, val: string) {
    onChange({
      ...value,
      colors: { ...colors, [key]: val },
      sections,
    })
  }

  // Helper to safely cast keyof LandingConfig['sections'] to allow string keys
  function setSection(
    key: keyof NonNullable<LandingConfig['sections']>,
    patch: Record<string, unknown>
  ) {
    onChange({
      ...value,
      colors,
      sections: {
        ...sections,
        [key]: { ...(sections[key] as object || {}), ...patch },
      },
    })
  }

  function toggleSection(key: keyof NonNullable<LandingConfig['sections']>) {
    const current = (sections[key] as { active?: boolean } | undefined)?.active !== false
    setSection(key, { active: !current })
  }

  if (step === 3) {
    return (
      <div className="space-y-6">
        {/* Colors Palette Section */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Palette size={16} className="text-[#1B2B5E]" />
            <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider">Paleta de Colores</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColorPicker label="Color Principal (títulos, navbar)" value={colors.primary || '#2C3E50'} onChange={(v) => setColor('primary', v)} />
            <ColorPicker label="Color Acento (precios, badges)" value={colors.accent || '#A0856A'} onChange={(v) => setColor('accent', v)} />
            <ColorPicker label="Color CTA (botón Comprar)" value={colors.cta || '#D4691E'} onChange={(v) => setColor('cta', v)} />
            <ColorPicker label="Color Urgencia (stock bajo, timer)" value={colors.red || '#7B2020'} onChange={(v) => setColor('red', v)} />
            <ColorPicker label="Color de Fondo" value={colors.bg || '#F5F5F0'} onChange={(v) => setColor('bg', v)} />
          </div>
        </div>

        {/* Sections Activation Section */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={16} className="text-[#1B2B5E]" />
            <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider">Estructura de la Landing</h4>
          </div>

          <div className="space-y-3">
            <SectionToggle
              icon={ShoppingBag} label="Sección Hero (Imagen, Título y Precio)"
              active={(sections.hero as { active?: boolean } | undefined)?.active !== false}
              onToggle={() => toggleSection('hero')}
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subtítulo o Frase Llamativa</label>
                <input
                  type="text"
                  placeholder="Usa la descripción del producto por defecto"
                  value={(sections.hero as { subtitle?: string } | undefined)?.subtitle || ''}
                  onChange={(e) => setSection('hero', { subtitle: e.target.value })}
                  className="h-10 px-4 rounded-xl border border-gray-100 text-xs font-medium outline-none focus:border-[#1B2B5E] bg-gray-50/30"
                />
              </div>
            </SectionToggle>

            <SectionToggle
              icon={Clock} label="Barra de Urgencia (Cronómetro de Unidades)"
              active={(sections.urgency as { active?: boolean } | undefined)?.active !== false}
              onToggle={() => toggleSection('urgency')}
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duración del cronómetro (horas)</label>
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={(sections.urgency as { duration_hours?: number } | undefined)?.duration_hours || 24}
                  onChange={(e) => setSection('urgency', { duration_hours: parseInt(e.target.value) || 24 })}
                  className="h-10 px-4 rounded-xl border border-gray-100 text-xs font-black outline-none focus:border-[#1B2B5E] bg-gray-50/30 w-28"
                />
              </div>
            </SectionToggle>

            <SectionToggle
              icon={Zap} label="Sección del Problema / Antes y Después"
              active={(sections.problem as { active?: boolean } | undefined)?.active !== false}
              onToggle={() => toggleSection('problem')}
            >
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Título del Problema</label>
                  <input
                    type="text"
                    placeholder="¿Cansado de lo mismo?"
                    value={(sections.problem as { title?: string } | undefined)?.title || ''}
                    onChange={(e) => setSection('problem', { title: e.target.value })}
                    className="h-10 px-4 rounded-xl border border-gray-100 text-xs font-medium outline-none focus:border-[#1B2B5E] bg-gray-50/30"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Texto Descriptivo</label>
                  <textarea
                    placeholder="Describe el dolor o problema que soluciona tu producto..."
                    rows={3}
                    value={(sections.problem as { copy?: string } | undefined)?.copy || ''}
                    onChange={(e) => setSection('problem', { copy: e.target.value })}
                    className="px-4 py-3 rounded-xl border border-gray-100 text-xs font-medium outline-none focus:border-[#1B2B5E] bg-gray-50/30 resize-none"
                  />
                </div>
              </div>
            </SectionToggle>

            <SectionToggle
              icon={BarChart2} label="Sección de Beneficios (Grid de Características)"
              active={(sections.benefits as { active?: boolean } | undefined)?.active !== false}
              onToggle={() => toggleSection('benefits')}
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Título de la Sección</label>
                <input
                  type="text"
                  placeholder="¿Por qué elegir nuestro producto?"
                  value={(sections.benefits as { title?: string } | undefined)?.title || ''}
                  onChange={(e) => setSection('benefits', { title: e.target.value })}
                  className="h-10 px-4 rounded-xl border border-gray-100 text-xs font-medium outline-none focus:border-[#1B2B5E] bg-gray-50/30"
                />
              </div>
            </SectionToggle>

            <SectionToggle
              icon={Eye} label="Especificaciones Técnicas"
              active={(sections.specs as { active?: boolean } | undefined)?.active !== false}
              onToggle={() => toggleSection('specs')}
            />

            <SectionToggle
              icon={MessageCircle} label="Sección de Precios / Pricing"
              active={(sections.pricing as { active?: boolean } | undefined)?.active !== false}
              onToggle={() => toggleSection('pricing')}
            />
          </div>
        </div>
      </div>
    )
  }

  if (step === 4) {
    return (
      <div className="space-y-6">
        <SectionToggle
          icon={Star} label="Activar Reseñas / Testimonios de Clientes"
          active={(sections.testimonials as { active?: boolean } | undefined)?.active !== false}
          onToggle={() => toggleSection('testimonials')}
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Título de la Sección</label>
              <input
                type="text"
                placeholder="Lo que dicen nuestros clientes"
                value={(sections.testimonials as { title?: string } | undefined)?.title || ''}
                onChange={(e) => setSection('testimonials', { title: e.target.value })}
                className="h-10 px-4 rounded-xl border border-gray-100 text-xs font-medium outline-none focus:border-[#1B2B5E] bg-gray-50/30"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lista de Testimonios ({testimonialsItems.length})</label>
              </div>
              
              {testimonialsItems.map((item, idx) => (
                <div key={idx} className="group flex flex-col gap-3.5 p-5 bg-gray-50/50 rounded-2xl border border-gray-150 relative">
                  <button 
                    type="button"
                    onClick={() => removeTestimonial(idx)} 
                    className="absolute top-3 right-3 w-7 h-7 bg-white shadow-sm hover:shadow border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Nombre del Cliente</label>
                      <input
                        type="text"
                        value={item.author || ''}
                        onChange={(e) => updateTestimonialItem(idx, 'author', e.target.value)}
                        placeholder="Ej. María G."
                        className="h-9 px-3 rounded-lg border border-gray-200 text-xs font-medium outline-none focus:border-[#1B2B5E] bg-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Ciudad</label>
                      <input
                        type="text"
                        list="colombian-cities"
                        value={item.city || ''}
                        onChange={(e) => updateTestimonialItem(idx, 'city', e.target.value)}
                        placeholder="Ej. Bogotá"
                        className="h-9 px-3 rounded-lg border border-gray-200 text-xs font-medium outline-none focus:border-[#1B2B5E] bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Calificación</label>
                      <select
                        value={item.rating || 5}
                        onChange={(e) => updateTestimonialItem(idx, 'rating', parseInt(e.target.value))}
                        className="h-9 px-3 rounded-lg border border-gray-200 text-xs font-bold outline-none focus:border-[#1B2B5E] bg-white cursor-pointer"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 estrellas)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 estrellas)</option>
                        <option value={3}>⭐⭐⭐ (3 estrellas)</option>
                        <option value={2}>⭐⭐ (2 estrellas)</option>
                        <option value={1}>⭐ (1 estrella)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Foto de Perfil / Avatar</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.avatar || ''}
                          onChange={(e) => updateTestimonialItem(idx, 'avatar', e.target.value)}
                          placeholder="Sube foto o escribe URL"
                          className="h-9 px-3 rounded-lg border border-gray-200 text-[10px] font-medium outline-none focus:border-[#1B2B5E] bg-white flex-1"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          ref={el => { fileInputsRef.current[idx] = el }}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleAvatarUpload(idx, file);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputsRef.current[idx]?.click()}
                          disabled={uploadingIdx === idx}
                          className="h-9 px-3 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-505 hover:text-[#1B2B5E] hover:border-[#1B2B5E] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {uploadingIdx === idx ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Comentario del Cliente</label>
                    <textarea
                      value={item.comment || ''}
                      onChange={(e) => updateTestimonialItem(idx, 'comment', e.target.value)}
                      placeholder="Escribe el comentario del cliente..."
                      rows={2}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium outline-none focus:border-[#1B2B5E] bg-white resize-none"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addTestimonial}
                className="w-full h-11 rounded-2xl border-2 border-dashed border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-[#1B2B5E] hover:text-[#1B2B5E] transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white"
              >
                <Plus size={14} /> Agregar Testimonio
              </button>
            </div>
          </div>

          <datalist id="colombian-cities">
            <option value="Bogotá" />
            <option value="Medellín" />
            <option value="Cali" />
            <option value="Barranquilla" />
            <option value="Bucaramanga" />
            <option value="Cartagena" />
            <option value="Cúcuta" />
            <option value="Pereira" />
            <option value="Manizales" />
            <option value="Ibagué" />
            <option value="Villavicencio" />
            <option value="Pasto" />
          </datalist>
        </SectionToggle>
      </div>
    )
  }

  return null
}
