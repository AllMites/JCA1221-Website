import { MapPin, Phone, Mail, Clock, User, Building2, ArrowDown, Paperclip } from 'lucide-react'
import type {
  OfficeInfo,
  TeamContact,
  PartnerLogo,
  DownloadableResource,
  SchedulingInfo,
} from '../types'

interface OfficeCardProps {
  office: OfficeInfo
}

function OfficeCard({ office }: OfficeCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-400/20 flex items-center justify-center">
          <MapPin className="w-4 h-4 text-blue-300" />
        </div>
        <h4 className="text-sm font-heading font-semibold text-white">Office</h4>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-slate-300 leading-relaxed">{office.address}</p>
            <p className="text-xs text-slate-500 mt-0.5">{office.city}</p>
          </div>
        </div>
        <a
          href={`tel:${office.phone}`}
          className="flex items-center gap-3 text-sm text-slate-400 hover:text-blue-300 transition-colors"
        >
          <Phone className="w-4 h-4 flex-shrink-0" />
          {office.phone}
        </a>
        <a
          href={`mailto:${office.email}`}
          className="flex items-center gap-3 text-sm text-slate-400 hover:text-blue-300 transition-colors"
        >
          <Mail className="w-4 h-4 flex-shrink-0" />
          {office.email}
        </a>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Clock className="w-4 h-4 flex-shrink-0" />
          {office.hoursNote}
        </div>
      </div>

      {/* Map placeholder */}
      <div className="mt-4 h-32 rounded-xl bg-slate-800/60 border border-white/5 flex items-center justify-center overflow-hidden relative group cursor-pointer">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)]" />
        <div className="relative z-10 text-center">
          <MapPin className="w-5 h-5 text-blue-400/60 mx-auto mb-1" />
          <span className="text-xs text-slate-500">View on Google Maps</span>
        </div>
      </div>
    </div>
  )
}

// ─── Team Contact Card ──────────────────────────────────────────────────────
interface TeamContactCardProps {
  contact: TeamContact
}

function TeamContactCard({ contact }: TeamContactCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-blue-400/20 transition-all duration-300 group">
      <div className="flex items-center gap-4 mb-3">
        {/* Avatar placeholder */}
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/20 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-blue-300" />
        </div>
        <div>
          <h5 className="text-sm font-heading font-semibold text-white leading-tight">
            {contact.name}
          </h5>
          <p className="text-xs text-slate-400">{contact.title}</p>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        <a
          href={`mailto:${contact.email}`}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-blue-300 transition-colors"
        >
          <Mail className="w-3 h-3" />
          {contact.email}
        </a>
        <a
          href={`tel:${contact.phone}`}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-blue-300 transition-colors"
        >
          <Phone className="w-3 h-3" />
          {contact.phone}
        </a>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {contact.inquiryCategories.map((cat) => (
          <span
            key={cat}
            className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-blue-500/10 border border-blue-400/15 text-blue-300/70"
          >
            {cat}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Partner Logos ──────────────────────────────────────────────────────────
interface PartnerLogosProps {
  logos: PartnerLogo[]
}

function PartnerLogos({ logos }: PartnerLogosProps) {
  return (
    <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-400/20 flex items-center justify-center">
          <Building2 className="w-4 h-4 text-amber-300" />
        </div>
        <h4 className="text-sm font-heading font-semibold text-white">Trusted By</h4>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {logos.map((logo) => (
          <div
            key={logo.name}
            className="aspect-[3/2] rounded-xl bg-slate-800/40 border border-white/5 flex items-center justify-center p-3 grayscale hover:grayscale-0 hover:border-white/15 transition-all duration-300 cursor-default group"
            title={logo.name}
          >
            <span className="text-[9px] text-slate-500 group-hover:text-slate-400 text-center leading-tight transition-colors font-mono">
              {logo.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Download PDF CTA ───────────────────────────────────────────────────────
interface DownloadCTAProps {
  resource: DownloadableResource
  onDownload?: () => void
}

function DownloadCTA({ resource, onDownload }: DownloadCTAProps) {
  return (
    <button
      onClick={() => onDownload?.()}
      className="w-full text-left p-5 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-blue-400/25 transition-all duration-300 group"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/25 transition-colors">
          <ArrowDown className="w-5 h-5 text-blue-300" />
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="text-sm font-heading font-semibold text-white mb-1 group-hover:text-blue-200 transition-colors">
            {resource.title}
          </h5>
          <p className="text-xs text-slate-400 leading-relaxed mb-2">
            {resource.description}
          </p>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
            <Paperclip className="w-3 h-3" />
            {resource.fileName} ({resource.fileSize})
          </span>
        </div>
      </div>
    </button>
  )
}

// ─── Schedule Call CTA ──────────────────────────────────────────────────────
interface ScheduleCTAProps {
  scheduling: SchedulingInfo
  onSchedule?: () => void
}

function ScheduleCTA({ scheduling, onSchedule }: ScheduleCTAProps) {
  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-lg border border-blue-400/20">
      <h5 className="text-sm font-heading font-semibold text-white mb-1.5">
        {scheduling.title}
      </h5>
      <p className="text-xs text-slate-400 leading-relaxed mb-4">
        {scheduling.description}
      </p>
      <button
        onClick={() => onSchedule?.()}
        className="w-full px-5 py-3 text-sm font-heading font-semibold rounded-full text-white bg-blue-500/80 hover:bg-blue-500/90 active:bg-blue-600/90 backdrop-blur-md border border-white/20 shadow-[0_4px_16px_rgba(59,130,246,0.25),0_1px_3px_rgba(59,130,246,0.15)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.35)] transition-all duration-300"
      >
        {scheduling.ctaText}
      </button>
    </div>
  )
}

// ─── Contact Info Panel (Composer) ──────────────────────────────────────────
interface ContactInfoPanelProps {
  officeInfo: OfficeInfo
  teamContacts: TeamContact[]
  partnerLogos: PartnerLogo[]
  downloadableResource: DownloadableResource
  schedulingInfo: SchedulingInfo
  onDownloadPDF?: () => void
  onScheduleCall?: () => void
}

export function ContactInfoPanel({
  officeInfo,
  teamContacts,
  partnerLogos,
  downloadableResource,
  schedulingInfo,
  onDownloadPDF,
  onScheduleCall,
}: ContactInfoPanelProps) {
  return (
    <div className="space-y-4">
      {/* Schedule CTA — prominent at top */}
      <ScheduleCTA scheduling={schedulingInfo} onSchedule={onScheduleCall} />

      {/* Office info */}
      <OfficeCard office={officeInfo} />

      {/* Team contacts */}
      <div className="space-y-3">
        {teamContacts.map((contact) => (
          <TeamContactCard key={contact.id} contact={contact} />
        ))}
      </div>

      {/* Partner logos */}
      <PartnerLogos logos={partnerLogos} />

      {/* Download PDF */}
      <DownloadCTA resource={downloadableResource} onDownload={onDownloadPDF} />
    </div>
  )
}
