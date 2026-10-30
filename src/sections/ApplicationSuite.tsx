import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import NetworkStage from '../components/NetworkStage'
import { APPS, FLOWS } from '../data/applications'
import { EASE } from '../lib/motion'

export default function ApplicationSuite() {
  const routeRef = useRef<number[]>([0])
  const touched = useRef(false)
  const visible = useRef(false)
  const wrap = useRef<HTMLElement>(null)
  const reduced = !!useReducedMotion()
  const [route, setRoute] = useState<number[]>([0])
  const [flow, setFlow] = useState<string | null>(null)

  const apply = useCallback((r: number[], f: string | null, user: boolean) => {
    if (user) touched.current = true
    routeRef.current = r
    setRoute(r)
    setFlow(f)
  }, [])
  const selectApp = useCallback((i: number) => apply([i], null, true), [apply])

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting })
    if (wrap.current) io.observe(wrap.current)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => {
      if (touched.current || !visible.current) return
      apply([(routeRef.current[0] + 1) % APPS.length], null, false)
    }, 3800)
    return () => clearInterval(id)
  }, [reduced, apply])

  const activeFlow = FLOWS.find((f) => f.id === flow)
  const m = APPS[route[0]]
  return (
    <section ref={wrap} id="applications" aria-labelledby="apps-h" className="relative overflow-hidden bg-[#040a1c] px-4 py-20 sm:px-8 md:py-28">
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 55% 50% at 38% 55%, rgba(37,99,235,.28), transparent 70%)' }} />
      <div className="relative mx-auto max-w-[1280px]">
        <div className="text-center lg:text-left">
          <motion.h2 id="apps-h" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, ease: EASE }}
            className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            One platform. <span className="text-sky-300">Every business connected.</span>
          </motion.h2>
          <p className="mt-4 max-w-xl text-lg text-slate-300">All your business operations, working together in one intelligent ecosystem.</p>
        </div>

        <div className="mt-8 grid items-center gap-6 lg:grid-cols-[1.6fr_1fr]">
          <NetworkStage items={APPS.map((a) => ({ id: a.id, short: a.short, color: a.color, Icon: a.Icon }))} variant="platform" routeRef={routeRef} selected={route} onSelect={selectApp} reduced={reduced}
            className="h-[400px] pb-14 sm:h-[480px] sm:pb-0 lg:h-[580px]" />

          <div>
            <div className="min-h-[330px] rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl sm:p-7" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div key={flow ?? m.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: EASE }}>
                  {activeFlow ? (
                    <>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Connected flow · illustrative</p>
                      <ol className="mt-3 flex flex-wrap items-center gap-2">
                        {activeFlow.route.map((i, k) => {
                          const a = APPS[i]
                          return (
                            <li key={a.id} className="flex items-center gap-2">
                              <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-display text-sm font-bold text-white"><a.Icon size={14} style={{ color: a.color }} aria-hidden />{a.short}</span>
                              {k < activeFlow.route.length - 1 && <ArrowRight size={14} className="text-sky-300" aria-hidden />}
                            </li>
                          )
                        })}
                      </ol>
                      <p className="mt-4 text-slate-300">{activeFlow.note}</p>
                      <p className="mt-2 text-sm text-slate-400">One shared dataset, so nothing is re-keyed between modules.</p>
                    </>
                  ) : (
                    <>
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: m.color }}><m.Icon size={15} aria-hidden />0{route[0] + 1} / 0{APPS.length}</p>
                      <h3 className="mt-2 font-display text-3xl font-extrabold text-white">{m.name}</h3>
                      <p className="mt-2 text-slate-300">{m.blurb}</p>
                      {m.shot && (
                        <div className="mt-5 overflow-hidden rounded-xl border border-white/10 shadow-2xl">
                          <img src={`/assets/shots/${m.shot}.webp`} alt={m.alt} width={1440} height={900} loading="lazy" decoding="async" className="aspect-[16/8] w-full object-cover object-[75%_0%]" />
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Connected flows">
              {FLOWS.map((f) => (
                <button key={f.id} type="button" aria-pressed={flow === f.id} onClick={() => apply(f.route, f.id, true)}
                  className={`rounded-full border px-4 py-2 font-display text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${flow === f.id ? 'border-sky-300 bg-sky-400/25 text-white' : 'border-white/15 text-slate-300 hover:text-white'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
