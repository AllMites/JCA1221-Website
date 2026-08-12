// src/sections/home/components/TrustWall.tsx
import { ScrollReveal, RevealItem } from '@/components/ScrollReveal'
import type { Partner } from '@/lib/content-types'

interface TrustWallProps {
  partners: Partner[]
}

export function TrustWall({ partners }: TrustWallProps) {
  const partnersWithLogos = (partners ?? []).filter(p => !!p.logo)

  // No partner logo assets yet — section collapses (certifications were removed per audit)
  if (partnersWithLogos.length === 0) {
    return null
  }

  return (
    <section className="py-16 sm:py-24 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white text-center mb-8">
            Serving
          </h2>

          {/* Partner logo grid — staggered reveal */}
          <ScrollReveal staggerChildren={0.05} viewportMargin="-40px 0px">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
              {partnersWithLogos.map((partner) => (
                <RevealItem key={partner.id}>
                  <a
                    href={partner.website_url || undefined}
                    target={partner.website_url ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className={partner.website_url ? 'cursor-pointer' : 'cursor-default'}
                  >
                    <div
                      className="aspect-[3/2] rounded-xl flex items-center justify-center p-4
                        bg-white/60 dark:bg-slate-800/60
                        border border-slate-200 dark:border-white/5
                        transition-all duration-300
                        hover:bg-white dark:hover:bg-slate-800
                        hover:border-slate-300 dark:hover:border-white/10
                        hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]
                        hover:-translate-y-0.5
                        group"
                    >
                      <img
                        src={partner.logo!}
                        alt={partner.name}
                        loading="lazy"
                        decoding="async"
                        className="max-h-full max-w-full object-contain transition-all duration-500
                          grayscale group-hover:grayscale-0"
                      />
                    </div>
                  </a>
                </RevealItem>
              ))}
            </div>
          </ScrollReveal>
        </ScrollReveal>
      </div>
    </section>
  )
}
