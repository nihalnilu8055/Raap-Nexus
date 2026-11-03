import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '../components/ui/Reveal'
import Fallback3D from '../components/ui/Fallback3D'
import { useNearView } from '../components/ui/useNearView'
import { Boundary, isMobile, webglSupported } from '../lib/webgl'
import { EASE, ScrollTrigger } from '../lib/motion'
import { useI18n } from '../i18n'
import type { FlowMode } from '../three/finance/FlowCoreScene'

const Scene = lazy(() => import('../three/finance/FlowCoreScene'))
const HUES = ['#38bdf8', '#60a5fa', '#818cf8', '#22d3ee', '#a5b4fc', '#7dd3fc']
const COUNT: Record<FlowMode, number> = { flow: 5, modules: 6 }

/**
 * Financial Intelligence Core: one WebGL scene, two views.
 * "Data flow": Transactions → Financial Data → Analysis → Auditing → Business Insights (scrolling through the section advances the stages; clicking overrides).
 * "ERP modules": the six modules around the core; selecting one lights its connections.
 * The text controls below the scene are the accessible equivalent of the 3D nodes.
 */
export default function FlowCore() {
  const { t } = useI18n()
  const reduced = !!useReducedMotion()
  const { ref, near, inView } = useNearView<HTMLDivElement>()
  const [webgl] = useState(webglSupported)
  const [mobile] = useState(isMobile)
  const [mode, setMode] = useState<FlowMode>('flow')
  const [sel, setSel] = useState(0)
  const modeRef = useRef<FlowMode>('flow'), selRef = useRef(0), progressRef = useRef(0.5), manual = useRef(false)

  const set = useCallback((m: FlowMode, i: number) => { modeRef.current = m; selRef.current = i; setMode(m); setSel(i) }, [])
  const pick = useCallback((i: number) => { manual.current = true; set(modeRef.current, i) }, [set])
  const switchMode = (m: FlowMode) => { if (m === modeRef.current) return; manual.current = true; set(m, 0) }

  // scrolling through the scene advances the data-flow stages (until the visitor picks one); also drives the camera orbit
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const st = ScrollTrigger.create({
      trigger: el, start: 'top 85%', end: 'bottom 15%',
      onUpdate: (s) => {
        progressRef.current = s.progress
        if (reduced || manual.current || modeRef.current !== 'flow') return
        const i = Math.min(4, Math.max(0, Math.floor((s.progress - 0.12) / 0.17)))
        if (i !== selRef.current) set('flow', i)
      },
      onLeave: () => { manual.current = false }, onLeaveBack: () => { manual.current = false },
    })
    return () => st.kill()
  }, [ref, reduced, set])

  const labels = useMemo(() => ({
    flow: Array.from({ length: 5 }, (_, i) => t(`flow.stages.${i}.label`)),
    modules: Array.from({ length: 6 }, (_, i) => t(`flow.modules.${i}.label`)),
  }), [t])
  const group = mode === 'flow' ? 'stages' : 'modules'
  const n = COUNT[mode]

  return (
    <section id="flow" aria-labelledby="fc-h" className="relative overflow-hidden bg-[#040a1c] px-4 py-20 sm:px-8 md:py-28">
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 52%, rgba(37,99,235,.3), transparent 70%), radial-gradient(ellipse 40% 30% at 85% 10%, rgba(34,211,238,.1), transparent 70%)' }} />
      <div className="relative mx-auto max-w-[1240px]">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-300">{t('flow.eyebrow')}</p>
          <motion.h2 id="fc-h" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, ease: EASE }}
            className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            {t('flow.h1')} <span className="text-sky-300">{t('flow.h2')}</span>
          </motion.h2>
          <Reveal delay={0.1}><p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">{t('flow.sub')}</p></Reveal>
          <Reveal delay={0.15}>
            <div role="group" aria-label={t('flow.aria')} className="mx-auto mt-7 flex w-fit gap-1.5 rounded-full border border-white/10 bg-white/[0.05] p-1.5 backdrop-blur-xl">
              {(['flow', 'modules'] as FlowMode[]).map((m) => (
                <button key={m} type="button" aria-pressed={mode === m} onClick={() => switchMode(m)}
                  className={`relative rounded-full px-5 py-2 font-display text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${mode === m ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
                  {mode === m && <motion.span layoutId="fc-pill" transition={{ duration: 0.4, ease: EASE }} className="absolute inset-0 rounded-full bg-blue-500/35 ring-1 ring-sky-300/60" />}
                  <span className="relative">{t(m === 'flow' ? 'flow.tabFlow' : 'flow.tabModules')}</span>
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal variant="depth">
          <div ref={ref} data-cursor="visual" className="relative mt-4 h-[400px] sm:h-[500px] lg:h-[580px]">
            {webgl && near ? (
              <Boundary fallback={<Fallback3D className="h-full w-full" />}>
                <Suspense fallback={<Fallback3D className="h-full w-full opacity-40" />}>
                  <Scene modeRef={modeRef} selRef={selRef} progressRef={progressRef} labels={labels} onPick={pick} reduced={reduced} mobile={mobile} active={inView} />
                </Suspense>
              </Boundary>
            ) : <Fallback3D className="h-full w-full opacity-60" />}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <ol aria-label={t(`flow.${group}Aria`)} className={`mx-auto mt-3 grid max-w-4xl gap-2 ${mode === 'flow' ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6'}`}>
            {Array.from({ length: n }, (_, i) => (
              <li key={mode + i}>
                <button type="button" aria-pressed={sel === i} onClick={() => pick(i)}
                  className={`group flex h-full w-full items-center gap-2 rounded-2xl border px-3 py-2.5 text-start font-display text-[13px] font-bold leading-tight transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${sel === i ? 'border-sky-300/60 bg-blue-500/25 text-white' : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/25 hover:text-white'}`}>
                  <span aria-hidden className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] text-[#06122e]" style={{ background: HUES[i] }}>{i + 1}</span>
                  <span>{t(`flow.${group}.${i}.label`)}</span>
                  {mode === 'flow' && i < 4 && <ArrowRight aria-hidden size={13} className="ms-auto hidden shrink-0 text-slate-500 sm:block rtl:-scale-x-100" />}
                </button>
              </li>
            ))}
          </ol>
          <p className="mx-auto mt-4 min-h-[3rem] max-w-xl text-center text-base text-slate-200" aria-live="polite"><strong className="font-display text-sky-300">{t(`flow.${group}.${sel}.label`)}</strong> – {t(`flow.${group}.${sel}.text`)}</p>
          <p className="mt-1 text-center text-xs text-slate-500">{t('flow.note')}</p>
        </Reveal>
      </div>
    </section>
  )
}
