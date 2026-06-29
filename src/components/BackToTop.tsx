import { useState, useEffect, useCallback } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const SCROLL_THRESHOLD = 300

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  const handleScroll = useCallback(() => {
    setVisible(window.scrollY > SCROLL_THRESHOLD)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    // Check initial state
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={cn(
        'fixed bottom-8 right-8 z-40',
        'w-12 h-12 rounded-full',
        'flex items-center justify-center',
        'bg-[oklch(0.546_0.245_262.881)]', // Pacific Blue (blue-600)
        'text-white',
        'shadow-[3px_3px_8px_rgba(0,0,0,0.15),-2px_-2px_6px_rgba(255,255,255,0.9)]',
        'dark:shadow-[3px_3px_8px_rgba(0,0,0,0.35),-2px_-2px_6px_rgba(255,255,255,0.05)]',
        'hover:bg-[oklch(0.488_0.243_264.376)]', // blue-700 on hover
        'transition-all duration-300 ease-in-out',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none',
      )}
    >
      <ArrowUp size={20} strokeWidth={2} />
    </button>
  )
}
