import { Product } from '@/types'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  product: Product
}

function formatCOP(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)
}

function getDiscount(original: number, current: number) {
  return Math.round((1 - current / original) * 100)
}

export default function ProductCard({ product }: Props) {
  const discount = product.originalPrice
    ? getDiscount(product.originalPrice, product.price)
    : null

  return (
    <Link href={`/producto/${product.slug}`} className="block">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        
        {/* Image */}
        <div className="w-full aspect-square bg-gray-50 flex items-center justify-center relative overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 200px"
            />
          ) : (
            <span className="text-4xl">🛍️</span>
          )}
          {discount && (
            <span className="absolute top-2 left-2 bg-[#C9A84C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col gap-1">
          <span className="text-xs text-gray-500 truncate capitalize">{product.category}</span>
          <h3 className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">
            {product.name}
          </h3>

          <div className="mt-1">
            <span className="text-base font-bold text-[#1B2B5E]">
              {formatCOP(product.price)}
            </span>
            {product.originalPrice && (
              <span className="ml-1.5 text-xs text-gray-400 line-through">
                {formatCOP(product.originalPrice)}
              </span>
            )}
          </div>

        </div>

      </div>
    </Link>
  )
}
