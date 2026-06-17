import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto flex flex-col items-center justify-center h-[70vh] gap-4 px-8 text-center">
      <span className="text-6xl">🏚️</span>
      <h2 className="text-xl font-bold text-[#1B2B5E]">Página no encontrada</h2>
      <p className="text-sm text-gray-500">El producto o página que buscas no existe o fue eliminado.</p>
      <Link
        href="/"
        className="mt-2 bg-[#1B2B5E] text-white text-sm font-semibold px-6 py-3 rounded-2xl"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
