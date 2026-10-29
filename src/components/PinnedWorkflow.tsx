import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MessageSquareText, Shield, CheckCircle2, Lock, ArrowRight, Layers } from 'lucide-react'
import { Link } from 'react-router-dom'

gsap.registerPlugin(ScrollTrigger)

const PHASES = [
  {
    step: '01',
    title: 'Ask in Everyday Words',
    subtitle: 'Natural Language Ingestion',
    icon: MessageSquareText,
    description:
      'Pose any operational or financial question without SQL or custom IT tickets. The system parses commercial intent across sales, stock, and ledger ledgers.',
    query: 'What was our branch revenue yesterday and which customers have overdue accounts > 60 days?',
    badge: 'Intent Parser V3',
  },
  {
    step: '02',
    title: 'Enforce Role Scoping & Invariants',
    subtitle: 'Zero-Leakage Governance Gateway',
    icon: Shield,
    description:
      'Every query runs against strict role-based access controls. Legal entities, branches, and salary accounts remain strictly partitioned.',
    checks: [
      { rule: 'Legal Entity Boundary', status: 'Dubai HQ Scoped', ok: true },
      { rule: 'User Role Permissions', status: 'Commercial Director Tier', ok: true },
      { rule: 'Accounting Invariant Check', status: 'Double-Entry Balanced', ok: true },
    ],
    badge: 'Sovereign Gateway Active',
  },
  {
    step: '03',
    title: 'Inspect Governed Ledger Outcomes',
    subtitle: 'Audited Action & Sign-Off',
    icon: CheckCircle2,
    description:
      'Receive instant visual breakdowns, ranked findings, or draft vouchers. Sensitive actions require explicit human authorization before writing to disk.',
    kpi: 'AED 314,700',
    kpiLabel: 'Yesterday Network Sales',
    flag: '2 One-off items flagged for CFO review',
    badge: 'Verified & Provenance-Logged',
  },
]

export default function PinnedWorkflow() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const pinContainerRef = useRef<HTMLDivElement>(null)
  const [activePhase, setActivePhase] = useState(0)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create scroll-driven pinned timeline
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=200%',
        pin: pinContainerRef.current,
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress
          if (progress < 0.33) {
            setActivePhase(0)
          } else if (progress < 0.66) {
            setActivePhase(1)
          } else {
            setActivePhase(2)
          }
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const phase = PHASES[activePhase]

  return (
    <section id="workflow" ref={sectionRef} className="relative bg-white border-b border-slate-200/80">
      {/* Pinned Viewport Container */}
      <div ref={pinContainerRef} className="min-h-screen flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="section-label mb-3">
              <Layers size={12} className="text-electric-blue" />
              Scroll-Linked Storytelling
            </div>
            <h2 className="section-heading text-3xl sm:text-4xl lg:text-5xl mb-3">
              From natural intent to{' '}
              <span className="gradient-text-blue">audited ERP execution.</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Scroll down to watch how RaapNexus navigates permission boundaries, validates accounting rules, and delivers verified outcomes.
            </p>
          </div>

          {/* Two-Column Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Step Indicators & Explanations (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {PHASES.map((p, idx) => {
                const Icon = p.icon
                const isActive = activePhase === idx
                return (
                  <div
                    key={p.step}
                    onClick={() => setActivePhase(idx)}
                    className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-blue-50/80 border-electric-blue shadow-card-hover'
                        : 'bg-slate-50/50 border-slate-200/80 hover:bg-white opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                            isActive ? 'bg-electric-blue text-white shadow-blue-glow' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Step {p.step} · {p.subtitle}
                        </span>
                      </div>
                      <span className="font-mono text-xl font-black text-slate-300">{p.step}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-1">{p.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Right: Dynamic Interactive Screen Canvas (7 Cols) */}
            <div className="lg:col-span-7">
              <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-elevation bg-white relative overflow-hidden min-h-[420px] flex flex-col justify-between">
                {/* Canvas Top Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      PHASE {phase.step} // {phase.badge}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {PHASES.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === activePhase ? 'w-6 bg-electric-blue' : 'w-2 bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Animated Phase Canvas Content */}
                <div className="flex-1 flex flex-col justify-center">
                  {/* Phase 1: Ingestion */}
                  {activePhase === 0 && (
                    <motion.div
                      key="p0"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="text-xs font-semibold text-slate-400 uppercase">
                        Executive Natural Language Input
                      </div>
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900 font-mono text-sm shadow-xs leading-relaxed">
                        "{phase.query}"
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-lg text-xs">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Identified Intention</span>
                          <span className="font-bold text-electric-blue">Cross-Branch Sales Aggregation</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Secondary Filter</span>
                          <span className="font-bold text-slate-800">Ageing Days &gt; 60 Ledger Bucket</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Phase 2: Gateway */}
                  {activePhase === 1 && (
                    <motion.div
                      key="p1"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase">
                        <span>Ledger Invariant Verification</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <Shield size={12} /> Air-Gapped Sandbox
                        </span>
                      </div>
                      <div className="space-y-2.5 font-mono text-xs">
                        {phase.checks?.map((c, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                          >
                            <span className="text-slate-600">{c.rule}</span>
                            <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                              <CheckCircle2 size={14} /> {c.status}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold flex items-center gap-2">
                        <Lock size={14} className="text-amber-700 flex-shrink-0" />
                        <span>Zero training on private books. All records stay within customer boundary.</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Phase 3: Audited Outcome */}
                  {activePhase === 2 && (
                    <motion.div
                      key="p2"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase">
                        <span>Audited Output Committed</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                          Ready for Sign-Off
                        </span>
                      </div>
                      <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-500 font-semibold block">
                            {phase.kpiLabel}
                          </span>
                          <span className="text-3xl font-black text-slate-900 font-mono">
                            {phase.kpi}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-mono block">VERIFIED SOURCE</span>
                          <span className="text-xs font-bold text-electric-blue">ABC-LEDGER-2026</span>
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium">
                        {phase.flag}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Canvas Footer Bar */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs mt-6">
                  <span className="text-slate-400">
                    Live ERP Architecture Simulation
                  </span>
                  <Link
                    to="/demo"
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 font-bold"
                  >
                    Launch Full Sandbox <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
