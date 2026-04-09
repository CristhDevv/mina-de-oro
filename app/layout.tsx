import type { Metadata } from 'next'
import './globals.css'
import ServiceWorkerRegistrar from '@/components/layout/ServiceWorkerRegistrar'

export const metadata: Metadata = {
  title: 'La Mina de Oro',
  description: 'Los mejores precios, la mejor calidad',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  )
}
