import { lazy, Suspense, useCallback, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Banknote, Scale, TrendingUp, Wallet } from 'lucide-react'
import Fallback3D from '../components/ui/Fallback3D'
import { useNearView } from '../components/ui/useNearView'
import { Boundary, isMobile, webglSupported } from '../lib/webgl'
import { EASE } from '../lib/motion'
import type { Metric } from '../three/finance/FinIntelScene'

const Scene = lazy(() => import('../three/finance/FinIntelScene'))
const TABS: { id: Metric; label: string; Icon: typeof Banknote; text: string }[] = [
  { id: 'revenue', label: 'Revenue', Icon: TrendingUp, text: 'Revenue trend across the period.' },
  { id: 'expenses', label: 'Expenses', Icon: Wallet, text: 'Where the cost base is moving.' },
  { id: 'cashflow', label: 'Cash flow', Icon: Banknote, text: 'Cash in and out, month by month.' },
  { id: 'balance', label: 'Balance sheet', Icon: Scale, text: 'Assets against liabilities and equity.' },
]

/** Visual A: Financial Intelligence (analysis). */
export default function FinIntel() {
  const { ref, near, inView } = useNearView<HTMLDivElement>()
  const metricRef = useRef<Metric>('revenue')
  const [m, setM] = useState<Metric>('revenue')
  const reduced = !!useReducedMotion()
  const [webgl] = useState(webglSupported)
  const [mobile] = useState(isMobile)
  const pick = useCallback((x: Metric) => { metricRef.current = x; setM(x) }, [])
  const cur = TABS.find((t) => t.id === m)!

  return (
    <section id="intelligence" aria-labelledby="fi-h" className="relative overflow-hidden bg-[#040a1c] px-4 py-20 sm:px-8 md:py-28">
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(37,99,235,.28), transparent 70%)' }} />
      <div className="relative mx-auto max-w-[1240px]">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-300">Financial &amp; Business Analysis</p>
          <motion.h2 id="fi-h" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, ease: EASE }}
            className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            See the numbers <span className="text-sky-300">move.</span>
          </motion.h2>
        </div>
        <div ref={ref} className="relative mt-6 h-[380px] sm:h-[480px] lg:h-[560px]">
          {webgl && near ? (
            <Boundary fallback={<Fallback3D className="h-full w-full" />}>
              <Suspense fallback={<Fallback3D className="h-full w-full opacity-40" />}>
                <Scene metricRef={metricRef} reduced={reduced} mobile={mobile} active={inView} />
              </Suspense>
            </Boundary>
          ) : <Fallback3D className="h-full w-full opacity-60" />}
        </div>
        <div role="tablist" aria-label="Financial metric" className="mx-auto -mt-2 flex w-fit max-w-full flex-wrap justify-center gap-1.5 rounded-3xl border border-white/10 bg-white/[0.05] p-1.5 backdrop-blur-xl">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={m === t.id} onClick={() => pick(t.id)}
              className={`relative flex items-center gap-2 rounded-full px-4 py-2 font-display text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${m === t.id ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
              {m === t.id && <motion.span layoutId="fi-pill" transition={{ duration: 0.4, ease: EASE }} className="absolute inset-0 rounded-full bg-blue-500/35 ring-1 ring-sky-300/60" />}
              <t.Icon size={15} className="relative" aria-hidden /><span className="relative">{t.label}</span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-slate-300" aria-live="polite">{cur.text}</p>
      </div>
    </section>
  )
}
