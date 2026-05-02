import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip, 10, 60000)) {
    return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 })
  }

  try {
    const { reference, amount, currency } = await req.json()

    const integrity_key = process.env.WOMPI_INTEGRITY_KEY
    if (!integrity_key) {
      return NextResponse.json({ error: 'Missing integrity key' }, { status: 500 })
    }

    const str = `${reference}${amount}${currency}${integrity_key}`
    const signature = createHash('sha256').update(str).digest('hex')

    return NextResponse.json({ signature })
  } catch {
    return NextResponse.json({ error: 'Error generating signature' }, { status: 500 })
  }
}
