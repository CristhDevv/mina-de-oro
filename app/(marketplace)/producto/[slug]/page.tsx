export const revalidate = 0
import { getProductBySlug, getProducts } from '@/lib/api/products'
import { notFound } from 'next/navigation'
import ProductDetail from '@/components/marketplace/ProductDetail'
import RelatedProducts from '@/components/marketplace/RelatedProducts'
import ProductSchema from '@/components/seo/ProductSchema'

import { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) return {}

  const images = product.images && product.images.length > 0 
    ? [product.images[0]] 
    : []

  return {
    title: product.name,
    description: product.description?.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.description?.substring(0, 160),
      images: images,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description?.substring(0, 160),
      images: images,
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <ProductSchema product={product} />
      <ProductDetail product={product} />
      <RelatedProducts 
        categorySlug={product.category} 
        currentProductId={product.id} 
      />
    </div>
  )
}

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((p) => ({ slug: p.slug }))
}
