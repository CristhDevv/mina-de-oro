'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Loader2, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError('Credenciales inválidas. Por favor intenta de nuevo.')
      } else {
        router.push('/admin')
        router.refresh()
      }
    } catch (err) {
      setError('Ocurrió un error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative patterns */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-50/50 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-50/50 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#1B2B5E] flex items-center justify-center shadow-xl shadow-blue-900/20 transform hover:scale-110 transition-transform cursor-pointer group">
            <Lock size={28} className="text-[#C9A84C] group-hover:rotate-12 transition-transform" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-[#1B2B5E] tracking-tight">
          Panel de Administración
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          La Mina de Oro <span className="mx-1">·</span> <span className="font-medium text-[#C9A84C]">Control Total</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative">
        <div className="bg-white py-10 px-8 shadow-2xl shadow-blue-100 sm:rounded-3xl border border-blue-50">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#1B2B5E] uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#1B2B5E] transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-gray-100 rounded-2xl text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B2B5E]/5 focus:border-[#1B2B5E] bg-gray-50/50 transition-all font-medium"
                  placeholder="admin@minadeoro.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" title="Contraseña" className="block text-xs font-bold text-[#1B2B5E] uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#1B2B5E] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-gray-100 rounded-2xl text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B2B5E]/5 focus:border-[#1B2B5E] bg-gray-50/50 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-[11px] font-bold py-3 px-4 rounded-xl flex items-center gap-2 animate-shake">
                <div className="w-1 h-1 rounded-full bg-red-600 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 h-12 bg-[#1B2B5E] text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-900/20 hover:bg-[#1B2B5E]/90 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    Entrar al panel
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-center text-[10px] text-gray-400 font-medium leading-relaxed">
              Si ha olvidado sus credenciales o necesita acceso adicional, favor de contactar al administrador del sistema.
            </p>
          </div>
        </div>
        
        <p className="mt-10 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} La Mina de Oro. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
