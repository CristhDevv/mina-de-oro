'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'
import { getCategories } from '@/lib/api/categories'
import { Category } from '@/types'
import { ArrowLeft } from 'lucide-react'

export default function NuevoProductoPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    getCategories().then(c => {
      setCategories(c || [])
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-12 h-12 border-4 border-[#1B2B5E] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-10 w-full pb-32 md:pb-10 flex-1">
      <button 
        onClick={() => router.push('/admin')}
        className="flex items-center gap-2 text-gray-500 hover:text-[#1B2B5E] transition-colors mb-6 font-bold text-sm"
      >
        <ArrowLeft size={16} /> Volver al panel
      </button>
      <ProductForm 
        product={null} 
        categories={categories} 
        onCancel={() => router.push('/admin')}
        onSaved={() => router.push('/admin')}
      />
    </div>
  )
}
