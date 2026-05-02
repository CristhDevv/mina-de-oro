import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { event, data, sent_at, signature } = body

  // Verificar firma
  const integrity = process.env.WOMPI_EVENTS_SECRET!
  const checksum = crypto
    .createHash('sha256')
    .update(`${data.transaction.id}${data.transaction.status}${data.transaction.amount_in_cents}${sent_at}${integrity}`)
    .digest('hex')

  if (checksum !== signature?.checksum) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  if (event === 'transaction.updated' && data.transaction.status === 'APPROVED') {
    const supabase = await createClient()
    const ref = data.transaction.reference
    await supabase.from('orders').update({ status: 'pagado' }).eq('reference', ref)
  }

  return NextResponse.json({ ok: true })
}
