'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Product } from '@/types'
import GuestCheckoutDrawer from '@/components/landing/GuestCheckoutDrawer'

const STORAGE_URL = 'https://dpvobmhvsausguqwzrrm.supabase.co/storage/v1/object/public/products/organizador/'

const IMAGES = {
  producto: `${STORAGE_URL}01-producto.jpg`,
  dormitorio: `${STORAGE_URL}02-dormitorio.jpg`,
  antes_despues: `${STORAGE_URL}03-antes-despues.jpg`,
  pares24: `${STORAGE_URL}04-24pares.jpg`,
  sneakers: `${STORAGE_URL}05-sneakers.jpg`,
  specs: `${STORAGE_URL}06-specs.jpg`,
  infografia: `${STORAGE_URL}07-infografia.jpg`,
  acero: `${STORAGE_URL}08-acero.jpg`,
}

interface Props {
  product: Product
}

export default function OrganizadorLanding({ product }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [selectedOption, setSelectedOption] = useState<number>(1) // 1 = 8 Niveles (Option B)
  const [showPopup, setShowPopup] = useState(false)
  const [popupData, setPopupData] = useState({ ciudad: '', msg: '' })

  // Timer sin localStorage
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 24 * 60 * 60)), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24))
    const h = Math.floor((seconds % (3600 * 24)) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return `${d.toString().padStart(2, '0')}d ${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
  }

  // Popup de actividad
  useEffect(() => {
    const ciudades = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Pereira', 'Manizales', 'Cartagena', 'Cúcuta', 'Ibagué', 'Pasto', 'Villavicencio']
    const mensajes = [
      'acaba de hacer su pedido',
      'pidió el de 8 niveles',
      'dejó sus datos para recibir el suyo',
      'está mirando esta página ahora mismo',
      'acaba de apartar el suyo'
    ]

    const triggerPopup = () => {
      setPopupData({
        ciudad: ciudades[Math.floor(Math.random() * ciudades.length)],
        msg: mensajes[Math.floor(Math.random() * mensajes.length)]
      })
      setShowPopup(true)
      setTimeout(() => setShowPopup(false), 5000)
    }

    const timeout = setTimeout(() => {
      triggerPopup()
      const interval = setInterval(triggerPopup, Math.random() * 20000 + 25000)
      return () => clearInterval(interval)
    }, 8000)
    return () => clearTimeout(timeout)
  }, [])

  // Intersection Observer para fade-in
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0')
          entry.target.classList.remove('opacity-0', 'translate-y-8')
        }
      })
    }, { threshold: 0.1 })

    document.querySelectorAll('.fade-in-section').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const toggleFaq = (index: number) => setActiveFaq(activeFaq === index ? null : index)

  return (
    <div className="font-sans text-[#1A1A1A] bg-[#F5F5F0] overflow-x-hidden pb-24 md:pb-0">
      
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-[#2C3E50] text-white text-center py-2.5 px-4 text-sm font-medium">
        🚚 ENVÍO A TODO COLOMBIA · Pagas cuando recibes el producto en casa · Sin riesgos 🏠
      </div>

      {/* Hero */}
      <section className="container mx-auto px-5 py-10 md:py-16 flex flex-col-reverse md:flex-row md:items-center fade-in-section opacity-0 translate-y-8 transition-all duration-700 ease-out">
        <div className="md:w-3/5 text-center md:text-left mt-10 md:mt-0 md:pr-10">
          <div className="inline-block bg-[#F8F1E3] text-[#A0856A] px-4 py-2 rounded-full font-semibold text-sm mb-5">
            ⭐ Más de 2.300 hogares ya lo tienen
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#2C3E50] mb-5 leading-tight">
            ¿Tu entrada parece un <span className="text-[#D4691E]">caos</span> de zapatos?
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Organiza hasta 24 pares sin taladro, sin obras y en menos de 5 minutos.
          </p>
          <button 
            onClick={() => setDrawerOpen(true)}
            className="inline-block bg-[#D4691E] text-white px-8 py-4 text-lg font-bold rounded-lg shadow-[0_4px_15px_rgba(232,98,26,0.4)] transition-transform hover:-translate-y-1 animate-[pulse_2s_infinite]"
          >
            📦 LO QUIERO — Pago al recibir en casa
          </button>
          <div className="flex flex-wrap justify-center md:justify-start gap-5 mt-6 text-sm font-medium text-gray-700">
            <span className="flex items-center gap-1">🚚 Envío gratis</span>
            <span className="flex items-center gap-1">🔄 30 días devolución</span>
            <span className="flex items-center gap-1">🔒 Pago seguro</span>
          </div>
        </div>
        <div className="md:w-2/5 flex flex-col gap-5">
          <Image src={IMAGES.producto} alt="Detalle producto" width={600} height={600} className="rounded-xl shadow-lg w-full" priority />
          <Image src={IMAGES.dormitorio} alt="Organizador" width={600} height={600} className="rounded-xl shadow-lg w-full" />
        </div>
      </section>

      {/* Logos */}
      <section className="bg-white py-6 border-y border-gray-200">
        <div className="container mx-auto px-5 text-center">
          <p className="text-xs text-gray-400 mb-4 uppercase tracking-widest font-semibold">Destacado en</p>
          <div className="flex justify-center items-center gap-6 md:gap-10 flex-wrap opacity-50 grayscale">
            <span className="font-serif text-xl font-bold">Homecenter</span>
            <span className="font-sans text-lg font-bold tracking-tighter">Falabella</span>
            <span className="font-sans text-lg font-bold">Alkosto</span>
            <span className="font-serif text-lg">Paris</span>
            <span className="font-sans text-lg font-black tracking-widest">Éxito</span>
          </div>
        </div>
      </section>

      {/* Urgency */}
      <section className="bg-[#D4691E] text-white text-center p-5 font-bold text-lg">
        🔥 OFERTA LIMITADA — Solo <strong>7 unidades</strong> disponibles al precio de hoy · Precio sube en:
        <span className="font-mono text-3xl md:text-4xl block my-3">{formatTime(timeLeft)}</span>
        <span className="line-through opacity-70 text-base font-normal mr-2">$95.000</span>
        Solo $60.000
      </section>

      {/* Problem */}
      <section className="container mx-auto px-5 py-16 md:py-20 text-center fade-in-section opacity-0 translate-y-8 transition-all duration-700 ease-out">
        <h2 className="text-3xl md:text-4xl font-serif text-[#2C3E50] mb-10">¿Te identificas con esto?</h2>
        <div className="relative max-w-3xl mx-auto rounded-xl overflow-hidden shadow-lg">
          <span className="absolute top-4 left-4 bg-[#D32F2F] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-sm md:text-base z-10">❌ Antes</span>
          <span className="absolute top-4 right-4 bg-[#2E7D32] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-sm md:text-base z-10">✅ Después</span>
          <Image src={IMAGES.antes_despues} alt="Antes y después" width={800} height={500} className="w-full object-cover" />
        </div>
        <p className="italic text-lg md:text-xl mt-8 text-gray-600 max-w-2xl mx-auto">
          "Cada mañana buscas un zapato, encuentras el otro, llegas tarde. Y encima tropiezas con ellos."
        </p>
      </section>

      {/* Trust Bar & CTA */}
      <section className="bg-white py-10 md:py-16 fade-in-section opacity-0 translate-y-8 transition-all duration-700 ease-out">
        <div className="container mx-auto px-5 max-w-4xl">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">🔒</span>
                <span className="text-xs font-bold text-gray-700">Tienda verificada</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">🚚</span>
                <span className="text-xs font-bold text-gray-700">Envío a todo Colombia</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">↩️</span>
                <span className="text-xs font-bold text-gray-700">30 días de devolución</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">📦</span>
                <span className="text-xs font-bold text-gray-700">Pagas al recibir</span>
              </div>
            </div>
          </div>
          
          <div className="text-center mb-12">
            <button 
              onClick={() => setDrawerOpen(true)}
              className="w-full md:w-auto md:min-w-[400px] bg-[#D4691E] text-white px-8 py-5 text-xl font-bold rounded-xl shadow-[0_4px_15px_rgba(232,98,26,0.4)] transition-transform hover:-translate-y-1 animate-[pulse_2s_infinite]"
            >
              📦 LO QUIERO — Pago al recibir
            </button>
          </div>

          <div className="max-w-3xl mx-auto rounded-xl overflow-hidden shadow-xl">
            <Image src={IMAGES.pares24} alt="24 pares organizados" width={800} height={600} className="w-full object-cover" />
          </div>
        </div>
      </section>

      {/* Capacity Overlay */}
      <section className="relative h-[400px] md:h-[500px] flex items-end fade-in-section opacity-0 translate-y-8 transition-all duration-700 ease-out">
        <Image src={IMAGES.sneakers} alt="Sneakers" fill className="object-cover" />
        <div className="relative w-full p-10 bg-gradient-to-t from-[#2C3E50] to-transparent text-center text-white z-10 pt-32">
          <h2 className="text-3xl md:text-5xl font-serif mb-3 text-white">Organiza hasta 24 pares</h2>
          <p className="text-lg md:text-xl opacity-90">Tallas, temporadas, tipos — todo tiene su sitio</p>
        </div>
      </section>

      {/* Specs */}
      <section className="container mx-auto px-5 py-16 md:py-20 flex flex-col md:flex-row gap-10 md:gap-12 fade-in-section opacity-0 translate-y-8 transition-all duration-700 ease-out">
        <div className="md:w-1/2 flex flex-col gap-6">
          <Image src={IMAGES.specs} alt="Specs" width={600} height={600} className="rounded-xl w-full shadow-lg" />
          <Image src={IMAGES.infografia} alt="Infografia" width={600} height={600} className="rounded-xl w-full shadow-lg" />
        </div>
        <div className="md:w-1/2 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-serif text-[#2C3E50] mb-8">Especificaciones</h2>
          <div className="space-y-4">
            {[
              { label: 'Material', value: 'Acero inoxidable cromado' },
              { label: 'Niveles', value: '6 (ampliable a 8)' },
              { label: 'Capacidad', value: '24-32 pares' },
              { label: 'Montaje', value: 'Sin herramientas' },
              { label: 'Patas', value: 'Antideslizantes' },
              { label: 'Conectores', value: 'ABS de alta resistencia' },
              { label: 'Peso soportado', value: '15 kg por nivel' },
            ].map((spec, i) => (
              <div key={i} className="flex border-b border-gray-200 pb-3">
                <span className="font-bold text-[#2C3E50] w-1/3 md:w-1/4">{spec.label}</span>
                <span className="text-gray-600 flex-1">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-16 md:py-20 fade-in-section opacity-0 translate-y-8 transition-all duration-700 ease-out">
        <Image src={IMAGES.sneakers} alt="Fondo" fill className="object-cover" />
        <div className="absolute inset-0 bg-[#1B2F5E]/90"></div>
        <div className="container mx-auto px-5 relative z-10">
          <h2 className="text-3xl md:text-4xl font-serif text-white text-center mb-12">Lo que dicen quienes ya lo tienen ⭐⭐⭐⭐⭐</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { init: 'M', name: 'María G.', city: 'Bogotá', color: '#A0856A', text: '"Lo monté en 5 minutos y mi entrada parece otra. ¡Por fin tengo todo ordenado!"' },
              { init: 'C', name: 'Carlos R.', city: 'Medellín', color: '#2C3E50', text: '"Compré el de 8 niveles para toda la familia. Muy sólido, aguanta perfectamente."' },
              { init: 'L', name: 'Laura M.', city: 'Cali', color: '#2E7D32', text: '"Tenía los zapatos por toda la habitación. Ahora tengo espacio y todo a la vista."' },
            ].map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: t.color }}>
                    {t.init}
                  </div>
                  <div>
                    <strong className="block text-[#1A1A1A]">{t.name}</strong>
                    <small className="text-gray-500">{t.city}</small>
                  </div>
                </div>
                <div className="text-[#A0856A] mb-3 tracking-widest text-sm">⭐⭐⭐⭐⭐</div>
                <p className="italic text-gray-700">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality */}
      <section className="container mx-auto px-5 py-16 md:py-20 flex flex-col md:flex-row items-center gap-10 md:gap-12 fade-in-section opacity-0 translate-y-8 transition-all duration-700 ease-out">
        <div className="md:w-1/2">
          <Image src={IMAGES.acero} alt="Calidad acero" width={600} height={600} className="rounded-xl w-full shadow-lg" />
        </div>
        <div className="md:w-1/2">
          <h2 className="text-3xl md:text-4xl font-serif text-[#2C3E50] mb-8">Construido para durar</h2>
          <ul className="space-y-4">
            {[
              'Acero inoxidable que no se oxida',
              'Conectores ABS que no se rompen',
              'Patas antideslizantes para cualquier suelo'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-lg text-gray-700">
                <span className="text-[#A0856A] font-bold text-2xl">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pricing */}
      <section id="comprar" className="bg-[#2C3E50] py-16 md:py-20 px-5 text-white fade-in-section opacity-0 translate-y-8 transition-all duration-700 ease-out">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif text-white text-center mb-10">Elige tu modelo</h2>
          
          <div className="flex flex-col md:flex-row justify-center gap-6 mb-10">
            {/* Opción A */}
            <div 
              onClick={() => setSelectedOption(0)}
              className={`relative bg-white/5 border-2 rounded-xl p-8 cursor-pointer w-full md:w-[320px] transition-all hover:bg-white/10 ${selectedOption === 0 ? 'border-[#A0856A] bg-white/10' : 'border-white/20'}`}
            >
              <h3 className="text-xl font-bold mb-4">Opción A — 6 Niveles</h3>
              <div className="line-through opacity-60 text-lg">$85.000</div>
              <div className="text-4xl font-bold text-[#A0856A] my-2">$55.000</div>
              <p className="opacity-80 text-sm">Organiza hasta 24 pares</p>
            </div>
            
            {/* Opción B */}
            <div 
              onClick={() => setSelectedOption(1)}
              className={`relative bg-white/5 border-2 rounded-xl p-8 cursor-pointer w-full md:w-[320px] transition-all hover:bg-white/10 ${selectedOption === 1 ? 'border-[#A0856A] bg-white/10' : 'border-white/20'}`}
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#A0856A] text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide">
                MÁS POPULAR
              </div>
              <h3 className="text-xl font-bold mb-4">Opción B — 8 Niveles</h3>
              <div className="line-through opacity-60 text-lg">$95.000</div>
              <div className="text-4xl font-bold text-[#A0856A] my-2">$60.000</div>
              <p className="opacity-80 text-sm">Organiza hasta 32 pares</p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Pago contra entrega box */}
            <div className="bg-gradient-to-br from-[#1a4a1a] to-[#2d7a2d] rounded-xl p-6 md:p-8 mb-8 text-center shadow-lg">
              <div className="text-5xl mb-3">🏠</div>
              <div className="text-2xl md:text-3xl font-serif font-bold mb-3">Pago Contra Entrega</div>
              <div className="text-white/90 mb-6 text-sm md:text-base">
                No pagas nada hoy. El mensajero llega a tu puerta, revisas el producto y <strong>solo entonces pagas.</strong>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="bg-white/15 px-4 py-1.5 rounded-full text-sm font-medium">✅ Cero riesgo</span>
                <span className="bg-white/15 px-4 py-1.5 rounded-full text-sm font-medium">✅ Sin tarjeta</span>
                <span className="bg-white/15 px-4 py-1.5 rounded-full text-sm font-medium">✅ Envío a todo Colombia</span>
              </div>
            </div>

            {/* Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 bg-[#f0f7f0] border border-[#c3e6c3] rounded-lg p-3 text-[#1a6b1a]">
                <span className="text-2xl">✅</span>
                <div>
                  <div className="font-bold text-xs">TIENDA VERIFICADA</div>
                  <div className="text-[10px] text-white/70">Vendedor de confianza</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#f0f4ff] border border-[#c3d0f5] rounded-lg p-3 text-[#1a3a8b]">
                <span className="text-2xl">🔒</span>
                <div>
                  <div className="font-bold text-xs">PAGO SSL SEGURO</div>
                  <div className="text-[10px] text-white/70">256-bit encriptado</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#fff8ec] border border-[#f5dcaa] rounded-lg p-3 text-[#8a5a00]">
                <span className="text-2xl">🏆</span>
                <div>
                  <div className="font-bold text-xs">TOP VENTAS 2025</div>
                  <div className="text-[10px] text-white/70">+2.300 unidades vendidas</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#fff0f0] border border-[#f5c3c3] rounded-lg p-3 text-[#8b1a1a]">
                <span className="text-2xl">↩️</span>
                <div>
                  <div className="font-bold text-xs">DEVOLUCIÓN GRATIS</div>
                  <div className="text-[10px] text-white/70">30 días sin preguntas</div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setDrawerOpen(true)}
              className="w-full bg-[#D4691E] text-white py-5 text-xl font-bold rounded-xl shadow-[0_4px_15px_rgba(232,98,26,0.4)] transition-transform hover:-translate-y-1 animate-[pulse_2s_infinite] mb-4"
            >
              📦 HACER PEDIDO — Pago al recibir
            </button>
            
            <div className="flex flex-wrap justify-center gap-4 text-xs opacity-80 mt-4">
              <span className="flex items-center gap-1">🏠 Pagas en tu puerta</span>
              <span className="flex items-center gap-1">📦 Envío a todo Colombia</span>
              <span className="flex items-center gap-1">↩️ Garantía 30 días</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#7B2020] text-white text-center p-4 font-bold md:text-lg">
        ⚠️ ¡ATENCIÓN! Solo quedan 7 unidades al precio de hoy. El precio sube en cuanto se agote el stock de lanzamiento.
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 md:py-20 fade-in-section opacity-0 translate-y-8 transition-all duration-700 ease-out">
        <div className="container mx-auto px-5 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-serif text-[#2C3E50] text-center mb-10">Preguntas frecuentes</h2>
          <div className="space-y-0">
            {[
              { q: '¿Necesito herramientas para montarlo?', a: 'No, se ensambla a presión en 5 minutos.' },
              { q: '¿Cuántos zapatos caben?', a: '3-4 pares por nivel: 24 pares en el de 6 niveles, 32 en el de 8.' },
              { q: '¿Es resistente?', a: 'Sí, acero inoxidable cromado, soporta 15 kg por nivel.' },
              { q: '¿Puedo devolver si no me gusta?', a: 'Sí, 30 días de devolución gratuita sin preguntas.' },
              { q: '¿Cuándo llega?', a: 'Envío en 24-48 horas laborables.' }
            ].map((faq, i) => (
              <div key={i} className="border-b border-gray-200 py-5 cursor-pointer" onClick={() => toggleFaq(i)}>
                <div className="flex justify-between items-center font-bold text-lg text-[#1A1A1A]">
                  {faq.q}
                  <span className={`text-2xl transition-transform duration-300 text-[#A0856A] ${activeFaq === i ? 'rotate-45' : ''}`}>+</span>
                </div>
                <div className={`mt-3 text-gray-600 overflow-hidden transition-all duration-300 ${activeFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-[#2C3E50] to-[#0a1128] text-center text-white fade-in-section opacity-0 translate-y-8 transition-all duration-700 ease-out px-5">
        <h2 className="text-4xl md:text-5xl font-serif mb-4 text-white">Tu casa ordenada.<br/>Esta semana.</h2>
        <p className="text-lg opacity-80 mb-10">Más de 2.300 familias ya dieron el paso.</p>
        <button 
          onClick={() => setDrawerOpen(true)}
          className="inline-block bg-[#D4691E] text-white px-8 py-4 text-lg font-bold rounded-lg shadow-[0_4px_15px_rgba(232,98,26,0.4)] transition-transform hover:-translate-y-1 animate-[pulse_2s_infinite]"
        >
          📦 LO QUIERO — Pago al recibir
        </button>
        <div className="font-mono text-2xl text-[#A0856A] mt-8">{formatTime(timeLeft)}</div>
        <div className="inline-flex items-center gap-4 bg-white/10 border border-white/20 rounded-xl p-5 mt-10 text-left max-w-md">
          <div className="text-4xl">🛡️</div>
          <div>
            <div className="font-bold text-white mb-1">Garantía Total 30 días</div>
            <div className="text-sm text-white/70">Si no te convence, te devolvemos cada céntimo.<br/>Sin formularios. Sin esperas.</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111] text-[#888] text-center py-10 px-5 text-sm pb-32 md:pb-10">
        <div className="flex justify-center gap-4 mb-4">
          <span className="hover:text-white transition-colors cursor-pointer">Política de privacidad</span> |
          <span className="hover:text-white transition-colors cursor-pointer">Aviso legal</span> |
          <span className="hover:text-white transition-colors cursor-pointer">Contacto</span>
        </div>
        <p className="mb-2">🔒 Compra 100% segura mediante encriptación SSL</p>
        <p>© 2025 OrganizaYa · Todos los derechos reservados</p>
      </footer>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#2C3E50] p-4 z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
        <button 
          onClick={() => setDrawerOpen(true)}
          className="w-full bg-[#D4691E] text-white py-4 text-lg font-bold rounded-xl shadow-lg animate-[pulse_2s_infinite]"
        >
          📦 LO QUIERO — Pago al recibir
        </button>
      </div>

      {/* Popup de Actividad */}
      <div 
        className={`fixed bottom-[100px] md:bottom-6 left-5 z-50 bg-white rounded-xl py-3 px-4 shadow-[0_8px_30px_rgba(0,0,0,0.15)] max-w-[280px] border-l-4 border-[#2C3E50] flex items-center gap-3 transition-all duration-500 ${showPopup ? 'translate-x-0 opacity-100' : '-translate-x-[120%] opacity-0'}`}
      >
        <span className="text-3xl">🛒</span>
        <div className="flex-1">
          <div className="font-bold text-sm text-[#1A1A1A] leading-tight mb-0.5">Alguien de {popupData.ciudad} {popupData.msg}</div>
          <div className="text-xs text-gray-500">Hace unos minutos</div>
        </div>
        <button onClick={() => setShowPopup(false)} className="text-gray-400 hover:text-gray-600 text-xl ml-1 px-1">&times;</button>
      </div>

      {/* Checkout Drawer */}
      <GuestCheckoutDrawer 
        product={{
          ...product,
          price: selectedOption === 1 ? 60000 : 55000,
          name: selectedOption === 1 ? `${product.name} (8 Niveles)` : `${product.name} (6 Niveles)`
        }} 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
      />
    </div>
  )
}
