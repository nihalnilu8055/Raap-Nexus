import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Play, ArrowRight, Sparkles, CheckCircle2, ShieldCheck,
  ExternalLink, TrendingUp, AlertTriangle, Cpu
} from 'lucide-react'
import { ROUTES } from '../config/routes'

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 })

  // Subtle scroll parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100])
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.96])

  useEffect(() => {
    const onPointerMove = (e: MouseEvent) => {
      // Normalize pointer from -1 to 1 across the screen
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      setPointerOffset({ x, y })
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [])

  const words = ['Your', 'Business.', 'One', 'Autonomous', 'Conversation', 'Away.']

  // Combined 3D rotation: base 3D angle + pointer deflection
  const rotX = 8 - pointerOffset.y * 5
  const rotY = -6 + pointerOffset.x * 6

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-white via-slate-50/70 to-white pt-32 sm:pt-40 pb-20 w-full"
      aria-label="RaapNexus Hero Section"
    >
      {/* Background Subtle Tech Grid & Glowing Lights */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="absolute top-1/6 left-1/4 w-[700px] h-[700px] rounded-full bg-blue-100/50 blur-[150px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-cyan-100/40 blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col items-center text-center">
        {/* Outlined Eyebrow Pill */}
        <motion.div
          className="section-label mb-6 shadow-2xs cursor-default inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/90 text-electric-blue text-xs font-bold uppercase tracking-wider"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Sparkles size={14} className="text-electric-blue animate-spin-slow" />
          <span>Next-Generation Autonomous ERP Intelligence</span>
        </motion.div>

        {/* Staggered Word Entrance Headline */}
        <h1 className="font-black text-slate-900 tracking-tight leading-[1.05] max-w-5xl mb-6 text-4xl sm:text-6xl md:text-7xl lg:text-7xl">
          {words.map((word, idx) => {
            const isHighlight = word === 'Autonomous' || word === 'Conversation'
            return (
              <motion.span
                key={word + idx}
                className={`inline-block mr-3 sm:mr-4 ${isHighlight ? 'gradient-text-blue' : ''}`}
                initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{
                  duration: 0.7,
                  delay: 0.1 + idx * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {word}
              </motion.span>
            )
          })}
        </h1>

        {/* Minimal High-Impact Subtitle */}
        <motion.p
          className="text-base sm:text-xl text-slate-600 max-w-3xl mb-10 leading-relaxed text-balance"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          Connect your general ledger, invoices, stock, and statutory compliance directly to sovereign AI.
          Ask in plain words, explore live ledgers, and commit audited transactions with your accounting invariants preserved.
        </motion.p>

        {/* Action CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full sm:w-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          {/* Primary Demo CTA: standalone authentic ERP dashboard */}
          <a
            href={ROUTES.ERP_STANDALONE}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm py-4 px-8 shadow-blue-glow flex items-center justify-center gap-2.5 uppercase tracking-wider font-bold w-full sm:w-auto text-white hover:scale-[1.02] active:scale-95 transition-all"
            title="Open original ABC Company standalone ERP dashboard"
          >
            <Play size={15} className="fill-white" />
            <span>Launch Standalone ERP</span>
            <ExternalLink size={13} className="opacity-80" />
          </a>

          {/* Secondary CTA: smooth scroll to interactive agent demonstration */}
          <a
            href={ROUTES.SECTIONS.INTERACTIVE_DEMO}
            className="btn-secondary text-sm py-4 px-7 flex items-center justify-center gap-2 font-bold uppercase tracking-wider w-full sm:w-auto hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span>Interactive Demo</span>
            <ArrowRight size={15} />
          </a>

          {/* Tertiary CTA: Workstation Sandbox */}
          <Link
            to={ROUTES.ERP_SANDBOX}
            className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-electric-blue transition-colors px-3 py-2 flex items-center gap-1"
          >
            Open Sandbox Workstation →
          </Link>
        </motion.div>

        {/* 3D PERSPECTIVE ERP DASHBOARD VISUAL (Real CSS 3D Depth + Floating Animation) */}
        <motion.div
          className="w-full relative mt-2 perspective-1600"
          style={{ y: heroY, scale: heroScale }}
          initial={{ opacity: 0, y: 70, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Mouse Tilt & Floating 3D Wrapper */}
          <div
            className="relative w-full max-w-[1440px] mx-auto preserve-3d transition-transform duration-300 ease-out"
            style={{
              transform: `perspective(1400px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            }}
          >
            {/* Gentle 3D Floating Bob Loop */}
            <div className="relative rounded-3xl border border-slate-200/90 bg-white shadow-elevation overflow-hidden text-left preserve-3d animate-float">
              {/* Virtual Browser Top Bar */}
              <div className="bg-slate-100/90 border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>

                <div className="flex-1 max-w-xl mx-4 bg-white border border-slate-200 rounded-lg px-3.5 py-1 text-xs text-slate-600 font-mono text-center flex items-center justify-center gap-2 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="truncate">https://raapnexus.internal/erp/dashboard.html — [ABC Company Core Ledger]</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={ROUTES.ERP_STANDALONE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-electric-blue hover:text-brand-800 flex items-center gap-1 uppercase tracking-wider"
                  >
                    Open Standalone <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Main Dashboard Visual Canvas with Real-Time Data & Floating 3D Chips */}
              <div className="p-5 sm:p-8 lg:p-10 bg-slate-50/70 relative preserve-3d">
                {/* Real-time KPI Ribbon (Authentic ABC Company General Ledger) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 preserve-3d">
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs transition-transform hover:-translate-y-1 hover:shadow-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Consolidated Ledger Volume
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">
                      AED 14.81M
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-1.5">
                      <TrendingUp size={13} /> Balanced Double-Entry Invariant
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs transition-transform hover:-translate-y-1 hover:shadow-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        September Revenue Run-Rate
                      </span>
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">
                      AED 1.42M
                    </span>
                    <span className="text-xs text-blue-700 font-semibold flex items-center gap-1 mt-1.5">
                      +23.5% Loss Narrowing Trend
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs transition-transform hover:-translate-y-1 hover:shadow-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Active Customer Invoices
                      </span>
                      <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">
                      184 Vouchers
                    </span>
                    <span className="text-xs text-slate-600 font-semibold block mt-1.5">
                      Dubai HQ: AED 524K Lead
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs transition-transform hover:-translate-y-1 hover:shadow-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Trial Balance Status
                      </span>
                      <ShieldCheck size={14} className="text-emerald-600" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono block">
                      100% Verified
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold block mt-1.5">
                      96 Statutory Accounts Cleared
                    </span>
                  </div>
                </div>

                {/* Main Visual: Realistic Chart & Findings Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch preserve-3d">
                  {/* Left: Trend Visual (7 Cols) */}
                  <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          Operating Revenue vs Cost Trajectory (Jan–Sep 2026)
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Verified against authentic ABC Company general ledger database
                        </p>
                      </div>
                      <span className="text-xs font-bold text-electric-blue bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                        Live Stream Active
                      </span>
                    </div>

                    {/* High-fidelity SVG chart drawing */}
                    <div className="w-full h-44 relative flex items-end justify-between pt-6 pb-2 border-b border-slate-100">
                      <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <defs>
                          <linearGradient id="heroAreaGrad3" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <polygon
                          points="0,85 14,75 28,80 42,65 56,52 70,58 84,38 100,22 100,100 0,100"
                          fill="url(#heroAreaGrad3)"
                        />
                        <path
                          d="M0,85 L14,75 L28,80 L42,65 L56,52 L70,58 L84,38 L100,22"
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      {/* Month column bars */}
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((m, i) => {
                        const heights = [35, 45, 40, 58, 70, 62, 80, 95, 100]
                        return (
                          <div key={m} className="flex flex-col items-center z-10 group cursor-pointer">
                            <div
                              className="w-5 sm:w-7 bg-slate-100 group-hover:bg-blue-100 rounded-t-md transition-all relative"
                              style={{ height: `${heights[i]}px` }}
                            >
                              <div className="w-full h-1 bg-electric-blue rounded-t-md opacity-80" />
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono mt-2 font-medium">{m}</span>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-3">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-electric-blue" /> Actual Sales Turnover
                        </span>
                        <span className="flex items-center gap-1.5 font-medium text-slate-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Operating Overheads
                        </span>
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-emerald-700">
                        September Gross Margin: 38.4%
                      </span>
                    </div>
                  </div>

                  {/* Right: Live AI Autonomous Findings & Actions (5 Cols) */}
                  <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Cpu size={15} className="text-electric-blue" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                            Autonomous Audit Stream
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          0 Invariant Violations
                        </span>
                      </div>

                      <div className="space-y-3 mt-3">
                        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs">
                          <div className="flex items-center gap-1.5 text-blue-900 font-bold mb-1">
                            <CheckCircle2 size={13} className="text-blue-600 flex-shrink-0" />
                            <span>Quarterly Margin Trajectory Cleared</span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            Dubai HQ retail volume expanded 18% month-over-month. Gross margin trajectory narrowed prior 8-month deficit by AED 240,000.
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs">
                          <div className="flex items-center gap-1.5 text-amber-900 font-bold mb-1">
                            <AlertTriangle size={13} className="text-amber-600 flex-shrink-0" />
                            <span>Two Miscellaneous Debit Notes Flagged</span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            AED 42,000 in promotional supplier allowances requires dual-controller authorization before monthly closing voucher is locked.
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-800 font-bold mb-1">
                            <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
                            <span>Double-Entry Balance Invariant Confirmed</span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            Total General Ledger debits equal credits at AED 14,815,000 with 0 orphaned child line items.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Source: /erp/dashboard.html
                      </span>
                      <a
                        href={ROUTES.ERP_STANDALONE}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-xs py-2 px-3.5 font-bold uppercase tracking-wider"
                      >
                        Open Full Dashboard <ArrowRight size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
