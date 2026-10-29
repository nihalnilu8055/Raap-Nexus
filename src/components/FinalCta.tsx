import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Play, Sparkles, Calendar, Layers, ExternalLink } from 'lucide-react'
import { ROUTES } from '../config/routes'

export default function FinalCta() {
  const ref = useRef<HTMLDivElement>(null)

  const handleScroll = (href: string) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section
      id="book-demo"
      ref={ref}
      className="py-24 sm:py-32 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden border-b border-slate-200/80 w-full"
      aria-label="Final Call to Action"
    >
      <div className="absolute inset-0 grid-bg opacity-35 pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          className="section-label mb-6 mx-auto shadow-2xs cursor-default inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-electric-blue text-xs font-bold uppercase tracking-wider"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.5 }}
        >
          <Sparkles size={12} className="text-electric-blue" />
          <span>Modernize Your Enterprise With Sovereign AI</span>
        </motion.div>

        <motion.h2
          className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.08] tracking-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Your Business Has Answers.{' '}
          <span className="gradient-text-blue block sm:inline">Start Asking.</span>
        </motion.h2>

        <motion.p
          className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Transform routine accounting and branch reporting into conversational speed. Zero training on foundation models, enterprise isolation, and verifiable ledger provenance.
        </motion.p>

        {/* Demo Request Card */}
        <motion.div
          className="bg-white max-w-xl mx-auto p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-elevation mb-8 text-left"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Request an Executive Demonstration
            </h3>
            <p className="text-xs text-slate-500">
              Schedule a personalized walkthrough tailored to your multi-company structure and ERP workflows.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              alert('Thank you for your interest! A RaapNexus representative will reach out to schedule your demonstration.')
            }}
            className="flex flex-col gap-3.5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Work Email"
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue"
              />
              <input
                type="text"
                required
                placeholder="Company Name"
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue"
              />
            </div>
            <button
              type="submit"
              className="btn-primary justify-center py-3 text-xs uppercase tracking-wider font-bold shadow-blue-glow w-full"
            >
              <Calendar size={15} /> Schedule Executive Walkthrough
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>Direct instant access:</span>
            <a
              href={ROUTES.ERP_STANDALONE}
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric-blue font-bold flex items-center gap-1 hover:underline"
            >
              <Play size={11} className="fill-electric-blue" />
              <span>Launch Standalone ERP Dashboard</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </motion.div>

        {/* Secondary Links */}
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs font-bold uppercase tracking-wider text-slate-500">
          <button
            onClick={() => handleScroll(ROUTES.SECTIONS.APPLICATION_SUITE)}
            className="hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            <Layers size={13} className="text-electric-blue" /> Explore Modules
          </button>
          <span>•</span>
          <Link
            to={ROUTES.ERP_SANDBOX}
            className="text-electric-blue hover:text-brand-700 transition-colors flex items-center gap-1"
          >
            <Play size={11} className="fill-electric-blue" /> Open Sandbox Workstation
          </Link>
          <span>•</span>
          <a
            href={ROUTES.ERP_STANDALONE}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            Direct ERP File <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </section>
  )
}
