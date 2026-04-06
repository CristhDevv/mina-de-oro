import { getProductBySlug, getProducts } from '@/lib/api/products'
import { notFound } from 'next/navigation'
import ProductDetail from '@/components/marketplace/ProductDetail'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  return (
    <div className="max-w-lg mx-auto">
      <ProductDetail product={product} />
    </div>
  )
}

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((p) => ({ slug: p.slug }))
}
