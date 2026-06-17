import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface OrderItem {
  quantity: number
  unit_price: number
  products: {
    name: string
  }
}

interface Payload {
  orderId: string
  userEmail: string
  userName: string
  total: number
  items: OrderItem[]
  shippingAddress: {
    name: string
    phone: string
    address: string
    city: string
  }
}

serve(async (req) => {
  try {
    const payload: Payload = await req.json()
    const { orderId, userEmail, userName, total, items, shippingAddress } = payload

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0">${item.products.name}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:center">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right">$${(item.unit_price * item.quantity).toLocaleString('es-CO')}</td>
      </tr>
    `).join('')

    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
        <div style="background:#1B2B5E;padding:24px;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:#C9A84C;margin:0;font-size:22px">La Mina de Oro</h1>
          <p style="color:white;margin:8px 0 0;font-size:14px">¡Tu pedido fue confirmado!</p>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #f0f0f0;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px">Hola <strong>${userName}</strong>, recibimos tu pedido.</p>
          <p style="font-size:12px;color:#888;margin:0 0 16px">
            Pedido <strong>#${orderId.slice(0, 8)}</strong>
          </p>

          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <thead>
              <tr>
                <th style="text-align:left;padding-bottom:8px;border-bottom:2px solid #1B2B5E;color:#1B2B5E">Producto</th>
                <th style="text-align:center;padding-bottom:8px;border-bottom:2px solid #1B2B5E;color:#1B2B5E">Cant.</th>
                <th style="text-align:right;padding-bottom:8px;border-bottom:2px solid #1B2B5E;color:#1B2B5E">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div style="text-align:right;margin-top:16px">
            <span style="font-size:16px;font-weight:bold">Total: $${total.toLocaleString('es-CO')}</span>
          </div>

          <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin-top:24px;font-size:13px">
            <p style="margin:0 0 4px;font-weight:bold;color:#1B2B5E">Dirección de envío</p>
            <p style="margin:0;color:#555">${shippingAddress.name}</p>
            <p style="margin:0;color:#555">${shippingAddress.address}, ${shippingAddress.city}</p>
            <p style="margin:0;color:#555">${shippingAddress.phone}</p>
          </div>

          <p style="font-size:12px;color:#aaa;margin-top:24px;text-align:center">
            Gracias por comprar en La Mina de Oro
          </p>
        </div>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'La Mina de Oro <noreply@minadeoro.com>',
        to: userEmail,
        subject: `Pedido confirmado #${orderId.slice(0, 8)}`,
        html,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Resend error: ${error}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
