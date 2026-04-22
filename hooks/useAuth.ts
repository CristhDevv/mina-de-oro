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

  const mapUser = useCallback((authUser: any, profile?: any): User => ({
    id: authUser.id,
    name: profile?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuario',
    email: authUser.email || '',
    role: (profile?.role as User['role']) || 'customer',
  }), [])

  useEffect(() => {
    let mounted = true

    // 1. Carga inicial ultra rápida
    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        
        if (session?.user) {
          // Primero seteamos datos básicos de la sesión para desbloquear la UI
          setUser(mapUser(session.user))
          setLoading(false)

          // Luego buscamos el perfil completo en segundo plano
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', session.user.id)
            .single()
          
          if (mounted && profile) {
            setUser(mapUser(session.user, profile))
          }
        } else {
          setLoading(false)
        }
      } catch (e) {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    // 2. Suscripción a cambios
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      if (session?.user) {
        setUser(mapUser(session.user))
        // Actualizar perfil si es un login nuevo
        if (event === 'SIGNED_IN') {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', session.user.id)
            .single()
          if (mounted) setUser(mapUser(session.user, profile))
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [mapUser])

  return { user, loading }
}
