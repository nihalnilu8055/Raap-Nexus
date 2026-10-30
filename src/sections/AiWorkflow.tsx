import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, RotateCcw, Sparkles } from 'lucide-react'
import { EASE, gsap } from '../lib/motion'

const STEPS = ['Question', 'AI', 'ERP', 'Insight', 'Action']
const QS = [
  { q: "What are today's sales?", shot: 'sales', head: 'AED 182,450', detail: '37 invoices · +6.2% vs yesterday', action: 'Daily summary shared with Sales', note: 'Illustrative figures' },
  { q: 'How is cash flow looking?', shot: 'cashflow', head: 'AED 0.92M', detail: 'Cash & bank balance, live', action: 'Collections follow-up drafted', note: 'From the sample dashboard' },
  { q: 'How are sales growing?', shot: 'dashboard', head: '+14.1%', detail: 'Jan–Sep 2026 vs 2025', action: 'Growth report scheduled', note: 'From the sample dashboard' },
]

function Connector({ cls, on }: { cls: string; on: boolean }) {
  return (
    <div className={`${cls} relative mx-auto h-14 w-px md:h-px md:w-full md:min-w-[48px]`} aria-hidden>
      {/* horizontal on md+, vertical below */}
      <svg className="absolute inset-0 hidden h-6 w-full -translate-y-1/2 overflow-visible md:block" viewBox="0 0 100 1" preserveAspectRatio="none">
        <path className="c-base" d="M0 .5H100" pathLength={1} fill="none" stroke="#3b82f6" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        <path className={`flow ${on ? 'opacity-100' : 'opacity-0'}`} d="M0 .5H100" pathLength={1} fill="none" stroke="#fff" strokeWidth="4" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      </svg>
      <svg className="absolute inset-y-0 left-1/2 h-full w-6 -translate-x-1/2 overflow-visible md:hidden" viewBox="0 0 1 100" preserveAspectRatio="none">
        <path className="c-base" d="M.5 0V100" pathLength={1} fill="none" stroke="#3b82f6" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        <path className={`flow ${on ? 'opacity-100' : 'opacity-0'}`} d="M.5 0V100" pathLength={1} fill="none" stroke="#fff" strokeWidth="4" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export default function AiWorkflow() {
  const root = useRef<HTMLElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const started = useRef(false)
  const reduced = !!useReducedMotion()
  const [qi, setQi] = useState(0)
  const [stage, setStage] = useState(0) // 0 idle/typing, 1 sent, 2 AI thinking, 3 ERP, 4 insight, 5 action
  const [typed, setTyped] = useState('')
  const q = QS[qi]

  const run = useCallback((i: number) => {
    tl.current?.kill()
    const text = QS[i].q
    const root_ = root.current!
    const c1 = root_.querySelectorAll('.k1 .c-base')
    const c2 = root_.querySelectorAll('.k2 .c-base')
    if (reduced) { setTyped(text); setStage(5); gsap.set([c1, c2], { strokeDasharray: 1, strokeDashoffset: 0 }); return }
    gsap.set([c1, c2], { strokeDasharray: 1, strokeDashoffset: 1 })
    const tw = { n: 0 }
    const t = gsap.timeline()
    t.call(() => { setStage(0); setTyped('') })
      .to(tw, { n: text.length, duration: text.length * 0.045, ease: 'none', onUpdate: () => setTyped(text.slice(0, Math.round(tw.n))) }, 0.2)
      .to(c1, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, '+=0.2')
      .call(() => setStage(1), undefined, '<0.2')
      .call(() => setStage(2), undefined, '+=0.3')
      .to(c2, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, '+=1.1')
      .call(() => setStage(3), undefined, '>')
      .call(() => setStage(4), undefined, '+=0.9')
      .call(() => setStage(5), undefined, '+=0.9')
    tl.current = t
  }, [reduced])

  useLayoutEffect(() => {
    const el = root.current!
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started.current) { started.current = true; run(0) } }, { threshold: 0.35 })
    io.observe(el)
    return () => { io.disconnect(); tl.current?.kill() }
  }, [run])
  useEffect(() => { if (started.current) run(qi) }, [qi, run])

  const done = stage === 5
  return (
    <section ref={root} id="intelligence" aria-labelledby="ai-h" className="relative overflow-hidden px-4 py-24 sm:px-8 md:py-32" style={{ background: 'linear-gradient(180deg,#f6f9ff 0%,#e8f0ff 100%)' }}>
      <div className="mx-auto max-w-[1180px]">
        <div className="text-center">
          <motion.h2 id="ai-h" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, ease: EASE }}
            className="font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            From questions to <span className="text-electric-blue">action.</span>
          </motion.h2>
          <p className="mt-4 text-lg text-slate-600">Your business data. Connected intelligence.</p>
        </div>

        <div className="relative mt-12 rounded-[28px] border border-white bg-white/70 p-5 shadow-[0_40px_100px_-30px_rgba(30,64,175,.35)] backdrop-blur-xl sm:p-8">
          <ol className="mb-8 flex items-center justify-between gap-1 text-[11px] font-bold uppercase tracking-wider sm:text-xs" aria-label="Workflow steps">
            {STEPS.map((s, i) => (
              <li key={s} className={`flex items-center gap-1.5 transition-colors duration-500 ${stage >= i ? 'text-electric-blue' : 'text-slate-400'}`} aria-current={stage === i ? 'step' : undefined}>
                <span className={`h-2 w-2 rounded-full transition-all duration-500 ${stage >= i ? 'scale-125 bg-electric-blue shadow-[0_0_12px_#3b82f6]' : 'bg-slate-300'}`} />{s}
              </li>
            ))}
          </ol>

          <div className="grid items-center gap-2 md:grid-cols-[1fr_minmax(56px,0.7fr)_auto_minmax(56px,0.7fr)_1fr] md:gap-4">
            {/* 1. question */}
            <div className="mx-auto w-full max-w-xs">
              <div className="rounded-2xl rounded-bl-sm bg-slate-900 px-5 py-4 text-white shadow-xl">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-300">You</p>
                <p className="mt-1 min-h-[3rem] font-display text-lg font-bold leading-snug" aria-live="polite">{typed}{stage === 0 && <span className="animate-blink ml-0.5 inline-block h-5 w-0.5 translate-y-1 bg-sky-300" />}</p>
              </div>
            </div>
            <Connector cls="k1" on={stage >= 1} />
            {/* 2. AI core */}
            <div className="mx-auto grid h-52 w-52 place-items-center [perspective:600px]" aria-label={stage === 2 ? 'AI is processing' : 'AI intelligence'}>
              <div className="relative h-40 w-40 [transform-style:preserve-3d]">
                {[0, 1, 2].map((r) => (
                  <span key={r} className="absolute inset-0 rounded-full border border-sky-400/70" style={{ animation: `orb${r} ${stage === 2 ? 2.2 : 9}s linear infinite`, transform: `rotateX(${60 + r * 15}deg)` }} />
                ))}
                <span className={`absolute inset-8 rounded-full transition-all duration-700 ${stage === 2 ? 'scale-110 shadow-[0_0_70px_14px_rgba(59,130,246,.65)]' : 'shadow-[0_0_40px_6px_rgba(59,130,246,.35)]'}`} style={{ background: 'radial-gradient(circle at 35% 30%,#dff4ff,#3b82f6 55%,#1e3fa8)' }} />
                <Sparkles className="absolute inset-0 m-auto text-white" size={22} aria-hidden />
              </div>
            </div>
            <Connector cls="k2" on={stage >= 3} />
            {/* 3. ERP panel */}
            <motion.div animate={{ opacity: stage >= 3 ? 1 : 0.35, scale: stage >= 3 ? 1 : 0.95 }} transition={{ duration: 0.6, ease: EASE }} className="mx-auto w-full max-w-xs">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="flex gap-1 border-b border-slate-100 bg-slate-50 px-3 py-2"><i className="h-2 w-2 rounded-full bg-slate-300" /><i className="h-2 w-2 rounded-full bg-slate-300" /><i className="h-2 w-2 rounded-full bg-slate-300" /></div>
                <img src={`/assets/shots/${q.shot}.webp`} alt={`RaapNexus ERP ${q.shot} view`} width={1440} height={900} loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover object-[80%_0%]" />
              </div>
            </motion.div>
          </div>

          {/* 4/5. insight + action */}
          <div className="mx-auto mt-8 min-h-[116px] max-w-xl">
            <motion.div initial={false} animate={{ opacity: stage >= 4 ? 1 : 0, y: stage >= 4 ? 0 : 16 }} transition={{ duration: 0.6, ease: EASE }} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-lg" aria-live="polite">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display text-4xl font-extrabold text-slate-900">{q.head}</p>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{q.note}</span>
              </div>
              <p className="mt-1 text-slate-600">{q.detail}</p>
              <motion.p initial={false} animate={{ opacity: done ? 1 : 0, height: done ? 'auto' : 0 }} className="mt-3 flex items-center gap-2 overflow-hidden text-sm font-semibold text-emerald-700">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white"><Check size={12} /></span>{q.action}
              </motion.p>
            </motion.div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {QS.map((x, i) => (
              <button key={x.q} onClick={() => { started.current = true; if (i === qi) run(i); else setQi(i) }} aria-pressed={qi === i}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue ${qi === i ? 'border-electric-blue bg-electric-blue text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'}`}>{x.q}</button>
            ))}
            <button onClick={() => run(qi)} aria-label="Replay" className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 hover:text-electric-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue"><RotateCcw size={15} /></button>
          </div>
        </div>
      </div>
    </section>
  )
}
