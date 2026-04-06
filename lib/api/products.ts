import { supabase } from '@/lib/supabase'
import { Product } from '@/types'

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    description: row.description as string,
    price: row.price as number,
    originalPrice: row.original_price as number | undefined,
    images: (row.images as string[]) ?? [],
    category: row.category_slug as string,
    stock: row.stock as number,
    rating: Number(row.rating),
    reviewCount: row.review_count as number,
    createdAt: new Date(row.created_at as string),
  }
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProduct)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (error) return null
  return mapProduct(data)
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_slug', categorySlug)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProduct)
}

export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,category_slug.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProduct)
}
