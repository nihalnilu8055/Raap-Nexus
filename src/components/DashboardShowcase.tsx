import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Monitor, LayoutDashboard, BarChart3, DollarSign, Package, FileText, Receipt, Play, ExternalLink } from 'lucide-react'
import DashboardPreview from './dashboard/DashboardPreview'

const modules = [
  { id: 'executive', label: 'Executive', icon: LayoutDashboard },
  { id: 'sales', label: 'Sales & Quotas', icon: BarChart3 },
  { id: 'finance', label: 'Finance & P&L', icon: DollarSign },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'reports', label: 'Trial Balance', icon: FileText },
  { id: 'invoices', label: 'Invoicing', icon: Receipt },
]

export default function DashboardShowcase() {
  const [activeModule, setActiveModule] = useState('executive')
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="dashboard" ref={ref} className="py-24 bg-slate-50 relative overflow-hidden border-b border-slate-200/80">
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label mb-4">
            <Monitor size={12} />
            Modular Ledger Workstation
          </div>
          <h2 className="section-heading text-3xl sm:text-4xl lg:text-5xl mb-4">
            Inspect the numbers in{' '}
            <span className="gradient-text-blue">real time.</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Switch between core financial, operational, and commercial modules.
            Every calculation reflects double-entry ledger integrity.
          </p>
        </motion.div>

        {/* Module Switcher Pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-8"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {modules.map((mod) => {
            const Icon = mod.icon
            const isActive = mod.id === activeModule
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                  isActive
                    ? 'bg-electric-blue text-white border-electric-blue shadow-blue-glow'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={14} />
                {mod.label}
              </button>
            )
          })}
        </motion.div>

        {/* Dashboard Frame */}
        <motion.div
          className="relative max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-elevation bg-white">
            {/* Virtual browser chrome */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-b border-slate-200">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 max-w-md mx-4 bg-white border border-slate-200 rounded-md px-3 py-1 text-xs text-slate-500 font-mono text-center shadow-2xs">
                raap.techorbit.net/src/abc-dashboard.html · {activeModule}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/demo"
                  className="btn-primary text-xs py-1 px-3 flex items-center gap-1 font-bold"
                >
                  <Play size={10} className="fill-white" /> Live Sandbox
                </Link>
              </div>
            </div>

            {/* Dashboard Component */}
            <DashboardPreview activeModule={activeModule} />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 px-2">
            <span>Synthetic simulation modeled on authentic enterprise schema.</span>
            <div className="flex items-center gap-3">
              <Link to="/demo" className="text-electric-blue font-bold hover:underline flex items-center gap-1">
                Open Full ERP Workstation <Play size={11} className="fill-electric-blue" />
              </Link>
              <span>•</span>
              <a
                href="/erp/dashboard.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                Direct File <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
