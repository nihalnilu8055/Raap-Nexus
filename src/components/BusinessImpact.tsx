import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { TrendingUp, Clock, ShieldCheck, GitMerge, FileSpreadsheet } from 'lucide-react'

const qualitativeBenefits = [
  {
    icon: Clock,
    title: 'Zero Waiting on BI & Reporting Queues',
    category: 'Operational Agility',
    description:
      'Instead of raising tickets with IT or waiting days for custom financial extracts, leaders query ERP systems directly and receive real-time, verified intelligence.',
  },
  {
    icon: ShieldCheck,
    title: 'Governed Human-in-the-Loop Actions',
    category: 'Risk Mitigation',
    description:
      'AI acts as an intelligent assistant, not an unsupervised operator. Approvals, draft invoices, and accounting modifications adhere to strict authorization hierarchies.',
  },
  {
    icon: GitMerge,
    title: 'Single Source of Cross-Branch Truth',
    category: 'Multi-Entity Cohesion',
    description:
      'Harmonize decentralized branch and warehouse data into consistent reports, eliminating reconciliation discrepancies between sales, stock, and general ledgers.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Automated Regulatory & Financial Filings',
    category: 'Compliance Readiness',
    description:
      'Generate audit-compliant trial balances, balance sheets, and tax-ready reporting structures directly from core ledger postings with complete provenance.',
  },
]

export default function BusinessImpact() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-24 bg-slate-50 relative overflow-hidden border-b border-slate-200/80">
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label mb-4">
            <TrendingUp size={13} />
            Enterprise Strategic Advantage
          </div>
          <h2 className="section-heading text-3xl sm:text-4xl lg:text-5xl mb-4">
            Built to amplify your leadership,
            <br />
            <span className="gradient-text-blue">not complicate your stack.</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Experience qualitative transformation in decision speed, corporate governance, and cross-functional visibility.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {qualitativeBenefits.map((b, i) => {
            const Icon = b.icon
            return (
              <motion.div
                key={b.title}
                className="glass-card-hover p-8 rounded-2xl flex flex-col justify-between border border-slate-200/90 bg-white"
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-electric-blue">
                      <Icon size={22} />
                    </div>
                    <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {b.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{b.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
