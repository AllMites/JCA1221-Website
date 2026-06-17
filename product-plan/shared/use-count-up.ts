import { useEffect, useState, useRef } from 'react'

interface UseCountUpOptions {
  /** Target number to count to */
  target: number
  /** Animation duration in ms (default 2000) */
  duration?: number
  /** Start counting when this becomes true */
  enabled: boolean
}

export function useCountUp({ target, duration = 2000, enabled }: UseCountUpOptions) {
  const [count, setCount] = useState(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return

    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        setCount(target)
      }
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [target, duration, enabled])

  return count
}
