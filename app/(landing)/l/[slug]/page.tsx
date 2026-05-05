import { createClient } from '@/lib/supabase/server'
import ProductDetail from '@/components/marketplace/ProductDetail'
import LandingCTA from '@/components/landing/LandingCTA'
import { notFound } from 'next/navigation'
import { Product } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!product) notFound()

  return (
    // pb-28 para que el contenido no quede debajo del CTA sticky
    <main className="min-h-screen bg-white pb-28">
      <ProductDetail product={product as Product} />
      <LandingCTA product={product as Product} />
    </main>
  )
}
