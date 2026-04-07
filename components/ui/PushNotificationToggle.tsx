'use client'
import { useEffect, useState } from 'react'
import { Bell, BellOff, Loader2 } from 'lucide-react'

interface Props { userId: string }

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushNotificationToggle({ userId }: Props) {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setSupported(true)
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setSubscribed(!!sub)
          setLoading(false)
        })
      })
    } else {
      setLoading(false)
    }
  }, [])

  async function toggle() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      if (subscribed) {
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          await sub.unsubscribe()
          await fetch('/api/push/subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          })
        }
        setSubscribed(false)
      } else {
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        })
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: sub.toJSON(), userId }),
        })
        setSubscribed(true)
      }
    } catch (err) {
      console.error('Push error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!supported) return null

  return (
    <button onClick={toggle} disabled={loading}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-gray-700 active:bg-gray-50 disabled:opacity-50">
      {loading ? <Loader2 size={18} className="animate-spin text-gray-400" /> :
        subscribed ? <Bell size={18} className="text-[#1B2B5E]" /> :
        <BellOff size={18} className="text-gray-400" />}
      {loading ? 'Cargando...' : subscribed ? 'Notificaciones activadas' : 'Activar notificaciones'}
    </button>
  )
}
