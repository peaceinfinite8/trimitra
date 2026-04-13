export default function NewsSkeleton() {
  return (
    <main className="editorial-container space-y-10 py-6 lg:py-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_3fr_1fr] md:grid-cols-2 sm:grid-cols-1">
        <div className="space-y-6">
          <div className="h-56 animate-pulse rounded-sm bg-slate-200" />
          <div className="h-56 animate-pulse rounded-sm bg-slate-200" />
        </div>
        <div className="space-y-4">
          <div className="aspect-[3/4] animate-pulse rounded-sm bg-slate-200" />
          <div className="mx-auto h-5 w-24 animate-pulse rounded-full bg-slate-200" />
          <div className="mx-auto h-16 w-[85%] animate-pulse rounded bg-slate-200" />
          <div className="mx-auto h-4 w-[70%] animate-pulse rounded bg-slate-200" />
        </div>
        <div className="space-y-4">
          <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex gap-3 border-t border-slate-200 pt-4 first:border-t-0 first:pt-0">
              <div className="flex-1 space-y-2">
                <div className="h-4 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="h-[60px] w-[80px] animate-pulse rounded-sm bg-slate-200" />
            </div>
          ))}
        </div>
      </section>

      {Array.from({ length: 3 }).map((_, sectionIndex) => (
        <section key={sectionIndex} className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="grid gap-5 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
            {Array.from({ length: 4 }).map((_, cardIndex) => (
              <div key={cardIndex} className="space-y-3">
                <div className="aspect-video animate-pulse rounded-sm bg-slate-200" />
                <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                <div className="h-5 w-[90%] animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                <div className="space-y-2">
                  <div className="h-3 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-[80%] animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr] sm:grid-cols-1">
          <div className="space-y-4">
            <div className="aspect-[4/3] animate-pulse rounded-sm bg-slate-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-12 w-[85%] animate-pulse rounded bg-slate-200" />
            <div className="space-y-2">
              <div className="h-3 animate-pulse rounded bg-slate-200" />
              <div className="h-3 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-[80%] animate-pulse rounded bg-slate-200" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, cardIndex) => (
              <div key={cardIndex} className="space-y-3">
                <div className="aspect-video animate-pulse rounded-sm bg-slate-200" />
                <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                <div className="h-5 w-[90%] animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
