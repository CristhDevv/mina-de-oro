import { getCategoryBySlug } from '@/lib/api/categories'
import { getProductsByCategory, getProducts } from '@/lib/api/products'
import { notFound } from 'next/navigation'
import CategoryView from '@/components/marketplace/CategoryView'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const [category, products] = await Promise.all([
    getCategoryBySlug(slug),
    getProductsByCategory(slug),
  ])

  if (!category) notFound()

  return (
    <div className="max-w-lg mx-auto">
      <CategoryView category={category} products={products} />
    </div>
  )
}

export async function generateStaticParams() {
  const products = await getProducts()
  const slugs = [...new Set(products.map((p) => p.category))]
  return slugs.map((slug) => ({ slug }))
}
