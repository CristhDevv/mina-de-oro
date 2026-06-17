'use client'

import { useState, useEffect } from 'react'
import { LandingConfig } from '@/types'
import { Palette, Eye, EyeOff, Clock, MessageCircle, Zap, Star, BarChart2, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  value: LandingConfig
  onChange: (config: LandingConfig) => void
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
            onClick={() => onChange(c)}
            title={c}
            className="w-6 h-6 rounded-lg border-2 transition-all hover:scale-110 active:scale-95"
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
  const [open, setOpen] = useState(false)
  return (
    <div className={`rounded-2xl border transition-all ${active ? 'border-gray-200 bg-white' : 'border-dashed border-gray-100 bg-gray-50 opacity-60'}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${active ? 'bg-[#1B2B5E] text-white' : 'bg-gray-100 text-gray-400'}`}>
          <Icon size={13} />
        </div>
        <span className={`text-xs font-black uppercase tracking-wide flex-1 ${active ? 'text-gray-800' : 'text-gray-400'}`}>{label}</span>
        {children && active && (
          <button
            onClick={() => setOpen(!open)}
            className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
          >
            {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
        <button
          onClick={onToggle}
          className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${active ? 'bg-[#C9A84C]' : 'bg-gray-200'}`}
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

// ─── Mini Preview ──────────────────────────────────────────────────────────
function MiniPreview({ colors, sections }: { colors: LandingConfig['colors']; sections: LandingConfig['sections'] }) {
  const primary = colors?.primary || '#2C3E50'
  const accent = colors?.accent || '#A0856A'
  const cta = colors?.cta || '#D4691E'
  const red = colors?.red || '#7B2020'
  const bg = colors?.bg || '#F5F5F0'

  return (
    <div
      className="w-full rounded-3xl overflow-hidden shadow-xl border border-gray-100 select-none"
      style={{ backgroundColor: bg, fontFamily: 'sans-serif' }}
    >
      {/* Announcement bar */}
      <div className="py-1.5 px-3 text-center text-[8px] font-black text-white uppercase tracking-wider" style={{ backgroundColor: primary }}>
        🚚 ENVÍO A TODO COLOMBIA · Sin riesgos
      </div>

      {/* Hero */}
      {sections?.hero?.active !== false && (
        <div className="bg-white px-4 py-3 rounded-b-2xl shadow-sm">
          <div className="aspect-square rounded-xl bg-gray-100 mb-3 flex items-center justify-center">
            <ShoppingBag size={32} style={{ color: accent }} />
          </div>
          <div className="text-[9px] font-black px-2 py-0.5 rounded-full inline-block mb-1"
            style={{ color: accent, backgroundColor: `${accent}18` }}>
            ⭐ Más de 2.300 hogares ya lo tienen
          </div>
          <div className="text-[11px] font-black leading-snug mb-0.5" style={{ color: primary }}>
            Nombre del Producto
          </div>
          <div className="text-[7px] text-gray-400 mb-2">Subtítulo o descripción corta del producto.</div>
          <div className="text-base font-black" style={{ color: cta }}>$129.900</div>
        </div>
      )}

      {/* Urgency */}
      {sections?.urgency?.active !== false && (
        <div className="mx-3 my-2 rounded-xl px-3 py-2 flex items-center gap-2" style={{ backgroundColor: `${red}15`, borderLeft: `3px solid ${red}` }}>
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: red }} />
          <div>
            <div className="text-[8px] font-black uppercase" style={{ color: red }}>¡Quedan pocas unidades!</div>
            <div className="text-[7px] font-bold" style={{ color: red }}>⏱ 23h 59m 00s</div>
          </div>
        </div>
      )}

      {/* Benefits */}
      {sections?.benefits?.active !== false && (
        <div className="mx-3 my-2 bg-white rounded-xl p-3 shadow-sm">
          <div className="text-[9px] font-black mb-2 text-center" style={{ color: primary }}>Todo lo que necesitas ✅</div>
          <div className="grid grid-cols-2 gap-1.5">
            {['Beneficio 1', 'Beneficio 2', 'Beneficio 3', 'Beneficio 4'].map((b) => (
              <div key={b} className="bg-gray-50 rounded-lg p-1.5">
                <div className="text-[7px] font-bold text-gray-600">⚡ {b}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testimonials */}
      {sections?.testimonials?.active !== false && (
        <div className="mx-3 my-2 bg-white rounded-xl p-3 shadow-sm">
          <div className="text-[9px] font-black mb-1.5 text-center" style={{ color: primary }}>Reseñas ⭐⭐⭐⭐⭐</div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-[7px] text-yellow-500 mb-0.5">★★★★★</div>
            <div className="text-[7px] text-gray-600">«Producto excelente, llegó rápido y en perfectas condiciones...»</div>
            <div className="text-[7px] text-gray-400 mt-0.5 font-bold">— Cliente satisfecho</div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mx-3 my-3 space-y-1.5">
        <div className="py-2 px-4 rounded-xl text-center text-[9px] font-black text-white shadow-sm" style={{ backgroundColor: cta }}>
          Comprar ahora →
        </div>
        <div className="py-2 px-4 rounded-xl text-center text-[9px] font-black flex items-center justify-center gap-1" style={{ backgroundColor: `${primary}15`, color: primary }}>
          <span>💬</span> Pedir por WhatsApp
        </div>
      </div>

      {/* Floating button hint */}
      <div className="m-3 py-2 px-3 rounded-xl flex items-center justify-between shadow-sm" style={{ backgroundColor: cta }}>
        <span className="text-[8px] font-black text-white">$129.900</span>
        <span className="text-[8px] font-black text-white">🛒 Comprar</span>
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function LandingConfigEditor({ value, onChange }: Props) {
  const [tab, setTab] = useState<'colors' | 'sections'>('colors')

  const colors = value?.colors || {}
  const sections = value?.sections || {}

  function setColor(key: keyof NonNullable<LandingConfig['colors']>, val: string) {
    onChange({
      ...value,
      colors: { ...colors, [key]: val },
      sections,
    })
  }

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

  return (
    <div className="flex flex-col gap-6">
      {/* Tab switcher */}
      <div className="flex gap-2 bg-gray-50 p-1 rounded-2xl">
        <button
          onClick={() => setTab('colors')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all ${tab === 'colors' ? 'bg-white text-[#1B2B5E] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Palette size={13} /> Colores
        </button>
        <button
          onClick={() => setTab('sections')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all ${tab === 'sections' ? 'bg-white text-[#1B2B5E] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Eye size={13} /> Secciones
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT — editor */}
        <div className="space-y-6">
          {tab === 'colors' && (
            <>
              <ColorPicker label="Color Principal (títulos, navbar)" value={colors.primary || '#2C3E50'} onChange={(v) => setColor('primary', v)} />
              <ColorPicker label="Color Acento (precios, badges)" value={colors.accent || '#A0856A'} onChange={(v) => setColor('accent', v)} />
              <ColorPicker label="Color CTA (botón Comprar)" value={colors.cta || '#D4691E'} onChange={(v) => setColor('cta', v)} />
              <ColorPicker label="Color Urgencia (stock bajo, timer)" value={colors.red || '#7B2020'} onChange={(v) => setColor('red', v)} />
              <ColorPicker label="Color de Fondo" value={colors.bg || '#F5F5F0'} onChange={(v) => setColor('bg', v)} />
            </>
          )}

          {tab === 'sections' && (
            <div className="space-y-3">
              <SectionToggle
                icon={ShoppingBag} label="Hero (imagen + precio + CTA)"
                active={(sections.hero as { active?: boolean } | undefined)?.active !== false}
                onToggle={() => toggleSection('hero')}
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subtítulo personalizado</label>
                  <input
                    type="text"
                    placeholder="Usa la descripción del producto por defecto"
                    value={(sections.hero as { subtitle?: string } | undefined)?.subtitle || ''}
                    onChange={(e) => setSection('hero', { subtitle: e.target.value })}
                    className="h-9 px-3 rounded-xl border border-gray-100 text-[11px] font-medium outline-none focus:border-[#1B2B5E] bg-white"
                  />
                </div>
              </SectionToggle>

              <SectionToggle
                icon={Clock} label="Barra de Urgencia (cronómetro + stock)"
                active={(sections.urgency as { active?: boolean } | undefined)?.active !== false}
                onToggle={() => toggleSection('urgency')}
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duración del timer (horas)</label>
                  <input
                    type="number"
                    min={1}
                    max={72}
                    value={(sections.urgency as { duration_hours?: number } | undefined)?.duration_hours || 24}
                    onChange={(e) => setSection('urgency', { duration_hours: parseInt(e.target.value) || 24 })}
                    className="h-9 px-3 rounded-xl border border-gray-100 text-[11px] font-black outline-none focus:border-[#1B2B5E] bg-white w-24"
                  />
                  <p className="text-[9px] text-gray-400">El cronómetro se reinicia por sesión (localStorage). Siempre genera urgencia real.</p>
                </div>
              </SectionToggle>

              <SectionToggle
                icon={Zap} label="Sección Problema / Antes & Después"
                active={(sections.problem as { active?: boolean } | undefined)?.active !== false}
                onToggle={() => toggleSection('problem')}
              >
                <div className="space-y-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Título</label>
                    <input
                      type="text"
                      placeholder="¿Te identificas con esto?"
                      value={(sections.problem as { title?: string } | undefined)?.title || ''}
                      onChange={(e) => setSection('problem', { title: e.target.value })}
                      className="h-9 px-3 rounded-xl border border-gray-100 text-[11px] font-medium outline-none focus:border-[#1B2B5E] bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Texto del problema</label>
                    <textarea
                      placeholder='"Cada mañana buscas el zapato..."'
                      rows={2}
                      value={(sections.problem as { copy?: string } | undefined)?.copy || ''}
                      onChange={(e) => setSection('problem', { copy: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-gray-100 text-[11px] font-medium outline-none focus:border-[#1B2B5E] bg-white resize-none"
                    />
                  </div>
                </div>
              </SectionToggle>

              <SectionToggle
                icon={BarChart2} label="Grid de Beneficios"
                active={(sections.benefits as { active?: boolean } | undefined)?.active !== false}
                onToggle={() => toggleSection('benefits')}
              >
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Título de la sección</label>
                  <input
                    type="text"
                    placeholder="Todo lo que necesitas. Nada que no necesitas."
                    value={(sections.benefits as { title?: string } | undefined)?.title || ''}
                    onChange={(e) => setSection('benefits', { title: e.target.value })}
                    className="h-9 px-3 rounded-xl border border-gray-100 text-[11px] font-medium outline-none focus:border-[#1B2B5E] bg-white"
                  />
                </div>
              </SectionToggle>

              <SectionToggle
                icon={Eye} label="Especificaciones Técnicas"
                active={(sections.specs as { active?: boolean } | undefined)?.active !== false}
                onToggle={() => toggleSection('specs')}
              />

              <SectionToggle
                icon={Star} label="Reseñas / Testimonios"
                active={(sections.testimonials as { active?: boolean } | undefined)?.active !== false}
                onToggle={() => toggleSection('testimonials')}
              >
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Título de la sección</label>
                  <input
                    type="text"
                    placeholder="Lo que dicen quienes ya lo tienen"
                    value={(sections.testimonials as { title?: string } | undefined)?.title || ''}
                    onChange={(e) => setSection('testimonials', { title: e.target.value })}
                    className="h-9 px-3 rounded-xl border border-gray-100 text-[11px] font-medium outline-none focus:border-[#1B2B5E] bg-white"
                  />
                </div>
              </SectionToggle>

              <SectionToggle
                icon={MessageCircle} label="Sección de Pricing / Opciones"
                active={(sections.pricing as { active?: boolean } | undefined)?.active !== false}
                onToggle={() => toggleSection('pricing')}
              />
            </div>
          )}
        </div>

        {/* RIGHT — live preview */}
        <div className="sticky top-24 self-start">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vista previa en tiempo real</span>
          </div>
          <div className="overflow-auto max-h-[640px] rounded-3xl border border-gray-100 shadow-lg">
            <MiniPreview
              colors={value?.colors || {}}
              sections={value?.sections || {}}
            />
          </div>
          <p className="text-[9px] text-gray-300 text-center mt-2">El preview refleja exactamente los colores de la landing real</p>
        </div>
      </div>
    </div>
  )
}
