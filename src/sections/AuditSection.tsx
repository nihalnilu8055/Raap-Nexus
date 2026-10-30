import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Calculator, ShieldCheck } from 'lucide-react'
import Fallback3D from '../components/ui/Fallback3D'
import { useNearView } from '../components/ui/useNearView'
import { Boundary, isMobile, webglSupported } from '../lib/webgl'
import { EASE, ScrollTrigger } from '../lib/motion'
import type { AuditMode } from '../three/finance/AuditIntelScene'

const Scene = lazy(() => import('../three/finance/AuditIntelScene'))
const VIEWS = [{ m: 0 as AuditMode, label: 'Tax review', Icon: Calculator }, { m: 1 as AuditMode, label: 'Financial audit', Icon: ShieldCheck }]
const LEGEND = [['Verified', '#34d399'], ['Reconciled', '#60a5fa'], ['Under review', '#fbbf24'], ['Attention required', '#f87171']] as const

/** Tax & Financial Auditing: a 3D audit workspace with two views (tax review / financial audit). */
export default function AuditSection() {
  const { ref, near, inView } = useNearView<HTMLDivElement>()
  const modeRef = useRef<AuditMode>(0)
  const progressRef = useRef(0.4)
  const sec = useRef<HTMLElement>(null)
  const [mode, setMode] = useState<AuditMode>(0)
  const reduced = !!useReducedMotion()
  const [webgl] = useState(webglSupported)
  const [mobile] = useState(isMobile)
  const pick = useCallback((m: AuditMode) => { modeRef.current = m; setMode(m) }, [])

  useEffect(() => {
    if (!sec.current) return
    const st = ScrollTrigger.create({ trigger: sec.current, start: 'top bottom', end: 'bottom top', onUpdate: (s) => { progressRef.current = s.progress } })
    return () => st.kill()
  }, [])

  return (
    <section ref={sec} id="audit" aria-labelledby="au-h" className="relative overflow-hidden bg-[#031018] px-4 pb-16 pt-20 sm:px-8 md:pt-28">
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 62%, rgba(16,185,129,.16), transparent 70%), radial-gradient(ellipse 55% 40% at 80% 15%, rgba(37,99,235,.24), transparent 70%), radial-gradient(ellipse 40% 35% at 10% 40%, rgba(245,158,11,.1), transparent 70%)' }} />
      <div className="relative mx-auto max-w-[1320px]">
        <div className="text-center">
          <motion.h2 id="au-h" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, ease: EASE }}
            className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            Tax &amp; <span className="bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent">Financial Auditing</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE, delay: 0.12 }} className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
            Clarity, accuracy, and intelligence behind every financial record.
          </motion.p>
        </div>

        <div ref={ref} className="relative -mx-4 mt-4 h-[460px] sm:-mx-8 sm:h-[600px] lg:h-[700px]">
          {webgl && near ? (
            <Boundary fallback={<Fallback3D className="h-full w-full" />}>
              <Suspense fallback={<Fallback3D className="h-full w-full opacity-40" />}>
                <Scene modeRef={modeRef} progressRef={progressRef} reduced={reduced} mobile={mobile} active={inView} />
              </Suspense>
            </Boundary>
          ) : <Fallback3D className="h-full w-full opacity-60" />}
          <div role="group" aria-label="Audit view" className="absolute inset-x-0 bottom-2 mx-auto flex w-fit gap-1 rounded-full border border-white/15 bg-[#06162a]/80 p-1.5 shadow-xl">
            {VIEWS.map((v) => (
              <button key={v.m} type="button" aria-pressed={mode === v.m} onClick={() => pick(v.m)}
                className={`relative flex items-center gap-2 rounded-full px-4 py-2 font-display text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:px-5 ${mode === v.m ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
                {mode === v.m && <motion.span layoutId="au-pill" transition={{ duration: 0.4, ease: EASE }} className="absolute inset-0 rounded-full bg-emerald-500/30 ring-1 ring-emerald-300/60" />}
                <v.Icon size={16} className="relative" aria-hidden /><span className="relative">{v.label}</span>
              </button>
            ))}
          </div>
        </div>
        <ul className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Record states">
          {LEGEND.map(([l, c]) => (
            <li key={l} className="flex items-center gap-2 text-sm text-slate-300"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c, boxShadow: `0 0 10px ${c}` }} />{l}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
