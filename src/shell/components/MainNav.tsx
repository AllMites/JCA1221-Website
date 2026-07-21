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

function NavPill({
  label,
  href,
  isActive,
  onClick,
  block = false,
}: {
  label: string
  href: string
  isActive?: boolean
  onClick: () => void
  block?: boolean
}) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
      className={`${block ? 'block w-full' : ''} px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 font-heading select-none ${
        isActive
          ? 'text-blue-600 dark:text-blue-400 bg-slate-100 dark:bg-slate-800'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-white/40 dark:bg-slate-800/40'
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
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-2" role="navigation" aria-label="Main navigation">
        {items.map((item) => (
          <NavPill
            key={item.href}
            label={item.label}
            href={item.href}
            isActive={item.isActive}
            onClick={() => handleClick(item.href)}
          />
        ))}
      </nav>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden p-2.5 rounded-full text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 transition-all duration-200 z-50"
        aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile dropdown — sits below header bar, no fixed positioning, no z-index war */}
      {mobileOpen && (
        <nav
          className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-lg px-4 py-4 flex flex-col gap-2 z-50"
          role="navigation"
          aria-label="Mobile navigation"
        >
          {items.map((item) => (
            <NavPill
              key={item.href}
              label={item.label}
              href={item.href}
              isActive={item.isActive}
              onClick={() => handleClick(item.href)}
              block
            />
          ))}
        </nav>
      )}
    </>
  )
}
