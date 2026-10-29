import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ShieldCheck, UserCheck, FileCheck2, Database, Building } from 'lucide-react'

const securityControls = [
  {
    icon: UserCheck,
    title: 'Role-Based Scoped Access',
    description:
      'Queries inherit the exact permissions and role boundaries of the authenticated user. Staff cannot inspect ledgers, payables, or executive reports outside their granted profile.',
  },
  {
    icon: Building,
    title: 'Multi-Tenant & Company Isolation',
    description:
      'Data partitions strictly isolate branch entities and legal company records. Transactions and analytics remain partitioned to prevent cross-company leakage.',
  },
  {
    icon: FileCheck2,
    title: 'Human-in-the-Loop Approvals',
    description:
      'AI cannot autonomously execute financial transactions or post accounting changes. Every generated invoice or journal entry requires an explicit, verified human sign-off.',
  },
  {
    icon: Database,
    title: 'Immutable Audit Logging',
    description:
      'Every natural language interaction, data retrieval, and proposed workflow change is timestamped and logged with user provenance for thorough internal review.',
  },
]

export default function EnterpriseTrust() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="security" ref={ref} className="py-24 bg-slate-50 relative overflow-hidden border-b border-slate-200/80">
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
            <ShieldCheck size={13} />
            Enterprise Architectural Governance
          </div>
          <h2 className="section-heading text-3xl sm:text-4xl lg:text-5xl mb-4">
            Total control.{' '}
            <span className="gradient-text-blue">Zero data compromises.</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Engineered with strict tenant isolation, role-based scoping, and mandatory human authorization.
          </p>
        </motion.div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {securityControls.map((c, i) => {
            const Icon = c.icon
            return (
              <motion.div
                key={c.title}
                className="glass-card-hover p-7 rounded-2xl flex items-start gap-5 border border-slate-200/90 bg-white"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                whileHover={{ y: -3 }}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-electric-blue flex-shrink-0">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{c.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {c.description}
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
