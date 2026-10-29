import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Sparkles, Send, BarChart2, FileText, Receipt, ShieldCheck } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const DEMO_CONVERSATIONS = [
  {
    id: 'sales-branch',
    userQuestion: 'What were sales by branch yesterday?',
    aiResponse: 'Yesterday\'s sales across verified branch ledgers:',
    chartType: 'bar',
    chartData: [
      { name: 'Dubai HQ', value: 124500 },
      { name: 'Abu Dhabi', value: 87300 },
      { name: 'Sharjah', value: 64200 },
      { name: 'Ajman', value: 38700 },
    ],
    summary: 'Dubai HQ led with AED 124,500 (+18% vs prior day), followed by Abu Dhabi at AED 87,300 (+6%). Total network volume: AED 314,700.',
    icon: BarChart2,
    tag: 'Sales Velocity',
  },
  {
    id: 'trial-balance',
    userQuestion: 'Show me the August trial balance summary.',
    aiResponse: 'August 2026 Trial Balance verification:',
    chartType: 'table',
    tableData: [
      { account: 'Cash & Bank Balances', debit: '4,720,000', credit: '–', balance: '4,720,000 Dr' },
      { account: 'Trade Receivables (0-30d)', debit: '2,145,000', credit: '–', balance: '2,145,000 Dr' },
      { account: 'Raw Materials & Inventory', debit: '6,830,000', credit: '–', balance: '6,830,000 Dr' },
      { account: 'Trade Payables & Accruals', debit: '–', credit: '1,240,000', balance: '1,240,000 Cr' },
      { account: 'Commercial Revenue (YTD)', debit: '–', credit: '8,920,000', balance: '8,920,000 Cr' },
    ],
    summary: 'Trial balance is balanced to the cent. Total debits and credits equal AED 14,815,000 each. Zero unposted vouchers detected.',
    icon: FileText,
    tag: 'Trial Balance',
  },
  {
    id: 'invoice-create',
    userQuestion: 'Prepare draft invoice for Al Noor Trading for 20 units of Item #A1042.',
    aiResponse: 'Invoice draft prepared — awaiting authorized manager approval:',
    chartType: 'invoice',
    invoiceData: {
      customer: 'Al Noor Trading',
      items: [{ desc: 'Item #A1042 – Heavy Duty Industrial Sensor', qty: 20, rate: 1250, total: 25000 }],
      subtotal: 25000,
      vat: 1250,
      grandTotal: 26250,
      status: 'Awaiting Manager Sign-Off',
    },
    summary: 'Invoice prepared for AED 26,250 (incl. 5% VAT). Human approval required before posting to general ledger. No production data modified.',
    icon: Receipt,
    tag: 'Voucher Workflow',
  },
]

export default function AiDemoSection() {
  const [activeConv, setActiveConv] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'typing' | 'responding' | 'done'>('idle')
  const [typedQuestion, setTypedQuestion] = useState('')
  const [typedResponse, setTypedResponse] = useState('')
  const [showChart, setShowChart] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const conv = DEMO_CONVERSATIONS[activeConv]

  const runAnimation = (convIndex: number) => {
    const c = DEMO_CONVERSATIONS[convIndex]
    setPhase('typing')
    setTypedQuestion('')
    setTypedResponse('')
    setShowChart(false)

    let qi = 0
    const qInterval = setInterval(() => {
      setTypedQuestion(c.userQuestion.slice(0, qi + 1))
      qi++
      if (qi >= c.userQuestion.length) {
        clearInterval(qInterval)
        setTimeout(() => {
          setPhase('responding')
          let ri = 0
          const rInterval = setInterval(() => {
            setTypedResponse(c.aiResponse.slice(0, ri + 1))
            ri++
            if (ri >= c.aiResponse.length) {
              clearInterval(rInterval)
              setShowChart(true)
              setPhase('done')
            }
          }, 18)
        }, 600)
      }
    }, 32)
  }

  useEffect(() => {
    if (isInView) {
      runAnimation(activeConv)
    }
  }, [isInView, activeConv])

  const handleConvChange = (i: number) => {
    setActiveConv(i)
  }

  const tooltipStyle = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
    color: '#0F172A',
    fontSize: '12px',
    padding: '8px 12px',
  }

  return (
    <section id="ai-demo" ref={ref} className="py-24 bg-slate-50 relative overflow-hidden border-b border-slate-200/80">
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label mb-4">
            <Sparkles size={12} />
            Conversational Intelligence In Action
          </div>
          <h2 className="section-heading text-3xl sm:text-4xl lg:text-5xl mb-4">
            Ask in plain words.{' '}
            <span className="gradient-text-blue">Inspect source records.</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            See how RaapNexus translates natural queries into verifiable ledger reports,
            branch rankings, and pre-formatted accounting drafts.
          </p>
        </motion.div>

        {/* Conversation Picker Pills */}
        <motion.div
          className="flex flex-wrap gap-2.5 justify-center mb-10"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          {DEMO_CONVERSATIONS.map((c, i) => {
            const Icon = c.icon
            return (
              <button
                key={c.id}
                onClick={() => handleConvChange(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                  i === activeConv
                    ? 'bg-white border-electric-blue text-slate-900 shadow-sm'
                    : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <Icon size={14} className={i === activeConv ? 'text-electric-blue' : 'text-slate-400'} />
                {c.tag}
              </button>
            )
          })}
        </motion.div>

        {/* Chat Interface Container */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/90 shadow-elevation bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-electric-blue text-white flex items-center justify-center font-bold text-xs">
                  R
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">RaapNexus Intelligence Engine</h3>
                  <p className="text-[11px] text-slate-500">Zero-Training Scoped Enterprise Query Engine</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Ready
                </span>
              </div>
            </div>

            {/* Message Flow */}
            <div className="p-6 sm:p-8 min-h-[380px] flex flex-col gap-6 bg-slate-50/40">
              {/* User Question */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`q-${activeConv}`}
                  className="flex items-start gap-3 justify-end"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="max-w-[80%] bg-blue-50 border border-blue-200/90 rounded-2xl rounded-tr-xs px-4 py-3 text-sm text-slate-900 shadow-2xs font-medium">
                    {typedQuestion}
                    {phase === 'typing' && (
                      <span className="animate-blink ml-0.5 text-electric-blue font-bold">|</span>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex-shrink-0 flex items-center justify-center text-xs font-bold">
                    U
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* AI Response */}
              <AnimatePresence>
                {phase !== 'idle' && phase !== 'typing' && (
                  <motion.div
                    key={`a-${activeConv}`}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-electric-blue text-white flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-xs">
                      R
                    </div>
                    <div className="max-w-[88%] flex flex-col gap-4">
                      <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs px-4 py-3 text-sm text-slate-800 shadow-2xs font-medium">
                        {typedResponse}
                        {phase === 'responding' && (
                          <span className="animate-blink ml-0.5 text-electric-blue font-bold">|</span>
                        )}
                      </div>

                      {/* Result Chart/Table */}
                      <AnimatePresence>
                        {showChart && (
                          <motion.div
                            className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-card p-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                          >
                            <ConvResult conv={conv} tooltipStyle={tooltipStyle} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Summary Note */}
                      <AnimatePresence>
                        {showChart && (
                          <motion.div
                            className="bg-slate-100/80 border border-slate-200/80 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-700 leading-relaxed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            {conv.summary}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mock Query Prompt Bar */}
            <div className="px-6 py-4 border-t border-slate-200 bg-white">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                <span className="text-xs sm:text-sm text-slate-400 flex-1 truncate font-mono">
                  Try asking: "What are our top overdue customer receivables?"
                </span>
                <button
                  className="p-1.5 rounded-lg bg-slate-200/80 text-slate-400 cursor-not-allowed"
                  disabled
                  aria-label="Send Query"
                >
                  <Send size={15} />
                </button>
              </div>
              <div className="mt-2 text-center text-[11px] text-slate-400">
                Preset demonstration scenario · All figures grounded in synthetic ERP schemas
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function ConvResult({ conv, tooltipStyle }: { conv: typeof DEMO_CONVERSATIONS[0]; tooltipStyle: object }) {
  if (conv.chartType === 'bar' && conv.chartData) {
    return (
      <div>
        <div className="text-xs font-bold text-slate-700 mb-3">Branch Sales Summary (AED) · Verified Core Ledgers</div>
        <ResponsiveContainer width="100%" height={175}>
          <BarChart data={conv.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
            <Tooltip contentStyle={tooltipStyle as any} formatter={(v: number) => [`AED ${v.toLocaleString()}`, 'Sales']} />
            <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (conv.chartType === 'table' && conv.tableData) {
    return (
      <div className="overflow-x-auto">
        <div className="text-xs font-bold text-slate-700 mb-3">Trial Balance Extract · 2026 Audit Certified</div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="text-left py-2 px-2 font-semibold">Account Classification</th>
              <th className="text-right py-2 px-2 font-semibold">Debit (AED)</th>
              <th className="text-right py-2 px-2 font-semibold">Credit (AED)</th>
              <th className="text-right py-2 px-2 font-semibold">Ledger Position</th>
            </tr>
          </thead>
          <tbody>
            {conv.tableData.map((row) => (
              <tr key={row.account} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-2.5 px-2 text-slate-800 font-medium">{row.account}</td>
                <td className="py-2.5 px-2 text-right font-mono text-slate-900">{row.debit}</td>
                <td className="py-2.5 px-2 text-right font-mono text-slate-900">{row.credit}</td>
                <td className="py-2.5 px-2 text-right font-bold text-emerald-700">{row.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (conv.chartType === 'invoice' && conv.invoiceData) {
    const inv = conv.invoiceData
    return (
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <div className="text-sm font-bold text-slate-900">{inv.customer}</div>
            <div className="text-[11px] text-slate-400 font-mono">Draft Sales Voucher — Not Committed</div>
          </div>
          <span className="status-warning text-xs font-semibold">{inv.status}</span>
        </div>

        <table className="w-full text-xs mb-4">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="text-left py-1.5 px-1 font-semibold">Line Item</th>
              <th className="text-right py-1.5 px-1 font-semibold">Qty</th>
              <th className="text-right py-1.5 px-1 font-semibold">Unit Rate</th>
              <th className="text-right py-1.5 px-1 font-semibold">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((item) => (
              <tr key={item.desc} className="border-b border-slate-100">
                <td className="py-2 px-1 text-slate-800 font-medium">{item.desc}</td>
                <td className="py-2 px-1 text-right text-slate-700">{item.qty}</td>
                <td className="py-2 px-1 text-right text-slate-700">AED {item.rate.toLocaleString()}</td>
                <td className="py-2 px-1 text-right text-slate-900 font-bold">AED {item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex flex-col gap-1 text-xs items-end border-t border-slate-100 pt-3">
          <div className="flex gap-8 text-slate-500">
            <span>Subtotal</span>
            <span className="font-mono text-slate-900 font-semibold">AED {inv.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex gap-8 text-slate-500">
            <span>VAT (5%)</span>
            <span className="font-mono text-slate-900 font-semibold">AED {inv.vat.toLocaleString()}</span>
          </div>
          <div className="flex gap-8 font-bold mt-1 text-sm">
            <span className="text-slate-900">Total Billed</span>
            <span className="font-mono text-electric-blue">AED {inv.grandTotal.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 text-emerald-700 font-medium">
            <ShieldCheck size={13} /> Dual-approval rule validated
          </span>
          <span className="text-slate-400 font-mono">STATUS: PENDING-SIGN-OFF</span>
        </div>
      </div>
    )
  }

  return null
}
