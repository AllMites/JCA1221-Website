import { useState, useEffect } from 'react'
import { WifiOff, RefreshCw } from 'lucide-react'

/**
 * NetworkStatus — shows a persistent banner when the user goes offline.
 * Listens to window online/offline events and navigator.onLine.
 */
export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setDismissed(false)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setDismissed(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Periodic check in case events aren't reliable
    const interval = setInterval(() => {
      const current = navigator.onLine
      if (current !== isOnline) {
        setIsOnline(current)
        if (current) setDismissed(false)
      }
    }, 5000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [isOnline])

  // Show nothing when online or when user dismissed
  if (isOnline || dismissed) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className="sticky top-0 z-[60] w-full bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300 truncate">
            You appear to be offline. Changes will be saved locally.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-500/15 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-xs text-amber-500 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-200 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
