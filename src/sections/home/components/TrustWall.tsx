// src/sections/home/components/TrustWall.tsx
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
  // Certifications-only fallback when no partners
  if (!partners || partners.length === 0) {
    return (
      <section className="py-16 sm:py-24 bg-slate-50/50 dark:bg-slate-950/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white text-center mb-8">
            Certifications & Compliance
          </h2>
          <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
            {CERTIFICATIONS.map((cert) => (
              <div
                key={cert.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
              >
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">✓</span>
                </span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-tight">
                  {cert.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 sm:py-24 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white text-center mb-8">
          Trusted By
        </h2>

        {/* Partner logo grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
          {partners.map((partner) => (
            <a
              key={partner.id}
              href={partner.website_url || undefined}
              target={partner.website_url ? '_blank' : undefined}
              rel="noopener noreferrer"
              className={partner.website_url ? 'cursor-pointer' : 'cursor-default'}
            >
              <div
                className="aspect-[3/2] rounded-lg flex items-center justify-center p-4
                  bg-white/40 dark:bg-slate-800/40
                  border border-slate-100 dark:border-slate-800
                  transition-all duration-300
                  hover:bg-white/80 dark:hover:bg-slate-800/80
                  hover:shadow-sm"
              >
                {partner.logo ? (
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full max-w-full object-contain transition-all duration-300"
                    style={{ filter: 'grayscale(100%)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.filter = 'grayscale(0%)'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.filter = 'grayscale(100%)'
                    }}
                  />
                ) : (
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 text-center">
                    {partner.name}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>

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
              className="flex items-center gap-3 p-3 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
            >
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">✓</span>
              </span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-tight">
                {cert.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
