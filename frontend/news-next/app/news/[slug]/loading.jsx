export default function Loading() {
  return (
    <main className="editorial-container py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="aspect-[16/9] animate-pulse rounded-sm bg-slate-200" />
        <div className="space-y-3">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-12 w-[90%] animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-48 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-3 animate-pulse rounded bg-slate-200" />
          ))}
        </div>
      </div>
    </main>
  )
}
