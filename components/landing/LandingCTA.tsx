'use client'

import { useState } from 'react'
import { Product } from '@/types'
import GuestCheckoutDrawer from '@/components/landing/GuestCheckoutDrawer'
import { ShoppingBag } from 'lucide-react'

interface LandingCTAProps {
  product: Product
}

export default function LandingCTA({ product }: LandingCTAProps) {
  const [open, setOpen] = useState(false)
  const accent = product.brand_color || '#1B2B5E'

  if (product.stock <= 0) return null

  return (
    <>
      {/* Botón CTA fijo en la parte inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-6 pt-3 bg-gradient-to-t from-white via-white/95 to-transparent">
        <button
          id="landing-cta-button"
          onClick={() => setOpen(true)}
          className="w-full h-14 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2.5 shadow-xl active:scale-[0.98] transition-all"
          style={{ backgroundColor: accent, boxShadow: `0 8px 30px ${accent}40` }}
        >
          <ShoppingBag size={20} />
          Quiero el mío · ${product.price.toLocaleString('es-CO')}
        </button>
      </div>

      {/* Drawer de checkout */}
      <GuestCheckoutDrawer
        product={product}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
