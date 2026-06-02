import type { ContactAndPartnershipsProps } from '../types'
import { ContactForm } from './ContactForm'
import { ContactInfoPanel } from './ContactInfoPanel'

export function ContactView({
  sectionTitle,
  sectionSubtitle,
  formConfig,
  inquiryTypes,
  timelineOptions,
  teamContacts,
  officeInfo,
  partnerLogos,
  downloadableResource,
  schedulingInfo,
  onSubmitBasic,
  onSubmitDetailed,
  onDownloadPDF,
  onScheduleCall,
}: ContactAndPartnershipsProps) {
  return (
    <div className="relative">
      {/* Navy/slate background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-slate-950 via-slate-900/95 to-slate-950" />

      {/* Grid texture */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Atmospheric orbs */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] rounded-full bg-blue-500/4 blur-[180px]" />
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] rounded-full bg-cyan-500/3 blur-[150px]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-blue-300/70 text-sm font-mono tracking-widest uppercase mb-4">
            Start the Conversation
          </p>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-4">
            {sectionTitle}
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">
            {sectionSubtitle}
          </p>
        </div>

        {/* Split panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 lg:gap-10 items-start">
          {/* Left: Form */}
          <div>
            <ContactForm
              formConfig={formConfig}
              inquiryTypes={inquiryTypes}
              timelineOptions={timelineOptions}
              onSubmitBasic={onSubmitBasic}
              onSubmitDetailed={onSubmitDetailed}
            />
          </div>

          {/* Right: Contact info + trust signals */}
          <div className="lg:sticky lg:top-24">
            <ContactInfoPanel
              officeInfo={officeInfo}
              teamContacts={teamContacts}
              partnerLogos={partnerLogos}
              downloadableResource={downloadableResource}
              schedulingInfo={schedulingInfo}
              onDownloadPDF={onDownloadPDF}
              onScheduleCall={onScheduleCall}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
