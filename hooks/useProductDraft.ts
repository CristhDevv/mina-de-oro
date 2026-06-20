import { useCallback, useRef } from 'react'
import { ProductFAQ, ProductOption, RichContentBlock, LandingConfig } from '@/types'

export interface DraftData {
  step: number
  savedAt: string
  name: string
  description: string
  price: string
  originalPrice: string
  categorySlug: string
  stock: string
  images: string[]
  videoUrl: string | null
  faq: ProductFAQ[]
  options: ProductOption[]
  featured: boolean
  features: string[]
  specifications: { label: string; value: string }[]
  richContent: RichContentBlock[]
  brandColor: string
  landingConfig: LandingConfig
}

export function useProductDraft(draftKey: string | undefined | null) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const clearDraft = useCallback(() => {
    if (!draftKey) return
    localStorage.removeItem(draftKey)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [draftKey])

  const saveDraft = useCallback((
    data: Omit<DraftData, 'savedAt'>,
    immediate = false
  ) => {
    if (!draftKey) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    const performSave = () => {
      try {
        const fullData: DraftData = {
          ...data,
          savedAt: new Date().toISOString(),
        }
        localStorage.setItem(draftKey, JSON.stringify(fullData))
      } catch (err) {
        console.error('Error saving draft to localStorage:', err)
      }
    }

    if (immediate) {
      performSave()
    } else {
      timeoutRef.current = setTimeout(performSave, 800)
    }
  }, [draftKey])

  const loadDraft = useCallback((): DraftData | null => {
    if (!draftKey) return null
    try {
      const stored = localStorage.getItem(draftKey)
      if (!stored) return null
      return JSON.parse(stored) as DraftData
    } catch (err) {
      console.error('Error loading draft from localStorage:', err)
      return null
    }
  }, [draftKey])

  const hasDraft = useCallback((): boolean => {
    if (!draftKey) return false
    return !!localStorage.getItem(draftKey)
  }, [draftKey])

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
  }
}
