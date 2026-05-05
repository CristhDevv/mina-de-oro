import MetaPixel from '@/components/landing/MetaPixel'

export const metadata = {
  robots: 'noindex, nofollow',
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MetaPixel />
      {children}
    </>
  )
}
