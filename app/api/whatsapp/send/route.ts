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

    const clientMsg = `¡Hola ${name}! 🛍️ Tu pedido *#${orderNumber}* ha sido recibido.\n\n${itemsList}\n\n*Total: $${total.toLocaleString('es-CO')}*\n\nTe avisamos cuando esté en camino. ¡Gracias por tu compra!`

    const ownerMsg = `🛒 *Nuevo pedido #${orderNumber}*\n\nCliente: ${name}\nTeléfono: ${to}\n\n${itemsList}\n\n*Total: $${total.toLocaleString('es-CO')}*`

    const from = process.env.TWILIO_WHATSAPP_FROM!
    const ownerNumber = process.env.WHATSAPP_BUSINESS_NUMBER!

    // Envío al dueño (siempre)
    await client.messages.create({ from, to: ownerNumber, body: ownerMsg })

    // Envío al cliente (puede fallar en sandbox — no bloquea)
    try {
      await client.messages.create({ from, to: `whatsapp:${to}`, body: clientMsg })
    } catch {
      console.warn('WhatsApp al cliente no enviado (sandbox)')
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('WhatsApp error:', error)
    return NextResponse.json({ error: 'Error enviando WhatsApp' }, { status: 500 })
  }
}
