import { ArrowDown, Droplets } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { HeroContent } from '../types'

interface HeroSectionProps {
  hero: HeroContent
  onCtaClick?: () => void
  onShellReveal?: () => void
  onShellHide?: () => void
}

export function HeroSection({ hero, onCtaClick, onShellReveal, onShellHide }: HeroSectionProps) {
  const edgeTimer = useRef<ReturnType<typeof setTimeout>>()

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.clientY <= 64) {
      clearTimeout(edgeTimer.current)
      onShellReveal?.()
    } else {
      edgeTimer.current = setTimeout(() => onShellHide?.(), 300)
    }
  }

  useEffect(() => {
    return () => clearTimeout(edgeTimer.current)
  }, [])

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Water background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900" />

      {/* Animated water gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[120%] aspect-square rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.4) 0%, rgba(30,64,175,0.2) 40%, transparent 70%)',
            animation: 'pulse-water 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-1/3 -left-1/4 w-[80%] aspect-square rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.2) 0%, transparent 60%)',
            animation: 'pulse-water 10s ease-in-out infinite 2s',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[60%] aspect-square rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.3) 0%, rgba(6,182,212,0.15) 40%, transparent 70%)',
            animation: 'pulse-water 12s ease-in-out infinite 5s',
          }}
        />

        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }} />
      </div>

      {/* Shell edge detection zone (invisible) */}
      <div className="fixed top-0 left-0 right-0 h-16 z-50 pointer-events-none" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Water droplet icon */}
        <div className="mb-8 flex justify-center animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <div className="p-4 rounded-full bg-blue-500/20 backdrop-blur-sm ring-1 ring-blue-400/30">
            <Droplets size={36} className="text-blue-400" strokeWidth={1.5} />
          </div>
        </div>

        {/* Site name */}
        <p
          className="text-sm font-medium font-heading uppercase tracking-[0.25em] text-blue-300 mb-6 animate-fade-in-up"
          style={{ animationDelay: '150ms' }}
        >
          {hero.siteName}
        </p>

        {/* Tagline */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-heading text-white tracking-tight leading-[0.95] mb-8 animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          {hero.tagline}
        </h1>

        {/* Description */}
        <p
          className="text-lg sm:text-xl text-blue-200/80 max-w-2xl mx-auto leading-relaxed mb-12 animate-fade-in-up"
          style={{ animationDelay: '450ms' }}
        >
          {hero.description}
        </p>

        {/* CTA */}
        <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <button
            onClick={onCtaClick}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 font-semibold font-heading rounded-full hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] transition-all duration-300"
          >
            {hero.ctaLabel}
            <ArrowDown
              size={18}
              className="group-hover:translate-y-0.5 transition-transform duration-300"
            />
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
          <div className="w-1 h-2.5 rounded-full bg-white/40 animate-scroll-dot" />
        </div>
      </div>

      <style>{`
        @keyframes pulse-water {
          0%, 100% { transform: translate(-50%, 0) scale(1); }
          50% { transform: translate(-50%, -2%) scale(1.05); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scroll-dot {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(8px); opacity: 1; }
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-scroll-dot {
          animation: scroll-dot 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}
