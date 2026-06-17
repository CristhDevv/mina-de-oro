export const revalidate = 0

import { getProducts } from '@/lib/api/products'
import { getCategories } from '@/lib/api/categories'
import ProductsFilterView from '@/components/marketplace/ProductsFilterView'

export default async function Page() {
  // Fetch paralelo de productos y categorías
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories()
  ])

  return (
    <div className="bg-white min-h-screen">
      <ProductsFilterView 
        initialProducts={products} 
        categories={categories} 
      />
    </div>
  )
}
