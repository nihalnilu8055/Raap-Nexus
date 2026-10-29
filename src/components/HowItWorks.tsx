import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { MessageSquareText, Cpu, CheckCircle2, Layers } from 'lucide-react'

const steps = [
  {
    step: '01',
    icon: MessageSquareText,
    title: 'Ask in Everyday Business Words',
    subtitle: 'Conversational Input',
    description:
      'Ask any business question in plain language — whether about yesterday\'s branch revenue, aging receivables, inventory stockout risks, or trial balance health.',
    visual: {
      type: 'query',
      query: 'What is our outstanding receivables breakdown by customer aging tier?',
      badge: 'Natural Language Processing',
    },
  },
  {
    step: '02',
    icon: Cpu,
    title: 'Process with Strict Controls',
    subtitle: 'Context & Permissions Engine',
    description:
      'The engine maps your query to authorized ERP databases, verifies user role permissions, enforces company scoping, and validates accounting rules.',
    visual: {
      type: 'engine',
      metrics: [
        { label: 'Entity Scoping', val: 'Dubai HQ Legal Entity', status: 'ok' },
        { label: 'Role Validation', val: 'Finance Director (Tier 1)', status: 'ok' },
        { label: 'Audit Trail ID', val: 'TXN-9024-LOG', status: 'ok' },
      ],
      badge: 'Zero Hallucination Grounding',
    },
  },
  {
    step: '03',
    icon: CheckCircle2,
    title: 'Review Validated Insights & Actions',
    subtitle: 'Immediate Executive Output',
    description:
      'Receive visual charts, formatted financial tables, or proposed workflow actions. High-impact transactions require explicit human sign-off before committing.',
    visual: {
      type: 'insight',
      statPrimary: 'AED 2,145,000',
      statLabel: 'Current Receivables (<30-Day Bucket)',
      health: '94% On-Track',
      badge: 'Audited ERP Commitment',
    },
  },
]

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="how-it-works" ref={ref} className="py-24 bg-white relative overflow-hidden border-b border-slate-200/80">
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label mb-4">
            <Layers size={13} />
            The Intelligence Flow
          </div>
          <h2 className="section-heading text-3xl sm:text-4xl lg:text-5xl mb-4">
            How RaapNexus bridges{' '}
            <span className="gradient-text-blue">intent with execution.</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            From natural language queries to precision enterprise reporting in seconds — with complete audit trails and role-based security.
          </p>
        </motion.div>

        {/* 3 Step Interactive Process */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          {/* Connecting line on desktop */}
          <div className="hidden lg:block absolute top-1/2 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-200 -translate-y-12 z-0" />

          {steps.map((s, i) => {
            const Icon = s.icon
            const isSelected = activeStep === i
            return (
              <motion.div
                key={s.step}
                className={`relative z-10 flex flex-col rounded-2xl transition-all duration-300 p-7 cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-50/60 border-electric-blue shadow-card-hover'
                    : 'bg-slate-50/60 border-slate-200/90 hover:bg-white hover:border-slate-300'
                }`}
                onClick={() => setActiveStep(i)}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                whileHover={{ y: -4 }}
              >
                {/* Step badge & icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                        isSelected
                          ? 'bg-electric-blue text-white shadow-blue-glow'
                          : 'bg-white text-slate-500 border border-slate-200'
                      }`}
                    >
                      <Icon size={22} />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold tracking-widest uppercase text-electric-blue">
                        Step {s.step}
                      </span>
                      <h4 className="text-xs text-slate-500 font-semibold">{s.subtitle}</h4>
                    </div>
                  </div>
                  <span className="text-3xl font-black text-slate-200 font-mono">{s.step}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                  {s.description}
                </p>

                {/* Micro Visual Card */}
                <div className="rounded-xl bg-white border border-slate-200/90 p-4 text-xs shadow-2xs">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                    <span className="text-[10px] text-electric-blue uppercase font-bold tracking-wider">
                      {s.visual.badge}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  </div>

                  {s.visual.type === 'query' && (
                    <div className="text-slate-800 font-medium italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      "{s.visual.query}"
                    </div>
                  )}

                  {s.visual.type === 'engine' && (
                    <div className="space-y-1.5 font-mono text-[11px]">
                      {s.visual.metrics?.map((m) => (
                        <div key={m.label} className="flex justify-between items-center">
                          <span className="text-slate-500">{m.label}</span>
                          <span className="text-emerald-700 font-bold">{m.val}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {s.visual.type === 'insight' && (
                    <div className="flex flex-col gap-1">
                      <div className="text-lg font-black text-slate-900 font-mono">{s.visual.statPrimary}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{s.visual.statLabel}</div>
                      <div className="mt-2 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> {s.visual.health}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
