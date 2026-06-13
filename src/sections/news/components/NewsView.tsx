import { useState, useMemo } from 'react'
import type { NewsViewProps, NewsCategory } from '@/../product/sections/news/types'
import { NewsArticleCard } from './NewsArticleCard'
import { ShaderBackground } from '@/components/ShaderBackground'
import { ScrollReveal, RevealItem } from '@/components/ScrollReveal'
import { Newspaper } from 'lucide-react'

const CATEGORY_OPTIONS: { label: string; value: NewsCategory }[] = [
  { label: 'All News', value: 'all' },
  { label: 'Awards', value: 'awards' },
  { label: 'Projects', value: 'projects' },
  { label: 'Expansion', value: 'expansion' },
  { label: 'Policy', value: 'policy' },
  { label: 'Media', value: 'media' },
]

export function NewsView({ sectionTitle, sectionSubtitle, articles }: NewsViewProps) {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('all')

  const filteredArticles = useMemo(() => {
    if (activeCategory === 'all') return articles
    return articles.filter((a) => a.category === activeCategory)
  }, [articles, activeCategory])

  // Sort by date descending
  const sortedArticles = useMemo(
    () => [...filteredArticles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [filteredArticles],
  )

  return (
    <div className="font-body">
      {/* Header section */}
      <section className="relative py-16 sm:py-20 overflow-hidden bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/20 dark:to-slate-950">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 dark:via-blue-600/20 to-transparent" />
        <ShaderBackground variant="blue" opacity={0.4} />

        <ScrollReveal direction="up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 mb-6">
              <Newspaper size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 dark:text-white mb-4">
              {sectionTitle}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              {sectionSubtitle}
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Filters + Articles */}
      <section className="relative py-16 sm:py-20 bg-white dark:bg-slate-950">
        <ShaderBackground variant="light" opacity={0.3} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category filter pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {CATEGORY_OPTIONS.map((opt) => {
              const isActive = activeCategory === opt.value

              return (
                <button
                  key={opt.value}
                  onClick={() => setActiveCategory(opt.value)}
                  className={`px-4 py-2 text-sm font-medium font-heading rounded-full transition-all duration-200 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.06),inset_-1px_-1px_3px_rgba(255,255,255,0.5)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-[2px_2px_6px_rgba(0,0,0,0.04),-1px_-1px_4px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_6px_rgba(0,0,0,0.3),-1px_-1px_4px_rgba(255,255,255,0.02)]'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>

          {/* Articles grid */}
          {sortedArticles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 dark:text-slate-500 text-lg font-heading">
                No articles in this category yet.
              </p>
            </div>
          ) : (
            <ScrollReveal staggerChildren={0.08} viewportMargin="-40px 0px">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedArticles.map((article) => (
                  <RevealItem key={article.id}>
                    <NewsArticleCard article={article} />
                  </RevealItem>
                ))}
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>
    </div>
  )
}
