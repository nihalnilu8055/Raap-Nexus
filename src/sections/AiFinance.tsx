import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BadgeCheck, FlaskConical, MessageSquareText, Server, Shuffle } from 'lucide-react'
import { AI_NODES, USE_CASES } from '../data/aiModels'
import { EASE } from '../lib/motion'

const SHOTS = ['balance', 'pnl', 'trial', 'expenses', 'dashboard', 'anomalies']
const CX = 260, CY = 215, R = 160
const POS = AI_NODES.map((_, i) => { const a = (i / AI_NODES.length) * Math.PI * 2 - Math.PI / 2; return { x: CX + Math.cos(a) * R * 1.12, y: CY + Math.sin(a) * R * 0.92 } })
/** Axelor-inspired model selection, adapted to financial intelligence. */
export default function AiFinance() {
  const reduced = !!useReducedMotion()
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
    if (reduced) return
    const id = setInterval(() => { if (!touched.current && vis.current) setSel((v) => (v + 1) % AI_NODES.length) }, 4200)
    return () => clearInterval(id)
  }, [reduced])

  const n = AI_NODES[sel]
  const ok = n.status === 'verified'
  return (
    <section ref={wrap} id="ai" aria-labelledby="ai-h" className="relative overflow-hidden bg-[#050824] px-4 py-20 sm:px-8 md:py-28">
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 55% at 72% 45%, rgba(99,88,255,.30), transparent 70%), radial-gradient(ellipse 40% 40% at 5% 90%, rgba(37,99,235,.18), transparent 70%)' }} />
      <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
        {/* LEFT: message */}
        <div>
          <motion.h2 id="ai-h" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, ease: EASE }}
            className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Financial intelligence. <span className="text-violet-300">Powered by AI.</span>
          </motion.h2>
          <p className="mt-4 text-lg text-slate-200">Flexible AI models. Smarter financial insights. Greater control.</p>
          <p className="mt-3 max-w-md text-slate-400">Ask your financial data anything.</p>
          <ul className="mt-6 space-y-3">
            {[
              { Icon: MessageSquareText, t: 'Ask in plain language', s: 'Live via MCP', live: true },
              { Icon: Shuffle, t: 'Flexible model connectivity', s: 'Planned', live: false },
              { Icon: Server, t: 'Deployment choice', s: 'Planned', live: false },
            ].map(({ Icon, t, s, live }) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.06] text-violet-200 ring-1 ring-white/10"><Icon size={18} aria-hidden /></span>
                <span className="font-display font-bold text-white">{t}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${live ? 'bg-emerald-400/15 text-emerald-300' : 'bg-indigo-400/15 text-indigo-200'}`}>{s}</span>
              </li>
            ))}
          </ul>
          <div className="mt-7">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Finance use cases</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Use cases">
              {USE_CASES.map((u, i) => (
                <button key={u.id} type="button" aria-pressed={uc === i} onClick={() => setUc(i)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${uc === i ? 'border-violet-300 bg-violet-400/20 text-white' : 'border-white/12 text-slate-300 hover:text-white'}`}>{u.label}</button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.p key={uc} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-slate-200" aria-live="polite">
                <span className="text-violet-300">“</span>{USE_CASES[uc].prompt}<span className="text-violet-300">”</span>
              </motion.p>
            </AnimatePresence>
            <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1233] shadow-[0_30px_60px_-30px_rgba(99,88,255,.6)]">
              <AnimatePresence mode="wait">
                <motion.img key={uc} src={`/assets/shots/${SHOTS[uc]}.webp`} alt="" width={1440} height={900} loading="lazy" decoding="async"
                  initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 0.92, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="block h-40 w-full object-cover object-left-top sm:h-48" />
              </AnimatePresence>
              {!reduced && <span aria-hidden className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-violet-300/35 to-transparent" style={{ animation: 'scanY 3.2s ease-in-out infinite' }} />}
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#050824]/70 to-transparent" />
              <motion.p key={`i${uc}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }} className="absolute bottom-3 left-4 flex items-center gap-2 text-sm font-bold text-white">
                <span className="h-2 w-2 animate-pulse rounded-full bg-violet-300" />{USE_CASES[uc].label}
              </motion.p>
            </div>
          </div>
        </div>

        {/* RIGHT: model selection */}
        <div>
          <div className="relative mx-auto w-full max-w-[560px]">
            <svg viewBox="0 0 520 430" className="w-full" aria-hidden>
              <defs>
                <radialGradient id="aicore" cx="38%" cy="32%" r="75%"><stop offset="0" stopColor="#ece9ff" /><stop offset=".45" stopColor="#7a6bff" /><stop offset="1" stopColor="#2a2a9a" /></radialGradient>
                <linearGradient id="hotpath" gradientUnits="userSpaceOnUse" x1={CX} y1={CY} x2={POS[sel].x} y2={POS[sel].y}><stop offset="0" stopColor="#c4b5fd" /><stop offset="1" stopColor={ok ? '#34d399' : '#818cf8'} /></linearGradient>
              </defs>
              {[70, 105].map((r, i) => <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="#8b7bff" strokeOpacity={0.18 - i * 0.05} strokeDasharray="3 7" style={{ transformOrigin: `${CX}px ${CY}px`, animation: reduced ? undefined : `spinSlow ${i ? 50 : 34}s linear infinite ${i ? 'reverse' : ''}` }} />)}
              {POS.map((p, i) => <line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="#6d5cff" strokeOpacity={i === sel ? 0 : 0.28} strokeDasharray="4 6" />)}
              <motion.line key={sel} x1={CX} y1={CY} x2={POS[sel].x} y2={POS[sel].y} stroke="url(#hotpath)" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: EASE }} />
              {!reduced && [0, 0.7, 1.4].map((b) => (
                <circle key={`${sel}${b}`} r="4" fill="#fff" style={{ filter: 'drop-shadow(0 0 6px #b8aaff)' }}><animateMotion dur="2.1s" begin={`${b}s`} repeatCount="indefinite" path={`M${CX} ${CY} L${POS[sel].x} ${POS[sel].y}`} /></circle>
              ))}
              <circle cx={CX} cy={CY} r="58" fill="#6d5cff" opacity=".18" />
              <circle cx={CX} cy={CY} r="44" fill="url(#aicore)" />
              <text x={CX} y={CY + 4} textAnchor="middle" fill="#fff" fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="13">RaapNexus</text>
              <text x={CX} y={CY + 19} textAnchor="middle" fill="#e0dcff" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="11">AI core</text>
            </svg>
            {AI_NODES.map((a, i) => (
              <button key={a.id} type="button" onClick={() => pick(i)} onFocus={() => pick(i)} aria-pressed={sel === i} aria-label={`${a.name}, ${a.status === 'verified' ? 'live' : 'planned'}`}
                className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none" style={{ left: `${(POS[i].x / 520) * 100}%`, top: `${(POS[i].y / 430) * 100}%` }}>
                <span className="flex flex-col items-center gap-1.5" style={reduced ? undefined : { animation: `floatY ${5 + (i % 3)}s ease-in-out ${i * -0.9}s infinite` }}>
                  <span className={`grid h-12 w-12 place-items-center rounded-full bg-white/95 ring-1 transition-all duration-300 sm:h-14 sm:w-14 group-focus-visible:ring-2 group-focus-visible:ring-violet-300 ${sel === i ? 'scale-110 ring-white' : 'ring-white/40 group-hover:scale-110'}`}
                    style={{ boxShadow: sel === i ? `0 0 38px -2px ${a.color}, 0 10px 30px -10px rgba(0,0,0,.6)` : `0 0 22px -8px ${a.color}, 0 8px 20px -10px rgba(0,0,0,.6)` }}>
                    {a.logo ? <img src={a.logo} alt="" width={28} height={28} loading="lazy" draggable={false} className="h-6 w-6 object-contain sm:h-7 sm:w-7" /> : <a.Icon size={22} strokeWidth={1.8} className="text-indigo-500" aria-hidden />}
                  </span>
                  <span className={`text-[11px] font-bold sm:text-xs ${sel === i ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{a.short}</span>
                </span>
                <span role="tooltip" className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-[#0b1233]/95 px-3 py-1 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 sm:block">{a.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-2 rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div key={n.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Active model</p>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${ok ? 'bg-emerald-400/15 text-emerald-300' : 'bg-indigo-400/15 text-indigo-200'}`}>
                    {ok ? <BadgeCheck size={13} aria-hidden /> : <FlaskConical size={13} aria-hidden />}{ok ? 'Live' : 'Planned'} · {n.statusLabel}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-2xl font-extrabold text-white">{n.name}</h3>
                <p className="mt-1 text-slate-300">{n.blurb}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

    </section>
  )
}
