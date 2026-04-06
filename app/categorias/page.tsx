import Link from 'next/link'
import { getCategories } from '@/lib/api/categories'

export default async function CategoriasPage() {
  const categories = await getCategories()

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-6">
      <h1 className="text-lg font-bold text-[#1B2B5E] mb-4">Todas las Categorías</h1>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categorias/${cat.slug}`}
            className="flex items-center gap-3 bg-white border border-gray-100 shadow-sm rounded-2xl p-4 active:bg-gray-50"
          >
            <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-2xl shrink-0">
              {cat.icon}
            </div>
            <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
