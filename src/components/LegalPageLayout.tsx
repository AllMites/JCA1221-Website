import { ShaderBackground } from '@/components/ShaderBackground'

interface LegalPageLayoutProps {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

/**
 * Shared layout for legal pages (Privacy Policy, Terms of Service).
 *
 * Glass card on light gradient backdrop.  Consistent typography with the
 * rest of the site — DM Sans headings, Inter body, slate palette.  Includes
 * a "Last updated" date and a print-friendly layout.
 */
export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950" />
      <ShaderBackground variant="light" opacity={0.4} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 dark:text-white mb-3">
            {title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Content card */}
        <div className="rounded-2xl bg-white dark:bg-white/5 backdrop-blur-lg border border-slate-200 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.03)] p-8 sm:p-10 lg:p-12">
          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-h2:text-xl prose-h3:text-lg prose-p:text-sm prose-p:leading-relaxed prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-li:text-sm prose-li:text-slate-600 dark:prose-li:text-slate-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
