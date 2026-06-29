import type { TeamViewProps } from '@/../product/sections/team/types'
import { TeamMemberCard } from './TeamMemberCard'
import { ShaderBackground } from '@/components/ShaderBackground'
import { ScrollReveal, RevealItem } from '@/components/ScrollReveal'
import { Users } from 'lucide-react'

export function TeamView({ sectionTitle, sectionSubtitle, members }: TeamViewProps) {
  return (
    <div className="font-body">
      {/* Header section */}
      <section className="relative py-16 sm:py-20 overflow-hidden bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/20 dark:to-slate-950">
        <ShaderBackground variant="blue" opacity={0.4} />

        <ScrollReveal direction="up">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 mb-6">
              <Users size={24} className="text-blue-600 dark:text-blue-400" />
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

      {/* Team member cards */}
      <section className="relative py-16 sm:py-20 bg-white dark:bg-slate-950">
        <ShaderBackground variant="light" opacity={0.3} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal staggerChildren={0.08} viewportMargin="-60px 0px">
            <div className="space-y-6">
              {members
                .sort((a, b) => a.order - b.order)
                .map((member, i) => (
                  <RevealItem key={member.id}>
                    <TeamMemberCard member={member} index={i} />
                  </RevealItem>
                ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative py-16 sm:py-20 overflow-hidden bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/30 dark:to-slate-950">
        <ShaderBackground variant="light" opacity={0.2} />

        <ScrollReveal direction="up">
          <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white mb-3">
              Join the Mission
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
              We are always looking for engineers, scientists, and operators who want to build
              environmental infrastructure that actually works — for communities, for ecosystems,
              for the next generation.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium font-heading rounded-full text-white bg-blue-500/80 hover:bg-blue-500/90 backdrop-blur-md border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.18)] transition-all duration-300"
            >
              Contact Us
            </a>
          </div>
        </ScrollReveal>
      </section>
    </div>
  )
}
