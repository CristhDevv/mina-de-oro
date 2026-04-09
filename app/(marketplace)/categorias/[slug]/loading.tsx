export default function CategoryLoading() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse" />
        <div className="flex flex-col gap-2">
          <div className="w-24 h-4 bg-gray-100 rounded animate-pulse" />
          <div className="w-16 h-3 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
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
