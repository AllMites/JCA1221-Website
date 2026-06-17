import type { ContactAndPartnershipsProps } from '../types'
import { ContactForm } from './ContactForm'
import { ContactInfoPanel } from './ContactInfoPanel'
import { ShaderBackground } from '../../shared/ShaderBackground'
import { ScrollReveal } from '../../shared/ScrollReveal'

export function ContactView({
  sectionTitle,
  sectionSubtitle,
  formConfig,
  inquiryTypes,
  timelineOptions,
  teamContacts,
  officeInfo,
  partnerLogos,
  onSubmitBasic,
  onSubmitDetailed,
}: ContactAndPartnershipsProps) {
  return (
    <div className="relative">
      {/* Background — light in light mode, dark gradient in dark mode */}
      <div className="fixed inset-0 -z-10 bg-slate-50 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900/95 dark:to-slate-950" />

      {/* Grid texture */}
      <ShaderBackground variant="dark" opacity={0.7} />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        {/* Section header */}
        <ScrollReveal direction="up">
          <div className="text-center mb-16">
            <p className="text-blue-600 dark:text-blue-300/70 text-sm font-mono tracking-widest uppercase mb-4">
              Start the Conversation
            </p>
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-slate-900 dark:text-white mb-4">
              {sectionTitle}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">
              {sectionSubtitle}
            </p>
          </div>
        </ScrollReveal>

        {/* Split panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 lg:gap-10 items-start">
          {/* Left: Form */}
          <ScrollReveal direction="up">
            <div>
              <ContactForm
                formConfig={formConfig}
                inquiryTypes={inquiryTypes}
                timelineOptions={timelineOptions}
                onSubmitBasic={onSubmitBasic}
                onSubmitDetailed={onSubmitDetailed}
              />
            </div>
          </ScrollReveal>

          {/* Right: Contact info + trust signals */}
          <ScrollReveal direction="left">
            <div className="lg:sticky lg:top-24">
              <ContactInfoPanel
                officeInfo={officeInfo}
                teamContacts={teamContacts}
                partnerLogos={partnerLogos}
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
