export default function HeroBanner() {
  return (
    <div className="mx-4 mt-4 rounded-2xl bg-[#1B2B5E] px-6 py-8 flex flex-col gap-2 relative overflow-hidden">
      {/* Decorative circle */}
      <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
      <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full bg-[#C9A84C]/20" />

      <span className="text-[#C9A84C] text-xs font-semibold uppercase tracking-widest">
        Ofertas especiales
      </span>
      <h1 className="text-white text-2xl font-bold leading-tight">
        Los mejores precios<br />de Bogotá
      </h1>
      <p className="text-white/70 text-sm">
        Calidad garantizada al mejor precio
      </p>
      <button className="mt-2 self-start bg-[#C9A84C] text-white text-sm font-semibold px-5 py-2 rounded-full">
        Ver ofertas
      </button>
    </div>
  )
}
