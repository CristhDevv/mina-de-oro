import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Product } from '@/types'
import OrganizadorLanding from '@/components/landing/OrganizadorLanding'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('id, slug, name, description, price, original_price, images, category_slug, stock, rating, review_count, active, created_at, faq, options, specifications, features, rich_content, featured, brand_color, video_url, landing_config, rich_content_video_url, product_type, alegra_item_id, alegra_reference')
    .eq('slug', slug)
    .single()

  if (!product) notFound()

  return <OrganizadorLanding product={product as unknown as Product} />
}
