import { Link } from 'react-router-dom'
import { ArrowUpRight, ShieldCheck, Play, ExternalLink } from 'lucide-react'
import Logo from './Logo'
import { ROUTES } from '../config/routes'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 text-sm w-full">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand info */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4" aria-label="RaapNexus Homepage">
              <Logo size="md" />
            </Link>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-sm mb-4">
              Autonomous enterprise ERP and conversational business intelligence. Connect your core ledger with sovereign, verifiable AI visibility.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>ACID ledger invariants & role scoping</span>
            </div>
          </div>

          {/* Column: Application Suite */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-900 mb-4">
              Application Modules
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <a href={ROUTES.ERP_MODULES.PNL} target="_blank" rel="noopener noreferrer" className="hover:text-electric-blue transition-colors flex items-center gap-1">
                  Financial P&L Ledger <ExternalLink size={10} className="text-slate-400" />
                </a>
              </li>
              <li>
                <a href={ROUTES.ERP_MODULES.SALES} target="_blank" rel="noopener noreferrer" className="hover:text-electric-blue transition-colors flex items-center gap-1">
                  Sales & Rep Quotas <ExternalLink size={10} className="text-slate-400" />
                </a>
              </li>
              <li>
                <a href={ROUTES.ERP_MODULES.AGEING} target="_blank" rel="noopener noreferrer" className="hover:text-electric-blue transition-colors flex items-center gap-1">
                  Receivables Ageing <ExternalLink size={10} className="text-slate-400" />
                </a>
              </li>
              <li>
                <a href={ROUTES.ERP_MODULES.TRIAL_BALANCE} target="_blank" rel="noopener noreferrer" className="hover:text-electric-blue transition-colors flex items-center gap-1">
                  Trial Balance & Audit <ExternalLink size={10} className="text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column: Platform & Demos */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-900 mb-4">
              Platform & Demos
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <a
                  href={ROUTES.ERP_STANDALONE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-electric-blue font-bold hover:underline flex items-center gap-1"
                >
                  <Play size={10} className="fill-electric-blue" /> Standalone ERP Application
                </a>
              </li>
              <li>
                <Link to={ROUTES.ERP_SANDBOX} className="hover:text-electric-blue transition-colors flex items-center gap-1">
                  Sandbox Workstation
                </Link>
              </li>
              <li>
                <a href={ROUTES.SECTIONS.INTERACTIVE_DEMO} className="hover:text-electric-blue transition-colors">
                  Interactive Agent Workbench
                </a>
              </li>
              <li>
                <a href={ROUTES.SECTIONS.APPLICATION_SUITE} className="hover:text-electric-blue transition-colors">
                  Application Constellation
                </a>
              </li>
              <li>
                <a href={ROUTES.SECTIONS.SOVEREIGNTY} className="hover:text-electric-blue transition-colors">
                  Multi-LLM Sovereignty
                </a>
              </li>
            </ul>
          </div>

          {/* Column: Direct Access */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-900 mb-4">
              Enterprise Access
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <a
                  href={ROUTES.ERP_STANDALONE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-electric-blue transition-colors flex items-center gap-1 font-semibold text-slate-800"
                >
                  Launch Production Dashboard <ArrowUpRight size={12} className="text-electric-blue" />
                </a>
              </li>
              <li>
                <a href={ROUTES.SECTIONS.BOOK_DEMO} className="hover:text-electric-blue transition-colors">
                  Schedule Private Demonstration
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and legal disclaimer */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {currentYear} RaapNexus. All rights reserved.
          </div>
          <div className="flex items-center gap-6 font-medium">
            <span>Enterprise Sovereign Standard</span>
            <span>PostgreSQL ACID Architecture</span>
            <span>Zero Training Retention</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
