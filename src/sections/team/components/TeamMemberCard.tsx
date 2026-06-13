import { Mail, Linkedin, Quote } from 'lucide-react'
import type { TeamMember } from '@/../product/sections/team/types'

interface TeamMemberCardProps {
  member: TeamMember
  index: number
}

export function TeamMemberCard({ member, index }: TeamMemberCardProps) {
  const isEven = index % 2 === 0

  return (
    <div
      className={`group relative rounded-2xl backdrop-blur-xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_40px_rgba(59,130,246,0.12)] dark:hover:shadow-[0_8px_40px_rgba(59,130,246,0.06)] transition-all duration-300 overflow-hidden ${
        isEven ? 'md:flex-row' : 'md:flex-row-reverse'
      }`}
    >
      {/* Photo */}
      <div className="md:w-64 shrink-0 relative overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950/30 dark:to-slate-900">
        <div className="aspect-[3/4] md:aspect-auto md:h-full relative">
          {/* Gradient placeholder */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-blue-500/10 to-slate-800/20 dark:from-blue-600/20 dark:via-blue-700/10 dark:to-slate-900" />
          {/* Profile image — only render when photo exists */}
          {member.photo && (
            <img
              src={member.photo}
              alt={member.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          )}
          {/* Gradient overlay for consistent look */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
        {/* Name + Role */}
        <div className="mb-3">
          <h3 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white mb-1">
            {member.name}
          </h3>
          {member.credentials && (
            <span className="text-xs font-medium font-heading text-blue-600 dark:text-blue-400 uppercase tracking-wide mr-2">
              {member.credentials}
            </span>
          )}
          <p className="text-sm font-semibold font-heading text-blue-600 dark:text-blue-400">
            {member.role}
          </p>
        </div>

        {/* Bio */}
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          {member.bio}
        </p>

        {/* Quote */}
        {member.quote && (
          <div className="mb-4 pl-4 border-l-2 border-amber-400/60 dark:border-amber-500/40">
            <Quote size={14} className="text-amber-400 dark:text-amber-500 mb-1 opacity-50" />
            <p className="text-sm italic text-slate-500 dark:text-slate-400 leading-relaxed">
              "{member.quote}"
            </p>
          </div>
        )}

        {/* Expertise tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {member.expertise.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 text-xs font-medium font-heading rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100/50 dark:border-blue-800/30"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Contact links */}
        {member.links && member.links.length > 0 && (
          <div className="flex gap-3">
            {member.links.map((link) => (
              <a
                key={link.type}
                href={link.url}
                target={link.type === 'email' ? undefined : '_blank'}
                rel={link.type === 'email' ? undefined : 'noopener noreferrer'}
                className="inline-flex items-center gap-1.5 text-xs font-medium font-heading text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {link.type === 'email' ? <Mail size={13} /> : <Linkedin size={13} />}
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
