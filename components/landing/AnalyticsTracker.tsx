'use client'

import { usePathname } from 'next/navigation'
import { useLandingAnalytics } from '@/hooks/useLandingAnalytics'

export default function AnalyticsTracker() {
  const pathname = usePathname()
  
  // Extraer el slug de la ruta para el contexto de las analíticas
  const slug = pathname.split('/').pop() || 'home'
  
  // Inicializar el sistema avanzado de tracking (efecto puro)
  useLandingAnalytics({ slug })

  return null
}
