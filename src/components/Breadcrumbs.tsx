import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbSegment {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  segments: BreadcrumbSegment[]
}

export function Breadcrumbs({ segments }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <ol className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
        {segments.map((segment, i) => {
          const isLast = i === segments.length - 1

          return (
            <li key={i} className="flex items-center gap-1.5">
              {segment.href && !isLast ? (
                <Link
                  to={segment.href}
                  className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  {segment.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-slate-900 dark:text-white font-semibold' : ''}>
                  {segment.label}
                </span>
              )}
              {!isLast && <ChevronRight size={14} className="text-slate-400 dark:text-slate-500" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
