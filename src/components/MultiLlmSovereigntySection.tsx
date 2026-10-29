import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Cpu, Shield, Lock, Database, GitBranch,
  CheckCircle2, EyeOff
} from 'lucide-react'

const SOVEREIGNTY_PILLARS = [
  {
    id: 'models',
    title: 'Multi-LLM Choice & Agnostic Routing',
    subtitle: 'Provider Freedom',
    icon: Cpu,
    description:
      'Deploy against Google Gemini, Anthropic Claude, OpenAI, or private on-premise models (such as Llama or Mistral). Switch providers at any time without re-architecting your ERP schemas.',
    highlights: [
      'Hot-swappable model endpoints without data lock-in',
      'Configurable latency vs. reasoning cost tiers',
      'Air-gapped private model hosting supported',
    ],
  },
  {
    id: 'sovereignty',
    title: 'Zero Data Retention & Sovereign Storage',
    subtitle: 'Confidentiality First',
    icon: EyeOff,
    description:
      'Your business transactions and accounting records are never used to train public or foundation models. Prompts and database results remain strictly within your tenant boundary.',
    highlights: [
      'No model fine-tuning on proprietary enterprise records',
      'Customer-managed encryption keys (CMEK)',
      'Regional data residency compliance',
    ],
  },
  {
    id: 'scoping',
    title: 'Role-Based Tenant Scoping',
    subtitle: 'Granular Permissions',
    icon: Lock,
    description:
      'AI interactions inherit the exact authorization boundaries of the signed-in user. A warehouse manager cannot query executive payroll or board-level trial balance variance.',
    highlights: [
      'Dynamic SQL & API query permission filtering',
      'Multi-branch and multi-company legal entity isolation',
      'Strict separation of administrative roles',
    ],
  },
  {
    id: 'governance',
    title: 'Business-Rule Gateways & Human Sign-Off',
    subtitle: 'Audit & Accountability',
    icon: Shield,
    description:
      'AI proposes actions; verified humans approve them. Invoices, journal adjustments, and credit line modifications undergo rigorous ledger invariant checks before committing.',
    highlights: [
      'Immutable cryptographic transaction logs',
      'Mandatory human sign-off on balance sheet adjustments',
      'Full explainability: AI shows source ledger references',
    ],
  },
]

export default function MultiLlmSovereigntySection() {
  const [activePillar, setActivePillar] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const current = SOVEREIGNTY_PILLARS[activePillar]
  const Icon = current.icon

  return (
    <section id="ai-sovereignty" ref={ref} className="py-24 bg-white relative overflow-hidden border-b border-slate-200/80">
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
            <Lock size={12} />
            Data Sovereignty & Multi-LLM Architecture
          </div>
          <h2 className="section-heading text-3xl sm:text-4xl lg:text-5xl mb-4">
            Total sovereignty.{' '}
            <span className="gradient-text-blue">Multi-model intelligence.</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Harness modern artificial intelligence without forfeiting control over sensitive business ledgers,
            customer registries, or operational secrets.
          </p>
        </motion.div>

        {/* Central Architecture Blueprint Visual */}
        <motion.div
          className="mb-14 rounded-2xl bg-slate-50 border border-slate-200/90 p-6 sm:p-8 shadow-card relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <GitBranch size={16} className="text-electric-blue" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Data Sovereignty & Execution Flow
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Air-Gapped & Zero-Training Certified
            </div>
          </div>

          {/* 4 Pipeline Stages */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
            {/* Step 1: Enterprise ERP Core */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Source Core</span>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Your ERP Records</h4>
                <p className="text-xs text-slate-500">PostgreSQL / SQL Ledgers, Inventory & Sales Datastores</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <Database size={13} className="text-slate-400" />
                <span>On-Prem / Private Cloud</span>
              </div>
            </div>

            {/* Step 2: Sovereignty Gateway */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-electric-blue uppercase tracking-wider block mb-1">Security Shield</span>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Sovereign Gateway</h4>
                <p className="text-xs text-slate-600">Zero data-retention proxy, PII masking & role scoping</p>
              </div>
              <div className="mt-4 pt-3 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-electric-blue font-semibold">
                <Shield size={13} />
                <span>Encrypted Memory</span>
              </div>
            </div>

            {/* Step 3: Multi-LLM Processing */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Reasoning Layer</span>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Multi-LLM Engine</h4>
                <p className="text-xs text-slate-500">Gemini, Claude, GPT, or local self-hosted weights</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <Cpu size={13} className="text-slate-400" />
                <span>Zero Training Guarantee</span>
              </div>
            </div>

            {/* Step 4: Governed Output */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">Commit Stage</span>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Human Verification</h4>
                <p className="text-xs text-slate-600">Verified reporting, audited workflow commitments</p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                <CheckCircle2 size={13} />
                <span>Sign-Off Required</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 4 Pillars Interactive Tabs & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Pillar Selector Pills */}
          <div className="lg:col-span-4 flex flex-col gap-2.5">
            {SOVEREIGNTY_PILLARS.map((p, idx) => {
              const PIcon = p.icon
              const isSelected = activePillar === idx
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePillar(idx)}
                  className={`p-4 rounded-xl text-left border transition-all duration-200 flex items-center gap-3.5 ${
                    isSelected
                      ? 'bg-blue-50/80 border-electric-blue text-slate-900 shadow-xs'
                      : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? 'bg-electric-blue text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <PIcon size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {p.subtitle}
                    </span>
                    <h4 className="text-sm font-bold truncate">{p.title}</h4>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Pillar Details Card */}
          <div className="lg:col-span-8">
            <div className="glass-card rounded-2xl p-7 sm:p-9 border border-slate-200/90 shadow-card bg-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-electric-blue">
                  <Icon size={20} />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {current.subtitle}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {current.title}
                  </h3>
                </div>
              </div>

              <p className="text-slate-600 text-base leading-relaxed mb-6">
                {current.description}
              </p>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Architectural Commitments
                </h4>
                {current.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 size={16} className="mt-0.5 text-emerald-600 flex-shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
