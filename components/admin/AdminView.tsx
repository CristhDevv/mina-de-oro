'use client'
import { useState } from 'react'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'

export default function AdminView() {
  const [authenticated, setAuthenticated] = useState(false)

  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} />
  }

  return <AdminDashboard />
}
