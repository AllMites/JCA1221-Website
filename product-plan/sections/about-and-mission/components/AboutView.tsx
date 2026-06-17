import type { AboutAndMissionProps } from '../types'
import { FounderLetterSection } from './FounderLetterSection'
import { ValuePillarSection } from './ValuePillarSection'
import { FounderProfileSection } from './FounderProfileSection'
import { ArrowRight } from 'lucide-react'
import { ScrollReveal, RevealItem } from '../../shared/ScrollReveal'

export function AboutView({
  founderLetter,
  founderProfile,
  valuePillars,
  ctaText,
  onCtaClick,
}: AboutAndMissionProps) {
  return (
    <div className="font-body">
      {/* 1. Founder's Letter — dark water background */}
      <ScrollReveal direction="up">
        <FounderLetterSection letter={founderLetter} />
      </ScrollReveal>

      {/* 2. Value Pillars — each its own colored section */}
      <ScrollReveal staggerChildren={0.1} viewportMargin="-40px 0px">
        {valuePillars.map((pillar, index) => (
          <RevealItem key={pillar.id}>
            <ValuePillarSection pillar={pillar} index={index} />
          </RevealItem>
        ))}
      </ScrollReveal>

      {/* 3. Founder Profile — quotes + timeline */}
      <ScrollReveal direction="up">
        <FounderProfileSection profile={founderProfile} />
      </ScrollReveal>

      {/* 4. CTA — blue-tinted glass */}
      <ScrollReveal direction="up">
        <section className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-950">
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white mb-4">
            Ready to build with integrity?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed mb-8">
            Whether you represent a municipality seeking environmental infrastructure, or an investor
            looking for measurable impact, we are ready to partner.
          </p>

          <button
            onClick={onCtaClick}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 text-base font-medium font-heading rounded-full transition-all duration-300 text-white bg-blue-500/80 hover:bg-blue-500/90 active:bg-blue-600/90 backdrop-blur-md border border-white/20 shadow-[0_4px_24px_rgba(59,130,246,0.3),0_1px_4px_rgba(59,130,246,0.15)] hover:shadow-[0_8px_32px_rgba(59,130,246,0.4),0_2px_8px_rgba(59,130,246,0.2)] active:shadow-[0_2px_12px_rgba(59,130,246,0.2)] hover:-translate-y-0.5 active:translate-y-0"
          >
            {ctaText}
            <ArrowRight size={18} />
          </button>
        </div>
        </section>
      </ScrollReveal>
    </div>
  )
}
