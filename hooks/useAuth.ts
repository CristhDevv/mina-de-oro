'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'

interface AuthState {
  user: User | null
  loading: boolean
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchUser(authUser: { id: string; email?: string; user_metadata?: { name?: string } }) {
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
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUser(session.user).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUser(session.user)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
