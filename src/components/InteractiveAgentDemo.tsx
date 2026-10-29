import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Sparkles, Play, CheckCircle2, AlertTriangle, ShieldCheck,
  TrendingUp, Users, Clock, PackageCheck, Terminal,
  ExternalLink, Loader2
} from 'lucide-react'
import { ROUTES } from '../config/routes'

interface AgentScenario {
  id: string
  name: string
  role: string
  icon: any
  prompt: string
  steps: { label: string; detail: string }[]
  metrics: { label: string; value: string; change: string; positive: boolean }[]
  findings: { title: string; detail: string; severity: 'info' | 'warning' | 'success' }[]
  tableData: { col1: string; col2: string; col3: string; status: string }[]
  tableHeaders: [string, string, string, string]
  erpAnchor: string
}

const AGENTS: AgentScenario[] = [
  {
    id: 'finance',
    name: 'Financial Auditor Agent',
    role: 'P&L, Ledger & Tax Compliance',
    icon: TrendingUp,
    erpAnchor: ROUTES.ERP_MODULES.PNL,
    prompt: 'Audit September 2026 operating performance, decompose revenue vs expenses, and flag variance against annual budget.',
    steps: [
      { label: 'Querying PostgreSQL General Ledger', detail: 'Scan completed across 96 accounts (Jan–Sep 2026)' },
      { label: 'Verifying Invariants & VAT Filings', detail: 'Debit/Credit balance confirmed at AED 14,815,000' },
      { label: 'Decomposing 8-Month Margin Trajectory', detail: 'September narrowed losses by AED 240,000' },
    ],
    metrics: [
      { label: 'September Revenue', value: 'AED 1.42M', change: '+23.5% vs Aug', positive: true },
      { label: 'Operating Cost Base', value: 'AED 1.18M', change: '-4.2% optimized', positive: true },
      { label: 'Net Profit Margin', value: '+14.6%', change: 'Recovery Trend', positive: true },
      { label: 'Unreconciled Items', value: '0 Vouchers', change: '100% Cleared', positive: true },
    ],
    findings: [
      {
        title: 'September narrowed the 8-month deficit',
        detail: 'Strong field sales in Dubai HQ offset legacy overheads; Q4 targets are mathematically attainable.',
        severity: 'success',
      },
      {
        title: 'Two unexplained one-off accounting line items',
        detail: 'AED 42,000 in miscellaneous vendor debit notes require dual-signoff before monthly ledger close.',
        severity: 'warning',
      },
    ],
    tableHeaders: ['Account Line', 'Period Debit', 'Period Credit', 'Ledger Integrity'],
    tableData: [
      { col1: '4010 · Commercial Sales Revenue', col2: '–', col3: 'AED 1,420,000', status: 'Reconciled' },
      { col1: '5020 · Raw Material Procurement', col2: 'AED 620,000', col3: '–', status: 'Reconciled' },
      { col1: '6010 · Branch Logistics & Fleet', col2: 'AED 184,000', col3: '–', status: 'Reconciled' },
      { col1: '2010 · Trade Payables & Accruals', col2: '–', col3: 'AED 380,000', status: 'Audited' },
    ],
  },
  {
    id: 'sales',
    name: 'Commercial Intelligence Agent',
    role: 'Branch Quotas & Customer Risk',
    icon: Users,
    erpAnchor: ROUTES.ERP_MODULES.SALES,
    prompt: 'Analyze branch sales velocity for yesterday, rank salesperson quota attainment, and inspect customer concentration.',
    steps: [
      { label: 'Aggregating Point-of-Sale Vouchers', detail: 'Processed 184 customer vouchers across 4 regional branches' },
      { label: 'Calculating Rep Quota Benchmarks', detail: 'Dubai HQ at 108% attainment; Sharjah at 102%' },
      { label: 'Evaluating Single-Buyer Concentration', detail: 'Two enterprise buyers account for 42% of active volume' },
    ],
    metrics: [
      { label: 'Yesterday Network Sales', value: 'AED 314.7K', change: '+18% vs day prior', positive: true },
      { label: 'Top Branch (Dubai HQ)', value: 'AED 124.5K', change: 'Quota Leader', positive: true },
      { label: 'Average Voucher Value', value: 'AED 7,717', change: '+4.2% up', positive: true },
      { label: 'Field Return Rate', value: '1.4%', change: 'Normal variance', positive: true },
    ],
    findings: [
      {
        title: 'Customer concentration risk in Industrial Tier',
        detail: 'Top 2 accounts represent 42% of invoiced volume. Recommend enforcing credit limits on new orders.',
        severity: 'warning',
      },
      {
        title: 'Dubai & Abu Dhabi pacing 14% ahead of quota',
        detail: 'Commercial team on track to surpass quarterly volume targets by mid-November.',
        severity: 'success',
      },
    ],
    tableHeaders: ['Regional Branch', 'Yesterday Volume', 'Quota Attainment', 'Commercial Health'],
    tableData: [
      { col1: 'Dubai HQ Flagship Hub', col2: 'AED 124,500', col3: '108% of target', status: 'Optimal' },
      { col1: 'Abu Dhabi Commercial Center', col2: 'AED 87,300', col3: '94% of target', status: 'On-Track' },
      { col1: 'Sharjah Industrial Branch', col2: 'AED 64,200', col3: '102% of target', status: 'Optimal' },
      { col1: 'Ajman Distribution Depot', col2: 'AED 38,700', col3: '89% of target', status: 'Action Needed' },
    ],
  },
  {
    id: 'ageing',
    name: 'Receivables & Credit Control Agent',
    role: 'Liquidity, Overdue Tiers & Collections',
    icon: Clock,
    erpAnchor: ROUTES.ERP_MODULES.AGEING,
    prompt: 'Inspect outstanding customer accounts, decompose aging brackets (0–30, 31–60, 90+), and isolate legacy arrears.',
    steps: [
      { label: 'Extracting Open Invoices & Credit Notes', detail: 'Queried active customer debtor ledgers' },
      { label: 'Classifying Overdue Aging Brackets', detail: '78% of active debt sits cleanly inside 30-day term' },
      { label: 'Quarantining Stale Debtor Ledgers', detail: 'AED 179M legacy balance isolated from operational cash flow' },
    ],
    metrics: [
      { label: 'Active Current Receivables', value: 'AED 2.14M', change: '78% within terms', positive: true },
      { label: '31–60 Day Overdue Tier', value: 'AED 380K', change: 'Follow-ups queued', positive: false },
      { label: 'Legacy Quarantine Ledger', value: 'AED 179M', change: 'Frozen balance', positive: false },
      { label: 'Collection Run-Rate', value: '94.2%', change: '+3.1% this week', positive: true },
    ],
    findings: [
      {
        title: 'AED ~179M legacy ledger successfully partitioned',
        detail: 'Historical uncollectible balance does not distort current operational working capital metrics.',
        severity: 'info',
      },
      {
        title: 'Immediate collection priority: 4 accounts past 45 days',
        detail: 'Automated dunning reminders dispatched with statement of account attachments.',
        severity: 'warning',
      },
    ],
    tableHeaders: ['Aging Tier', 'Ledger Total (AED)', '% of Portfolio', 'Action Required'],
    tableData: [
      { col1: 'Current (0–30 Days)', col2: 'AED 1,670,000', col3: '78.0%', status: 'Healthy' },
      { col1: 'Past Due (31–60 Days)', col2: 'AED 305,000', col3: '14.2%', status: 'Automated Notice' },
      { col1: 'Critical (61–90 Days)', col2: 'AED 170,000', col3: '7.8%', status: 'Credit Hold' },
      { col1: 'Historical Legacy (Quarantined)', col2: 'AED 179,000,000', col3: 'Separate Ledger', status: 'Legal Review' },
    ],
  },
  {
    id: 'inventory',
    name: 'Supply Chain & Inventory Agent',
    role: 'Raw Materials, Reorder Points & BOMs',
    icon: PackageCheck,
    erpAnchor: ROUTES.ERP_MODULES.TRIAL_BALANCE,
    prompt: 'Check raw material stock levels, verify minimum reorder safety thresholds, and calculate inventory valuation.',
    steps: [
      { label: 'Auditing Warehouse Stock Registers', detail: '8,504 active SKUs tracked across 3 warehouse locations' },
      { label: 'Evaluating Lead Times & Supplier Reorders', detail: '3 critical raw material lines approaching safety floor' },
      { label: 'Computing FIFO & Weighted Valuations', detail: 'Total active stock inventory valued at AED 6.83M' },
    ],
    metrics: [
      { label: 'Total Tracked SKUs', value: '8,504', change: 'Active Registers', positive: true },
      { label: 'Total Stock Valuation', value: 'AED 6.83M', change: '+3.1% vs Q2', positive: true },
      { label: 'Reorder Safety Alerts', value: '3 Lines', change: 'Action Required', positive: false },
      { label: 'Pending Goods Receipts', value: '14 GRNs', change: 'In QA Inspection', positive: true },
    ],
    findings: [
      {
        title: 'Alloy Rods & Couplers approaching safety floor',
        detail: 'Draft purchase orders generated for approved vendor contracts to prevent assembly delays.',
        severity: 'warning',
      },
      {
        title: 'Inventory turnover ratio improved to 6.2x',
        detail: 'Just-in-time stocking for high-velocity electronics reduced warehouse holding costs.',
        severity: 'success',
      },
    ],
    tableHeaders: ['Material / SKU Category', 'Current Stock', 'Safety Reorder Floor', 'Inventory Status'],
    tableData: [
      { col1: 'High-Tensile Alloy Rods (MT)', col2: '1,240 Units', col3: '200 Units', status: 'Healthy' },
      { col1: 'Power Coupler Assemblies', col2: '3,820 Units', col3: '500 Units', status: 'Healthy' },
      { col1: 'Tier-1 Industrial Sensors', col2: '890 Units', col3: '300 Units', status: 'Healthy' },
      { col1: 'Specialized Hardware Fasteners', col2: '4,500 Boxes', col3: '1,000 Boxes', status: 'Reorder Triggered' },
    ],
  },
]

export default function InteractiveAgentDemo() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [animProgress, setAnimProgress] = useState(100)
  const [isExecuting, setIsExecuting] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.15 })

  const agent = AGENTS[activeIdx]

  // Sequence trigger on agent switch
  const selectAgent = (idx: number) => {
    if (idx === activeIdx && isExecuting) return
    setActiveIdx(idx)
    setIsExecuting(true)
    setAnimProgress(0)

    let p = 0
    const interval = setInterval(() => {
      p += 25
      setAnimProgress(p)
      if (p >= 100) {
        clearInterval(interval)
        setIsExecuting(false)
      }
    }, 160)
  }

  useEffect(() => {
    if (isInView) {
      selectAgent(activeIdx)
    }
  }, [isInView])

  return (
    <section
      id="interactive-demo"
      ref={sectionRef}
      className="py-24 sm:py-32 bg-slate-900 text-white relative overflow-hidden w-full"
      aria-label="Interactive ERP Agent Demo"
    >
      {/* Background Subtle Tech Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Ambient Radial Lights */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[450px] bg-blue-600/15 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[700px] h-[450px] bg-cyan-500/15 blur-[150px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section Header (Matching Reference A: Outlined label, animated 2-line headline, short copy) */}
        <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
          <motion.div
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-blue-400/30 bg-blue-500/10 text-cyan-300 text-xs font-mono uppercase tracking-widest mb-5"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles size={12} className="text-cyan-400" />
            <span>Interactive Demo // Autonomous Agent Execution</span>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] mb-5"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Delegate complex business queries.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent block sm:inline">
              Watch AI execute in real time.
            </span>
          </motion.h2>

          <motion.p
            className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Select an autonomous ERP agent below to see instant query parsing, invariant verification, and real-time ledger generation.
          </motion.p>
        </div>

        {/* Row of Interactive Agent Selectors (Reference A Top Bar) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {AGENTS.map((a, idx) => {
            const Icon = a.icon
            const isSelected = idx === activeIdx
            return (
              <button
                key={a.id}
                onClick={() => selectAgent(idx)}
                className={`p-4 sm:p-5 rounded-2xl text-left transition-all duration-300 border flex flex-col justify-between relative group ${
                  isSelected
                    ? 'bg-slate-800/90 border-blue-500/80 shadow-elevation ring-2 ring-blue-500/20'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70 hover:border-slate-600'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
                  </span>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-blue-glow'
                        : 'bg-slate-700/60 text-slate-300 group-hover:bg-slate-700'
                    }`}
                  >
                    <Icon size={19} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {a.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{a.role}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700/40">
                  <span className="font-mono text-cyan-400">Agent {idx + 1} of 4</span>
                  <span className="font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    {isSelected ? 'Simulating' : 'Simulate'} →
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Large Realistic Application Interface Panel (Reference A Workstation) */}
        <motion.div
          className="rounded-3xl border border-slate-700/80 bg-slate-950/80 shadow-2xl overflow-hidden backdrop-blur-md"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Workstation Top Bar / Terminal Header */}
          <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
                <Terminal size={14} className="text-cyan-400" />
                <span>agent://{agent.id}.audit.raapnexus.internal</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/60">
                <ShieldCheck size={13} /> Invariants Protected
              </span>
              <a
                href={agent.erpAnchor}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 uppercase tracking-wider"
              >
                Inspect in Live ERP <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div className="p-5 sm:p-8 lg:p-10 space-y-8">
            {/* Task Prompt & Execution Bar */}
            <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5 font-mono text-xs font-bold">
                  &gt;_
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      Dispatched Natural Language Instruction
                    </span>
                    <span className="text-xs font-mono text-cyan-400">
                      {isExecuting ? 'Processing...' : 'Completed (160ms)'}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-slate-100 font-medium">
                    "{agent.prompt}"
                  </p>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    style={{ width: `${animProgress}%` }}
                    transition={{ ease: 'linear' }}
                  />
                </div>
              </div>
            </div>

            {/* 3-Step Execution Progress Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {agent.steps.map((st, i) => {
                const isDone = animProgress >= (i + 1) * 33
                return (
                  <div
                    key={st.label}
                    className={`p-4 rounded-xl border transition-all ${
                      isDone
                        ? 'bg-slate-900/90 border-blue-500/40 text-slate-200'
                        : 'bg-slate-900/30 border-slate-800/80 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {isDone ? (
                        <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0" />
                      ) : (
                        <Loader2 size={16} className="text-slate-600 animate-spin flex-shrink-0" />
                      )}
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Step 0{i + 1}: {st.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                      {st.detail}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Live KPI Indicators */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {agent.metrics.map((m) => (
                <div key={m.label} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5">
                  <span className="text-[11px] text-slate-400 block mb-1 uppercase font-semibold tracking-wider">
                    {m.label}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-white font-mono block">
                    {m.value}
                  </span>
                  <span
                    className={`text-xs font-semibold block mt-1 ${
                      m.positive ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {m.change}
                  </span>
                </div>
              ))}
            </div>

            {/* Generated Application Preview & Ledger Data Table */}
            <div className="bg-slate-900/70 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Synthesized Ledger Extract · Verified ABC Company Engine
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  PostgreSQL · Schema Invariant Confirmed
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      {agent.tableHeaders.map((th, i) => (
                        <th key={th} className={`py-3 px-4 ${i === 0 ? 'pl-6' : ''}`}>
                          {th}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {agent.tableData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 pl-6 text-slate-200 font-medium">{row.col1}</td>
                        <td className="py-3 px-4 text-slate-400">{row.col2}</td>
                        <td className="py-3 px-4 text-slate-300 font-bold">{row.col3}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950/80 text-cyan-300 border border-blue-800/60">
                            <CheckCircle2 size={10} /> {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ranked Strategic Findings */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block font-bold">
                Ranked Autonomous Findings & Recommended Actions:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {agent.findings.map((f, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                      f.severity === 'warning'
                        ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                        : f.severity === 'success'
                        ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                        : 'bg-blue-950/30 border-blue-800/60 text-blue-200'
                    }`}
                  >
                    {f.severity === 'warning' ? (
                      <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <strong className="block text-white mb-1 font-bold">{f.title}</strong>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{f.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Compact CTA Below the Panel (Reference A) */}
          <div className="bg-slate-900/90 border-t border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Full ERP dataset sanitized. All metrics match the standalone dashboard.</span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={ROUTES.ERP_SANDBOX}
                className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Open Full Workstation Sandbox →
              </Link>
              <a
                href={ROUTES.ERP_STANDALONE}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs py-2 px-4 uppercase tracking-wider font-bold shadow-blue-glow"
              >
                <Play size={12} className="fill-white" /> Launch Standalone ERP
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
