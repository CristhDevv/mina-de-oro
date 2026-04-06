import { Product } from '@/types'
import ProductCard from './ProductCard'

interface Props {
  products: Product[]
}

export default function ProductGrid({ products }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 pb-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
