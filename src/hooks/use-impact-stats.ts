import { useState, useEffect } from 'react'
import { supabase, hasSupabaseCredentials } from '@/lib/supabase'
import type { ImpactStat } from '@/../product/sections/home/types'
import type { ImpactMetric } from '@/lib/content-types'

interface MetricCategory {
  /** Substrings to look for in the metric label (case-insensitive) */
  matchKeywords: string[]
  /** Substrings that disqualify a match (to avoid double-counting) */
  excludeKeywords: string[]
  /** Display label for the aggregated stat */
  label: string
  /** Unit suffix (e.g. "m³", "tons", "+") */
  suffix: string
  /** Description shown below the number */
  description: string
}

const METRIC_CATEGORIES: MetricCategory[] = [
  {
    matchKeywords: ['wastewater', 'water treated', 'treatment capacity'],
    excludeKeywords: ['recycled'],
    label: 'Water Treated Daily',
    suffix: 'm³',
    description: 'Combined treatment capacity across all operational facilities',
  },
  {
    matchKeywords: ['employment', 'job'],
    excludeKeywords: [],
    label: 'Local Jobs Created',
    suffix: '+',
    description: 'Direct employment from operations, construction, and education',
  },
  {
    matchKeywords: ['waste'],
    excludeKeywords: ['water', 'wastewater'],
    label: 'Waste Diverted Daily',
    suffix: 'tons',
    description: 'Solid waste diverted from landfills and open dumping sites',
  },
  {
    matchKeywords: ['carbon', 'co₂', 'co2'],
    excludeKeywords: [],
    label: 'CO₂ Sequestered Annually',
    suffix: 'tons',
    description: 'Through biochar soil application and nature-based solutions',
  },
]

function metricMatchesCategory(metric: ImpactMetric, category: MetricCategory): boolean {
  const label = metric.label.toLowerCase()

  // Check exclude keywords first
  if (category.excludeKeywords.some((kw) => label.includes(kw.toLowerCase()))) {
    return false
  }

  // Check include keywords
  return category.matchKeywords.some((kw) => label.includes(kw.toLowerCase()))
}

function extractNumericValue(metric: ImpactMetric): number {
  // Strip common non-numeric prefixes/suffixes: ~, +, %, commas, units
  const raw = metric.value
    .replace(/[~<>≈]/g, '')      // approximation symbols
    .replace(/,/g, '')            // thousands separators
    .replace(/%/g, '')            // percent signs
    .replace(/[a-zA-Z\/]/g, '')   // letters and slashes
    .trim()

  const num = parseFloat(raw)
  return isNaN(num) ? 0 : num
}

export function useImpactStats() {
  const [stats, setStats] = useState<ImpactStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchStats() {
      setLoading(true)

      if (!hasSupabaseCredentials) {
        if (!cancelled) setLoading(false)
        return
      }

      const { data: projects, error } = await supabase
        .from('projects')
        .select('impact_metrics')
        .eq('published', true)

      if (error || !projects) {
        if (!cancelled) setLoading(false)
        return
      }

      // Aggregate numeric values per category
      const aggregated: number[] = new Array(METRIC_CATEGORIES.length).fill(0)

      for (const project of projects) {
        const metrics = project.impact_metrics as ImpactMetric[] | null
        if (!metrics || !Array.isArray(metrics)) continue

        for (const metric of metrics) {
          if (!metric || !metric.label) continue

          for (let i = 0; i < METRIC_CATEGORIES.length; i++) {
            if (metricMatchesCategory(metric, METRIC_CATEGORIES[i])) {
              aggregated[i] += extractNumericValue(metric)
              break // Each metric goes to at most one category
            }
          }
        }
      }

      // Build display stats
      const displayStats: ImpactStat[] = METRIC_CATEGORIES
        .map((cat, i) => ({
          number: Math.round(aggregated[i]),
          suffix: cat.suffix,
          label: cat.label,
          description: cat.description,
        }))
        .filter((s) => s.number > 0)

      // Always include project count
      displayStats.push({
        number: projects.length,
        suffix: '',
        label: 'Active Projects',
        description: 'Water and waste infrastructure across the Philippines',
      })

      if (!cancelled) {
        setStats(displayStats)
        setLoading(false)
      }
    }

    fetchStats()

    return () => {
      cancelled = true
    }
  }, [])

  return { stats, loading }
}
