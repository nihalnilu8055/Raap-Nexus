import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Fallback3D from '../components/ui/Fallback3D'
import { MODULES } from '../data/ecosystem'
import { Boundary, isMobile, webglSupported } from '../lib/webgl'
import { EASE } from '../lib/motion'

const Scene = lazy(() => import('../three/EcosystemScene'))

export default function Ecosystem() {
  const box = useRef<HTMLDivElement>(null)
  const labels = useRef<(HTMLElement | null)[]>([])
  const activeRef = useRef(0)
  const touched = useRef(false)
  const reduced = !!useReducedMotion()
  const [webgl] = useState(webglSupported)
  const [mobile] = useState(isMobile)
  const [near, setNear] = useState(false) // mount the scene only close to the viewport
  const [inView, setInView] = useState(false)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const el = box.current!
    const a = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '700px 0px' })
    const b = new IntersectionObserver(([e]) => setInView(e.isIntersecting))
    a.observe(el); b.observe(el)
    return () => { a.disconnect(); b.disconnect() }
  }, [])

  const select = useCallback((i: number, user = true) => {
    if (user) touched.current = true
    activeRef.current = i
    setActive(i)
  }, [])

  useEffect(() => {
    if (reduced || !inView) return
    const id = setInterval(() => { if (!touched.current) select((activeRef.current + 1) % MODULES.length, false) }, 3800)
    return () => clearInterval(id)
  }, [reduced, inView, select])

  const m = MODULES[active]
  return (
    <section id="capabilities" aria-labelledby="eco-h" className="relative overflow-hidden bg-[#040a1c] px-4 py-24 sm:px-8 md:py-32">
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 55% 50% at 38% 55%, rgba(37,99,235,.28), transparent 70%)' }} />
      <div className="relative mx-auto max-w-[1280px]">
        <motion.h2 id="eco-h" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, ease: EASE }}
          className="text-center font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-left">
          Everything works <span className="text-sky-300">together.</span>
        </motion.h2>

        <div className="mt-8 grid items-center gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div ref={box} className="relative h-[380px] sm:h-[480px] lg:h-[600px]">
            {webgl && near ? (
              <Boundary fallback={<Fallback3D className="h-full w-full" />}>
                <Suspense fallback={<Fallback3D className="h-full w-full opacity-40" />}>
                  <Scene count={MODULES.length} activeRef={activeRef} onSelect={select} labels={labels} reduced={reduced} mobile={mobile} active={inView} />
                </Suspense>
              </Boundary>
            ) : (
              <Fallback3D className="h-full w-full opacity-60" />
            )}
            {webgl && near && (
              <div className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block">
                {MODULES.map((mod, i) => (
                  <button key={mod.id} type="button" ref={(el) => { labels.current[i] = el }} onClick={() => select(i)} onFocus={() => select(i)} aria-pressed={active === i}
                    className={`pointer-events-auto absolute left-0 top-0 rounded-full border px-3.5 py-1.5 font-display text-sm font-bold backdrop-blur transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${active === i ? 'border-sky-300 bg-sky-400/25 text-white' : 'border-white/15 bg-white/5 text-slate-300 hover:text-white'}`} style={{ opacity: 0 }}>
                    {mod.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className={`mb-4 flex flex-wrap gap-2 ${webgl ? 'sm:hidden' : ''}`} role="group" aria-label="Modules">
              {MODULES.map((mod, i) => (
                <button key={mod.id} type="button" onClick={() => select(i)} aria-pressed={active === i}
                  className={`rounded-full border px-3.5 py-1.5 font-display text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${active === i ? 'border-sky-300 bg-sky-400/25 text-white' : 'border-white/15 text-slate-300'}`}>{mod.label}</button>
              ))}
            </div>
            <div className="min-h-[300px] rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl sm:p-7" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div key={m.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: EASE }}>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">0{active + 1} / 0{MODULES.length}</p>
                  <h3 className="mt-2 font-display text-3xl font-extrabold text-white">{m.label}</h3>
                  <p className="mt-2 text-slate-300">{m.blurb}</p>
                  {m.shot && (
                    <div className="mt-5 overflow-hidden rounded-xl border border-white/10 shadow-2xl">
                      <img src={`/assets/shots/${m.shot}.webp`} alt={m.alt} width={1440} height={900} loading="lazy" decoding="async" className="aspect-[16/8] w-full object-cover object-[75%_0%]" />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
