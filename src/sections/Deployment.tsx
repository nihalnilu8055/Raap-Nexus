import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Cloud, Cpu, Laptop, ShieldCheck } from 'lucide-react'
import Fallback3D from '../components/ui/Fallback3D'
import { useNearView } from '../components/ui/useNearView'
import { Boundary, isMobile, webglSupported } from '../lib/webgl'
import { EASE, ScrollTrigger } from '../lib/motion'

const Scene = lazy(() => import('../three/finance/DeployScene'))
const STAGES = [
  { label: 'AI Model', Icon: Cpu, color: '#a5b4fc', title: 'AI Model', line: 'One intelligence core, ready to connect.' },
  { label: 'Cloud', Icon: Cloud, color: '#38bdf8', title: 'Cloud', line: 'Run models on managed cloud infrastructure.' },
  { label: 'Private Infrastructure', Icon: ShieldCheck, color: '#34d399', title: 'Private Infrastructure', line: 'Dedicated servers inside infrastructure you control.' },
  { label: 'Local Deployment', Icon: Laptop, color: '#fbbf24', title: 'Local Deployment', line: 'Models running directly on your own machines.' },
]
const stageAt = (p: number) => (p < 0.2 ? 0 : p < 0.45 ? 1 : p < 0.72 ? 2 : 3)

/** Where the Model Runs: scroll-driven 3D story (core → cloud → private → local). Selecting an environment overrides the scroll. */
export default function Deployment() {
  const reduced = !!useReducedMotion()
  const { ref, near, inView } = useNearView<HTMLElement>('900px 0px')
  const focusRef = useRef(0)
  const override = useRef<{ i: number; p: number } | null>(null)
  const prog = useRef(0)
  const [focus, setFocus] = useState(0)
  const [webgl] = useState(webglSupported)
  const [mobile] = useState(isMobile)

  const set = useCallback((i: number) => { focusRef.current = i; setFocus(i) }, [])
  const pick = useCallback((i: number) => { override.current = { i, p: prog.current }; set(i) }, [set])

  useEffect(() => {
    if (reduced || !ref.current) return
    const st = ScrollTrigger.create({
      trigger: ref.current, start: 'top top', end: 'bottom bottom',
      onUpdate: (s) => {
        prog.current = s.progress
        const o = override.current
        if (o && Math.abs(s.progress - o.p) < 0.05) return
        override.current = null
        const n = stageAt(s.progress)
        if (n !== focusRef.current) set(n)
      },
    })
    return () => st.kill()
  }, [reduced, ref, set])

  const cur = STAGES[focus]
  return (
    <section ref={ref} id="deploy" aria-labelledby="dp-h" className={`relative bg-[#050824] ${reduced ? '' : 'h-[320vh]'}`}>
      <div className={`${reduced ? 'relative h-[760px]' : 'sticky top-0 h-screen min-h-[660px]'} overflow-hidden`}>
        <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 55% 50% at 50% 45%, rgba(99,88,255,.3), transparent 70%), radial-gradient(ellipse 40% 35% at 15% 20%, rgba(56,189,248,.14), transparent 70%), radial-gradient(ellipse 40% 35% at 88% 70%, rgba(52,211,153,.12), transparent 70%)' }} />
        <div className="absolute inset-0">
          {webgl && near ? (
            <Boundary fallback={<Fallback3D className="h-full w-full" />}>
              <Suspense fallback={<Fallback3D className="h-full w-full opacity-40" />}>
                <Scene focusRef={focusRef} onPick={pick} reduced={reduced} mobile={mobile} active={inView} />
              </Suspense>
            </Boundary>
          ) : <Fallback3D className="h-full w-full opacity-60" />}
        </div>

        <div className="pointer-events-none relative z-10 px-4 pt-24 text-center sm:pt-28">
          <motion.h2 id="dp-h" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE }} className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            Where the <span className="bg-gradient-to-r from-sky-300 via-violet-300 to-emerald-300 bg-clip-text text-transparent">Model Runs</span>
          </motion.h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-300 sm:text-lg">Flexible AI deployment. Greater control over your infrastructure.</p>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-6 sm:pb-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-3 min-h-[76px] rounded-3xl border border-white/10 bg-[#0a1040]/80 px-5 py-3 text-center" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div key={focus} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease: EASE }}>
                  <p className="font-display text-xl font-extrabold" style={{ color: cur.color }}>{cur.title}</p>
                  <p className="text-sm text-slate-300 sm:text-base">{cur.line}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div role="group" aria-label="Deployment environment" className="flex flex-wrap justify-center gap-2">
              {STAGES.map((s, i) => (
                <button key={s.label} type="button" aria-pressed={focus === i} onClick={() => pick(i)}
                  className={`flex items-center gap-2 rounded-full border px-3.5 py-2 font-display text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 sm:px-4 sm:text-sm ${focus === i ? 'border-transparent text-white' : 'border-white/15 bg-[#0a1040]/60 text-slate-300 hover:text-white'}`}
                  style={focus === i ? { background: `${s.color}33`, boxShadow: `inset 0 0 0 1px ${s.color}` } : undefined}>
                  <s.Icon size={15} style={{ color: s.color }} aria-hidden />{s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
