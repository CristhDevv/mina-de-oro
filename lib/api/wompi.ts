export const baseUrl = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost'
      ? 'https://mina-de-oro.vercel.app'
      : window.location.origin)
  : 'https://mina-de-oro.vercel.app'

export function generateReference(orderId: string): string {
  return `minadeoro-${orderId.slice(0, 8)}-${Date.now()}`
}

export async function getWompiSignature(
  reference: string,
  amount: number,
  currency = 'COP'
): Promise<string> {
  const res = await fetch('/api/wompi/signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reference, amount, currency }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Error generando firma')
  return data.signature
}

export function openWompiCheckout(params: {
  publicKey: string
  reference: string
  amountInCents: number
  currency: string
  signature: string
  redirectUrl: string
  customerEmail: string
}) {
  const {
    publicKey, reference, amountInCents,
    currency, signature, redirectUrl, customerEmail
  } = params

  const url = new URL('https://checkout.wompi.co/p/')
  url.searchParams.set('public-key', publicKey)
  url.searchParams.set('currency', currency)
  url.searchParams.set('amount-in-cents', amountInCents.toString())
  url.searchParams.set('reference', reference)
  url.searchParams.set('signature:integrity', signature)
  url.searchParams.set('redirect-url', redirectUrl)
  url.searchParams.set('customer-data:email', customerEmail)


  window.location.href = url.toString()
}
