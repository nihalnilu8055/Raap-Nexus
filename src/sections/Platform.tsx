import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, Bell } from 'lucide-react'
import CountUp from '../components/ui/CountUp'
import { EASE, gsap } from '../lib/motion'

const TABS = [
  { id: 'summary', label: 'Executive', alt: 'RaapNexus executive summary dashboard' },
  { id: 'pnl', label: 'Profit & loss', alt: 'RaapNexus monthly profit and loss statement' },
  { id: 'balance', label: 'Balance sheet', alt: 'RaapNexus balance sheet with VAT balances' },
  { id: 'trial', label: 'Trial balance', alt: 'RaapNexus trial balance view' },
  { id: 'cashflow', label: 'Cash flow', alt: 'RaapNexus cash flow view' },
  { id: 'anomalies', label: 'Red flags', alt: 'RaapNexus anomalies and red flags review' },
]
const NOTES = ['Trial balance verified', 'Collections report ready', 'Month-end ledger balanced (sample)']
const SPARK = 'M0 62 C 18 58, 28 40, 46 46 S 78 24, 98 30 S 130 52, 150 22 S 176 8, 196 12'

export default function Platform() {
  const section = useRef<HTMLElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const tilt = useRef<HTMLDivElement>(null)
  const spark = useRef<SVGPathElement>(null)
  const reduced = !!useReducedMotion()
  const [tab, setTab] = useState(0)
  const [paused, setPaused] = useState(false)
  const [note, setNote] = useState(0)

  useEffect(() => {
    if (reduced || paused) return
    const id = setInterval(() => setTab((t) => (t + 1) % TABS.length), 5200)
    return () => clearInterval(id)
  }, [reduced, paused])
  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => setNote((n) => (n + 1) % NOTES.length), 3200)
    return () => clearInterval(id)
  }, [reduced])

  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      // dashboard rises out of the hero's darkness with real perspective
      gsap.fromTo(frame.current, { rotationX: 34, y: 140, scale: 0.84, opacity: 0.2, transformPerspective: 1600, transformOrigin: '50% 100%' },
        { rotationX: 0, y: 0, scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: frame.current, start: 'top 98%', end: 'top 38%', scrub: 0.6 } })
      // floating layers drift at different speeds for depth
      gsap.utils.toArray<HTMLElement>('[data-depth]').forEach((el) => {
        const d = Number(el.dataset.depth)
        gsap.fromTo(el, { y: 90 * d }, { y: -70 * d, ease: 'none', scrollTrigger: { trigger: section.current, start: 'top bottom', end: 'bottom top', scrub: 0.8 } })
      })
      // chart line draws itself
      const p = spark.current
      if (p) {
        const len = p.getTotalLength()
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
        gsap.to(p, { strokeDashoffset: 0, duration: 2, ease: 'power2.out', scrollTrigger: { trigger: p, start: 'top 90%', once: true } })
      }
    }, section)
    return () => ctx.revert()
  }, [reduced])

  // pointer-driven tilt
  useEffect(() => {
    if (reduced || !tilt.current) return
    const el = tilt.current
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.8, ease: 'power3.out' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.8, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      ry(((e.clientX - r.left) / r.width - 0.5) * 5)
      rx(-((e.clientY - r.top) / r.height - 0.5) * 4)
    }
    const leave = () => { rx(0); ry(0) }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
  }, [reduced])

  const cur = TABS[tab]
  return (
    <section ref={section} id="platform" aria-labelledby="platform-h" className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-8 md:pb-32"
      style={{ background: 'linear-gradient(180deg,#071331 0%,#0b1d4d 14%,#cfe0ff 46%,#eef4ff 70%,#f6f9ff 100%)' }}>
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-12 text-center md:mb-16">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-sky-300">The RaapNexus finance dashboard</p>
          <motion.h2 id="platform-h" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, ease: EASE }}
            className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            Complete financial <span className="text-sky-300">intelligence.</span>
          </motion.h2>
        </div>

        <div className="relative [perspective:1600px]" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
          {/* floating glass layers (desktop) */}
          <div data-depth="0.9" className="absolute left-2 top-10 z-20 hidden w-60 lg:block xl:-left-2">
            <div className="rounded-2xl border border-white/50 bg-white/70 p-4 shadow-[0_30px_60px_-20px_rgba(15,40,120,.45)] backdrop-blur-xl">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Revenue YTD</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-slate-900">AED <CountUp to={47.6} decimals={1} suffix="M" /></p>
              <svg viewBox="0 0 200 70" className="mt-2 h-12 w-full" aria-hidden>
                <path ref={spark} d={SPARK} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div data-depth="1.3" className="absolute right-2 top-40 z-20 hidden w-52 lg:block xl:-right-2">
            <div className="rounded-2xl border border-white/50 bg-white/70 p-4 shadow-[0_30px_60px_-20px_rgba(15,40,120,.45)] backdrop-blur-xl">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Sales growth</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-emerald-600">+<CountUp to={14.1} decimals={1} suffix="%" /></p>
              <div className="mt-3 flex h-10 items-end gap-1.5" aria-hidden>
                {[40, 55, 48, 70, 62, 85, 100].map((h, i) => (
                  <motion.span key={i} className="flex-1 rounded-sm bg-gradient-to-t from-blue-500 to-sky-300" initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE, delay: i * 0.07 }} />
                ))}
              </div>
            </div>
          </div>
          <div data-depth="0.5" className="absolute -bottom-6 left-6 z-20 hidden lg:block">
            <AnimatePresence mode="wait">
              <motion.div key={note} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.5, ease: EASE }}
                role="status" className="flex items-center gap-3 rounded-full border border-white/60 bg-white/85 py-2 pl-2 pr-5 shadow-xl backdrop-blur-xl">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500 text-white"><Check size={16} /></span>
                <span className="text-sm font-semibold text-slate-800">{NOTES[note]}</span>
                <Bell size={14} className="text-slate-400" aria-hidden />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* application frame */}
          <div ref={frame} className="will-change-transform">
            <div ref={tilt} className="relative mx-auto overflow-hidden rounded-[18px] border border-white/60 bg-white shadow-[0_60px_120px_-30px_rgba(8,30,100,.65),0_0_0_1px_rgba(255,255,255,.4)] [transform-style:preserve-3d]">
              <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" /><span className="h-2.5 w-2.5 rounded-full bg-slate-300" /><span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="mx-auto rounded-md bg-white px-3 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">RaapNexus ERP · {cur.label}</span>
              </div>
              {/* below lg the screenshot is shown at a readable size and can be swiped sideways */}
              <div className="relative h-[400px] overflow-x-auto overflow-y-hidden bg-slate-50 lg:h-auto lg:overflow-hidden lg:aspect-[1440/900]" tabIndex={0} aria-label="ERP dashboard preview, scroll sideways to pan">
                <AnimatePresence initial={false}>
                  <motion.img key={cur.id} src={`/assets/shots/${cur.id}.webp`} alt={cur.alt} width={1440} height={900} decoding="async"
                    initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: EASE }}
                    className="absolute left-0 top-0 h-auto w-[1000px] max-w-none select-none lg:w-full" draggable={false} />
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <div role="tablist" aria-label="ERP views" className="mx-auto mt-10 flex max-w-full justify-start gap-1 overflow-x-auto rounded-full border border-slate-200 bg-white/80 p-1.5 shadow-lg backdrop-blur sm:w-fit sm:justify-center">
          {TABS.map((t, i) => (
            <button key={t.id} role="tab" aria-selected={tab === i} onClick={() => { setTab(i); setPaused(true) }}
              className={`relative shrink-0 rounded-full px-4 py-2 font-display text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue ${tab === i ? 'text-white' : 'text-slate-600 hover:text-slate-900'}`}>
              {tab === i && <motion.span layoutId="tabpill" className="absolute inset-0 rounded-full bg-electric-blue" transition={{ duration: 0.4, ease: EASE }} />}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
