import { AppShell } from './components/AppShell'

export default function ShellPreview() {
  const navigationItems = [
    { label: 'Home', href: '/', isActive: true },
    { label: 'About & Mission', href: '/about' },
    { label: 'Projects & Track Record', href: '/projects' },
    { label: 'Contact & Partnerships', href: '/contact' },
  ]

  const sidebarAnchors = [
    { label: 'Our Story', href: '#story', isActive: true },
    { label: 'Mission & Values', href: '#mission' },
    { label: 'Leadership', href: '#leadership' },
    { label: 'Zero Corruption Pledge', href: '#integrity' },
  ]

  const handleNavigate = (href: string) => {
    console.log('Navigate to:', href)
  }

  const handleCtaClick = () => {
    console.log('CTA clicked — Partner With Us')
  }

  return (
    <AppShell
      siteName="JCA 1221 Holdings"
      navigationItems={navigationItems}
      sidebarAnchors={sidebarAnchors}
      ctaLabel="Partner With Us"
      ctaHref="/contact"
      onNavigate={handleNavigate}
      onCtaClick={handleCtaClick}
    >
      <div className="flex justify-center">
        <div className="space-y-8 max-w-2xl w-full">
          <section id="story">
            <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-white mb-4">
              About JCA 1221 Holdings
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              We are a Philippine environmental infrastructure company that designs,
              builds, and operates water reclamation and solid waste management
              facilities. Founded in 2016, we bring scalable, nature-mimicking
              technology to communities that need it most.
            </p>
          </section>

          <section id="mission" className="pt-4">
            <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-3">
              Mission & Values
            </h2>
            <div className="flex flex-col gap-4">
              {[
                { title: 'Serbisyo, Hindi Negosyo', desc: 'Service, not business — we temper profitability to keep services affordable.' },
                { title: 'Zero Corruption', desc: 'Absolute intolerance for corruption in every engagement and partnership.' },
                { title: 'Integrity in Every Project', desc: 'Every project delivered with full transparency and accountability.' },
                { title: 'Environmental Stewardship', desc: 'Our machines help nature instead of destroying it.' },
              ].map((v) => (
                <div
                  key={v.title}
                  className="relative p-6 rounded-xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden"
                >
                  {/* Glass tint overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 to-amber-100/20 dark:from-blue-900/20 dark:to-amber-900/10" />
                  <div className="relative z-10">
                    <h3 className="font-semibold font-heading text-slate-900 dark:text-white mb-2 text-lg">
                      {v.title}
                    </h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="leadership" className="pt-4">
            <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-3">
              Leadership
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Founded by Jehremiah Asis — a lawyer who pivoted to environmental
              engineering, driven by a mission to restore Philippine waters.
            </p>
          </section>

          <section id="integrity" className="pt-4">
            <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-3">
              Zero Corruption Pledge
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              We believe infrastructure projects should serve communities, not
              interests. Every JCA 1221 project operates under full transparency,
              with real-time monitoring data available to partners and the public.
            </p>
          </section>
        </div>
      </div>
    </AppShell>
  )
}
