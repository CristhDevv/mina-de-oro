'use client'

import { useState, useEffect } from 'react'
import { getSiteSettings } from '@/lib/api/settings'
import { HeroBannerSettings } from '@/types'

export default function HeroBanner() {
  const [settings, setSettings] = useState<HeroBannerSettings>({
    label: 'Ofertas especiales',
    title: 'Los mejores precios de Bogotá',
    description: 'Calidad garantizada al mejor precio',
    buttonText: 'Ver ofertas',
    alignment: 'left'
  })

  useEffect(() => {
    async function load() {
      try {
        const data = await getSiteSettings<HeroBannerSettings>('hero_banner')
        if (data) setSettings(data)
      } catch (error) {
        console.error('Error loading banner settings:', error)
      }
    }
    load()
  }, [])

  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  }

  return (
    <div className={`mx-4 mt-4 rounded-3xl bg-[#1B2B5E] px-6 py-8 flex flex-col gap-2 relative overflow-hidden shadow-xl shadow-blue-900/20 ${alignmentClasses[settings.alignment]}`}>
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full bg-[#C9A84C]/10 pointer-events-none" />
      <div className="absolute -left-10 top-1/2 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

      <span className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-[0.2em]">
        {settings.label}
      </span>
      <h1 className="text-white text-2xl font-extrabold leading-tight whitespace-pre-line">
        {settings.title}
      </h1>
      <p className="text-white/70 text-sm max-w-[240px] leading-relaxed">
        {settings.description}
      </p>
      <button className="mt-4 bg-[#C9A84C] text-white text-xs font-bold px-7 py-3 rounded-2xl shadow-lg shadow-[#C9A84C]/20 active:scale-95 transition-all">
        {settings.buttonText}
      </button>
    </div>
  )
}
