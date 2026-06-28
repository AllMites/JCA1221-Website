// src/sections/home/components/TrustWall.tsx
import { BadgeCheck } from 'lucide-react'
import { ScrollReveal, RevealItem } from '@/components/ScrollReveal'
import type { Partner } from '@/lib/content-types'

const CERTIFICATIONS = [
  { label: 'Philippine SEC Registered' },
  { label: 'DENR Environmental Compliance' },
  { label: 'DILG PPP Framework' },
  { label: 'ISO 14001 (in progress)' },
]

interface TrustWallProps {
  partners: Partner[]
}

export function TrustWall({ partners }: TrustWallProps) {
  const partnersWithLogos = (partners ?? []).filter(p => !!p.logo)

  // Certifications-only when no partners have real logo assets
  if (partnersWithLogos.length === 0) {
    return (
      <section className="py-16 sm:py-24 bg-slate-50/50 dark:bg-slate-950/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white text-center mb-8">
              Certifications & Compliance
            </h2>
            <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
              {CERTIFICATIONS.map((cert) => (
                <div
                  key={cert.label}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                >
                  <BadgeCheck size={18} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-tight">
                    {cert.label}
                  </span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 sm:py-24 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white text-center mb-8">
            Trusted By
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

          {/* Divider */}
          <div className="border-t border-slate-200 dark:border-slate-700 max-w-xl mx-auto mb-8" />

          {/* Certifications */}
          <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white text-center mb-6">
            Certifications & Compliance
          </h3>
          <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
            {CERTIFICATIONS.map((cert) => (
              <div
                key={cert.label}
                className="flex items-center gap-3 p-3.5 rounded-xl
                  bg-white/70 dark:bg-slate-800/70
                  border border-blue-100 dark:border-blue-500/10
                  shadow-[0_2px_8px_rgba(0,0,0,0.02)]
                  transition-all duration-300
                  hover:shadow-[0_4px_12px_rgba(59,130,246,0.06)]
                  hover:border-blue-200 dark:hover:border-blue-500/20"
              >
                <BadgeCheck size={18} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-tight">
                  {cert.label}
                </span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
