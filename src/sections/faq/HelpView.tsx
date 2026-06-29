import { Download, ArrowRight } from 'lucide-react'
import { FaqSection } from './components/FaqSection'
import { GlossarySection } from './components/GlossarySection'
import { ScrollReveal } from '@/components/ScrollReveal'

interface HelpViewProps {
  ctaText?: string
  onCtaClick?: () => void
}

export function HelpView({ ctaText = 'Partner With Us', onCtaClick }: HelpViewProps) {
  const handleDownloadCapability = () => {
    window.print()
  }

  return (
    <div className="font-body">
      {/* Hero Banner */}
      <ScrollReveal direction="up">
        <section className="relative py-16 sm:py-24 overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="absolute inset-0">
            <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-blue-500/5 blur-[100px]" />
            <div className="absolute bottom-20 left-1/3 w-64 h-64 rounded-full bg-slate-500/4 blur-[80px]" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-blue-600 dark:text-blue-300/80 text-sm font-mono tracking-widest uppercase mb-4">
                Help &amp; Documentation
              </p>
              <h1 className="text-3xl sm:text-5xl font-heading font-bold text-slate-900 dark:text-white mb-4">
                Everything You Need to Know
              </h1>
              <p className="text-slate-600 dark:text-slate-300/60 max-w-2xl mx-auto text-lg leading-relaxed">
                Find answers to common questions, explore key terminology, and download our capability statement for your procurement team.
              </p>
            </div>

            {/* Action Cards Row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Download Capability Statement */}
              <button
                onClick={handleDownloadCapability}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 text-base font-medium font-heading rounded-full transition-all duration-300 text-white bg-blue-500/80 hover:bg-blue-500/90 active:bg-blue-600/90 backdrop-blur-md border border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.3),0_1px_4px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2)] active:shadow-[0_2px_12px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0"
              >
                <Download size={18} />
                Download Capability Statement
              </button>

              {/* Partner CTA */}
              {onCtaClick && (
                <button
                  onClick={onCtaClick}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 text-base font-medium font-heading rounded-full transition-all duration-300 text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-md border border-slate-300 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                >
                  {ctaText}
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Print-only header */}
      <div className="hidden print:block print:px-8 print:py-6 print:mb-8 print:border-b print:border-slate-300">
        <h1 className="print:text-2xl print:font-bold print:text-slate-900">
          JCA1221 Holdings — Capability Statement
        </h1>
        <p className="print:text-sm print:text-slate-600 print:mt-2">
          Philippine environmental infrastructure: nature-based water treatment, coastal restoration, and solid waste management.
          Makati City, Metro Manila, Philippines | info@jca1221.com
        </p>
      </div>

      {/* FAQ Section */}
      <FaqSection />

      {/* Glossary Section */}
      <GlossarySection />

      {/* Bottom CTA */}
      <ScrollReveal direction="up">
        <section className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-950">
          <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center no-print">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white mb-4">
              Ready to discuss a project?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed mb-8">
              Our team is available to provide detailed technical specifications, site assessment reports, and partnership proposals tailored to your LGU or investment mandate.
            </p>

            {onCtaClick && (
              <button
                onClick={onCtaClick}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 text-base font-medium font-heading rounded-full transition-all duration-300 text-white bg-blue-500/80 hover:bg-blue-500/90 active:bg-blue-600/90 backdrop-blur-md border border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.3),0_1px_4px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2)] active:shadow-[0_2px_12px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0"
              >
                {ctaText}
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </section>
      </ScrollReveal>

      {/* Print-only footer */}
      <div className="hidden print:block print:px-8 print:py-4 print:mt-8 print:border-t print:border-slate-300 print:text-xs print:text-slate-500">
        &copy; {new Date().getFullYear()} JCA1221 Holdings. All rights reserved. | jca1221.com
      </div>
    </div>
  )
}
