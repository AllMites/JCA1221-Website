import { ArrowRight } from 'lucide-react'

interface UserMenuProps {
  ctaLabel?: string
  ctaHref?: string
  onCtaClick?: () => void
}

/**
 * Glass-tinted CTA button — translucent blue with backdrop blur,
 * glass edge, and soft blue shadow. Bridges glassmorphism + neumorphism.
 */
export function UserMenu({
  ctaLabel = 'Partner With Us',
  ctaHref = '/contact',
  onCtaClick,
}: UserMenuProps) {
  return (
    <div className="flex items-center gap-3">
      <a
        href={ctaHref}
        onClick={(e) => {
          e.preventDefault()
          onCtaClick?.()
        }}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium font-heading rounded-full transition-all duration-300 text-white bg-blue-500/80 hover:bg-blue-500/90 active:bg-blue-600/90 backdrop-blur-md border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.18),0_2px_6px_rgba(0,0,0,0.2)] active:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
      >
        {ctaLabel}
        <ArrowRight size={16} />
      </a>
    </div>
  )
}
