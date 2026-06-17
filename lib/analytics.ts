/**
 * Este archivo actúa como un adaptador ligero para enviar eventos al sistema principal.
 * La lógica compleja y la gestión de la cola ahora viven dentro de hooks/useLandingAnalytics.ts
 */

export const trackEvent = (eventType: string, data: any = {}) => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('track_analytics_event', {
      detail: { eventType, data }
    })
    window.dispatchEvent(event)
  }
}
