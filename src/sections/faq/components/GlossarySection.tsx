import { BookOpen } from 'lucide-react'
import { ScrollReveal, RevealItem } from '@/components/ScrollReveal'

interface GlossaryTerm {
  term: string
  abbreviation?: string
  definition: string
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: 'Biochemical Oxygen Demand',
    abbreviation: 'BOD',
    definition:
      'A measure of the amount of dissolved oxygen required by aerobic microorganisms to decompose organic matter in water. Lower BOD levels indicate cleaner water. Our constructed wetlands routinely achieve over 90% BOD reduction, transforming highly polluted wastewater into effluent safe for discharge or reuse.',
  },
  {
    term: 'Constructed Wetland',
    definition:
      'An engineered system that uses natural processes involving wetland vegetation, soils, and their associated microbial assemblages to treat wastewater. Unlike conventional mechanical treatment plants, constructed wetlands require minimal energy, no chemical additives, and provide ancillary benefits including habitat creation and carbon sequestration.',
  },
  {
    term: 'Effluent Treatment',
    definition:
      'The process of treating wastewater — the outflow from a sewage treatment facility or industrial process — to remove contaminants before discharge into the environment. Our multi-stage treatment approach ensures effluent meets or exceeds DENR Administrative Order 2016-08 (General Effluent Standards) for Class C water bodies.',
  },
  {
    term: 'Facultative Lagoon',
    definition:
      'A shallow, earthen wastewater treatment basin that supports both aerobic (oxygen-using) and anaerobic (oxygen-free) biological processes. The upper layer, exposed to sunlight and atmospheric oxygen, supports algae and aerobic bacteria, while the lower layer hosts anaerobic digestion of settled solids. These lagoons are a cost-effective component of our wastewater treatment trains.',
  },
  {
    term: 'Nature-Based Solutions',
    abbreviation: 'NBS',
    definition:
      'Actions that protect, sustainably manage, and restore natural or modified ecosystems to address societal challenges while simultaneously providing human well-being and biodiversity benefits. At JCA1221, NBS underpins our entire technology stack — from mangrove restoration for coastal protection to constructed wetlands for water purification.',
  },
  {
    term: 'Public-Private Partnership',
    abbreviation: 'PPP',
    definition:
      'A contractual arrangement between a government agency and a private sector entity whereby the private party delivers a public infrastructure project or service and assumes substantial financial, technical, and operational risk. The Philippines\' PPP Center governs these arrangements under the BOT Law (Republic Act 6957, as amended by RA 7718).',
  },
  {
    term: 'Environmental Compliance Certificate',
    abbreviation: 'ECC',
    definition:
      'A document issued by the Department of Environment and Natural Resources (DENR) certifying that a proposed project will not cause significant negative environmental impact and that the proponent has complied with all the requirements of the Philippine Environmental Impact Statement System. All JCA1221 projects secure ECC clearance prior to construction.',
  },
  {
    term: 'Total Suspended Solids',
    abbreviation: 'TSS',
    definition:
      'A water quality parameter measuring the dry weight of particles suspended in a water sample that are trapped by a filter. High TSS levels reduce water clarity, harm aquatic life, and can carry adsorbed pollutants. Our treatment systems reduce TSS through sedimentation, filtration through wetland substrates, and biological flocculation.',
  },
  {
    term: 'Special-Purpose Vehicle',
    abbreviation: 'SPV',
    definition:
      'A legal entity created for a specific, limited purpose — typically to isolate financial risk. In infrastructure finance, an SPV is often established to hold project assets, manage construction and operations, and service debt. JCA1221 structures project-level SPVs to ring-fence investment and provide transparency to LGU and private sector partners.',
  },
  {
    term: 'Coastal Ecosystem Restoration',
    definition:
      'The process of assisting the recovery of degraded, damaged, or destroyed coastal habitats — including mangroves, seagrass beds, and coral reefs — to a resilient and self-sustaining state. Our restoration programs combine bioengineering techniques with community-based management to rebuild natural coastal defenses against storm surges and sea-level rise.',
  },
]

export function GlossarySection() {
  return (
    <ScrollReveal staggerChildren={0.06} viewportMargin="-40px 0px">
      <section className="relative py-20 sm:py-28 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <RevealItem>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-400/20">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                <span className="text-xs font-mono tracking-widest uppercase text-blue-600 dark:text-blue-300/80">
                  Reference
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 dark:text-white mb-4">
                Glossary of Terms
              </h2>
              <p className="text-slate-600 dark:text-slate-300/60 max-w-xl mx-auto text-lg leading-relaxed">
                Key environmental infrastructure and regulatory terms used throughout our documentation and proposals.
              </p>
            </div>
          </RevealItem>

          {/* Glossary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GLOSSARY_TERMS.map((item) => (
              <RevealItem key={item.term}>
                <div className="h-full p-5 sm:p-6 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-400/25 transition-all duration-300">
                  <div className="flex items-baseline gap-2 mb-2">
                    <h3 className="text-sm font-heading font-bold text-slate-800 dark:text-slate-200">
                      {item.term}
                    </h3>
                    {item.abbreviation && (
                      <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300/80 border border-blue-200 dark:border-blue-400/15">
                        {item.abbreviation}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300/60 leading-relaxed">
                    {item.definition}
                  </p>
                </div>
              </RevealItem>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  )
}
