import type { ValuePillar, SectionColor, GlassTint } from '@/../product/sections/about-and-mission/types'
import { ShieldCheck, RefreshCw, HeartHandshake, Trophy } from 'lucide-react'
import { ShaderBackground } from '@/components/ShaderBackground'
import type { ShaderVariant } from '@/components/ShaderBackground'

interface ValuePillarSectionProps {
  pillar: ValuePillar
  index: number
}

// lucide-react icon lookup
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  ShieldCheck,
  RefreshCw,
  HeartHandshake,
  Trophy,
}

// Section background colors
const SECTION_BG: Record<SectionColor, string> = {
  amber:
    'bg-gradient-to-b from-amber-50/80 via-amber-50/30 to-white dark:from-amber-950/40 dark:via-amber-950/15 dark:to-slate-950',
  emerald:
    'bg-gradient-to-b from-emerald-50/80 via-emerald-50/30 to-white dark:from-emerald-950/40 dark:via-emerald-950/15 dark:to-slate-950',
  blue:
    'bg-gradient-to-b from-blue-50/80 via-blue-50/30 to-white dark:from-blue-950/40 dark:via-blue-950/15 dark:to-slate-950',
  slate:
    'bg-gradient-to-b from-slate-100 via-slate-50/60 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black',
}

// Section top accent line
const SECTION_LINE: Record<SectionColor, string> = {
  amber: 'from-transparent via-amber-400/40 dark:via-amber-600/30 to-transparent',
  emerald: 'from-transparent via-emerald-400/40 dark:via-emerald-600/30 to-transparent',
  blue: 'from-transparent via-blue-400/40 dark:via-blue-600/30 to-transparent',
  slate: 'from-transparent via-amber-400/30 dark:via-amber-600/20 to-transparent',
}

// Glass card tint based on pillar's glassTint
const GLASS_TINT: Record<GlassTint, string> = {
  amber: 'bg-amber-50/50 dark:bg-amber-900/20 border-amber-200/30 dark:border-amber-700/20',
  emerald: 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200/30 dark:border-emerald-700/20',
  blue: 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200/30 dark:border-blue-700/20',
}

// Colored shadow by tint
const GLASS_SHADOW: Record<GlassTint, string> = {
  amber: 'shadow-[0_4px_24px_rgba(245,158,11,0.06)] dark:shadow-[0_4px_24px_rgba(245,158,11,0.04)]',
  emerald: 'shadow-[0_4px_24px_rgba(16,185,129,0.06)] dark:shadow-[0_4px_24px_rgba(16,185,129,0.04)]',
  blue: 'shadow-[0_4px_24px_rgba(59,130,246,0.08)] dark:shadow-[0_4px_24px_rgba(59,130,246,0.04)]',
}

// Icon container tint
const ICON_TINT: Record<GlassTint, string> = {
  amber: 'bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
  emerald: 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
  blue: 'bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
}

// Section color → shader variant
const SECTION_SHADER: Record<SectionColor, ShaderVariant> = {
  amber: 'amber',
  emerald: 'emerald',
  blue: 'blue',
  slate: 'slate',
}

export function ValuePillarSection({ pillar, index }: ValuePillarSectionProps) {
  const IconComponent = ICON_MAP[pillar.icon] ?? Trophy
  const isEven = index % 2 === 0

  return (
    <section className={`relative py-20 sm:py-28 overflow-hidden ${SECTION_BG[pillar.sectionColor]}`}>
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${SECTION_LINE[pillar.sectionColor]} opacity-0`} style={{ opacity: 1 }} />

      <ShaderBackground variant={SECTION_SHADER[pillar.sectionColor]} opacity={0.4} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-10 lg:gap-16 items-center lg:items-start`}>
          {/* Left/Right: Pillar header — glass card */}
          <div className="lg:w-[380px] shrink-0">
            <div
              className={`sticky top-28 rounded-2xl backdrop-blur-xl border border-white/20 dark:border-white/10 ${GLASS_SHADOW[pillar.glassTint]} ${GLASS_TINT[pillar.glassTint]} p-8 transition-all duration-500`}
            >
              {/* Icon */}
              <div className={`mb-5 w-14 h-14 rounded-2xl flex items-center justify-center shadow-[inset_1px_1px_3px_rgba(255,255,255,0.5),inset_-1px_-1px_2px_rgba(0,0,0,0.04)] ${ICON_TINT[pillar.glassTint]}`}>
                <IconComponent size={26} />
              </div>

              {/* Title */}
              <h2 className="font-bold font-heading text-2xl text-slate-900 dark:text-white mb-4 leading-tight">
                {pillar.title}
              </h2>

              {/* Description */}
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {pillar.description}
              </p>
            </div>
          </div>

          {/* Right/Left: Stacked sub-point glass cards */}
          <div className="flex-1 flex flex-col gap-4 w-full">
            {pillar.subPoints.map((point) => (
              <div
                key={point.title}
                className="rounded-2xl backdrop-blur-lg border border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-300 p-6 sm:p-8"
              >
                <h3 className="font-bold font-heading text-base text-slate-900 dark:text-white mb-2">
                  {point.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300/30 dark:via-slate-700/20 to-transparent" />
    </section>
  )
}
