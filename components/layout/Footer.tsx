'use client'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-10 pb-24 px-6">
      <div className="max-w-lg mx-auto">
        <div className="flex flex-col gap-8">
          {/* Info del Negocio */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-xl font-bold text-[#1B2B5E]">La Mina</span>
              <span className="text-xl font-bold text-[#C9A84C]">de Oro</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Los mejores precios, la mejor calidad. Tu tienda de confianza para encontrar productos exclusivos y ofertas increíbles.
            </p>
          </div>

          {/* Links de Navegación */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Navegación</h4>
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              <Link href="/" className="text-sm font-medium text-gray-600 hover:text-[#1B2B5E] transition-colors">Inicio</Link>
              <Link href="/productos" className="text-sm font-medium text-gray-600 hover:text-[#1B2B5E] transition-colors">Productos</Link>
              <Link href="/cuenta" className="text-sm font-medium text-gray-600 hover:text-[#1B2B5E] transition-colors">Mi Cuenta</Link>
            </nav>
          </div>

          {/* Contacto */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contacto</h4>
            <a href="https://wa.me/573117284178" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#1B2B5E] transition-colors">
              <MessageCircle size={16} className="text-[#C9A84C]" />
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-gray-50 text-center">
          <p className="text-[10px] text-gray-400 font-medium">
            © {new Date().getFullYear()} LA MINA DE ORO. TODOS LOS DERECHOS RESERVADOS.
          </p>
        </div>
      </div>
    </footer>
  )
}
