import { supabase } from '@/lib/supabase'
import { Product, ProductFAQ, ProductOption, RichContentBlock } from '@/types'

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
    faq: (row.faq as ProductFAQ[]) ?? [],
    options: (row.options as ProductOption[]) ?? [],
    specifications: (row.specifications as { label: string; value: string }[]) ?? [],
    features: (row.features as string[]) ?? [],
    rich_content: (row.rich_content as RichContentBlock[]) ?? [],
    featured: row.featured as boolean,
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
