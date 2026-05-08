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
    recent_events
  })
}
