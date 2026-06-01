import { useRef, useEffect, useState } from 'react'
import { TrendingUp, Droplets, Gauge, Sun } from 'lucide-react'
import type { LiveMetrics, LiveMetric, ChartDataPoint } from '@/../product/sections/technology-and-approach/types'
import { ShaderBackground } from '@/components/ShaderBackground'
import { GlassPill } from '@/components/GlassPill'

interface LiveDashboardSectionProps {
  liveMetrics: LiveMetrics
}

// ─── CSS Chart Sub-Components ───────────────────────────────────────────────

function LineChart({ data, color }: { data: ChartDataPoint[]; color: string }) {
  if (data.length < 2) return null
  const maxVal = Math.max(...data.map((d) => d.value))
  const minVal = Math.min(...data.map((d) => d.value))
  const range = maxVal - minVal || 1
  const width = 100
  const height = 100
  const padding = 10

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((d.value - minVal) / range) * (height - padding * 2)
    return `${x},${y}`
  })

  const polyline = points.join(' ')

  const areaPoints = [
    `${padding},${height - padding}`,
    ...points,
    `${width - padding},${height - padding}`,
  ].join(' ')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const y = height - padding - frac * (height - padding * 2)
        return (
          <line
            key={frac}
            x1={padding}
            y1={y}
            x2={width - padding}
            y2={y}
            stroke="currentColor"
            strokeOpacity={0.06}
            strokeWidth={0.5}
          />
        )
      })}
      <polygon points={areaPoints} fill={color} fillOpacity={0.1} />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeOpacity={0.8}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeOpacity={0.3}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((pt, i) => {
        const [cx, cy] = pt.split(',')
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={1.5}
            fill={color}
            fillOpacity={0.9}
          />
        )
      })}
    </svg>
  )
}

function BarChart({ data, color }: { data: ChartDataPoint[]; color: string }) {
  const maxVal = Math.max(...data.map((d) => d.value))
  const barCount = data.length
  const gapRatio = 0.3

  return (
    <div className="w-full h-full flex items-end" style={{ gap: `${gapRatio * 100 / barCount}%` }}>
      {data.map((d, i) => {
        const heightPct = (d.value / maxVal) * 100
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center justify-end gap-1"
            style={{ height: '100%' }}
          >
            <div
              className="w-full rounded-t-sm transition-all duration-1000 ease-out"
              style={{
                height: `${heightPct}%`,
                backgroundColor: color,
                opacity: 0.7,
                minHeight: d.value > 0 ? '2px' : '0',
              }}
            />
            <span className="text-[9px] text-slate-500 dark:text-slate-400 leading-none whitespace-nowrap">
              {d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function AreaChart({ data, color }: { data: ChartDataPoint[]; color: string }) {
  if (data.length < 2) return null
  const maxVal = Math.max(...data.map((d) => d.value))
  const minVal = Math.min(...data.map((d) => d.value))
  const range = maxVal - minVal || 1
  const width = 100
  const height = 100
  const padding = 10

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((d.value - minVal) / range) * (height - padding * 2)
    return `${x},${y}`
  })

  const areaPoints = [
    `${padding},${height - padding}`,
    ...points,
    `${width - padding},${height - padding}`,
  ]

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <polygon points={areaPoints.join(' ')} fill={color} fillOpacity={0.15} />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeOpacity={0.7}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Icon Map ────────────────────────────────────────────────────────────────

const METRIC_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'cumulative-treated': Droplets,
  'daily-volume': TrendingUp,
  'water-quality': Gauge,
  'energy-solar': Sun,
}

// ─── Tick rates per metric (units added per second) ─────────────────────────

const TICK_RATES: Record<string, number> = {
  'cumulative-treated': 0.4,   // m³ per second (~34,560/day — realistic plant output)
  'daily-volume': 0.002,       // m³/day per second (drifts slowly)
  'water-quality': 0.0003,     // % per second (barely perceptible wobble)
  'energy-solar': 0.0015,      // % per second (slow upward trend)
}

const VALUE_DECIMALS: Record<string, number> = {
  'cumulative-treated': 0,
  'daily-volume': 0,
  'water-quality': 1,
  'energy-solar': 1,
}

// ─── Live Counter (continuous, time-based) ──────────────────────────────────

function LiveCount({
  metricId,
  baseValue,
  unit,
}: {
  metricId: string
  baseValue: string
  unit: string
}) {
  const [displayed, setDisplayed] = useState('0')
  const [mounted, setMounted] = useState(false)
  const startTime = useRef<number>(0)

  useEffect(() => {
    const numeric = parseFloat(baseValue.replace(/,/g, ''))
    const tickRate = TICK_RATES[metricId] || 0.01
    const decimals = VALUE_DECIMALS[metricId] ?? 0
    startTime.current = performance.now()
    setMounted(true)

    let raf: number
    const tick = () => {
      const elapsed = (performance.now() - startTime.current) / 1000
      const current = numeric + tickRate * elapsed
      setDisplayed(
        current.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      )
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [baseValue, metricId])

  // Initial count-up animation (fires once on mount)
  useEffect(() => {
    if (!mounted) return
    const numeric = parseFloat(baseValue.replace(/,/g, ''))
    const decimals = VALUE_DECIMALS[metricId] ?? 0
    const duration = 2000
    const start = performance.now()

    let raf: number
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = numeric * eased
      setDisplayed(
        current.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      )
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // After count-up finishes, switch to live mode
    const timeout = setTimeout(() => {
      startTime.current = performance.now()
    }, duration + 50)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timeout)
    }
  }, [mounted])

  return (
    <span className="tabular-nums">
      {displayed}
      <span className="text-sm ml-1 font-normal text-slate-400">{unit}</span>
    </span>
  )
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({ metric, color }: { metric: LiveMetric; color: string }) {
  const IconComponent = METRIC_ICONS[metric.id]

  const chart =
    metric.chartType === 'line' ? (
      <LineChart data={metric.dataPoints} color={color} />
    ) : metric.chartType === 'bar' ? (
      <BarChart data={metric.dataPoints} color={color} />
    ) : (
      <AreaChart data={metric.dataPoints} color={color} />
    )

  return (
    <div className="flex-shrink-0 w-[300px] sm:w-[340px]">
      <div className="h-full p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.03)] hover:border-white/15 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {IconComponent && (
            <GlassPill as="div" className="w-9 h-9 rounded-lg bg-slate-500/10 border border-white/10 flex items-center justify-center">
              <IconComponent className="w-4 h-4 text-slate-300" />
            </GlassPill>
          )}
          <p className="text-xs font-mono uppercase tracking-wider text-slate-400 leading-tight flex-1">
            {metric.label}
          </p>
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[10px] font-mono text-emerald-400/70 uppercase tracking-wider">
              Live
            </span>
          </div>
        </div>

        {/* Value */}
        <div className="mb-1">
          <span className="text-2xl sm:text-3xl font-heading font-bold text-white">
            <LiveCount
              metricId={metric.id}
              baseValue={metric.currentValue}
              unit={metric.unit}
            />
          </span>
        </div>

        {/* Context */}
        <p className="text-xs text-slate-400 leading-relaxed mb-5">
          {metric.context}
        </p>

        {/* Chart area */}
        <div className="w-full h-32 rounded-xl bg-slate-950/40 border border-white/5 p-2">
          {chart}
        </div>
      </div>
    </div>
  )
}

// ─── Auto-Scroll Carousel ───────────────────────────────────────────────────

function AutoScrollCarousel({
  metrics,
  colors,
}: {
  metrics: LiveMetric[]
  colors: Record<string, string>
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)
  const isPaused = useRef(false)
  const speedPxPerS = 40 // scroll speed

  // Clone metrics 3× for seamless wraparound
  const tripled = [...metrics, ...metrics, ...metrics]

  // Respect reduced-motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      isPaused.current = true
    }
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    // Start in the middle clone so we have room to scroll both directions
    const singleWidth = el.scrollWidth / 3
    el.scrollLeft = singleWidth

    let lastTime = performance.now()

    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000
      lastTime = now

      if (!isPaused.current) {
        el.scrollLeft += speedPxPerS * dt

        // When we scroll past the second full set, reset to the first clone position
        if (el.scrollLeft >= singleWidth * 2) {
          el.scrollLeft -= singleWidth
        }
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [metrics.length])

  return (
    <div
      ref={scrollRef}
      className="flex gap-5 overflow-x-hidden pb-4 motion-safe-auto-scroll"
      onMouseEnter={() => { isPaused.current = true }}
      onMouseLeave={() => { isPaused.current = false }}
      onFocus={() => { isPaused.current = true }}
      onBlur={() => { isPaused.current = false }}
    >
      {tripled.map((metric, i) => {
        const color = colors[metric.id] || '#3b82f6'
        return <MetricCard key={`${metric.id}-${i}`} metric={metric} color={color} />
      })}
    </div>
  )
}

// ─── Main Section ────────────────────────────────────────────────────────────

export function LiveDashboardSection({ liveMetrics }: LiveDashboardSectionProps) {
  const metricColors: Record<string, string> = {
    'cumulative-treated': '#3b82f6',
    'daily-volume': '#f59e0b',
    'water-quality': '#10b981',
    'energy-solar': '#f97316',
  }

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden" aria-label="Live impact metrics dashboard">
      {/* Solid deep background */}
      <div className="absolute inset-0 bg-slate-950" />

      {/* Subtle atmospheric orb */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-slate-500/4 blur-[120px]" />

      {/* Subtle grid texture */}
      <ShaderBackground variant="slate" opacity={0.4} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-slate-400/80 text-sm font-mono tracking-widest uppercase mb-4">
            Measurable Impact
          </p>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
            {liveMetrics.title}
          </h2>
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            <span className="text-sm">
              {liveMetrics.subtitle} — since {liveMetrics.sinceDate}
            </span>
          </div>
        </div>

        {/* Auto-scrolling carousel */}
        <div className="relative" aria-live="polite">
          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-r from-transparent to-slate-950 z-10 pointer-events-none" />

          <AutoScrollCarousel metrics={liveMetrics.metrics} colors={metricColors} />
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center mt-8 gap-1.5">
          {liveMetrics.metrics.map((metric) => (
            <div
              key={metric.id}
              className="w-1.5 h-1.5 rounded-full bg-white/20"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
