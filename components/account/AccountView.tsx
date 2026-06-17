'use client'
import { useAuth } from '@/hooks/useAuth'
import GuestView from './GuestView'
import UserView from './UserView'

export default function AccountView() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-[#1B2B5E] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <GuestView />
  }

  return <UserView user={user} />
}
