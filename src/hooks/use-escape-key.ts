import { useEffect } from 'react'

/**
 * Hook that invokes a callback when the Escape key is pressed.
 * Useful for closing modals, drawers, dropdowns, etc.
 *
 * @param onEscape - Callback fired on Escape keydown
 * @param enabled - Whether the listener is active (default: true)
 */
export function useEscapeKey(onEscape: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Don't interfere with Radix dialogs/sheets that handle Escape internally.
        // Only fire if no dialog/sheet is currently open in the DOM.
        // We check if any [data-state="open"] dialog/sheet exists — if so, let Radix handle it.
        const openOverlay = document.querySelector(
          '[data-slot="dialog-content"][data-state="open"], [data-slot="sheet-content"][data-state="open"], [data-slot="alert-dialog-content"][data-state="open"]',
        )
        if (openOverlay) return // Radix will handle this Escape press

        onEscape()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onEscape, enabled])
}
