import { Product } from '@/types'
import ProductCard from './ProductCard'

interface Props {
  products: Product[]
  priorityCount?: number
}

export default function ProductGrid({ products, priorityCount = 0 }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 pb-4">
      {products.map((product, index) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          priority={index < priorityCount} 
        />
      ))}
    </div>
  )
}
