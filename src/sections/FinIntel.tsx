import { Reveal } from '../components/ui/Reveal'
import { lazy, Suspense, useCallback, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Banknote, Scale, TrendingUp, Wallet } from 'lucide-react'
import Fallback3D from '../components/ui/Fallback3D'
import { useNearView } from '../components/ui/useNearView'
import { Boundary, isMobile, webglSupported } from '../lib/webgl'
import { EASE } from '../lib/motion'
import { useI18n } from '../i18n'
import type { Metric } from '../three/finance/FinIntelScene'

const Scene = lazy(() => import('../three/finance/FinIntelScene'))
const TABS: { id: Metric; Icon: typeof Banknote }[] = [
  { id: 'revenue', Icon: TrendingUp }, { id: 'expenses', Icon: Wallet }, { id: 'cashflow', Icon: Banknote }, { id: 'balance', Icon: Scale },
]

/** Visual A: Financial Intelligence (analysis). */
export default function FinIntel() {
  const { t } = useI18n()
  const { ref, near, inView } = useNearView<HTMLDivElement>()
  const metricRef = useRef<Metric>('revenue')
  const [m, setM] = useState<Metric>('revenue')
  const reduced = !!useReducedMotion()
  const [webgl] = useState(webglSupported)
  const [mobile] = useState(isMobile)
  const pick = useCallback((x: Metric) => { metricRef.current = x; setM(x) }, [])
  const ci = TABS.findIndex((x) => x.id === m)

  return (
    <section id="intelligence" aria-labelledby="fi-h" className="relative overflow-hidden bg-[#040a1c] px-4 py-20 sm:px-8 md:py-28">
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(37,99,235,.28), transparent 70%)' }} />
      <div className="relative mx-auto max-w-[1240px]">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-300">{t('intel.eyebrow')}</p>
          <motion.h2 id="fi-h" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, ease: EASE }}
            className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            {t('intel.h1')} <span className="text-sky-300">{t('intel.h2')}</span>
          </motion.h2>
        </div>
        <Reveal variant="depth">
        <div ref={ref} className="relative mt-6 h-[380px] sm:h-[480px] lg:h-[560px]">
          {webgl && near ? (
            <Boundary fallback={<Fallback3D className="h-full w-full" />}>
              <Suspense fallback={<Fallback3D className="h-full w-full opacity-40" />}>
                <Scene metricRef={metricRef} reduced={reduced} mobile={mobile} active={inView} />
              </Suspense>
            </Boundary>
          ) : <Fallback3D className="h-full w-full opacity-60" />}
        </div>
        </Reveal>
        <Reveal delay={0.15}>
        <div role="tablist" aria-label={t('intel.aria')} className="mx-auto -mt-2 flex w-fit max-w-full flex-wrap justify-center gap-1.5 rounded-3xl border border-white/10 bg-white/[0.05] p-1.5 backdrop-blur-xl">
          {TABS.map((tb, i) => (
            <button key={tb.id} role="tab" aria-selected={m === tb.id} onClick={() => pick(tb.id)}
              className={`relative flex items-center gap-2 rounded-full px-4 py-2 font-display text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${m === tb.id ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
              {m === tb.id && <motion.span layoutId="fi-pill" transition={{ duration: 0.4, ease: EASE }} className="absolute inset-0 rounded-full bg-blue-500/35 ring-1 ring-sky-300/60" />}
              <tb.Icon size={15} className="relative" aria-hidden /><span className="relative">{t(`intel.tabs.${i}.label`)}</span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-slate-300" aria-live="polite">{t(`intel.tabs.${ci}.text`)}</p>
        </Reveal>
      </div>
    </section>
  )
}
