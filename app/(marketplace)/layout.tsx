import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="pb-16 min-h-screen bg-white">
        {children}
      </main>
      <BottomNav />
    </>
  )
}
