import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

webpush.setVapidDetails(
  process.env.VAPID_MAILTO!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { title, body, url } = await req.json()
    if (!title || !body) {
      return NextResponse.json({ error: 'Faltan title o body' }, { status: 400 })
    }
    const { data: subs } = await supabase.from('push_subscriptions').select('*')
    if (!subs?.length) {
      return NextResponse.json({ sent: 0 })
    }
    const payload = JSON.stringify({ title, body, url: url ?? '/' })
    const results = await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
      )
    )
    const sent = results.filter((r) => r.status === 'fulfilled').length
    return NextResponse.json({ sent, total: subs.length })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
