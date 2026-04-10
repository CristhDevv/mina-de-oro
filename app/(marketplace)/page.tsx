export const revalidate = 0
import HeroBanner from '@/components/marketplace/HeroBanner'
import CategoryRow from '@/components/marketplace/CategoryRow'
import ProductGrid from '@/components/marketplace/ProductGrid'
import { getProducts } from '@/lib/api/products'
import { getCategories } from '@/lib/api/categories'

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ])

  return (
    <div className="max-w-lg mx-auto">
      <HeroBanner />
      <CategoryRow categories={categories} />
      <section className="px-4 pt-4 pb-2">
        <h2 className="text-base font-bold text-[#1B2B5E]">Ofertas del día</h2>
      </section>
      <ProductGrid products={products} />
    </div>
  )
}
