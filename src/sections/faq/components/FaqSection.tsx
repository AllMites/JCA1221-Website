import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollReveal, RevealItem } from '@/components/ScrollReveal'

interface FaqItem {
  question: string
  answer: string
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How do I partner with JCA1221 Holdings?',
    answer:
      'Partnerships begin with a consultation to understand your community\'s environmental challenges. LGUs and government agencies may contact us directly through our contact form or official procurement channels. We then conduct a feasibility assessment and, if aligned, proceed with a memorandum of agreement (MOA) and project scoping.',
  },
  {
    question: 'What LGUs and areas do you serve?',
    answer:
      'We serve municipalities, cities, and provincial government units across the Philippines, with active and pipeline projects spanning Luzon, Visayas, and Mindanao. Our approach is tailored to each LGU\'s specific environmental needs, from coastal communities requiring wastewater treatment to inland areas needing solid waste management solutions.',
  },
  {
    question: 'What is the procurement and contracting process?',
    answer:
      'We comply with Republic Act 9184 (Government Procurement Reform Act) and its implementing rules and regulations. Projects may be procured through competitive bidding, negotiated procurement, or unsolicited proposal routes under the Build-Operate-Transfer (BOT) Law, depending on the project structure and funding source. Our team guides partners through the appropriate framework.',
  },
  {
    question: 'What water treatment technologies do you use?',
    answer:
      'We deploy nature-based solutions including constructed wetlands, facultative lagoons, anaerobic baffled reactors, and polishing ponds — all designed to mimic natural purification processes. Our systems achieve high BOD reduction and effluent quality while requiring low energy input and minimal chemical use, making them ideal for Philippine municipalities.',
  },
  {
    question: 'How are projects funded?',
    answer:
      'Projects are funded through a combination of national government allocations, LGU budgets, official development assistance (ODA), and private investment through Public-Private Partnership (PPP) structures. JCA1221 also facilitates access to green climate funds and multilateral development bank financing for qualifying environmental infrastructure.',
  },
  {
    question: 'Where do you currently operate?',
    answer:
      'JCA1221 Holdings is headquartered in Makati City, Metro Manila, with active project sites in Central Luzon, CALABARZON, and the Bicol Region. Our expansion pipeline targets underserved municipalities in the Visayas and Mindanao, with priority given to areas facing critical water quality and waste management challenges.',
  },
  {
    question: 'What makes JCA1221 different from other environmental firms?',
    answer:
      'Unlike conventional engineering firms, we integrate nature-mimicking technology with community-centered implementation and long-term ecosystem stewardship. Our team combines deep technical expertise in environmental engineering with experience in government procurement and development finance, enabling us to deliver projects that are both ecologically sound and institutionally viable.',
  },
  {
    question: 'How can investors get involved?',
    answer:
      'Investors may participate through equity investment in project special-purpose vehicles (SPVs), green bond issuances, or direct co-financing arrangements. We welcome institutional investors, impact funds, and development finance institutions seeking measurable environmental returns alongside financial performance. Contact our investment relations team to discuss opportunities.',
  },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <ScrollReveal staggerChildren={0.08} viewportMargin="-40px 0px">
      <section className="relative py-20 sm:py-28 bg-white dark:bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <RevealItem>
            <div className="text-center mb-14">
              <p className="text-blue-600 dark:text-blue-300/80 text-sm font-mono tracking-widest uppercase mb-4">
                Frequently Asked Questions
              </p>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 dark:text-white mb-4">
                Working with JCA1221
              </h2>
              <p className="text-slate-600 dark:text-slate-300/60 max-w-xl mx-auto text-lg leading-relaxed">
                Common questions from government partners, investors, and communities about our process and capabilities.
              </p>
            </div>
          </RevealItem>

          {/* FAQ Items */}
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index
              return (
                <RevealItem key={index}>
                  <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 overflow-hidden transition-all duration-300">
                    <button
                      onClick={() => toggle(index)}
                      className="w-full flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 text-left hover:bg-slate-100 dark:hover:bg-white/8 transition-colors duration-200"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm sm:text-base font-heading font-semibold text-slate-800 dark:text-slate-200 pr-4">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={cn(
                          'w-5 h-5 flex-shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-300',
                          isOpen && '-rotate-180',
                        )}
                      />
                    </button>

                    <div
                      className={cn(
                        'grid transition-all duration-300 ease-out',
                        isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0">
                          <p className="text-sm text-slate-600 dark:text-slate-300/70 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </RevealItem>
              )
            })}
          </div>
        </div>
      </section>
    </ScrollReveal>
  )
}
