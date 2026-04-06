'use client'

import { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { sendOrderEmail } from '@/lib/api/orders'

interface Props {
  orderId: string
}

export default function OrderConfirmation({ orderId }: Props) {
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState(false)

  useEffect(() => {
    sendOrderEmail(orderId)
      .then(() => setEmailSent(true))
      .catch(() => setEmailError(true))
  }, [orderId])

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        ¡Pedido confirmado!
      </h1>
      <p className="text-gray-500 text-sm mb-2">
        Tu pedido fue recibido con éxito.
      </p>
      <p className="text-xs text-gray-400 mb-4 font-mono break-all">
        #{orderId}
      </p>

      {emailSent && (
        <p className="text-xs text-green-600 mb-8">
          Te enviamos un correo de confirmación.
        </p>
      )}
      {emailError && (
        <p className="text-xs text-gray-400 mb-8">
          No pudimos enviar el correo de confirmación.
        </p>
      )}

      <Link
        href="/"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
