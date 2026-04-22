'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'

interface AuthState {
  user: User | null
  loading: boolean
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async (authUser: { id: string; email?: string; user_metadata?: { name?: string } }) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', authUser.id)
        .single()

      setUser({
        id: authUser.id,
        name: profile?.name ?? authUser.user_metadata?.name ?? authUser.email?.split('@')[0] ?? '',
        email: authUser.email ?? '',
        role: (profile?.role as User['role']) ?? 'customer',
      })
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // Fallback a metadatos básicos si el perfil falla
      setUser({
        id: authUser.id,
        name: authUser.user_metadata?.name ?? authUser.email?.split('@')[0] ?? '',
        email: authUser.email ?? '',
        role: 'customer',
      })
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function init() {
      // Timeout de seguridad de 5 segundos
      const timeoutId = setTimeout(() => {
        if (mounted) setLoading(false)
      }, 5000)

      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        if (session?.user) {
          await fetchUser(session.user)
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
        clearTimeout(timeoutId)
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      try {
        if (session?.user) {
          await fetchUser(session.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Auth state change error:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchUser])

  return { user, loading }
}
