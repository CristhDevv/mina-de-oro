import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usamos service_role para bypassear RLS en escrituras anónimas de la landing
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { session, events } = body

    if (!session || !session.session_id) {
      return NextResponse.json({ ok: true })
    }

    const supabase = createAdminClient()

    // 1. Upsert en landing_sessions por session_id
    const { error: sessionError } = await supabase
      .from('landing_sessions')
      .upsert({
        session_id: session.session_id,
        slug: session.slug,
        fingerprint: session.fingerprint,
        ip: session.ip,
        country: session.country,
        city: session.city,
        device: session.device,
        screen: session.screen,
        referrer: session.referrer,
        utm_source: session.utm_source,
        utm_medium: session.utm_medium,
        utm_campaign: session.utm_campaign,
        utm_content: session.utm_content,
        user_agent: session.user_agent,
        is_returning: session.is_returning,
        load_time_ms: session.load_time_ms,
      }, { onConflict: 'session_id' })

    // 2. Insert batch en landing_events
    if (!sessionError && events && Array.isArray(events) && events.length > 0) {
      const eventsToInsert = events.map((event: any) => ({
        session_id: session.session_id,
        slug: event.slug || session.slug,
        event_type: event.event_type,
        element: event.element,
        section: event.section,
        metadata: event.metadata,
        time_on_page_ms: event.time_on_page_ms,
        scroll_pct: event.scroll_pct,
        x: event.x,
        y: event.y,
      }))

      await supabase
        .from('landing_events')
        .insert(eventsToInsert)
    }
  } catch (error) {
    // Falla silenciosa: nunca rompemos la landing por un fallo en analíticas
    console.error('[Analytics Error]:', error)
  }

  // Siempre retornamos { ok: true }
  return NextResponse.json({ ok: true })
}
