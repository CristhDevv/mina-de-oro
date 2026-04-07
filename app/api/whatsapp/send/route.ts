import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export async function POST(req: NextRequest) {
  try {
    const { to, orderNumber, items, total, name } = await req.json()

    const itemsList = items
      .map((i: { name: string; quantity: number; unit_price: number }) =>
        `• ${i.name} x${i.quantity} — $${i.unit_price.toLocaleString('es-CO')}`
      )
      .join('\n')

    const body = `¡Hola ${name}! 🛍️ Tu pedido *#${orderNumber}* ha sido recibido.\n\n${itemsList}\n\n*Total: $${total.toLocaleString('es-CO')}*\n\nTe avisamos cuando esté en camino. ¡Gracias por tu compra!`

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: `whatsapp:${to}`,
      body,
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('WhatsApp error:', error)
    return NextResponse.json({ error: 'Error enviando WhatsApp', details: error.message }, { status: 500 })
  }
}
