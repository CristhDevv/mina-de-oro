import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
import { Product } from '@/types'
import { productSchema } from '@/lib/schemas'

function mapProduct(row: any): Product {
  try {
    return productSchema.parse({
      ...row,
      originalPrice: row.original_price ?? undefined,
      category: row.category_slug,
      reviewCount: row.review_count ?? 0,
      createdAt: row.created_at,
    })
  } catch (error) {
    console.error(`Error de validación en producto [${row.id}]:`, error)
    throw error
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

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .eq('featured', true)
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

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
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

export async function searchProducts(
  query: string,
  filters?: {
    categorySlug?: string
    minPrice?: number
    maxPrice?: number
    minRating?: number
    sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating'
  }
): Promise<Product[]> {
  let q = supabase
    .from('products')
    .select('*')
    .eq('active', true)

  if (query.trim()) {
    q = q.or(`name.ilike.%${query}%,description.ilike.%${query}%,category_slug.ilike.%${query}%`)
  }

  if (filters?.categorySlug) q = q.eq('category_slug', filters.categorySlug)
  if (filters?.minPrice !== undefined) q = q.gte('price', filters.minPrice)
  if (filters?.maxPrice !== undefined) q = q.lte('price', filters.maxPrice)
  if (filters?.minRating !== undefined) q = q.gte('rating', filters.minRating)

  if (filters?.sortBy === 'price_asc') q = q.order('price', { ascending: true })
  else if (filters?.sortBy === 'price_desc') q = q.order('price', { ascending: false })
  else if (filters?.sortBy === 'rating') q = q.order('rating', { ascending: false })
  else q = q.order('created_at', { ascending: false })

  const { data, error } = await q
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProduct)
}

export async function getRelatedProducts(categorySlug: string, excludeId: string, limit = 6): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .eq('category_slug', categorySlug)
    .neq('id', excludeId)
    .order('rating', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data ?? []).map(mapProduct)
}
