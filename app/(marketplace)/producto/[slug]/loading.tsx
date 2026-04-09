export default function ProductLoading() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-32">
      <div className="w-20 h-5 bg-gray-100 rounded animate-pulse mb-4" />
      <div className="rounded-2xl bg-gray-100 aspect-square animate-pulse mb-4" />
      <div className="flex flex-col gap-3">
        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/4" />
        <div className="h-6 bg-gray-100 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6" />
        <div className="h-8 bg-gray-100 rounded animate-pulse w-1/2 mt-2" />
      </div>
    </div>
  )
}
