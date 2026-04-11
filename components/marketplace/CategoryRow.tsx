import { Category } from '@/types'
import Link from 'next/link'
import { Shirt, Home, UtensilsCrossed, Gamepad2, Sparkles, Cpu, Tag } from 'lucide-react'

const categoryIcons: Record<string, React.ElementType> = {
  ropa: Shirt,
  hogar: Home,
  cocina: UtensilsCrossed,
  juguetes: Gamepad2,
  belleza: Sparkles,
  electronica: Cpu,
}

interface Props {
  categories: Category[]
}

export default function CategoryRow({ categories }: Props) {
  return (
    <section className="px-4 pt-5 pb-2">
      <h2 className="text-base font-bold text-[#1B2B5E] mb-3">Categorías</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {categories.map((cat) => {
          const Icon = categoryIcons[cat.slug] ?? Tag
          return (
            <Link
              key={cat.id}
              href={`/categorias/${cat.slug}`}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">
                <Icon size={24} className="text-gray-700" />
              </div>
              <span className="text-[11px] text-gray-600 font-medium text-center">
                {cat.name}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
