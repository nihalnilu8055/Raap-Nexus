import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  MessageSquare, BarChart3, FileText, Package,
  Receipt, Brain, Building2, ChevronRight
} from 'lucide-react'
import DashboardPreview from './dashboard/DashboardPreview'

const capabilities = [
  {
    id: 'ai-bi',
    icon: Brain,
    label: 'Conversational BI',
    title: 'Ask your data anything in plain language.',
    description:
      'Query your entire business data using natural language. Get instant charts, summaries, and actionable insights — no SQL, no waiting for the BI team.',
    color: '#2563EB',
    module: 'executive',
  },
  {
    id: 'reporting',
    icon: BarChart3,
    label: 'ERP Analytics',
    title: 'Live dashboards across every business function.',
    description:
      'Real-time KPIs, trend analysis, and custom reports across sales, finance, inventory, and operations — consolidated into a single view.',
    color: '#0891B2',
    module: 'reports',
  },
  {
    id: 'finance',
    icon: FileText,
    label: 'Financial Management',
    title: 'Full accounting visibility in real time.',
    description:
      'General ledger, trial balance, P&L, cash flow, accounts payable and receivable — all accessible through a single intelligent interface.',
    color: '#7C3AED',
    module: 'finance',
  },
  {
    id: 'sales',
    icon: Receipt,
    label: 'Sales & Invoicing',
    title: 'From quotation to payment, without friction.',
    description:
      'Manage the complete sales cycle — quotations, orders, invoices, returns, and payments — with branch-level analytics and approval workflows.',
    color: '#059669',
    module: 'sales',
  },
  {
    id: 'inventory',
    icon: Package,
    label: 'Inventory & Operations',
    title: 'Real-time stock intelligence across all locations.',
    description:
      'Track stock movements, monitor reorder levels, manage goods receipts, and gain full visibility into your supply chain in real time.',
    color: '#D97706',
    module: 'inventory',
  },
  {
    id: 'multi-entity',
    icon: Building2,
    label: 'Multi-Company',
    title: 'Operate across branches, companies, and entities.',
    description:
      'Manage multiple companies and branches within a single platform. Each entity maintains its own books with consolidated reporting available centrally.',
    color: '#2563EB',
    module: 'executive',
  },
]

export default function CapabilitiesSection() {
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  // Auto-cycle capabilities gently
  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % capabilities.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const activeCap = capabilities[active]

  return (
    <section id="capabilities" ref={ref} className="py-24 bg-white relative overflow-hidden border-b border-slate-200/80">
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
            <MessageSquare size={12} />
            Platform Capabilities
          </div>
          <h2 className="section-heading text-3xl sm:text-4xl lg:text-5xl mb-4">
            Everything your business needs,
            <br />
            <span className="gradient-text-blue">intelligently connected.</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Built for enterprise operations. Designed for clarity. Governed by accounting logic.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left — capability list */}
          <motion.div
            className="flex flex-col gap-2.5"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {capabilities.map((cap, i) => {
              const Icon = cap.icon
              const isActive = i === active
              return (
                <motion.button
                  key={cap.id}
                  onClick={() => setActive(i)}
                  className={`flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200 border group ${
                    isActive
                      ? 'bg-blue-50/70 border-electric-blue shadow-card-hover'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                  whileHover={{ x: 4 }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300"
                    style={{
                      backgroundColor: isActive ? `${cap.color}15` : '#F1F5F9',
                      color: isActive ? cap.color : '#64748B',
                      border: isActive ? `1px solid ${cap.color}30` : '1px solid #E2E8F0',
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block mb-0.5 ${
                      isActive ? 'text-electric-blue' : 'text-slate-400'
                    }`}>
                      {cap.label}
                    </span>
                    <h4 className={`text-sm font-bold mb-1 ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                      {cap.title}
                    </h4>
                    <AnimatePresence>
                      {isActive && (
                        <motion.p
                          className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {cap.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`flex-shrink-0 mt-2 transition-transform duration-200 ${
                      isActive ? 'text-electric-blue rotate-90' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                </motion.button>
              )
            })}
          </motion.div>

          {/* Right — live dashboard */}
          <motion.div
            className="sticky top-24"
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-elevation bg-white">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 border-b border-slate-200">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 mx-3 text-center">
                  <span className="text-xs font-semibold text-slate-600 font-mono">
                    raap.techorbit.net/src/abc-dashboard.html · {activeCap.label}
                  </span>
                </div>
              </div>
              <DashboardPreview activeModule={activeCap.module} />
            </div>

            {/* Progress indicator pills */}
            <div className="flex gap-1.5 justify-center mt-4">
              {capabilities.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? 'bg-electric-blue w-6' : 'bg-slate-300 w-3 hover:bg-slate-400'
                  }`}
                  aria-label={`View ${capabilities[i].label}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
