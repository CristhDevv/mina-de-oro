export default function GlobalLoading() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      {/* Hero skeleton */}
      <div className="rounded-2xl bg-gray-100 h-44 animate-pulse mb-5" />

      {/* Categories skeleton */}
      <div className="flex gap-3 mb-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 animate-pulse" />
            <div className="w-10 h-2 rounded bg-gray-100 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Products skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden">
            <div className="aspect-square bg-gray-100 animate-pulse" />
            <div className="p-3 flex flex-col gap-2">
              <div className="h-2 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
