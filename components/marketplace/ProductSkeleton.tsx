export default function ProductSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full aspect-square bg-gray-100" />

      {/* Info Skeleton */}
      <div className="p-3 flex flex-col gap-2">
        {/* Category */}
        <div className="h-3 w-16 bg-gray-100 rounded-md" />
        
        {/* Title */}
        <div className="space-y-1.5">
          <div className="h-4 w-full bg-gray-100 rounded-md" />
          <div className="h-4 w-2/3 bg-gray-100 rounded-md" />
        </div>

        {/* Price */}
        <div className="mt-1 h-5 w-24 bg-gray-100 rounded-md" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 pb-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}
