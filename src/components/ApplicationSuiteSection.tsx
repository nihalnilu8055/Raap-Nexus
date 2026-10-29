import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FileSpreadsheet, Users, Clock, PackageCheck,
  Coins, AlertOctagon, ArrowRight, CheckCircle2,
  Layers, ExternalLink
} from 'lucide-react'

export interface ERPModule {
  id: string
  name: string
  shortTitle: string
  category: string
  description: string
  kpi: string
  kpiLabel: string
  icon: any
  features: string[]
  color: string
}

export const ERP_MODULES: ERPModule[] = [
  {
    id: 'finance',
    name: 'Financial Accounting & Trial Balance',
    shortTitle: 'Finance & Ledger',
    category: 'Core Accounting',
    description:
      'Real-time general ledger with automatic trial balance reconciliation. Generates P&L, balance sheets, and tax-ready statements without manual closing delays.',
    kpi: 'AED 14.8M',
    kpiLabel: 'Balanced Ledger Volume',
    icon: FileSpreadsheet,
    features: [
      'Automatic double-entry balance verification',
      'Multi-entity and branch consolidated P&L',
      'Full journal entry provenance & audit log',
    ],
    color: '#2563EB',
  },
  {
    id: 'sales',
    name: 'Sales Intelligence & Quota Operations',
    shortTitle: 'Sales & Reps',
    category: 'Commercial Growth',
    description:
      'Track quotation lifecycles, branch sales velocity, and salesperson quota attainment. Identifies customer concentration risks and excessive field returns.',
    kpi: 'AED 1.42M',
    kpiLabel: 'Monthly Invoiced Value',
    icon: Users,
    features: [
      'Branch and salesperson quota leaderboards',
      'Customer order concentration risk alerts',
      'Field sales returns monitoring and root cause analysis',
    ],
    color: '#0891B2',
  },
  {
    id: 'ageing',
    name: 'Ageing & Receivables Governance',
    shortTitle: 'Receivables & Ageing',
    category: 'Credit & Liquidity',
    description:
      'Monitors customer aging brackets (0–30, 31–60, 60–90, 90+ days). Pinpoints credit default risks and automates follow-up schedules before bad debt occurs.',
    kpi: '78%',
    kpiLabel: 'Current Collections (<30d)',
    icon: Clock,
    features: [
      'Automated aging schedule classification',
      'Legacy receivables quarantine & recovery tracking',
      'Credit limit enforcement at sales order entry',
    ],
    color: '#7C3AED',
  },
  {
    id: 'materials',
    name: 'Raw Materials & Inventory Flow',
    shortTitle: 'Inventory & Materials',
    category: 'Supply Operations',
    description:
      'Maintain visibility across raw material stocks, warehouse movements, and procurement lead times. Links bills of materials directly to production costs.',
    kpi: '8,504',
    kpiLabel: 'Tracked Active SKUs',
    icon: PackageCheck,
    features: [
      'Real-time reorder point notifications',
      'Goods receipt note (GRN) to invoice three-way matching',
      'Inventory valuation across weighted average and FIFO',
    ],
    color: '#059669',
  },
  {
    id: 'cashflow',
    name: 'Cash Flow & Liquidity Intelligence',
    shortTitle: 'Cash & Liquidity',
    category: 'Treasury & Capital',
    description:
      'Anticipate working capital needs with predictive cash flow models. Reconciles bank statements against open payables and incoming receivables.',
    kpi: 'AED 4.7M',
    kpiLabel: 'Liquid Working Capital',
    icon: Coins,
    features: [
      '13-week rolling cash position projection',
      'Automated bank reconciliation feeds',
      'Payables scheduling optimized for early-payment discounts',
    ],
    color: '#D97706',
  },
  {
    id: 'anomalies',
    name: 'Audit Engine & Anomaly Detection',
    shortTitle: 'Audit & Governance',
    category: 'Risk & Control',
    description:
      'Continuously inspects ledger transactions to catch irregular entries, out-of-period adjustments, or duplicate vendor billings before financial close.',
    kpi: 'Zero',
    kpiLabel: 'Uninvestigated Variances',
    icon: AlertOctagon,
    features: [
      'Automated one-off expense item flags',
      'Segregation-of-duties conflict detection',
      'Tamper-evident system activity audit trails',
    ],
    color: '#DC2626',
  },
]

export default function ApplicationSuiteSection() {
  const [selectedModule, setSelectedModule] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const active = ERP_MODULES[selectedModule]
  const ActiveIcon = active.icon

  return (
    <section id="application-suite" ref={ref} className="py-24 bg-slate-50 relative overflow-hidden border-b border-slate-200/80">
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
            <Layers size={12} />
            Modular Application Suite
          </div>
          <h2 className="section-heading text-3xl sm:text-4xl lg:text-5xl mb-4">
            One cohesive suite.{' '}
            <span className="gradient-text-blue">Zero operational silos.</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Every module in RaapNexus operates on a shared data schema, ensuring that sales transactions,
            inventory movements, and ledger postings update in real time.
          </p>
        </motion.div>

        {/* Constellation / Grid of Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Module List (6 Columns) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {ERP_MODULES.map((mod, i) => {
              const Icon = mod.icon
              const isSelected = i === selectedModule
              return (
                <motion.button
                  key={mod.id}
                  onClick={() => setSelectedModule(i)}
                  className={`p-4 rounded-xl text-left border transition-all duration-300 flex items-start gap-3.5 group ${
                    isSelected
                      ? 'bg-white border-electric-blue shadow-card-hover'
                      : 'bg-white/70 border-slate-200/90 hover:bg-white hover:border-slate-300'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  whileHover={{ x: 4 }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
                    style={{
                      backgroundColor: isSelected ? `${mod.color}15` : '#F1F5F9',
                      color: isSelected ? mod.color : '#64748B',
                      border: isSelected ? `1px solid ${mod.color}30` : '1px solid #E2E8F0',
                    }}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {mod.category}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-electric-blue uppercase flex items-center gap-1">
                          <CheckCircle2 size={11} /> Selected
                        </span>
                      )}
                    </div>
                    <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                      {mod.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {mod.description}
                    </p>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Right: Featured Module Deep-Dive Card (7 Columns) */}
          <div className="lg:col-span-7 sticky top-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                className="glass-card rounded-2xl p-7 sm:p-9 border border-slate-200/90 shadow-elevation bg-white relative overflow-hidden"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
              >
                {/* Top Accent Strip */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: active.color }}
                />

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: active.color }}
                    >
                      <ActiveIcon size={24} />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {active.category}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                        {active.name}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-semibold text-slate-400 uppercase">{active.kpiLabel}</div>
                    <div className="text-2xl font-black text-slate-900 font-mono">{active.kpi}</div>
                  </div>
                </div>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                  {active.description}
                </p>

                {/* Feature Checkpoints */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 mb-8 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Engineered Enterprise Capabilities
                  </h4>
                  {active.features.map((feat, fi) => (
                    <div key={fi} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 size={16} className="mt-0.5 text-emerald-600 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to="/demo"
                    className="btn-primary text-xs py-2.5 px-5 flex items-center gap-1.5"
                  >
                    Launch Live Module <ArrowRight size={14} />
                  </Link>
                  <a
                    href="/erp/dashboard.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-1.5"
                  >
                    Open Standalone <ExternalLink size={13} />
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
