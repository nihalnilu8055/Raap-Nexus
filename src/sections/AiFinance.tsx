import { lazy, memo, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BadgeCheck, Bot, ChevronRight, MessageSquareText, Server, Shuffle } from 'lucide-react'
import Fallback3D from '../components/ui/Fallback3D'
import { useNearView } from '../components/ui/useNearView'
import { Boundary, isMobile, webglSupported } from '../lib/webgl'
import { Reveal } from '../components/ui/Reveal'
import { ScrollTrigger } from '../lib/motion'
import { useI18n } from '../i18n'
import { AI_NODES, USE_CASES } from '../data/aiModels'
const Engine = lazy(() => import('../three/finance/EngineScene'))
import { EASE } from '../lib/motion'

const SHOTS = ['balance', 'pnl', 'trial', 'expenses', 'dashboard', 'anomalies']
const FLOW_C = ['#0ea5e9', '#7c6bff', '#10b981']
const BENEFIT_ICONS = [MessageSquareText, Shuffle, Server, Bot]

/** The 3D engine + its data → processing → insights pill. It owns the `phase` state and is memoised, so the 4-second provider rotation and
 *  use-case clicks in the parent never re-render it (and the engine's phase changes never re-render the whole section). */
const EngineStage = memo(function EngineStage({ progressRef, reduced, mobile, webgl }: { progressRef: React.MutableRefObject<number>; reduced: boolean; mobile: boolean; webgl: boolean }) {
  const { t, tr } = useI18n()
  const { ref: stageRef, near, inView } = useNearView<HTMLDivElement>()
  const [phase, setPhase] = useState(0)
  return (
    <div ref={stageRef} className="relative mx-auto w-full max-w-[680px]">
      <div role="img" data-cursor="visual" aria-label={t('ai.engineAria')} className="relative h-[300px] w-full min-[400px]:h-[330px] sm:h-[430px] lg:h-[480px] [@media(orientation:landscape)_and_(max-height:520px)]:h-[260px]">
        {webgl && near ? (
          <Boundary fallback={<Fallback3D className="h-full w-full" />}>
            <Suspense fallback={<Fallback3D className="h-full w-full opacity-40" />}>
              <Engine progressRef={progressRef} onPhase={setPhase} reduced={reduced} mobile={mobile} active={inView} />
            </Suspense>
          </Boundary>
        ) : <Fallback3D className="h-full w-full opacity-70" />}
      </div>
      <ol className="mx-auto -mt-2 flex w-fit max-w-full items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] p-1.5 backdrop-blur-xl" aria-label={t('ai.engineAria')}>
        {tr<string[]>('ai.flow').map((f, i) => (
          <li key={i} className="flex items-center gap-1">
            <span className={`rounded-full px-2.5 py-1.5 font-display text-[11px] font-bold transition-all duration-500 min-[400px]:px-3 sm:px-4 sm:text-sm ${phase === i ? 'text-white shadow-lg' : 'text-slate-400'}`}
              style={phase === i ? { background: FLOW_C[i], boxShadow: `0 6px 24px -8px ${FLOW_C[i]}` } : undefined}>{f}</span>
            {i < 2 && <ChevronRight size={14} className="shrink-0 text-slate-500 rtl:rotate-180" aria-hidden />}
          </li>
        ))}
      </ol>
    </div>
  )
})
/** AI section: a 3D Intelligence Engine (data → processing → insights) with provider selection as a secondary area. */
export default function AiFinance() {
  const { t } = useI18n()
  const reduced = !!useReducedMotion()
  const progressRef = useRef(0.5)
  const [webgl] = useState(webglSupported)
  const [mobile] = useState(isMobile)
  const [sel, setSel] = useState(0)
  const [uc, setUc] = useState(0)
  const touched = useRef(false)
  const vis = useRef(false)
  const wrap = useRef<HTMLElement>(null)
  const pick = useCallback((i: number, user = true) => { if (user) touched.current = true; setSel(i) }, [])

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { vis.current = e.isIntersecting })
    if (wrap.current) io.observe(wrap.current)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (!wrap.current) return
    const st = ScrollTrigger.create({ trigger: wrap.current, start: 'top bottom', end: 'bottom top', onUpdate: (x) => { progressRef.current = x.progress } })
    return () => st.kill()
  }, [])
  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => { if (!touched.current && vis.current) setSel((v) => (v + 1) % AI_NODES.length) }, 4200)
    return () => clearInterval(id)
  }, [reduced])

  const n = AI_NODES[sel]
  return (
    <section ref={wrap} id="ai" aria-labelledby="ai-h" className="relative overflow-hidden bg-[#050824] px-4 py-20 sm:px-8 md:py-28">
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 55% at 72% 45%, rgba(99,88,255,.30), transparent 70%), radial-gradient(ellipse 40% 40% at 5% 90%, rgba(37,99,235,.18), transparent 70%)' }} />
      <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
        {/* LEFT: message */}
        <div>
          <motion.h2 id="ai-h" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, ease: EASE }}
            className="font-display text-[clamp(2rem,8.6vw,2.25rem)] font-extrabold leading-[1.1] tracking-tight text-white min-[400px]:text-4xl sm:text-5xl">
            {t('ai.h1')} <span className="text-violet-300">{t('ai.h2')}</span>
          </motion.h2>
          <Reveal delay={0.1}><p className="mt-4 text-lg text-slate-200">{t('ai.sub')}</p></Reveal>
          <Reveal delay={0.18}><p className="mt-3 max-w-md text-slate-400">{t('ai.lead')}</p></Reveal>
          <ul className="mt-6 space-y-2.5 sm:space-y-3">
            {BENEFIT_ICONS.map((Icon, i) => (
              <Reveal as="li" variant="left" delay={0.1 * i} key={i} className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.06] text-violet-200 ring-1 ring-white/10"><Icon size={18} aria-hidden /></span>
                <span className="font-display font-bold text-white">{t(`ai.benefits.${i}.t`)}</span>
              </Reveal>
            ))}
          </ul>
          <div className="mt-7">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t('ai.useCasesLabel')}</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t('ai.useCasesLabel')}>
              {USE_CASES.map((u, i) => (
                <button key={u.id} type="button" aria-pressed={uc === i} onClick={() => setUc(i)}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold sm:text-sm [@media(pointer:coarse)]:min-h-11 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${uc === i ? 'border-violet-300 bg-violet-400/20 text-white' : 'border-white/12 text-slate-300 hover:text-white'}`}>{t(`ai.useCases.${i}.label`)}</button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.p key={uc} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-slate-200" aria-live="polite">
                <span className="text-violet-300">“</span>{t(`ai.useCases.${uc}.prompt`)}<span className="text-violet-300">”</span>
              </motion.p>
            </AnimatePresence>
            <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1233] shadow-[0_30px_60px_-30px_rgba(99,88,255,.6)]">
              <AnimatePresence mode="wait">
                <motion.img key={uc} src={`/assets/shots/${SHOTS[uc]}.webp`} alt="" width={1440} height={900} loading="lazy" decoding="async"
                  initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 0.92, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="block h-40 w-full object-cover object-left-top sm:h-48" />
              </AnimatePresence>
              {!reduced && <span aria-hidden className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-violet-300/35 to-transparent" style={{ top: 0, animation: 'scanT 3.2s ease-in-out infinite', willChange: 'transform' }} />}
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#050824]/70 to-transparent" />
              <motion.p key={`i${uc}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }} className="absolute bottom-3 start-4 flex items-center gap-2 text-sm font-bold text-white">
                <span className="h-2 w-2 animate-pulse rounded-full bg-violet-300" />{t(`ai.useCases.${uc}.label`)}
              </motion.p>
            </div>
          </div>
        </div>

        {/* RIGHT: the AI Intelligence Engine + secondary provider selection */}
        <Reveal variant="right" className="min-w-0">
          <EngineStage progressRef={progressRef} reduced={reduced} mobile={mobile} webgl={webgl} />

          {/* provider selection: refined, secondary */}
          <p className="mt-8 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t('ai.providers')}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-x-2 gap-y-3" role="group" aria-label={t('ai.providers')}>
            {AI_NODES.map((a, i) => {
              const nm = a.id === 'local' || a.id === 'custom' ? t(`ai.models.${a.id}.name`) : a.name
              const sh = a.id === 'custom' ? t('ai.models.custom.short') : a.short
              return (
                <Reveal key={a.id} variant="scale" delay={0.05 * i}>
                <button type="button" onClick={() => pick(i)} onFocus={() => pick(i)} aria-pressed={sel === i} aria-label={`${nm}, ${t('ai.live')}`}
                  className={`group flex items-center gap-2 rounded-full border hover:-translate-y-0.5 hover:scale-[1.04] py-1.5 ps-1.5 pe-3.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${sel === i ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'}`}
                  style={sel === i ? { boxShadow: `0 0 26px -8px ${a.color}` } : undefined}>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white/95">
                    {a.logo ? <img src={a.logo} alt="" width={20} height={20} loading="lazy" draggable={false} className="h-5 w-5 object-contain" /> : <a.Icon size={16} strokeWidth={1.8} className="text-indigo-500" aria-hidden />}
                  </span>
                  <span className={`text-xs font-bold sm:text-sm ${sel === i ? 'text-white' : 'text-slate-300'}`}>{sh}</span>
                </button>
                </Reveal>
              )
            })}
          </div>

          <div data-spotlight className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div key={n.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t('ai.active')}</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">
                    <BadgeCheck size={13} aria-hidden />{t('ai.live')} · {t(`ai.models.${n.id}.status`)}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-2xl font-extrabold text-white">{n.id === 'local' || n.id === 'custom' ? t(`ai.models.${n.id}.name`) : n.name}</h3>
                <p className="mt-1 text-slate-300">{t(`ai.models.${n.id}.blurb`)}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>

    </section>
  )
}
