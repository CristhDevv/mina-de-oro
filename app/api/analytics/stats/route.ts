import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const supabase = await createClient()

  // 1. Obtener slugs únicos
  const { data: slugData } = await supabase.from('landing_sessions').select('slug')
  const slugs = Array.from(new Set(slugData?.map(s => s.slug).filter(Boolean) || []))

  if (!slug) {
    return NextResponse.json({ slugs })
  }

  // 2. Traer sesiones del slug
  let sessionsQuery = supabase.from('landing_sessions').select('*').eq('slug', slug)
  if (from) sessionsQuery = sessionsQuery.gte('created_at', from)
  if (to) sessionsQuery = sessionsQuery.lte('created_at', to)
  const { data: sessions, error: sErr } = await sessionsQuery

  // 3. Traer eventos del slug
  let eventsQuery = supabase.from('landing_events').select('*').eq('slug', slug)
  if (from) eventsQuery = eventsQuery.gte('created_at', from)
  if (to) eventsQuery = eventsQuery.lte('created_at', to)
  const { data: events, error: eErr } = await eventsQuery

  if (sErr || eErr || !sessions || !events) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }

  // MÉTRICAS
  const unique_visits = sessions.length
  
  const leaveEvents = events.filter(e => e.event_type === 'leave_page')
  const avg_time = leaveEvents.length > 0 
    ? leaveEvents.reduce((acc, curr) => acc + (curr.time_on_page_ms || 0), 0) / leaveEvents.length 
    : 0

  // Bounce Rate (% que no interactuó con CTAs ni Scroll profundo)
  const sessionsWithAction = new Set(
    events.filter(e => ['click_cta', 'checkout_open', 'checkout_success'].includes(e.event_type)).map(e => e.session_id)
  )
  const bounce_rate = unique_visits > 0 
    ? ((unique_visits - sessionsWithAction.size) / unique_visits) * 100 
    : 0

  const cta_clicks = events.filter(e => e.event_type === 'click_cta').length
  const returning = sessions.filter(s => s.is_returning).length

  // Retención por Scroll
  const maxScrollPerSession: Record<string, number> = {}
  events.filter(e => e.event_type === 'scroll').forEach(e => {
    const current = maxScrollPerSession[e.session_id] || 0
    maxScrollPerSession[e.session_id] = Math.max(current, e.scroll_pct || 0)
  })
  
  const scrollBuckets = [0, 25, 50, 75, 100]
  const scroll_retention = scrollBuckets.map(pct => {
    const usersReached = Object.values(maxScrollPerSession).filter(max => max >= pct).length
    const count = pct === 0 ? unique_visits : usersReached // Todos empiezan en 0%
    return {
      scroll: `${pct}%`,
      percentage: unique_visits > 0 ? Math.round((count / unique_visits) * 100) : 0
    }
  })

  // Heatmap de Secciones
  const sectionTimes: Record<string, { total: number, count: number }> = {}
  events.filter(e => e.event_type === 'section_view' && e.section).forEach(e => {
    if (!sectionTimes[e.section!]) sectionTimes[e.section!] = { total: 0, count: 0 }
    sectionTimes[e.section!].total += (e.metadata?.time_spent_ms || 0)
    sectionTimes[e.section!].count += 1
  })
  const section_heatmap = Object.keys(sectionTimes).map(section => ({
    section,
    avgTime: Math.round(sectionTimes[section].total / sectionTimes[section].count / 1000) // en segundos
  })).sort((a, b) => b.avgTime - a.avgTime) // Ordenar de mayor a menor

  // Fuentes de Tráfico
  const sources: Record<string, number> = {}
  sessions.forEach(s => {
    let source = s.utm_source || 'Direct'
    if (!s.utm_source && s.referrer) {
      try {
        source = new URL(s.referrer).hostname.replace('www.', '')
      } catch {
        source = s.referrer
      }
    }
    sources[source] = (sources[source] || 0) + 1
  })
  const traffic_sources = Object.keys(sources).map(name => ({
    name,
    value: sources[name]
  })).sort((a, b) => b.value - a.value)

  // Dispositivos
  const deviceCounts: Record<string, number> = {}
  sessions.forEach(s => {
    const d = s.device || 'unknown'
    deviceCounts[d] = (deviceCounts[d] || 0) + 1
  })
  const devices = Object.keys(deviceCounts).map(name => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: deviceCounts[name]
  }))

  // Eventos Recientes
  const recent_events = events
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 50)

  // 1. Embudo de conversión
  const usersReached50 = Object.values(maxScrollPerSession).filter(max => max >= 50).length
  const uniqueCheckoutOpen = new Set(events.filter(e => e.event_type === 'checkout_open').map(e => e.session_id)).size
  const uniqueCheckoutSuccess = new Set(events.filter(e => e.event_type === 'checkout_success').map(e => e.session_id)).size
  const conversion_funnel = [
    { step: "Entraron", count: unique_visits },
    { step: "Bajaron al 50%", count: usersReached50 },
    { step: "Tocaron comprar", count: uniqueCheckoutOpen },
    { step: "Compraron", count: uniqueCheckoutSuccess }
  ]

  // 2. Clicks mapa (coordenadas)
  const click_map = events
    .filter(e => e.event_type.includes('click') && e.x !== undefined && e.y !== undefined && e.x !== null && e.y !== null)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 500)
    .map(e => ({ x: e.x, y: e.y, section: e.section, element: e.element }))

  // Helper para agrupar eventos por sesión
  const eventsBySession: Record<string, any[]> = {}
  events.forEach(e => {
    if (!eventsBySession[e.session_id]) eventsBySession[e.session_id] = []
    eventsBySession[e.session_id].push(e)
  })

  // 3. Exit intent stats
  const exitIntentEvents = events.filter(e => e.event_type === 'exit_intent')
  const exit_by_section: Record<string, number> = {}
  
  exitIntentEvents.forEach(exitEvent => {
    const sessionEvents = eventsBySession[exitEvent.session_id].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    const exitIndex = sessionEvents.findIndex(e => e.id === exitEvent.id)
    if (exitIndex > 0) {
      let prevEvent = sessionEvents[exitIndex - 1]
      let i = exitIndex - 1
      while (i >= 0 && !sessionEvents[i].section) i--
      if (i >= 0) prevEvent = sessionEvents[i]
      const sectionName = prevEvent.section || 'unknown'
      exit_by_section[sectionName] = (exit_by_section[sectionName] || 0) + 1
    } else {
      exit_by_section['unknown'] = (exit_by_section['unknown'] || 0) + 1
    }
  })
  
  const exit_intent = {
    total: exitIntentEvents.length,
    by_section: exit_by_section
  }

  // 4. Distracciones
  const tab_changes = events.filter(e => e.event_type === 'visibilitychange' && e.metadata?.state === 'hidden').length
  const inactivityEvents = events.filter(e => e.event_type === 'inactivity')
  const inactivity_events = inactivityEvents.length
  const sumInactiveMs = inactivityEvents.reduce((acc, curr) => acc + (curr.metadata?.inactive_ms || 0), 0)
  const avg_inactive_ms = inactivity_events > 0 ? Math.round(sumInactiveMs / inactivity_events) : 0
  
  const distractions = {
    tab_changes,
    inactivity_events,
    avg_inactive_ms
  }

  // 5. Rendimiento
  const sessionsWithLoadTime = sessions.filter(s => s.load_time_ms !== null && s.load_time_ms !== undefined)
  const avg_load_time_ms = sessionsWithLoadTime.length > 0
    ? Math.round(sessionsWithLoadTime.reduce((acc, curr) => acc + curr.load_time_ms!, 0) / sessionsWithLoadTime.length)
    : 0
  const slow_loads = sessionsWithLoadTime.filter(s => s.load_time_ms! > 3000).length
  
  const by_device: Record<string, { total: number, count: number }> = {}
  sessionsWithLoadTime.forEach(s => {
    const d = s.device || 'unknown'
    if (!by_device[d]) by_device[d] = { total: 0, count: 0 }
    by_device[d].total += s.load_time_ms!
    by_device[d].count += 1
  })
  
  const performance_by_device: Record<string, number> = {}
  Object.keys(by_device).forEach(d => {
    performance_by_device[d] = Math.round(by_device[d].total / by_device[d].count)
  })
  
  const performance = {
    avg_load_time_ms,
    slow_loads,
    by_device: performance_by_device
  }

  // 6. Formulario
  const formEvents = events.filter(e => e.event_type === 'form_interaction')
  const formStatsMap: Record<string, { field: string, focuses: number, changes: number, blurs: number }> = {}
  
  formEvents.forEach(e => {
    const field = e.element || 'unknown'
    if (!formStatsMap[field]) {
      formStatsMap[field] = { field, focuses: 0, changes: 0, blurs: 0 }
    }
    const type = e.metadata?.type
    if (type === 'focus') formStatsMap[field].focuses++
    else if (type === 'change' || type === 'input') formStatsMap[field].changes++
    else if (type === 'blur') formStatsMap[field].blurs++
  })
  const form_stats = Object.values(formStatsMap)

  // 7. Sesiones individuales
  const recent_sessions = [...sessions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20)
    
  const individual_sessions = recent_sessions.map(s => {
    const sEvents = eventsBySession[s.session_id] || []
    sEvents.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    const converted = sEvents.some(e => e.event_type === 'checkout_success')
    const max_scroll = maxScrollPerSession[s.session_id] || 0
    return {
      id: s.id,
      device: s.device,
      referrer: s.referrer,
      is_returning: s.is_returning,
      load_time_ms: s.load_time_ms,
      created_at: s.created_at,
      events: sEvents.map(e => ({
        id: e.id,
        created_at: e.created_at,
        event_type: e.event_type,
        section: e.section,
        element: e.element,
        metadata: e.metadata
      })),
      total_events: sEvents.length,
      max_scroll,
      converted
    }
  })

  // 8. Errores JS
  const jsErrorEvents = events.filter(e => e.event_type === 'js_error')
  const jsErrorMap: Record<string, number> = {}
  jsErrorEvents.forEach(e => {
    const msg = e.metadata?.message || 'Error desconocido'
    jsErrorMap[msg] = (jsErrorMap[msg] || 0) + 1
  })
  const js_errors = Object.keys(jsErrorMap).map(message => ({
    message,
    count: jsErrorMap[message]
  })).sort((a, b) => b.count - a.count)

  return NextResponse.json({
    slugs,
    metrics: {
      unique_visits,
      avg_time_seconds: Math.round(avg_time / 1000),
      bounce_rate: Math.round(bounce_rate),
      cta_clicks,
      returning
    },
    scroll_retention,
    section_heatmap,
    traffic_sources,
    devices,
    recent_events,
    conversion_funnel,
    click_map,
    exit_intent,
    distractions,
    performance,
    form_stats,
    individual_sessions,
    js_errors
  })
}
