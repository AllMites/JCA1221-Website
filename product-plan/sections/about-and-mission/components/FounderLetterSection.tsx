import { Quote } from 'lucide-react'

interface FounderLetterSectionProps {
  letter: string
}

export function FounderLetterSection({ letter }: FounderLetterSectionProps) {
  // Split body from signature at last em-dash
  const lastDash = letter.lastIndexOf(' — ')
  const body = lastDash > -1 ? letter.slice(0, lastDash) : letter
  const signature = lastDash > -1 ? letter.slice(lastDash + 3) : ''

  return (
    <section className="relative py-20 sm:py-32 overflow-hidden bg-slate-950">
      {/* Water-gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" />

      {/* Atmospheric glass orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-cyan-400/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

      {/* Decorative top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section label */}
        <div className="text-center mb-10">
          <p className="text-sm font-medium font-heading uppercase tracking-[0.2em] text-blue-400 mb-3">
            A Letter from the Founder
          </p>
          <Quote size={20} className="text-blue-400/60 mx-auto" />
        </div>

        {/* Frosted glass letter panel */}
        <div className="relative group">
          {/* Glass panel */}
          <div className="relative rounded-3xl bg-white/5 dark:bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_8px_48px_rgba(59,130,246,0.08),0_2px_8px_rgba(59,130,246,0.05)] p-8 sm:p-12 lg:p-14">
            {/* Subtle inner glass glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.06] via-transparent to-blue-400/[0.04] pointer-events-none" />

            <div className="relative z-10">
              {/* Quote mark decoration */}
              <span className="block text-7xl sm:text-8xl font-serif text-blue-400/20 leading-none mb-4 select-none">
                &ldquo;
              </span>

              {/* Letter body */}
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-300 dark:text-slate-300 text-base sm:text-lg leading-relaxed whitespace-pre-line font-body">
                  {body}
                </p>
              </div>

              {/* Signature */}
              {signature && (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-blue-300 dark:text-blue-300 text-base font-heading font-semibold italic">
                    {signature}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Decorative corner highlights */}
          <div className="absolute -top-px -left-px w-12 h-12 rounded-tl-3xl border-t border-l border-blue-400/20 pointer-events-none" />
          <div className="absolute -bottom-px -right-px w-12 h-12 rounded-br-3xl border-b border-r border-blue-400/20 pointer-events-none" />
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />
    </section>
  )
}
