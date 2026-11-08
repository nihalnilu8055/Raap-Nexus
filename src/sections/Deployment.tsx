import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Cloud, Cpu, Laptop, ShieldCheck } from 'lucide-react'
import Fallback3D from '../components/ui/Fallback3D'
import { useNearView } from '../components/ui/useNearView'
import { Boundary, isMobile, webglSupported } from '../lib/webgl'
import { EASE, ScrollTrigger } from '../lib/motion'
import { useI18n } from '../i18n'

const Scene = lazy(() => import('../three/finance/DeployScene'))
const STAGES = [
  { Icon: Cpu, color: '#a5b4fc' },
  { Icon: Cloud, color: '#38bdf8' },
  { Icon: ShieldCheck, color: '#34d399' },
  { Icon: Laptop, color: '#fbbf24' },
]
// scroll progress -> continuous focus (0 intro, 1 cloud, 2 private, 3 local): short holds on each stage, scrubbed moves in between
// separated ranges: intro hold 0-.08 | move to Cloud -.27 | hold -.40 | move to Private -.57 | hold -.70 | move to Local -.87 | hold to the end (runway is 270vh / 220vh, so each move still gets ~30vh / ~23vh)
const KEYS: [number, number][] = [[0, 0], [0.08, 0], [0.27, 1], [0.4, 1], [0.57, 2], [0.7, 2], [0.87, 3], [1, 3]]
const focusAt = (p: number) => {
  for (let i = 1; i < KEYS.length; i++) if (p <= KEYS[i][0]) { const [a, fa] = KEYS[i - 1], [b, fb] = KEYS[i]; return fa + ((p - a) / (b - a)) * (fb - fa) }
  return 3
}

/** Where the Model Runs: scroll-driven 3D story (core → cloud → private → local). Selecting an environment overrides the scroll. */
export default function Deployment() {
  const { t } = useI18n()
  const reduced = !!useReducedMotion()
  const { ref, near, inView } = useNearView<HTMLElement>('900px 0px')
  const focusRef = useRef(0)
  const camRef = useRef(0)
  const bar = useRef<HTMLSpanElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const entryRef = useRef(reduced ? 1 : 0)
  const override = useRef<{ i: number; p: number } | null>(null)
  const prog = useRef(0)
  const [focus, setFocus] = useState(0)
  const [webgl] = useState(webglSupported)
  const [mobile] = useState(isMobile)

  const set = useCallback((i: number) => { focusRef.current = i; setFocus(i) }, [])
  const pick = useCallback((i: number) => { override.current = { i, p: prog.current }; camRef.current = i; set(i) }, [set])

  useEffect(() => {
    if (reduced || !track.current) return
    // 1) approach: the stage rises into view below the heading while the camera travels in
    const enter = ScrollTrigger.create({ trigger: track.current, start: 'top 92%', end: 'top top', onUpdate: (s) => { entryRef.current = s.progress }, onLeave: () => { entryRef.current = 1 }, onLeaveBack: () => { entryRef.current = 0 } })
    // 2) pinned stage only (the heading is not pinned): scroll scrubs Cloud -> Private -> Local
    const st = ScrollTrigger.create({
      trigger: track.current, start: 'top top', end: 'bottom bottom',
      onUpdate: (s) => {
        prog.current = s.progress
        if (bar.current) bar.current.style.transform = `scaleX(${s.progress})`
        const o = override.current
        if (o && Math.abs(s.progress - o.p) < 0.05) return
        override.current = null
        const f = focusAt(s.progress)
        camRef.current = f
        const n = Math.round(f)
        if (n !== focusRef.current) set(n)
      },
    })
    // language / font / content changes alter the page height: keep trigger positions in sync
    let tm = 0
    const ro = new ResizeObserver(() => { window.clearTimeout(tm); tm = window.setTimeout(() => ScrollTrigger.refresh(), 150) })
    ro.observe(document.body)
    return () => { window.clearTimeout(tm); ro.disconnect(); enter.kill(); st.kill() }
  }, [reduced, set])

  const cur = STAGES[focus]
  return (
    <section ref={ref} id="deploy" aria-labelledby="dp-h" className="relative bg-[#050824]">
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 60%, rgba(99,88,255,.3), transparent 70%), radial-gradient(ellipse 40% 35% at 15% 40%, rgba(56,189,248,.14), transparent 70%), radial-gradient(ellipse 40% 35% at 88% 80%, rgba(52,211,153,.12), transparent 70%)' }} />

      {/* heading: normal flow, compact, never pinned */}
      <div className="relative z-10 px-4 pb-6 pt-20 text-center sm:pb-8 sm:pt-24 lg:pt-28">
        <motion.h2 id="dp-h" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE }} className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {t('deploy.h1')} <span className="bg-gradient-to-r from-sky-300 via-violet-300 to-emerald-300 bg-clip-text text-transparent">{t('deploy.h2')}</span>
        </motion.h2>
        <p className="mx-auto mt-3 max-w-xl text-base text-slate-300 sm:mt-4 sm:text-lg">{t('deploy.sub')}</p>
      </div>

      {/* scroll space belongs to the visual stage only */}
      <div ref={track} className={reduced ? 'relative' : 'relative h-[220vh] md:h-[270vh]'}>
        <div className={`${reduced ? 'relative h-[760px]' : 'sticky top-0 h-[100svh] min-h-[600px]'} flex flex-col overflow-hidden`}>
          <div className="relative flex min-h-0 flex-1 items-center justify-center pt-14">
            {/* visual box: sized per breakpoint (height targets 340-400 / 400-480 / 500-580 / 580-680 / 680-780 px) */}
            <div data-cursor="visual" className="relative h-[clamp(340px,calc(100svh-300px),400px)] w-full min-[390px]:h-[clamp(400px,calc(100svh-290px),480px)] md:h-[clamp(500px,calc(100svh-250px),580px)] lg:h-[clamp(580px,calc(100svh-190px),680px)] lg:w-[94%] min-[1440px]:h-[clamp(680px,calc(100svh-190px),780px)] min-[1440px]:w-[93%]">
              {webgl && near ? (
                <Boundary fallback={<Fallback3D className="h-full w-full" />}>
                  <Suspense fallback={<Fallback3D className="h-full w-full opacity-40" />}>
                    <Scene focusRef={focusRef} camRef={camRef} entryRef={entryRef} onPick={pick} reduced={reduced} mobile={mobile} active={inView} />
                  </Suspense>
                </Boundary>
              ) : <Fallback3D className="h-full w-full opacity-60" />}
            </div>
          </div>
          <div className="relative z-10 shrink-0 px-4 pb-6 pt-2 sm:pb-8">
            <div className="mx-auto max-w-3xl">
            <div className="mb-3 min-h-[76px] rounded-3xl [@media(max-height:800px)]:mb-2 [@media(max-height:800px)]:min-h-0 [@media(max-height:800px)]:py-1.5 border border-white/10 bg-[#0a1040]/80 px-5 py-3 text-center" aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.div key={focus} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease: EASE }}>
                    <p className="font-display text-xl font-extrabold" style={{ color: cur.color }}>{t(`deploy.stages.${focus}.label`)}</p>
                    <p className="text-sm text-slate-300 sm:text-base [@media(max-height:800px)]:hidden">{t(`deploy.stages.${focus}.line`)}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              {!reduced && <div aria-hidden className="mx-auto mb-3 h-px w-full max-w-sm overflow-hidden bg-white/10"><span ref={bar} className="block h-full origin-left bg-gradient-to-r from-sky-300 via-violet-300 to-amber-300 rtl:origin-right" style={{ transform: 'scaleX(0)' }} /></div>}
              <div role="group" aria-label={t('deploy.group')} className="flex flex-wrap justify-center gap-2">
                {STAGES.map((s, i) => (
                  <button key={i} type="button" aria-pressed={focus === i} onClick={() => pick(i)}
                    className={`flex items-center gap-2 rounded-full border px-3.5 py-2 font-display text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 sm:px-4 sm:text-sm ${focus === i ? 'border-transparent text-white' : 'border-white/15 bg-[#0a1040]/60 text-slate-300 hover:text-white'}`}
                    style={focus === i ? { background: `${s.color}33`, boxShadow: `inset 0 0 0 1px ${s.color}` } : undefined}>
                    <s.Icon size={15} style={{ color: s.color }} aria-hidden />{t(`deploy.stages.${i}.label`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
