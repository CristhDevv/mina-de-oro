export const revalidate = 0
import HeroBanner from '@/components/marketplace/HeroBanner'
import ProductGrid from '@/components/marketplace/ProductGrid'
import ProductCard from '@/components/marketplace/ProductCard'
import { getProducts, getFeaturedProducts } from '@/lib/api/products'
import { Star, Tag, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function HomePage() {
  const [allProducts, featured] = await Promise.all([
    getProducts(),
    getFeaturedProducts(),
  ])

  // Filtrar ofertas (productos con precio original mayor al actual)
  const offers = allProducts.filter(p => p.originalPrice && p.originalPrice > p.price)

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen pb-10">
      <HeroBanner />

      {/* Sección de Destacados */}
      {featured.length > 0 && (
        <section className="py-8">
          <div className="px-5 mb-5 flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-[#1B2B5E] flex items-center gap-2">
                <Star size={20} className="text-[#C9A84C] fill-[#C9A84C]" />
                Destacados
              </h2>
              <p className="text-[11px] text-gray-400 font-medium">Selección exclusiva para ti</p>
            </div>
            <Link href="/productos" className="text-xs font-bold text-[#C9A84C] flex items-center gap-0.5">
              Ver todo <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="flex overflow-x-auto gap-4 px-5 pb-2 no-scrollbar scroll-smooth">
            {featured.map((product) => (
              <div key={product.id} className="min-w-[200px] transition-transform active:scale-95">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sección de Ofertas */}
      {offers.length > 0 && (
        <section className="py-2 border-t border-gray-50">
          <div className="px-5 py-6 flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-[#1B2B5E] flex items-center gap-2">
                <Tag size={20} className="text-[#C9A84C]" />
                Ofertas Imperdibles
              </h2>
              <p className="text-[11px] text-gray-400 font-medium">Precios que no volverán</p>
            </div>
          </div>
          <ProductGrid products={offers} />
        </section>
      )}

      {/* Fallback si no hay ofertas pero hay productos */}
      {!offers.length && allProducts.length > 0 && (
        <section className="py-4 border-t border-gray-50">
          <div className="px-5 py-6">
            <h2 className="text-xl font-bold text-[#1B2B5E]">Nuestros Productos</h2>
            <p className="text-[11px] text-gray-400 font-medium mt-1">Calidad garantizada en cada compra</p>
          </div>
          <ProductGrid products={allProducts} />
        </section>
      )}
      
      {/* Botón de ver más catálogo */}
      <div className="px-5 mt-6">
        <Link href="/productos" className="flex items-center justify-center w-full h-12 rounded-2xl border-2 border-gray-100 text-sm font-bold text-[#1B2B5E] active:bg-gray-50 transition-colors">
          Explorar todo el catálogo
        </Link>
      </div>
    </div>
  )
}
