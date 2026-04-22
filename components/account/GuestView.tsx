'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

type Mode = 'login' | 'register'

export default function GuestView() {
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  async function handleSubmit() {
    if (!email || !password) { setError('Completa todos los campos'); return }
    if (mode === 'register' && !name) { setError('Ingresa tu nombre'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }

    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'login') {
      const { error: e } = await supabase.auth.signInWithPassword({ email, password })
      if (e) {
        setError(e.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos' : e.message)
      } else {
        router.replace(redirect)
      }
    } else {
      const { error: e } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (e) setError(e.message)
      else setSuccess('¡Cuenta creada! Revisa tu correo para confirmar.')
    }

    setLoading(false)
  }

  return (
    <div className="px-4 pt-8 pb-6 flex flex-col gap-6">

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#1B2B5E]">
          {mode === 'login' ? 'Bienvenido' : 'Crear cuenta'}
        </h1>
        <p className="text-sm text-gray-500">
          {mode === 'login' ? 'Inicia sesión para ver tus pedidos' : 'Regístrate gratis en La Mina de Oro'}
        </p>
      </div>

      <div className="flex flex-col gap-3">

        {mode === 'register' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="Tu nombre"
              className="h-12 px-4 rounded-2xl border border-gray-200 text-sm outline-none focus:border-[#1B2B5E] transition-colors"
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            placeholder="tu@correo.com"
            className="h-12 px-4 rounded-2xl border border-gray-200 text-sm outline-none focus:border-[#1B2B5E] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              placeholder="••••••••"
              className="h-12 px-4 pr-12 rounded-2xl border border-gray-200 text-sm outline-none focus:border-[#1B2B5E] transition-colors w-full"
            />
            <button
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        {success && <p className="text-xs text-green-600 font-medium">{success}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="h-12 bg-[#1B2B5E] text-white font-semibold text-sm rounded-2xl mt-1 disabled:opacity-50"
        >
          {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </button>

      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">o</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="text-sm text-gray-500">
          {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
        </p>
        <button
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess('') }}
          className="text-sm font-semibold text-[#1B2B5E]"
        >
          {mode === 'login' ? 'Crear cuenta gratis' : 'Iniciar sesión'}
        </button>
      </div>

    </div>
  )
}
