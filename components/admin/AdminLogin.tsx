'use client'
import { useState } from 'react'
import { Lock } from 'lucide-react'

interface Props {
  onSuccess: () => void
}

export default function AdminLogin({ onSuccess }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit() {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      onSuccess()
    } else {
      setError('Contraseña incorrecta')
      setPassword('')
    }
  }

  return (
    <div className="px-4 pt-16 pb-6 flex flex-col items-center gap-6">
      <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] flex items-center justify-center">
        <Lock size={28} className="text-[#1B2B5E]" />
      </div>

      <div className="text-center">
        <h1 className="text-xl font-bold text-[#1B2B5E]">Panel Admin</h1>
        <p className="text-sm text-gray-500 mt-1">La Mina de Oro</p>
      </div>

      <div className="w-full flex flex-col gap-3">
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError('') }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Contraseña de administrador"
          className="h-12 px-4 rounded-2xl border border-gray-200 text-sm outline-none focus:border-[#1B2B5E] transition-colors w-full"
        />

        {error && (
          <p className="text-xs text-red-500 font-medium text-center">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          className="h-12 bg-[#1B2B5E] text-white font-semibold text-sm rounded-2xl w-full active:opacity-80"
        >
          Ingresar
        </button>
      </div>
    </div>
  )
}
