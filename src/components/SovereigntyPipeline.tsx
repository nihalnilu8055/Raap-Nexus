import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Cpu, Shield, Lock, Database,
  CheckCircle2, EyeOff, Play, ExternalLink
} from 'lucide-react'
import { ROUTES } from '../config/routes'

interface ModelProvider {
  id: string
  name: string
  provider: string
  type: string
  latency: string
  privacyTier: string
  sampleOutput: string
  iconColor: string
}

const PROVIDERS: ModelProvider[] = [
  {
    id: 'gemini',
    name: 'Google Gemini Pro / Flash',
    provider: 'Google Cloud Platform',
    type: 'Enterprise Cloud API',
    latency: '~420ms',
    privacyTier: 'Zero-Retention BAA',
    sampleOutput: 'Analyzed 9-month revenue run-rate: September narrowed loss by AED 240,000. Balanced against 96 ledger accounts.',
    iconColor: '#2563EB',
  },
  {
    id: 'claude',
    name: 'Anthropic Claude 3.5 Sonnet',
    provider: 'Anthropic Bedrock / Vertex',
    type: 'Enterprise Cloud API',
    latency: '~650ms',
    privacyTier: 'Zero Data Training Standard',
    sampleOutput: 'Customer concentration risk detected: 2 single-category buyers account for 42% volume. Credit limit enforcement advised.',
    iconColor: '#7C3AED',
  },
  {
    id: 'openai',
    name: 'OpenAI GPT-4o Enterprise',
    provider: 'Azure OpenAI Private Gateway',
    type: 'Dedicated Enterprise Tenant',
    latency: '~580ms',
    privacyTier: 'Customer-Managed Keys (CMEK)',
    sampleOutput: 'Automated trial balance audit complete. Total debits equal credits at AED 14,815,000. Zero unposted vouchers.',
    iconColor: '#059669',
  },
  {
    id: 'local',
    name: 'Self-Hosted Private Weights (Llama / Mistral)',
    provider: 'Customer Private VPC / On-Premise',
    type: 'Air-Gapped Sovereign Cluster',
    latency: '~320ms',
    privacyTier: '100% On-Premise Air-Gapped',
    sampleOutput: 'Legacy receivables quarantine active: AED 179M partitioned from active working capital liquidity reporting.',
    iconColor: '#D97706',
  },
]

export default function SovereigntyPipeline() {
  const [selectedProvider, setSelectedProvider] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const current = PROVIDERS[selectedProvider]

  return (
    <section
      id="ai-sovereignty"
      ref={ref}
      className="py-24 sm:py-32 bg-white relative overflow-hidden border-b border-slate-200/80 w-full"
      aria-label="Multi-LLM and Sovereignty"
    >
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <motion.div
            className="section-label mb-4 shadow-2xs cursor-default inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-electric-blue text-xs font-bold uppercase tracking-wider"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.5 }}
          >
            <Lock size={12} className="text-electric-blue" />
            <span>Multi-LLM & Data Sovereignty</span>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08] mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Model agnostic.{' '}
            <span className="gradient-text-blue block sm:inline">
              Completely sovereign.
            </span>
          </motion.h2>

          <motion.p
            className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Route queries across leading cloud intelligence engines or run 100% on-premise. Your financial records, employee compensation, and trade ledgers never train foundation models.
          </motion.p>
        </div>

        {/* Visual 3-Node Architecture Pipeline Flow */}
        <div className="w-full max-w-5xl my-6 bg-slate-50 border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch relative">
            {/* Node 1: ERP Core Database */}
            <motion.div
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs relative group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-electric-blue flex items-center justify-center font-bold">
                  <Database size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Source of Truth
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">ERP Core Database</h4>
                </div>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 mb-4">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  PostgreSQL ACID ledgers
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  Row-level security policies
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  Double-entry invariants
                </li>
              </ul>
              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                AES-256 at rest
              </div>
            </motion.div>

            {/* Node 2: Sovereign Zero-Retention Gateway */}
            <motion.div
              className="bg-white rounded-2xl border-2 border-electric-blue p-6 flex flex-col justify-between shadow-elevation relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-electric-blue text-white text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full shadow-xs">
                Zero-Retention Gateway
              </div>
              <div className="flex items-center gap-3 mb-4 mt-1">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-blue-glow">
                  <Shield size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Middleware Guard
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">Sovereign Boundary</h4>
                </div>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 mb-4">
                <li className="flex items-center gap-1.5 font-medium text-slate-900">
                  <EyeOff size={13} className="text-electric-blue" />
                  PII & Salaried Data Redaction
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  Ephemeral query context
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  Signed token authorization
                </li>
              </ul>
              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-electric-blue font-bold">
                Zero Data Training Guarantee
              </div>
            </motion.div>

            {/* Node 3: AI Inference Providers */}
            <motion.div
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Cpu size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Execution Cluster
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">Multi-Model Cloud / VPC</h4>
                </div>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 mb-4">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  Gemini, Claude, GPT-4o
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  On-Premise Llama / Mistral
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  Dynamic failover routing
                </li>
              </ul>
              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                Customer-managed VPC endpoints
              </div>
            </motion.div>
          </div>
        </div>

        {/* Interactive Provider Selector & Live Output */}
        <div className="w-full max-w-5xl mt-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {PROVIDERS.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setSelectedProvider(idx)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedProvider === idx
                    ? 'bg-white border-electric-blue shadow-card ring-2 ring-blue-100'
                    : 'bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {p.type}
                  </span>
                  {selectedProvider === idx && (
                    <span className="w-2 h-2 rounded-full bg-electric-blue" />
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
                  <span>{p.latency}</span>
                  <span className="text-emerald-700 font-semibold">{p.privacyTier}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Active Model Output Inspection Card */}
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Active Routing Pipeline: {current.name} · {current.provider}
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-800 font-mono bg-slate-50 p-4 rounded-xl border border-slate-200">
                "{current.sampleOutput}"
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto flex-shrink-0">
              <a
                href={ROUTES.ERP_STANDALONE}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs py-2.5 px-4 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <Play size={12} className="fill-white" />
                <span>Launch ERP Core</span>
                <ExternalLink size={12} />
              </a>
              <Link
                to={ROUTES.ERP_SANDBOX}
                className="btn-secondary text-xs py-2.5 px-4 font-bold uppercase tracking-wider text-center"
              >
                Sandbox Workstation
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
