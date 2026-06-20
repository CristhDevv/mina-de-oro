import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.wompi.co https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://www.facebook.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://dpvobmhvsausguqwzrrm.supabase.co https://www.facebook.com https://www.google-analytics.com",
      "media-src 'self' https://dpvobmhvsausguqwzrrm.supabase.co",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co https://checkout.wompi.co https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://www.facebook.com https://connect.facebook.net",
      "frame-src https://checkout.wompi.co",
    ].join('; ')
  }
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dpvobmhvsausguqwzrrm.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          // organizador.minadeoro.com.co → /l/organizador
          // Excluimos rutas internas para que carguen los assets correctamente
          source: '/:path((?!api|_next/static|_next/image|favicon.ico).*)',
          destination: '/l/organizador/:path',
          has: [{ type: 'host', value: 'organizador.minadeoro.com.co' }],
        },
      ],
      afterFiles: [],
      fallback: [],
    }
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      }
    ]
  }
}

export default nextConfig
