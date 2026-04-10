import { supabase } from '@/lib/supabase'

export async function uploadProductImage(
  file: File,
  productSlug: string
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${productSlug}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('products')
    .upload(path, file, { upsert: true })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage
    .from('products')
    .getPublicUrl(path)

  return data.publicUrl
}

export async function deleteProductImage(url: string): Promise<void> {
  const path = url.split('/products/')[1]
  if (!path) return
  await supabase.storage.from('products').remove([path])
}
