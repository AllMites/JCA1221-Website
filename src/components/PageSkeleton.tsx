import { Skeleton } from '@/components/ui/skeleton'

function PageSkeletonShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      {/* Glass header skeleton */}
      <header className="sticky top-0 z-50 border-b border-border/10 bg-card/60 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Skeleton className="h-6 w-36 rounded-md" />
            <div className="flex items-center gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-14 rounded-md hidden md:block" />
              ))}
              <Skeleton className="h-9 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </header>

      {children}

      {/* Glass footer skeleton */}
      <footer className="border-t border-border/10 mt-16 bg-card/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-4 w-48 rounded-md" />
          </div>
        </div>
      </footer>
    </div>
  )
}

/** Generic page skeleton — content card + sidebar layout */
export function PageSkeleton() {
  return (
    <PageSkeletonShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page heading */}
        <div className="mb-10">
          <Skeleton className="h-9 w-64 rounded-lg mb-3" />
          <Skeleton className="h-5 w-96 rounded-md" />
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/10 bg-card/60 backdrop-blur-md p-6 space-y-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
            >
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-2/3 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </PageSkeletonShell>
  )
}

/** Compact skeleton for full-screen hero pages (Home) */
export function HeroPageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900">
      <Skeleton className="h-16 w-16 rounded-full bg-white/10 mb-8" />
      <Skeleton className="h-5 w-48 rounded-md bg-white/10 mb-6" />
      <Skeleton className="h-16 w-[32rem] max-w-[90vw] rounded-xl bg-white/10 mb-8" />
      <Skeleton className="h-6 w-[28rem] max-w-[80vw] rounded-md bg-white/10 mb-12" />
      <Skeleton className="h-14 w-48 rounded-full bg-white/15" />
    </div>
  )
}

/** Minimal skeleton for detail pages */
export function DetailPageSkeleton() {
  return (
    <PageSkeletonShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-4 w-48 rounded-md mb-8" />
        <Skeleton className="h-56 w-full rounded-xl mb-8" />
        <Skeleton className="h-8 w-3/4 rounded-lg mb-4" />
        <Skeleton className="h-5 w-1/2 rounded-md mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full rounded-md" />
          ))}
        </div>
      </div>
    </PageSkeletonShell>
  )
}
