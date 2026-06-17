import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, User, Building2 } from 'lucide-react'
import { GlassPill } from '../../shared/GlassPill'
import { ScrollReveal, RevealItem } from '../../shared/ScrollReveal'
import type {
  OfficeInfo,
  TeamContact,
  PartnerLogo,
} from '../types'
// ─── Shared card surface classes ─────────────────────────────────────────────
const cardSurface =
  'p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.03),0_0_0_1px_rgba(0,0,0,0.01)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.06),0_0_0_1px_rgba(255,255,255,0.02)]'

const iconBox =
  'w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-400/20 flex items-center justify-center'

const iconClass = 'w-4 h-4 text-blue-600 dark:text-blue-300'

const cardTitle = 'text-sm font-heading font-semibold text-slate-900 dark:text-white'

// ─── Office Card ─────────────────────────────────────────────────────────────
interface OfficeCardProps {
  office: OfficeInfo
}

function OfficeCard({ office }: OfficeCardProps) {
  return (
    <div className={cardSurface}>
      <div className="flex items-center gap-3 mb-4">
        <div className={iconBox}>
          <MapPin className={iconClass} />
        </div>
        <h4 className={cardTitle}>Office</h4>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{office.address}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{office.city}</p>
          </div>
        </div>
        <a
          href={`mailto:${office.email}`}
          className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
        >
          <Mail className="w-4 h-4 flex-shrink-0" />
          {office.email}
        </a>
        <div className="flex items-center gap-3 text-sm text-slate-400 dark:text-slate-500">
          <Clock className="w-4 h-4 flex-shrink-0" />
          {office.hoursNote}
        </div>
      </div>

      {/* Map placeholder */}
      <div className="mt-4 h-32 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 flex items-center justify-center overflow-hidden relative group cursor-pointer">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.06),transparent)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)]" />
        <div className="relative z-10 text-center">
          <MapPin className="w-5 h-5 text-blue-400/60 mx-auto mb-1" />
          <span className="text-xs text-slate-400 dark:text-slate-500">View on Google Maps</span>
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
    <div className={cardSurface}>
      <div className="flex items-center gap-4 mb-3">
        {/* Avatar placeholder */}
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-500/20 dark:to-cyan-500/20 border border-blue-200 dark:border-blue-400/20 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-300" />
        </div>
        <div>
          <h5 className="text-sm font-heading font-semibold text-slate-900 dark:text-white leading-tight">
            {contact.name}
          </h5>
          <p className="text-xs text-slate-500 dark:text-slate-400">{contact.title}</p>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        <a
          href={`mailto:${contact.email}`}
          className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
        >
          <Mail className="w-3 h-3" />
          {contact.email}
        </a>
        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
          >
            <Phone className="w-3 h-3" />
            {contact.phone}
          </a>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {contact.inquiryCategories.map((cat) => (
          <GlassPill
            key={cat}
            className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-400/15 text-blue-600 dark:text-blue-300/70"
          >
            {cat}
          </GlassPill>
        ))}
      </div>
    </div>
  )
}

// ─── Partner Logos ──────────────────────────────────────────────────────────
interface PartnerLogosProps {
  logos: PartnerLogo[]
}

function PartnerLogoImage({ src, name }: { src: string; name: string }) {
  const [errored, setErrored] = useState(false)
  if (errored) {
    return (
      <span className="text-[9px] text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400 text-center leading-tight transition-colors font-mono">
        {name}
      </span>
    )
  }
  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setErrored(true)}
      className="max-w-full max-h-full object-contain"
    />
  )
}

function PartnerLogos({ logos }: PartnerLogosProps) {
  return (
    <div className={cardSurface}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-400/20 flex items-center justify-center">
          <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-300" />
        </div>
        <h4 className={cardTitle}>Trusted By</h4>
      </div>

      <ScrollReveal staggerChildren={0.06}>
        <div className="grid grid-cols-3 gap-3">
          {logos.map((logo) => (
            <RevealItem key={logo.name}>
              <div
                className="aspect-[3/2] rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 flex items-center justify-center p-3 grayscale hover:grayscale-0 hover:border-slate-300 dark:hover:border-white/15 transition-all duration-300 cursor-default group"
                title={logo.name}
              >
                <PartnerLogoImage src={logo.imageUrl} name={logo.name} />
              </div>
            </RevealItem>
          ))}
        </div>
      </ScrollReveal>
    </div>
  )
}

// ─── Contact Info Panel (Composer) ──────────────────────────────────────────
interface ContactInfoPanelProps {
  officeInfo: OfficeInfo
  teamContacts: TeamContact[]
  partnerLogos: PartnerLogo[]
}

export function ContactInfoPanel({
  officeInfo,
  teamContacts,
  partnerLogos,
}: ContactInfoPanelProps) {
  return (
    <div className="space-y-4">
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
    </div>
  )
}
