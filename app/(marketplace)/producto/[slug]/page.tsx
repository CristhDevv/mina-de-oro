import { getProductBySlug, getProducts } from '@/lib/api/products'
import { notFound } from 'next/navigation'
import ProductDetail from '@/components/marketplace/ProductDetail'
import RelatedProducts from '@/components/marketplace/RelatedProducts'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <ProductDetail product={product} />
      <RelatedProducts 
        categorySlug={product.category_slug || product.category} 
        currentProductId={product.id} 
      />
    </div>
  )
}

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((p) => ({ slug: p.slug }))
}
