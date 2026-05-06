import MetaPixel from '@/components/landing/MetaPixel'
import GoogleAnalytics from '@/components/landing/GoogleAnalytics'

export const metadata = {
  robots: 'noindex, nofollow',
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MetaPixel />
      <GoogleAnalytics />
      {children}
    </>
  )
}
