'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types'
import { getRelatedProducts } from '@/lib/api/products'

interface RelatedProductsProps {
  categorySlug: string
  currentProductId: string
}

export default function RelatedProducts({ categorySlug, currentProductId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getRelatedProducts(categorySlug, currentProductId, 6)
        setProducts(data)
      } catch (error) {
        console.error('Error loading related products:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [categorySlug, currentProductId])

  if (loading || products.length === 0) return null

  return (
    <div className="py-8 border-t border-gray-100">
      <div className="px-4 mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#1B2B5E] uppercase tracking-wider">
          También te puede interesar
        </h3>
        <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-wider">
          Ver todo
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar scroll-smooth">
        {products.map((product) => (
          <Link 
            key={product.id}
            href={`/producto/${product.slug}`}
            className="flex-shrink-0 w-36 group"
          >
            <div className="relative aspect-square mb-2 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-50 group-active:scale-95 transition-all">
              <Image
                src={product.images[0] || '/images/placeholder.svg'}
                alt={product.name}
                fill
                className="object-contain p-2"
              />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-[11px] font-medium text-gray-700 line-clamp-1 group-hover:text-[#1B2B5E] transition-colors">
                {product.name}
              </h4>
              <p className="text-sm font-black text-[#1B2B5E]">
                ${product.price.toLocaleString('es-CO')}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
