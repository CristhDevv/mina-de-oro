'use client'
import { User } from '@/types'
import { useState } from 'react'

interface Props {
  onLogin: (user: User) => void
}

export default function GuestView({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!email || !password) {
      setError('Por favor completa todos los campos')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    // Mock login — reemplazar por NextAuth en el futuro
    onLogin({
      id: '1',
      name: email.split('@')[0],
      email,
      role: 'customer',
    })
  }

  return (
    <div className="px-4 pt-8 pb-6 flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#1B2B5E]">Bienvenido</h1>
        <p className="text-sm text-gray-500">Inicia sesión para ver tus pedidos y más</p>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            placeholder="tu@correo.com"
            className="h-12 px-4 rounded-2xl border border-gray-200 text-sm outline-none focus:border-[#1B2B5E] transition-colors bg-white"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            placeholder="••••••••"
            className="h-12 px-4 rounded-2xl border border-gray-200 text-sm outline-none focus:border-[#1B2B5E] transition-colors bg-white"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          className="h-12 bg-[#1B2B5E] text-white font-semibold text-sm rounded-2xl mt-1 active:opacity-80"
        >
          Iniciar sesión
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">o</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Register CTA */}
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm text-gray-500">¿No tienes cuenta?</p>
        <button className="text-sm font-semibold text-[#1B2B5E]">
          Crear cuenta gratis
        </button>
      </div>

    </div>
  )
}
