import type { Partner } from '@/lib/content-types'

const TYPE_LABELS: Record<string, string> = {
  LGU: 'LGU',
  national_agency: 'National Agency',
  private_sector: 'Private Sector',
  community: 'Community',
  regulatory: 'Regulatory',
  academic: 'Academic',
  international: 'International',
}

interface PartnerBadgesProps {
  partners: Partner[]
  projectId?: string
  title?: string
}

export function PartnerBadges({ partners, projectId, title = 'Project Partners' }: PartnerBadgesProps) {
  if (!partners || partners.length === 0) return null

  const filtered = projectId
    ? partners.filter((p) => p.project_ids?.includes(projectId))
    : partners

  if (filtered.length === 0) return null

  return (
    <div>
      {title && (
        <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <div className="flex flex-wrap gap-3">
        {filtered.map((partner) => (
          <div
            key={partner.id}
            className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 transition-all hover:border-lime-400/30 hover:bg-lime-50/30 dark:hover:bg-lime-500/5 group"
          >
            {/* Logo thumbnail */}
            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden">
              {partner.logo ? (
                <img src={partner.logo} alt={partner.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  {partner.name.charAt(0)}
                </span>
              )}
            </div>

            {/* Name + type */}
            <div className="min-w-0">
              <a
                href={partner.website_url || undefined}
                target={partner.website_url ? '_blank' : undefined}
                rel="noopener noreferrer"
                className={`text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors truncate block ${partner.website_url ? 'hover:underline' : ''}`}
              >
                {partner.name}
              </a>
              {partner.type && (
                <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {TYPE_LABELS[partner.type] || partner.type}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
