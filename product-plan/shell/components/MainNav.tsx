import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export interface NavigationItem {
  label: string
  href: string
  isActive?: boolean
}

interface MainNavProps {
  items: NavigationItem[]
  onNavigate?: (href: string) => void
}

function NeumorphicPill({
  label,
  href,
  isActive,
  onClick,
}: {
  label: string
  href: string
  isActive?: boolean
  onClick: () => void
}) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
      className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 font-heading select-none ${
        isActive
          ? // Pressed/active: inset shadows, slightly darker bg
            'text-blue-600 dark:text-blue-400 bg-slate-100 dark:bg-slate-800 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.08),inset_-1px_-1px_3px_rgba(255,255,255,0.6)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]'
          : // Raised: offset shadows creating soft protrusion
            'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-white/40 dark:bg-slate-800/40 shadow-[3px_3px_8px_rgba(0,0,0,0.06),-2px_-2px_6px_rgba(255,255,255,0.9)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.4),-2px_-2px_6px_rgba(255,255,255,0.03)] hover:shadow-[4px_4px_12px_rgba(0,0,0,0.08),-2px_-2px_8px_rgba(255,255,255,1)] dark:hover:shadow-[4px_4px_12px_rgba(0,0,0,0.5),-2px_-2px_8px_rgba(255,255,255,0.04)]'
      }`}
    >
      {label}
    </a>
  )
}

export function MainNav({ items, onNavigate }: MainNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleClick = (href: string) => {
    setMobileOpen(false)
    onNavigate?.(href)
  }

  return (
    <>
      {/* Desktop nav — neumorphic pills */}
      <nav className="hidden md:flex items-center gap-2" role="navigation" aria-label="Main navigation">
        {items.map((item) => (
          <NeumorphicPill
            key={item.href}
            label={item.label}
            href={item.href}
            isActive={item.isActive}
            onClick={() => handleClick(item.href)}
          />
        ))}
      </nav>

      {/* Mobile hamburger — neumorphic circle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden p-2.5 rounded-full text-slate-600 dark:text-slate-400 bg-white/40 dark:bg-slate-800/40 shadow-[3px_3px_8px_rgba(0,0,0,0.06),-2px_-2px_6px_rgba(255,255,255,0.9)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.4),-2px_-2px_6px_rgba(255,255,255,0.03)] active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.08),inset_-1px_-1px_3px_rgba(255,255,255,0.6)] dark:active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] transition-all duration-200"
        aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile slide-out — glass panel */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <nav
            className="absolute top-0 right-0 w-72 h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-l border-white/20 dark:border-white/10 shadow-[-8px_0_32px_rgba(59,130,246,0.06)] p-6 pt-20 flex flex-col gap-2"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault()
                  handleClick(item.href)
                }}
                className={`px-4 py-3 text-sm font-medium rounded-full transition-all duration-200 font-heading ${
                  item.isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-slate-100 dark:bg-slate-800 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.08),inset_-1px_-1px_3px_rgba(255,255,255,0.6)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-white/40 dark:bg-slate-800/40 shadow-[3px_3px_8px_rgba(0,0,0,0.06),-2px_-2px_6px_rgba(255,255,255,0.9)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.4),-2px_-2px_6px_rgba(255,255,255,0.03)]'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
