import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbSegment {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  /** Explicit segments to render. If omitted, breadcrumbs are auto-derived from URL path. */
  segments?: BreadcrumbSegment[]
}

/** Map URL path segments to human-readable labels */
function pathToLabel(segment: string): string {
  // Capitalize and replace hyphens with spaces
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Hook that derives breadcrumb segments from the current URL path.
 * Paths like /projects/my-slug → [{ label: 'Home', href: '/' }, { label: 'Projects', href: '/projects' }, { label: 'My Slug' }]
 */
export function useBreadcrumbs(): BreadcrumbSegment[] {
  const { pathname } = useLocation()
  const parts = pathname.split('/').filter(Boolean)

  if (parts.length === 0) return [{ label: 'Home' }]

  const segments: BreadcrumbSegment[] = [{ label: 'Home', href: '/' }]

  let accumulatedPath = ''
  for (let i = 0; i < parts.length; i++) {
    accumulatedPath += `/${parts[i]}`
    const isLast = i === parts.length - 1
    segments.push({
      label: pathToLabel(parts[i]),
      href: isLast ? undefined : accumulatedPath,
    })
  }

  return segments
}

export function Breadcrumbs({ segments: explicitSegments }: BreadcrumbsProps) {
  const autoSegments = useBreadcrumbs()
  const segments = explicitSegments ?? autoSegments

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
