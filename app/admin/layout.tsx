import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.log('AdminLayout: No user found, redirecting to /cuenta', userError)
    redirect('/cuenta')
  }

  // Fetch user role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    console.log('AdminLayout: User is not admin or profile error, redirecting to /cuenta', {
      role: profile?.role,
      error: profileError
    })
    redirect('/cuenta')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {children}
    </div>
  )
}
