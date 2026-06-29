import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: string
  children: React.ReactNode
  /** Position relative to the trigger element */
  position?: 'top' | 'bottom' | 'left' | 'right'
  /** Optional delay before showing (ms) */
  delay?: number
  className?: string
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const triggerRef = useRef<HTMLSpanElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay)
  }

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800 dark:border-t-slate-200',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-slate-800 dark:border-b-slate-200',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-slate-800 dark:border-l-slate-200',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-slate-800 dark:border-r-slate-200',
  }

  return (
    <span
      ref={triggerRef}
      className={cn('relative inline cursor-help border-b border-dotted border-slate-400 dark:border-slate-500', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={cn(
            'absolute z-50 px-3 py-2 text-xs font-body leading-relaxed rounded-lg shadow-lg pointer-events-none whitespace-nowrap',
            'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900',
            'animate-fade-in',
            positionClasses[position],
          )}
        >
          {content}
          <span className={cn('absolute w-0 h-0', arrowClasses[position])} />
        </span>
      )}
    </span>
  )
}
