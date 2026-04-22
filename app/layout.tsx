import type { Metadata } from 'next'
import './globals.css'
import ServiceWorkerRegistrar from '@/components/layout/ServiceWorkerRegistrar'
import LocalBusinessSchema from '@/components/seo/LocalBusinessSchema'

export const metadata: Metadata = {
  title: {
    default: 'La Mina de Oro | Calidad y Precio Garantizado',
    template: '%s | La Mina de Oro'
  },
  description: 'Descubre los mejores precios y la más alta calidad en electrodomésticos, tecnología y hogar en La Mina de Oro. El marketplace líder con envíos a todo el país.',
  keywords: ['marketplace', 'mejores precios', 'calidad', 'compras online', 'hogar', 'tecnología'],
  authors: [{ name: 'La Mina de Oro' }],
  creator: 'La Mina de Oro',
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://minadeoro.com.co', // Cambiar por URL real si existe
    siteName: 'La Mina de Oro',
    title: 'La Mina de Oro | Calidad y Precio Garantizado',
    description: 'Descubre los mejores precios y la más alta calidad en electrodomésticos, tecnología y hogar.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'La Mina de Oro - Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Mina de Oro | Calidad y Precio Garantizado',
    description: 'Los mejores precios y la más alta calidad en un solo lugar.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <LocalBusinessSchema />
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  )
}
