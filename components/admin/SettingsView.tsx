'use client'

import { useState, useEffect } from 'react'
import { Save, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { getSiteSettings, updateSiteSettings } from '@/lib/api/settings'
import { HeroBannerSettings } from '@/types'

export default function SettingsView() {
  const [settings, setSettings] = useState<HeroBannerSettings>({
    label: 'Ofertas especiales',
    title: 'Los mejores precios de Bogotá',
    description: 'Calidad garantizada al mejor precio',
    buttonText: 'Ver ofertas',
    alignment: 'left'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getSiteSettings<HeroBannerSettings>('hero_banner')
        if (data) setSettings(data)
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      await updateSiteSettings('hero_banner', settings)
      setMessage({ type: 'success', text: 'Configuración guardada correctamente' })
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Error al guardar la configuración' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Cargando configuración...</div>
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto pb-10">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Banner Principal</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Etiqueta (Sobre el título)
            </label>
            <input
              type="text"
              value={settings.label}
              onChange={e => setSettings({ ...settings, label: e.target.value })}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:border-[#1B2B5E] outline-none"
              placeholder="Ej: Ofertas especiales"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Título
            </label>
            <textarea
              value={settings.title}
              onChange={e => setSettings({ ...settings, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#1B2B5E] outline-none min-h-[80px]"
              placeholder="Ej: Los mejores precios de Bogotá"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Descripción
            </label>
            <textarea
              value={settings.description}
              onChange={e => setSettings({ ...settings, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#1B2B5E] outline-none min-h-[80px]"
              placeholder="Ej: Calidad garantizada al mejor precio"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Texto del Botón
            </label>
            <input
              type="text"
              value={settings.buttonText}
              onChange={e => setSettings({ ...settings, buttonText: e.target.value })}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:border-[#1B2B5E] outline-none"
              placeholder="Ej: Ver ofertas"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Alineación del Texto
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSettings({ ...settings, alignment: 'left' })}
                className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border transition-all ${
                  settings.alignment === 'left' 
                    ? 'bg-[#1B2B5E] text-white border-[#1B2B5E]' 
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                <AlignLeft size={16} /> Izquierda
              </button>
              <button
                onClick={() => setSettings({ ...settings, alignment: 'center' })}
                className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border transition-all ${
                  settings.alignment === 'center' 
                    ? 'bg-[#1B2B5E] text-white border-[#1B2B5E]' 
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                <AlignCenter size={16} /> Centro
              </button>
              <button
                onClick={() => setSettings({ ...settings, alignment: 'right' })}
                className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border transition-all ${
                  settings.alignment === 'right' 
                    ? 'bg-[#1B2B5E] text-white border-[#1B2B5E]' 
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                <AlignRight size={16} /> Derecha
              </button>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="h-12 bg-[#1B2B5E] text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:bg-[#1B2B5E]/90 active:scale-95 shadow-lg shadow-blue-900/10"
      >
        <Save size={18} />
        {saving ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </div>
  )
}
