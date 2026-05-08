'use client'

import { useEffect, useRef } from 'react'

// Utilidad simple para hashear el fingerprint y evitar guardar datos extensos
const cyrb53 = (str: string, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16)
}

export function useLandingAnalytics({ slug }: { slug: string }) {
  const sessionIdRef = useRef<string>('')
  const eventQueueRef = useRef<any[]>([])
  const sessionDataRef = useRef<any>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const sectionEntryTimes = useRef<Record<string, number>>({})

  useEffect(() => {
    if (typeof window === 'undefined') return

    const trackEvent = (eventType: string, data: any = {}) => {
      lastActivityRef.current = Date.now()
      eventQueueRef.current.push({
        event_type: eventType,
        slug,
        ...data,
      })
    }

    const flushEvents = () => {
      if (eventQueueRef.current.length === 0 && !sessionDataRef.current?._needsUpdate) return

      const payload = {
        session: sessionDataRef.current,
        events: [...eventQueueRef.current],
      }

      eventQueueRef.current = []
      if (sessionDataRef.current) {
        sessionDataRef.current._needsUpdate = false
      }

      try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/analytics/events', blob)
        } else {
          fetch('/api/analytics/events', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
            keepalive: true,
          }).catch(() => {})
        }
      } catch (e) {
        // Silencioso
      }
    }

    // 1. Al montar: Generar ID y recabar datos
    if (!sessionIdRef.current) {
      sessionIdRef.current = crypto.randomUUID()
    }

    // Fingerprint
    const fpString = `${navigator.userAgent}-${window.screen.width}x${window.screen.height}-${Intl.DateTimeFormat().resolvedOptions().timeZone}-${navigator.language}-${navigator.platform}-${window.screen.colorDepth}`
    const fingerprint = cyrb53(fpString)

    // is_returning
    const visitsKey = `lp_visits_${slug}`
    const isReturning = localStorage.getItem(visitsKey) === 'true'
    localStorage.setItem(visitsKey, 'true')

    // Device
    const ua = navigator.userAgent.toLowerCase()
    let device = 'desktop'
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      device = 'tablet'
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      device = 'mobile'
    }

    // URL Params
    const url = new URL(window.location.href)
    const utm_source = url.searchParams.get('utm_source')
    const utm_medium = url.searchParams.get('utm_medium')
    const utm_campaign = url.searchParams.get('utm_campaign')
    const utm_content = url.searchParams.get('utm_content')

    // Load time
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const loadTimeMs = navEntry ? Math.round(navEntry.loadEventEnd - navEntry.startTime) : null

    sessionDataRef.current = {
      session_id: sessionIdRef.current,
      slug,
      fingerprint,
      ip: null, // Capturado en el backend idealmente
      country: null,
      city: null,
      device,
      screen: `${window.screen.width}x${window.screen.height}`,
      referrer: document.referrer || null,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      user_agent: navigator.userAgent,
      is_returning: isReturning,
      load_time_ms: loadTimeMs,
      _needsUpdate: true,
    }

    // Enviar inicio de sesión y page_view inicial
    trackEvent('page_view')
    flushEvents()

    // 2. Intervalo de Flush (cada 5s)
    const flushInterval = setInterval(flushEvents, 5000)

    // 3. Captura de Eventos

    // Scroll
    let scrollTimeout: NodeJS.Timeout | null = null
    const handleScroll = () => {
      lastActivityRef.current = Date.now()
      if (scrollTimeout) clearTimeout(scrollTimeout)
      
      scrollTimeout = setTimeout(() => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        if (docHeight > 0) {
          const pct = Math.round((window.scrollY / docHeight) * 100)
          trackEvent('scroll', { scroll_pct: pct })
        }
      }, 500)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Click
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const sectionEl = target.closest('[data-section]')
      
      let elementStr = target.tagName.toLowerCase()
      if (target.id) elementStr += `#${target.id}`
      if (target.className && typeof target.className === 'string') {
        const classes = target.className.split(' ').slice(0, 2).join('.')
        if (classes) elementStr += `.${classes}`
      }

      trackEvent('click', {
        element: elementStr.substring(0, 100), // Resumido
        x: e.clientX,
        y: e.clientY,
        section: sectionEl ? sectionEl.getAttribute('data-section') : null,
      })
    }
    document.addEventListener('click', handleClick, { passive: true })

    // Section View (Intersection Observer)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const sectionName = entry.target.getAttribute('data-section')
        if (!sectionName) return

        if (entry.isIntersecting) {
          sectionEntryTimes.current[sectionName] = Date.now()
        } else {
          const entryTime = sectionEntryTimes.current[sectionName]
          if (entryTime) {
            const timeSpent = Date.now() - entryTime
            trackEvent('section_view', {
              section: sectionName,
              metadata: { time_spent_ms: timeSpent },
            })
            delete sectionEntryTimes.current[sectionName]
          }
        }
      })
    }, { threshold: 0.1 }) // Considerado "visto" cuando un 10% entra en pantalla

    // Pequeño timeout para permitir que React renderice los [data-section]
    const observerTimeout = setTimeout(() => {
      document.querySelectorAll('[data-section]').forEach(el => observer.observe(el))
    }, 1000)

    // Mouseleave (Exit Intent)
    const handleMouseLeave = (e: MouseEvent) => {
      // Usualmente exit intent es cuando y <= 0 (abandona por arriba)
      // Ajustado a y <= 5 para capturar intenciones rápidas hacia pestañas
      if (e.clientY <= 5) {
        trackEvent('exit_intent', { x: e.clientX, y: e.clientY })
      }
    }
    document.addEventListener('mouseleave', handleMouseLeave)

    // Visibility Change
    const handleVisibilityChange = () => {
      trackEvent('visibilitychange', { metadata: { state: document.visibilityState } })
      if (document.visibilityState === 'hidden') {
        flushEvents()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Form Interaction
    const handleFormInteraction = (e: Event) => {
      const target = e.target as HTMLElement
      if (!target || !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      
      const name = (target as HTMLInputElement).name || target.id || target.tagName.toLowerCase()
      trackEvent('form_interaction', {
        element: name,
        event_type: e.type, // 'focus', 'blur', 'change'
      })
    }
    document.addEventListener('focus', handleFormInteraction, true)
    document.addEventListener('blur', handleFormInteraction, true)
    document.addEventListener('change', handleFormInteraction, true)

    // Inactivity
    const inactivityInterval = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityRef.current
      if (inactiveTime > 30000) { // 30 segundos sin eventos
        trackEvent('inactivity', { metadata: { inactive_ms: inactiveTime } })
        lastActivityRef.current = Date.now() // Resetear para evitar spam cada 5s
      }
    }, 10000)

    // JS Error
    const handleError = (e: ErrorEvent) => {
      trackEvent('js_error', {
        metadata: {
          message: e.message,
          filename: e.filename,
          lineno: e.lineno,
          stack: e.error?.stack ? e.error.stack.substring(0, 200) : null,
        },
      })
    }
    window.addEventListener('error', handleError)

    // Unload (sendBeacon fallback guarantee)
    window.addEventListener('beforeunload', flushEvents)

    // Escuchar eventos personalizados de otros componentes (ej. pasarela de pago)
    const handleCustomTrack = (e: CustomEvent) => {
      if (e.detail?.eventType) {
        trackEvent(e.detail.eventType, e.detail.data || {})
      }
    }
    window.addEventListener('track_analytics_event', handleCustomTrack as EventListener)

    // Limpieza
    return () => {
      clearInterval(flushInterval)
      clearInterval(inactivityInterval)
      if (scrollTimeout) clearTimeout(scrollTimeout)
      clearTimeout(observerTimeout)
      
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('focus', handleFormInteraction, true)
      document.removeEventListener('blur', handleFormInteraction, true)
      document.removeEventListener('change', handleFormInteraction, true)
      window.removeEventListener('error', handleError)
      window.removeEventListener('beforeunload', flushEvents)
      window.removeEventListener('track_analytics_event', handleCustomTrack as EventListener)
      observer.disconnect()
      
      flushEvents() // Flush final al desmontar
    }
  }, [slug])
}
