import { ExternalLink, Calendar, Newspaper, Trophy, Megaphone, Star } from 'lucide-react'
import type { NewsArticle } from '@/../product/sections/news/types'

const TYPE_ICONS: Record<NewsArticle['type'], typeof Newspaper> = {
  'press-release': Megaphone,
  'media-coverage': Newspaper,
  'award': Trophy,
  'feature': Star,
}

const TYPE_LABELS: Record<NewsArticle['type'], string> = {
  'press-release': 'Press Release',
  'media-coverage': 'Media Coverage',
  'award': 'Award',
  'feature': 'Feature',
}

const TYPE_STYLES: Record<NewsArticle['type'], string> = {
  'press-release': 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200/50 dark:border-purple-800/30',
  'media-coverage': 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/30',
  'award': 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/30',
  'feature': 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/30',
}

export function NewsArticleCard({ article }: { article: NewsArticle }) {
  const TypeIcon = TYPE_ICONS[article.type]
  const formattedDate = new Date(article.date).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl backdrop-blur-lg border border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_40px_rgba(59,130,246,0.12)] dark:hover:shadow-[0_8px_40px_rgba(59,130,246,0.06)] hover:border-blue-300/30 dark:hover:border-blue-600/20 transition-all duration-300 p-5 sm:p-6"
    >
      {/* Type badge + Source */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium font-heading rounded-full border ${TYPE_STYLES[article.type]}`}
        >
          <TypeIcon size={12} />
          {TYPE_LABELS[article.type]}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          {article.source}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
        {article.title}
      </h3>

      {/* Excerpt */}
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 line-clamp-3">
        {article.excerpt}
      </p>

      {/* Footer: date + tags + external link */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <Calendar size={12} />
            {formattedDate}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
          Read more
          <ExternalLink size={11} />
        </span>
      </div>

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/50">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[11px] font-medium font-heading rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </a>
  )
}
