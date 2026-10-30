import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Calculator, LineChart, ShieldCheck, TrendingUp } from 'lucide-react'
import CountUp from '../components/ui/CountUp'
import CtaButton from '../components/ui/CtaButton'
import { SERVICES } from '../data/services'
import { EASE } from '../lib/motion'
import { AnalysisScene, AuditScene, BusinessScene, TaxScene } from './services/Scenes'

const META: Record<string, { accent: string; glow: string; line: string; cta: string; CtaIcon: typeof Calculator; Scene: typeof TaxScene }> = {
  tax: { accent: '#f59e0b', glow: 'rgba(245,158,11,.35)', line: 'Tax data, VAT and returns in one view.', cta: 'Explore tax auditing', CtaIcon: Calculator, Scene: TaxScene },
  audit: { accent: '#10b981', glow: 'rgba(16,185,129,.32)', line: 'Every entry traced from ledger to bank.', cta: 'Explore auditing', CtaIcon: ShieldCheck, Scene: AuditScene },
  analysis: { accent: '#2563eb', glow: 'rgba(56,189,248,.32)', line: 'Revenue, expenses and cash flow, clearly.', cta: 'Explore analysis', CtaIcon: LineChart, Scene: AnalysisScene },
  business: { accent: '#8b5cf6', glow: 'rgba(139,92,246,.35)', line: 'Growth and margin, connected to decisions.', cta: 'Explore performance', CtaIcon: TrendingUp, Scene: BusinessScene },
}
const AUTO = 7000

export default function Services() {
  const reduced = !!useReducedMotion()
  const [sel, setSel] = useState(0)
  const [auto, setAuto] = useState(true)
  const [seen, setSeen] = useState(false)
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const s = SERVICES[sel], m = META[s.id]

  // scroll-driven entrance: the stage tilts up out of the page; background glows drift (parallax)
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start end', 'center center'] })
  const sp = useSpring(scrollYProgress, { stiffness: 120, damping: 28 })
  const rotX = useTransform(sp, [0, 1], [reduced ? 0 : 16, 0]), sc = useTransform(sp, [0, 1], [reduced ? 1 : 0.9, 1]), ty = useTransform(sp, [0, 1], [reduced ? 0 : 60, 0])
  const { scrollYProgress: secP } = useScroll({ target: root, offset: ['start end', 'end start'] })
  const b1 = useTransform(secP, [0, 1], [reduced ? 0 : 120, reduced ? 0 : -120]), b2 = useTransform(secP, [0, 1], [reduced ? 0 : -80, reduced ? 0 : 140])

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.35 })
    if (stage.current) io.observe(stage.current)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (reduced || !auto || !seen) return
    const id = setTimeout(() => setSel((v) => (v + 1) % SERVICES.length), AUTO)
    return () => clearTimeout(id)
  }, [reduced, auto, seen, sel])
  useEffect(() => {
    const h = (e: Event) => {
      const i = SERVICES.findIndex((x) => x.id === (e as CustomEvent).detail)
      if (i >= 0) { setSel(i); setAuto(false); stage.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }
    }
    window.addEventListener('select-service', h)
    return () => window.removeEventListener('select-service', h)
  }, [])
  const pick = (i: number) => { setSel(i); setAuto(false) }
  const Scene = m.Scene

  return (
    <section ref={root} id="services" aria-labelledby="svc-h" className="relative overflow-hidden px-4 py-20 sm:px-8 md:py-28" style={{ background: 'linear-gradient(180deg,#f6f9ff 0%,#e3ecff 100%)' }}>
      <motion.div aria-hidden style={{ y: b1, background: m.glow }} className="absolute -right-40 top-10 h-[520px] w-[520px] rounded-full blur-[130px] transition-colors duration-1000" />
      <motion.div aria-hidden style={{ y: b2 }} className="absolute -left-40 bottom-0 h-[460px] w-[460px] rounded-full bg-blue-300/30 blur-[130px]" />
      <div className="relative mx-auto max-w-[1240px]">
        <motion.h2 id="svc-h" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, ease: EASE }}
          className="text-center font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
          Four services. <span className="text-electric-blue">One platform.</span>
        </motion.h2>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.9fr_1fr] lg:gap-8 [perspective:1800px]">
          {/* featured stage */}
          <motion.div ref={stage} style={{ rotateX: rotX, scale: sc, y: ty, transformOrigin: '50% 100%' }} className="min-w-0 will-change-transform">
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#070d2b] shadow-[0_60px_120px_-40px_rgba(10,25,90,.75)]">
              <img src={`/assets/shots/${s.shot}.webp`} alt="" aria-hidden width={1440} height={900} loading="lazy" decoding="async" className="pointer-events-none absolute inset-0 h-full w-full object-cover object-left-top opacity-[.05] blur-[1px] mix-blend-screen" />
              <div aria-hidden className="absolute inset-0 transition-all duration-1000" style={{ background: `radial-gradient(ellipse 60% 50% at 75% 20%, ${m.glow}, transparent 70%), radial-gradient(ellipse 50% 40% at 10% 100%, rgba(37,99,235,.25), transparent 70%)` }} />
              <div className="relative p-5 sm:p-8">
                <AnimatePresence mode="wait">
                  <motion.div key={s.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: EASE }} className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg" style={{ background: m.accent, boxShadow: `0 10px 30px -8px ${m.accent}` }}><s.Icon size={24} strokeWidth={1.8} aria-hidden /></span>
                      <div>
                        <h3 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{s.name}</h3>
                        <p className="text-slate-300">{m.line}</p>
                      </div>
                    </div>
                    <CtaButton label={m.cta} icon={m.CtaIcon} variant="tint" accent={m.accent} small />
                  </motion.div>
                </AnimatePresence>
                <div className="relative mt-4 aspect-[640/380] w-full">
                  <AnimatePresence mode="wait">
                    <motion.div key={s.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="absolute inset-0" role="tabpanel" id="svc-panel">
                      <Scene reduced={reduced} />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="mt-2 flex flex-wrap gap-3">
                  {s.kpis.map((k) => (
                    <div key={s.id + k.label} className="rounded-2xl border border-white/10 bg-white/[.06] px-4 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{k.label}</p>
                      <p className="font-display text-xl font-extrabold text-white"><CountUp to={k.to} decimals={k.decimals} prefix={k.prefix} suffix={k.suffix} /></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* supporting selector */}
          <div role="tablist" aria-label="Financial services" aria-orientation="vertical" className="grid grid-cols-2 gap-3 lg:flex lg:flex-col lg:justify-between lg:gap-4">
            {SERVICES.map((v, i) => {
              const on = i === sel, mm = META[v.id]
              return (
                <motion.button key={v.id} role="tab" aria-selected={on} aria-controls="svc-panel" onClick={() => pick(i)} type="button"
                  initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.8, ease: EASE, delay: 0.1 + i * 0.1 }}
                  whileHover={reduced ? undefined : { y: -4, rotateX: 4, rotateY: -4 }} style={{ transformPerspective: 900 }}
                  className={`group relative flex flex-1 flex-col justify-between overflow-hidden rounded-3xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue sm:p-5 ${on ? 'border-transparent bg-[#070d2b] text-white shadow-[0_30px_60px_-24px_rgba(10,25,90,.7)]' : 'border-white bg-white/70 text-slate-900 backdrop-blur hover:bg-white'}`}>
                  <div aria-hidden className={`absolute inset-0 transition-opacity duration-500 ${on ? 'opacity-100' : 'opacity-0'}`} style={{ background: `radial-gradient(circle at 100% 0%, ${mm.glow}, transparent 65%)` }} />
                  <div className="relative flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl transition-colors duration-500" style={{ background: on ? mm.accent : '#fff', color: on ? '#fff' : mm.accent, boxShadow: on ? `0 8px 24px -8px ${mm.accent}` : 'inset 0 0 0 1px #e2e8f0' }}><v.Icon size={20} strokeWidth={1.8} aria-hidden /></span>
                    <span className={`font-display text-sm font-bold ${on ? 'text-white/60' : 'text-slate-400'}`}>0{i + 1}</span>
                  </div>
                  <div className="relative mt-4">
                    <span className="block font-display text-base font-extrabold leading-tight sm:text-lg">{v.name}</span>
                    <span className={`mt-1 hidden text-sm lg:block ${on ? 'text-slate-300' : 'text-slate-500'}`}>{META[v.id].line}</span>
                  </div>
                  {on && !reduced && auto && <span key={`p${sel}`} aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] origin-left" style={{ background: mm.accent, animation: `svcprog ${AUTO}ms linear forwards` }} />}
                  {on && (!auto || reduced) && <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: mm.accent }} />}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
