'use client'
import { useEffect } from 'react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="max-w-lg mx-auto flex flex-col items-center justify-center h-[70vh] gap-4 px-8 text-center">
      <span className="text-6xl">⚠️</span>
      <h2 className="text-lg font-bold text-[#1B2B5E]">Algo salió mal</h2>
      <p className="text-sm text-gray-500">No pudimos cargar la información. Verifica tu conexión.</p>
      <button
        onClick={reset}
        className="mt-2 bg-[#1B2B5E] text-white text-sm font-semibold px-6 py-3 rounded-2xl"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
