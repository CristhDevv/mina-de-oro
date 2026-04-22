import { supabase } from '@/lib/supabase'
import { Category } from '@/types'
import { categorySchema } from '@/lib/schemas'

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => categorySchema.parse(row))
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return categorySchema.parse(data)
}

export async function createCategory(data: { name: string; slug: string; icon: string }) {
  const { error } = await supabase.from('categories').insert(data)
  if (error) throw new Error(error.message)
}

export async function updateCategory(id: string, data: { name: string; slug: string; icon: string }) {
  const { error } = await supabase.from('categories').update(data).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
