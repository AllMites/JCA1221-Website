import { useParams, Link } from 'react-router-dom'
import { Phone, Mail, Linkedin, Download } from 'lucide-react'
import { PageSEO } from '@/components/PageSEO'
import { PageSkeleton } from '@/components/PageSkeleton'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { useTeamMemberBySlug } from '@/hooks/use-content'
import { buildVCard, vcardFilename } from '@/lib/vcard'
import type { TeamMember } from '@/lib/content-types'

// Digital business card behind the team's NFC calling cards
// (jca1221.com/team/<slug>). Not linked from the site; noindex via PageSEO
// and the X-Robots-Tag header in netlify.toml.

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((w) => w[0]).filter((c) => /[A-Za-z]/.test(c)).slice(0, 2).join('').toUpperCase()
}

function saveContact(member: TeamMember, email: string | null) {
  const vcard = buildVCard({
    name: member.name,
    role: member.role,
    credentials: member.credentials,
    phone: member.phone,
    email,
    url: `https://jca1221.com/team/${member.slug}`,
  })
  const href = URL.createObjectURL(new Blob([vcard], { type: 'text/vcard;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = href
  a.download = vcardFilename(member.name)
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(href), 1000)
}

const actionClass =
  'flex items-center justify-center gap-2 w-full h-12 rounded-full text-sm font-medium font-heading border transition-colors'
const primaryAction = `${actionClass} text-white bg-blue-600 hover:bg-blue-700 border-blue-600`
const secondaryAction = `${actionClass} text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10`

export function CardPage() {
  const { slug = '' } = useParams()
  const { member, loading } = useTeamMemberBySlug(slug)

  if (loading) return <PageSkeleton />
  if (!member) return <NotFoundPage />

  const emailLink = member.links?.find((l) => l.type === 'email') ?? null
  const email = emailLink ? emailLink.url.replace(/^mailto:/, '') : null
  const linkedin = member.links?.find((l) => l.type === 'linkedin') ?? null

  return (
    <>
      <PageSEO title={`${member.name} — JCA 1221 Holdings`} description={member.role} noIndex />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center px-4 py-8">
        <Link to="/" className="mb-8" aria-label="JCA 1221 Holdings home">
          <img src="/logo-nav.png" alt="JCA 1221 Holdings" className="h-9 w-auto" />
        </Link>

        <main className="w-full max-w-[420px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-white/10 shadow-sm p-6">
          <div className="flex flex-col items-center text-center">
            {member.photo ? (
              <img
                src={member.photo}
                alt={member.name}
                className="w-28 h-28 rounded-full object-cover object-top border-4 border-white dark:border-slate-800 shadow"
              />
            ) : (
              <div className="w-28 h-28 rounded-full flex items-center justify-center bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-3xl font-heading font-bold">
                {initials(member.name)}
              </div>
            )}

            <h1 className="mt-4 text-2xl font-heading font-bold text-slate-900 dark:text-white">{member.name}</h1>
            {member.credentials && (
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
                {member.credentials}
              </p>
            )}
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{member.role}</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">JCA 1221 Holdings</p>
          </div>

          <div className="mt-6 space-y-3">
            {member.phone && (
              <a href={`tel:${member.phone}`} className={primaryAction}>
                <Phone size={16} /> Call {member.phone}
              </a>
            )}
            {emailLink && email && (
              <a href={emailLink.url} className={member.phone ? secondaryAction : primaryAction}>
                <Mail size={16} /> {email}
              </a>
            )}
            {linkedin && (
              <a href={linkedin.url} target="_blank" rel="noopener noreferrer" className={secondaryAction}>
                <Linkedin size={16} /> LinkedIn
              </a>
            )}
            <button type="button" onClick={() => saveContact(member, email)} className={secondaryAction}>
              <Download size={16} /> Save contact
            </button>
          </div>
        </main>

        <Link to="/" className="mt-8 text-xs text-slate-400 hover:text-blue-600 transition-colors">
          JCA 1221 Holdings · jca1221.com
        </Link>
      </div>
    </>
  )
}
