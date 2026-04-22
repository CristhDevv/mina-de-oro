import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
import { HeroBannerSettings } from '@/types'

export async function getSiteSettings<T>(key: string): Promise<T | null> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single()

  if (error) {
    console.error('Error fetching site settings:', error)
    return null
  }

  return data?.value as T
}

export async function updateSiteSettings(key: string, value: any) {
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() })

  if (error) throw error
}
