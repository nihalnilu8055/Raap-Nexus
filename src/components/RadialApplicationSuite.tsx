import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  FileSpreadsheet, Users, Clock, PackageCheck,
  Coins, AlertOctagon, Layers, Play,
  CheckCircle2, ExternalLink, Sparkles, Building2
} from 'lucide-react'
import { ROUTES } from '../config/routes'

interface ConstellationModule {
  id: string
  name: string
  shortLabel: string
  category: string
  angleDeg: number
  icon: any
  kpi: string
  kpiLabel: string
  description: string
  features: string[]
  accentColor: string
  erpAnchor: string
}

const MODULES: ConstellationModule[] = [
  {
    id: 'finance',
    name: 'Financial Accounting & P&L',
    shortLabel: 'Finance & P&L',
    category: 'Core Accounting',
    angleDeg: -90, // Top
    icon: FileSpreadsheet,
    erpAnchor: ROUTES.ERP_MODULES.PNL,
    kpi: 'AED 14.8M',
    kpiLabel: 'Balanced Ledger Volume',
    description: 'General ledger with automatic trial balance reconciliation, multi-entity consolidation, and statutory P&L statements.',
    features: ['Double-entry balance verification', 'Consolidated monthly statements', 'Audit-ready journal vouchers'],
    accentColor: '#2563EB',
  },
  {
    id: 'sales',
    name: 'Sales Operations & Invoicing',
    shortLabel: 'Sales & Invoices',
    category: 'Commercial',
    angleDeg: -45, // Top-Right
    icon: Users,
    erpAnchor: ROUTES.ERP_MODULES.SALES,
    kpi: 'AED 1.42M',
    kpiLabel: 'Monthly Invoiced Run-Rate',
    description: 'End-to-end sales lifecycle management from quotation to cash receipt with branch-level velocity metrics.',
    features: ['Branch sales leaderboards', 'Real-time voucher issuance', 'Return rate diagnostics'],
    accentColor: '#0891B2',
  },
  {
    id: 'ageing',
    name: 'Ageing & Receivables Governance',
    shortLabel: 'Receivables & Ageing',
    category: 'Credit & Liquidity',
    angleDeg: 0, // Right
    icon: Clock,
    erpAnchor: ROUTES.ERP_MODULES.AGEING,
    kpi: '78%',
    kpiLabel: 'Current Collections (<30d)',
    description: 'Monitors customer aging brackets, credit limits, and partitions legacy arrears to safeguard operational liquidity.',
    features: ['Automatic aging schedule brackets', 'Customer concentration alerts', 'Legacy ledger quarantine'],
    accentColor: '#7C3AED',
  },
  {
    id: 'cashflow',
    name: 'Cash Flow & Liquidity',
    shortLabel: 'Cash & Liquidity',
    category: 'Treasury',
    angleDeg: 45, // Bottom-Right
    icon: Coins,
    erpAnchor: ROUTES.ERP_MODULES.CASH_FLOW,
    kpi: 'AED 4.7M',
    kpiLabel: 'Liquid Working Capital',
    description: 'Predictive cash position forecasting, bank reconciliation feeds, and optimized vendor payables scheduling.',
    features: ['13-week rolling cash projection', 'Live bank feed matching', 'Early-settlement optimization'],
    accentColor: '#D97706',
  },
  {
    id: 'ledger',
    name: 'Trial Balance & Audit Engine',
    shortLabel: 'Trial Balance',
    category: 'Statutory Verification',
    angleDeg: 90, // Bottom
    icon: Layers,
    erpAnchor: ROUTES.ERP_MODULES.TRIAL_BALANCE,
    kpi: '100%',
    kpiLabel: 'Reconciliation Cleared',
    description: 'Ensures debits equal credits across all active accounts with automated variance and out-of-period alerts.',
    features: ['96-account balance check', 'Multi-branch elimination entries', 'Statutory tax reconciliation'],
    accentColor: '#059669',
  },
  {
    id: 'inventory',
    name: 'Raw Materials & Inventory Flow',
    shortLabel: 'Raw Materials',
    category: 'Supply Operations',
    angleDeg: 135, // Bottom-Left
    icon: PackageCheck,
    erpAnchor: ROUTES.ERP_MODULES.SUMMARY,
    kpi: '8,504',
    kpiLabel: 'Active Tracked SKUs',
    description: 'Tracks raw material stocks, warehouse movements, and procurement lead times with automated reorder triggers.',
    features: ['Safety floor reorder alerts', '3-way matching on GRNs', 'FIFO inventory valuation'],
    accentColor: '#0284C7',
  },
  {
    id: 'branches',
    name: 'Branch & Depots Management',
    shortLabel: 'Branch Networks',
    category: 'Multi-Location',
    angleDeg: 180, // Left
    icon: Building2,
    erpAnchor: ROUTES.ERP_MODULES.SALES,
    kpi: '4 Hubs',
    kpiLabel: 'UAE Regional Branches',
    description: 'Centralized governance across Dubai HQ, Abu Dhabi, Sharjah, and Ajman with inter-branch transfers.',
    features: ['Multi-currency sub-ledgers', 'Branch quota tracking', 'Stock transit visibility'],
    accentColor: '#4F46E5',
  },
  {
    id: 'anomalies',
    name: 'Anomaly Detection & Audit Radar',
    shortLabel: 'Audit & Red Flags',
    category: 'Risk Controls',
    angleDeg: 225, // Top-Left
    icon: AlertOctagon,
    erpAnchor: ROUTES.ERP_MODULES.ANOMALIES,
    kpi: '0 Flags',
    kpiLabel: 'Unexplained Balances',
    description: 'Automated ML heuristics scanning transaction journals to isolate off-budget disbursements and fraud vectors.',
    features: ['Duplicate voucher detection', 'One-off debit note review', 'Tamper-proof audit logs'],
    accentColor: '#DC2626',
  },
]

export default function RadialApplicationSuite() {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeModule = MODULES[hoveredIdx !== null ? hoveredIdx : selectedIdx]

  // Calculate cartesian coordinates on a percentage radius from center (50%, 50%)
  const getCoords = (angleDeg: number, radiusPercent: number) => {
    const rad = (angleDeg * Math.PI) / 180
    const x = 50 + radiusPercent * Math.cos(rad)
    const y = 50 + radiusPercent * Math.sin(rad)
    return { x, y }
  }

  return (
    <section
      id="application-suite"
      ref={containerRef}
      className="py-24 sm:py-32 bg-slate-50/70 border-b border-slate-200/80 relative overflow-hidden w-full"
      aria-label="Application Suite Radial Constellation"
    >
      {/* Background Subtle Radial Glow & Grid Pattern */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-blue-100/40 blur-[160px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <motion.div
            className="section-label mb-4 shadow-2xs cursor-default inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-electric-blue text-xs font-bold uppercase tracking-wider"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles size={12} className="text-electric-blue" />
            <span>Unified ERP Constellation</span>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08] mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            One intelligent hub.{' '}
            <span className="gradient-text-blue block sm:inline">
              Every business module in sync.
            </span>
          </motion.h2>

          <motion.p
            className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Click or hover any module tile in the radial orbit to inspect its live data integration, ledger flows, and controls.
          </motion.p>
        </div>

        {/* Desktop Radial Constellation Canvas (>= md) */}
        <div className="hidden md:block relative w-full max-w-5xl aspect-square my-4 sm:my-8 select-none">
          {/* SVG Orbit Rings & Radial Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 800 800">
            <defs>
              <linearGradient id="orbitLineGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0891B2" stopOpacity="0.5" />
              </linearGradient>
            </defs>

            {/* Outer Orbit Ring (Animated Dash) */}
            <motion.circle
              cx="400"
              cy="400"
              r="290"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.85 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />

            {/* Inner Orbit Ring */}
            <motion.circle
              cx="400"
              cy="400"
              r="185"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.7 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 1.2, delay: 0.2, ease: 'easeInOut' }}
            />

            {/* Radial Connector Lines to each Module Tile */}
            {MODULES.map((m, idx) => {
              const rad = (m.angleDeg * Math.PI) / 180
              const x2 = 400 + 290 * Math.cos(rad)
              const y2 = 400 + 290 * Math.sin(rad)
              const isHighlighted = idx === selectedIdx || idx === hoveredIdx

              return (
                <g key={m.id}>
                  <motion.line
                    x1="400"
                    y1="400"
                    x2={x2}
                    y2={y2}
                    stroke={isHighlighted ? 'url(#orbitLineGrad)' : '#E2E8F0'}
                    strokeWidth={isHighlighted ? '3' : '1.5'}
                    strokeDasharray={isHighlighted ? 'none' : '4 4'}
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: isHighlighted ? 1 : 0.6 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{ duration: 0.8, delay: 0.25 + idx * 0.07 }}
                  />
                  {isHighlighted && (
                    <motion.circle
                      cx={x2}
                      cy={y2}
                      r="4.5"
                      fill="#2563EB"
                      animate={{ scale: [1, 1.8, 1], opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </g>
              )
            })}
          </svg>

          {/* Central ERP Intelligence Hub (Centerpiece) */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-white border-2 border-electric-blue shadow-elevation flex flex-col items-center justify-center p-3 text-center z-20 cursor-pointer group"
            initial={{ scale: 0.4, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.7, delay: 0.15, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.06 }}
            onClick={() => setSelectedIdx(0)}
          >
            {/* Ambient Pulse Ring */}
            <div className="absolute inset-0 rounded-full border border-blue-400 animate-ping opacity-25 pointer-events-none" />
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-electric-blue to-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-xs mb-1">
              R
            </div>
            <span className="text-xs font-black tracking-tight text-slate-900 leading-tight">
              RaapNexus
            </span>
            <span className="text-[9px] font-bold text-electric-blue uppercase tracking-widest mt-0.5">
              Core Ledger Hub
            </span>
          </motion.div>

          {/* 8 Module Tiles Positioned Along the Radial Orbit */}
          {MODULES.map((m, idx) => {
            const coords = getCoords(m.angleDeg, 36.2)
            const Icon = m.icon
            const isSelected = idx === selectedIdx
            const isHovered = idx === hoveredIdx

            return (
              <motion.button
                key={m.id}
                onClick={() => setSelectedIdx(idx)}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  left: `${coords.x}%`,
                  top: `${coords.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute z-30 p-3.5 sm:p-4 rounded-2xl bg-white border transition-all duration-300 flex items-center gap-3 shadow-card group ${
                  isSelected || isHovered
                    ? 'border-electric-blue shadow-elevation scale-110 ring-4 ring-blue-100 z-40'
                    : 'border-slate-200/90 hover:border-slate-300 hover:scale-105'
                }`}
                initial={{ scale: 0.3, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.5, delay: 0.3 + idx * 0.07, type: 'spring' }}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected || isHovered
                      ? 'bg-electric-blue text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div className="text-left whitespace-nowrap pr-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                    {m.category}
                  </span>
                  <span
                    className={`text-xs font-bold block transition-colors leading-snug ${
                      isSelected || isHovered ? 'text-electric-blue' : 'text-slate-900'
                    }`}
                  >
                    {m.shortLabel}
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Mobile Vertical Grid Fallback (< md) */}
        <div className="grid md:hidden grid-cols-2 gap-3 w-full my-6">
          {MODULES.map((m, idx) => {
            const Icon = m.icon
            const isSelected = idx === selectedIdx
            return (
              <button
                key={m.id}
                onClick={() => setSelectedIdx(idx)}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-white border-electric-blue shadow-md ring-2 ring-blue-100'
                    : 'bg-white/80 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-electric-blue text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    {m.category}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-900">{m.shortLabel}</span>
              </button>
            )
          })}
        </div>

        {/* Interactive Module Inspection Preview Card Below Constellation */}
        <motion.div
          key={activeModule.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-4xl bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-card mt-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-electric-blue flex items-center justify-center flex-shrink-0 shadow-2xs">
                <activeModule.icon size={22} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {activeModule.category} · Verified Module
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {activeModule.name}
                </h3>
              </div>
            </div>

            <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                {activeModule.kpiLabel}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {activeModule.kpi}
              </span>
            </div>
          </div>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed my-5">
            {activeModule.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-5">
            {activeModule.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 font-medium">
                <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>

          <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600" />
              Sourced from active ABC Company production schema
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href={activeModule.erpAnchor}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs py-2.5 px-4 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 w-full sm:w-auto"
              >
                <span>Launch {activeModule.shortLabel}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Global CTA Below Constellation */}
        <div className="mt-12 text-center">
          <a
            href={ROUTES.ERP_STANDALONE}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs py-3 px-6 uppercase tracking-wider font-bold inline-flex items-center gap-2"
          >
            <Play size={13} className="fill-slate-900" />
            <span>Explore All 8 Modules in Full ERP</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </section>
  )
}
