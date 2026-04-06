'use client'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Props {
  orderId: string
}

export default function OrderConfirmation({ orderId }: Props) {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        ¡Pedido confirmado!
      </h1>
      <p className="text-gray-500 text-sm mb-2">
        Tu pedido fue recibido con éxito.
      </p>
      <p className="text-xs text-gray-400 mb-8 font-mono break-all">
        #{orderId}
      </p>
      <Link
        href="/"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
