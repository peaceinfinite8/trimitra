export default function Loading() {
  return (
    <main className="editorial-container py-10">
      <div className="h-10 w-40 animate-pulse rounded bg-slate-200" />
      <div className="mt-8 grid gap-5 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="aspect-video animate-pulse rounded-sm bg-slate-200" />
            <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
            <div className="h-5 w-[90%] animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </main>
  )
}
