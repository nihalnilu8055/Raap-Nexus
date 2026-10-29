import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Maximize2, RefreshCw, Shield } from 'lucide-react'
import Logo from '../components/Logo'
import { ROUTES } from '../config/routes'

const ERP_SCENARIOS = [
  { id: 'summary', label: 'Executive Summary', description: 'Consolidated profit/loss and ranked critical findings' },
  { id: 'pnl', label: 'Monthly P&L', description: 'Month-by-month revenue, gross margin, and operating expenses' },
  { id: 'sales', label: 'Sales & Reps', description: 'Branch-level sales volume, returns, and quota attainment' },
  { id: 'ageing', label: 'Ageing & Collections', description: 'Receivables aging tiers and customer concentration' },
  { id: 'balance', label: 'Trial Balance', description: 'Assets, liabilities, and double-entry ledger verification' },
  { id: 'anomalies', label: 'Audit & Red Flags', description: 'Automated anomaly detection and one-off expense audit' },
]

export default function LiveDemoPage() {
  const [activeScenario, setActiveScenario] = useState('summary')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 p-0' : ''}`}>
      {/* Top Demo Bar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Website
          </Link>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <Logo size="sm" />
          <span className="hidden md:inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live ERP Application Sandbox
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            title="Reload Dashboard"
            aria-label="Reload Dashboard"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
          >
            <Maximize2 size={15} />
          </button>
          <a
            href={ROUTES.ERP_STANDALONE}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
          >
            Open in New Tab <ExternalLink size={12} />
          </a>
        </div>
      </header>

      {/* Scenario Bar */}
      {!isFullscreen && (
        <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-2.5 overflow-x-auto flex items-center gap-2 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 flex-shrink-0">
            ERP Scenarios:
          </span>
          {ERP_SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(s.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex-shrink-0 ${
                activeScenario === s.id
                  ? 'bg-electric-blue text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Main ERP Sandbox Frame */}
      <main className="flex-1 p-2 sm:p-4 bg-slate-100 flex flex-col">
        <div className="flex-1 bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
          {/* Virtual Browser Top */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            </div>
            <div className="flex-1 max-w-lg mx-auto bg-white border border-slate-200 rounded-md px-3 py-1 text-xs text-slate-500 font-mono text-center flex items-center justify-center gap-1.5 shadow-2xs">
              <Shield size={11} className="text-emerald-600" />
              <span>https://raapnexus.internal/erp/dashboard?module={activeScenario}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Confidential Synthetic Data · Read Only
            </div>
          </div>

          {/* Authentic ERP Application Frame */}
          <div className="flex-1 relative w-full h-[calc(100vh-140px)] min-h-[600px]">
            <iframe
              ref={iframeRef}
              src="/erp/dashboard.html"
              title="RaapNexus ERP Dashboard"
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          </div>
        </div>
      </main>
    </div>
  )
}
