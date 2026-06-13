// src/sections/home/components/MissionPillars.tsx
import { ScrollReveal, RevealItem } from '@/components/ScrollReveal'

interface Pillar {
  title: string
  description: string
}

interface MissionPillarsProps {
  tagline: string
  taglineSub: string
  pillars: Pillar[]
}

const DEFAULT_PILLARS: Pillar[] = [
  {
    title: 'Stewardship',
    description:
      "We don't own the land or water — we restore what's been damaged, for the next generation.",
  },
  {
    title: 'Ingenuity',
    description:
      'Filipino-engineered solutions that cost 60% less than conventional infrastructure — built to last.',
  },
  {
    title: 'Partnership',
    description:
      'We work with, not for — LGUs, communities, and the private sector share ownership.',
  },
]

function NeumorphicPillarCard({ pillar }: { pillar: Pillar }) {
  return (
    <div
      className="group p-6 sm:p-8 rounded-2xl cursor-pointer select-none transition-all duration-200
        bg-white/60 dark:bg-slate-800/60
        shadow-[3px_3px_8px_rgba(0,0,0,0.06),-2px_-2px_6px_rgba(255,255,255,0.9)]
        dark:shadow-[3px_3px_8px_rgba(0,0,0,0.4),-2px_-2px_6px_rgba(255,255,255,0.03)]
        hover:shadow-[4px_4px_12px_rgba(0,0,0,0.08),-2px_-2px_8px_rgba(255,255,255,1)]
        dark:hover:shadow-[4px_4px_12px_rgba(0,0,0,0.5),-2px_-2px_8px_rgba(255,255,255,0.04)]
        active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.08),inset_-1px_-1px_3px_rgba(255,255,255,0.6)]
        dark:active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]"
    >
      <h3 className="font-bold font-heading text-lg text-slate-800 dark:text-slate-200 mb-2">
        {pillar.title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {pillar.description}
      </p>
    </div>
  )
}

export function MissionPillars({ tagline, taglineSub, pillars }: MissionPillarsProps) {
  const displayPillars = pillars.length >= 3 ? pillars : DEFAULT_PILLARS

  return (
    <section className="py-20 sm:py-28 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mission statement */}
        <ScrollReveal direction="up">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-slate-900 dark:text-white mb-4 tracking-tight">
              &ldquo;{tagline}&rdquo;
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {taglineSub}
            </p>
          </div>
        </ScrollReveal>

        {/* Pillar cards */}
        <ScrollReveal staggerChildren={0.1} viewportMargin="-40px 0px" className="grid md:grid-cols-3 gap-6">
          {displayPillars.map((pillar) => (
            <RevealItem key={pillar.title}>
              <NeumorphicPillarCard pillar={pillar} />
            </RevealItem>
          ))}
        </ScrollReveal>
      </div>
    </section>
  )
}
