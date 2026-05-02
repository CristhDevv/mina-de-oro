'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'
import { getCategories } from '@/lib/api/categories'
import { getProductById } from '@/lib/api/products'
import { Category, Product } from '@/types'
import { ArrowLeft } from 'lucide-react'

export default function EditarProductoPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    async function loadData() {
      try {
        const id = params.id as string
        const [cats, prod] = await Promise.all([
          getCategories(),
          getProductById(id)
        ])
        setCategories(cats || [])
        setProduct(prod)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-12 h-12 border-4 border-[#1B2B5E] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Cargando...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-sm text-red-500 font-bold uppercase tracking-widest">Producto no encontrado</p>
        <button onClick={() => router.push('/admin')} className="text-[#1B2B5E] font-bold">Volver</button>
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
        product={product} 
        categories={categories} 
        onCancel={() => router.push('/admin')}
        onSaved={() => router.push('/admin')}
      />
    </div>
  )
}
