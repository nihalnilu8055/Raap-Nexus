// PRICING-PAGE (removable): part of the self-contained Pricing feature, see README-REMOVE.md
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ArrowDown, Calculator } from 'lucide-react'
import { glInfo } from '../lib/gate'
import { useSceneGate } from '../lib/gate'
import { Boundary, isMobile } from '../lib/webgl'
import { HUB_ITEMS, STAGES, type Api, type HubId } from './Hero3D'
import { Reveal } from '../components/ui/Reveal'

const Hero3D = lazy(() => import('./Hero3D'))
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** DOM-only version of the hub: shown before the WebGL scene starts, and permanently when WebGL is unavailable. */
function Fallback() {
  const rings = [{ i: '4%', d: '26s', c: '#22d3ee' }, { i: '16%', d: '19s', c: '#60a5fa' }, { i: '28%', d: '33s', c: '#8b7bff' }]
  return (
    <div className="fb" aria-hidden>
      <div className="fb-stage">
        {rings.map((r, n) => <div key={n} className="fb-ring" style={{ ['--i' as string]: r.i, ['--d' as string]: r.d, ['--c' as string]: r.c }} />)}
        <div className="fb-core" />
      </div>
    </div>
  )
}

export default function Hero() {
  const gate = useSceneGate()
  const api = useRef<Api>({ hover: null, stage: 0, px: 0, py: 0, reduced: reducedMotion() })
  const [stage, setStage] = useState(0)
  const [hover, setHover] = useState<HubId | null>(null)
  const [auto, setAuto] = useState(true)
  const gl = glInfo()
  const live = gate && gl.ok
  const lite = isMobile() || gl.software

  useEffect(() => { api.current.stage = stage }, [stage])
  useEffect(() => {
    if (!auto || reducedMotion()) return
    const id = window.setInterval(() => setStage((s) => (s + 1) % 3), 4200)
    return () => window.clearInterval(id)
  }, [auto])
  const onHover = (id: HubId | null) => { api.current.hover = id; setHover(id) }
  const active = HUB_ITEMS.find((h) => h.id === hover)

  return (
    <section id="pricing-hero" aria-labelledby="pricing-h1" className="fit fit-hero relative overflow-hidden px-4 pb-12 pt-28 sm:px-6 sm:pt-32">
      <div aria-hidden className="grid-bg absolute inset-0" />
      <div aria-hidden className="absolute -right-40 top-10 h-[640px] w-[640px] rounded-full bg-blue-600/20 blur-[140px]" />
      <div aria-hidden className="absolute -left-40 bottom-0 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="relative mx-auto grid w-full max-w-[1200px] items-center gap-10 lg:grid-cols-[1.02fr_1fr] lg:gap-6">
        <div className="min-w-0">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-300/25 bg-sky-400/10 px-3.5 py-1.5 font-display text-xs font-bold uppercase tracking-[0.18em] text-sky-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />RaapNexus Pricing</p>
            <h1 id="pricing-h1" className="mt-5 font-display text-[2.1rem] font-extrabold leading-[1.08] tracking-tight text-white [text-wrap:balance] sm:text-5xl lg:text-[3.35rem]">
              <span className="glow-text">Powerful Business Intelligence.</span> Pricing That Scales With You.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">Start free with RaapNexus. Connect your business systems, unlock advanced capabilities and pay only for what your business needs.</p>
            <div className="fit-cta mt-8 flex flex-wrap gap-3">
              <a href="#profiles" className="inline-flex items-center gap-2 rounded-full bg-electric-blue px-6 py-3 font-display text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(37,99,235,.9)] transition hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">View pricing <ArrowDown size={16} aria-hidden /></a>
              <a href="#calculator" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[.06] px-6 py-3 font-display text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/[.12] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"><Calculator size={16} aria-hidden />Estimate your cost</a>
            </div>
          </Reveal>
          <dl className="fit-stats mt-9 grid max-w-xl grid-cols-3 gap-3">
            {[['$0', 'to start'], ['4', 'free connectors'], ['$1', 'add-ons from']].map(([a, b]) => (
              <div key={b} className="glass rounded-2xl px-4 py-3"><dt className="sr-only">{b}</dt><dd className="font-display text-xl font-extrabold text-white sm:text-2xl">{a}<span className="mt-1 block text-[11px] font-semibold uppercase leading-tight tracking-wider text-slate-400">{b}</span></dd></div>
            ))}
          </dl>
        </div>

        <div className="min-w-0">
          <div className="hero-art relative mx-auto aspect-square w-full max-w-[560px] sm:aspect-[1.05/1]" role="img" aria-label="Interactive 3D model: the RaapNexus core connected to ERP systems, databases, AI agents, dashboards, business intelligence, data sources and workflows.">
            <div aria-hidden className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(47,107,255,.28),transparent 68%)]" />
            {!live && <Fallback />}
            {live && (
              <Boundary fallback={<Fallback />}>
                <Suspense fallback={<Fallback />}><Hero3D api={api} lite={lite} onHover={onHover} /></Suspense>
              </Boundary>
            )}
          </div>
          <div className="mx-auto mt-2 max-w-[560px]">
            <div className="flex items-center justify-center gap-1.5" role="group" aria-label="Pricing journey">
              {STAGES.map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  <button type="button" onClick={() => { setAuto(false); setStage(i) }} aria-pressed={stage === i}
                    className={`rounded-full px-4 py-2 font-display text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${stage === i ? 'bg-sky-400/20 text-white ring-1 ring-sky-300/60' : 'text-slate-400 hover:text-white'}`}>{s}</button>
                  {i < 2 && <span aria-hidden className="text-slate-600">→</span>}
                </div>
              ))}
            </div>
            <p className="mt-2 min-h-[2.75rem] text-center text-sm leading-relaxed text-slate-300" aria-live="polite">
              {active ? <><strong className="text-white">{active.name}.</strong> {active.text}</> : ['Connect the ERP systems, databases and files you already use.', 'Analyse them together with dashboards, business intelligence and AI agents.', 'Expand with more users, dashboards, workflows and integrations when you need them.'][stage]}
            </p>
            <ul className="mt-1 flex flex-wrap justify-center gap-1.5">
              {HUB_ITEMS.map((h) => (
                <li key={h.id}><button type="button" onMouseEnter={() => onHover(h.id)} onMouseLeave={() => onHover(null)} onFocus={() => onHover(h.id)} onBlur={() => onHover(null)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${hover === h.id ? 'border-sky-300/70 bg-sky-400/15 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}>{h.name}</button></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
