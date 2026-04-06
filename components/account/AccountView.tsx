'use client'
import { useState } from 'react'
import GuestView from './GuestView'
import UserView from './UserView'
import { User } from '@/types'

export default function AccountView() {
  const [user, setUser] = useState<User | null>(null)

  if (!user) {
    return <GuestView onLogin={(u) => setUser(u)} />
  }

  return <UserView user={user} onLogout={() => setUser(null)} />
}
