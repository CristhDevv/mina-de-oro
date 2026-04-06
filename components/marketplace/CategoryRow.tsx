import { Category } from '@/types'
import Link from 'next/link'

interface Props {
  categories: Category[]
}

export default function CategoryRow({ categories }: Props) {
  return (
    <section className="px-4 pt-5 pb-2">
      <h2 className="text-base font-bold text-[#1B2B5E] mb-3">Categorías</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categorias/${cat.slug}`}
            className="flex flex-col items-center gap-1.5 shrink-0"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] flex items-center justify-center text-2xl">
              {cat.icon}
            </div>
            <span className="text-[11px] text-gray-600 font-medium text-center">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
