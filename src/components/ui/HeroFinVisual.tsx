import { useEffect, useId, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ShieldCheck, TrendingUp } from 'lucide-react'
import { EASE } from '../../lib/motion'
import { useI18n } from '../../i18n'

/**
 * Hero visual: a layered "financial intelligence" scene made of glass KPI panels, an animated area chart, a donut, bars,
 * connecting lines and flowing data particles. Pure SVG + CSS (no WebGL, no images), so it paints instantly, never shifts layout
 * and costs almost nothing. Everything pauses when the hero is off-screen and stops entirely for prefers-reduced-motion.
 * All figures are illustrative demonstration values - they are not connected to any live ERP data.
 */
const AREA = 'M0 78 C 14 74, 22 58, 36 62 S 58 40, 72 44 S 92 26, 106 30 S 128 16, 144 8'
const BARS = [34, 48, 41, 60, 52, 72, 86]
const SPARK = 'M0 26 C 10 24, 16 14, 26 17 S 42 6, 54 9 S 70 12, 80 2'

const panel = 'absolute rounded-2xl border border-white/[.14] bg-[linear-gradient(145deg,rgba(255,255,255,.12),rgba(255,255,255,.04))] shadow-[0_24px_60px_-24px_rgba(2,8,30,.9),inset_0_1px_0_rgba(255,255,255,.18)] backdrop-blur-xl'

export default function HeroFinVisual({ active = true }: { active?: boolean }) {
  const { t } = useI18n()
  const reduced = !!useReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const gid = useId().replace(/:/g, '')

  // pause every CSS + SMIL animation while the hero is off-screen
  useEffect(() => {
    const el = root.current; if (!el) return
    el.toggleAttribute('data-off', !active || reduced)
    const s = svg.current as (SVGSVGElement & { pauseAnimations?: () => void; unpauseAnimations?: () => void }) | null
    if (s?.pauseAnimations) (active && !reduced) ? s.unpauseAnimations?.() : s.pauseAnimations()
  }, [active, reduced])

  // pointer parallax: writes two CSS variables, no React re-render
  useEffect(() => {
    const el = root.current; if (!el || reduced) return
    let raf = 0
    const mv = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const r = el.getBoundingClientRect(); const x = ((e.clientX - r.left) / r.width - 0.5) * 2, y = ((e.clientY - r.top) / r.height - 0.5) * 2
      cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { el.style.setProperty('--px', String(Math.max(-1, Math.min(1, x)))); el.style.setProperty('--py', String(Math.max(-1, Math.min(1, y)))) })
    }
    const lv = () => { el.style.setProperty('--px', '0'); el.style.setProperty('--py', '0') }
    el.addEventListener('pointermove', mv, { passive: true }); el.addEventListener('pointerleave', lv)
    return () => { cancelAnimationFrame(raf); el.removeEventListener('pointermove', mv); el.removeEventListener('pointerleave', lv) }
  }, [reduced])

  const enter = (d: number) => reduced ? {} : { initial: { opacity: 0, y: 26, scale: 0.96 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 1, ease: EASE, delay: 0.5 + d } }

  return (
    <div ref={root} role="img" aria-label={t('hero.vis.alt')} className="hv relative mx-auto aspect-square w-full max-w-[620px] select-none [perspective:1100px]" style={{ ['--px' as string]: 0, ['--py' as string]: 0 }}>
      {/* soft light behind the scene */}
      <div aria-hidden className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,.42),transparent_68%)] blur-2xl" />

      {/* connecting lines + flowing particles (square viewBox, so circles stay round) */}
      <svg ref={svg} aria-hidden viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`${gid}l`} x1="0" x2="1"><stop offset="0" stopColor="#38bdf8" stopOpacity="0" /><stop offset=".5" stopColor="#60a5fa" stopOpacity=".9" /><stop offset="1" stopColor="#a5b4fc" stopOpacity="0" /></linearGradient>
        </defs>
        {[
          'M30 33 C 44 20, 58 18, 72 22',
          'M62 52 C 76 52, 82 62, 78 78',
          'M44 62 C 40 72, 34 78, 26 82',
          'M18 20 C 24 24, 30 28, 36 32',
        ].map((d, i) => (
          <g key={i}>
            <path d={d} fill="none" stroke={`url(#${gid}l)`} strokeWidth=".45" strokeLinecap="round" className="hv-flow" style={{ animationDelay: `${i * -0.9}s` }} />
            {!reduced && [0, 1].map((k) => (
              <circle key={k} r=".95" fill="#bae6fd" opacity=".95">
                <animateMotion dur={`${5.2 + i * 0.6}s`} begin={`${-(k * 2.6 + i * 0.7)}s`} repeatCount="indefinite" path={d} />
              </circle>
            ))}
          </g>
        ))}
      </svg>

      {/* main dashboard plane: slight 3D tilt that follows the pointer */}
      <div className="hv-layer absolute left-[7%] top-[17%] h-[55%] w-[63%]" style={{ ['--d' as string]: 10 }}>
        <motion.div {...enter(0)} className={`${panel} hv-float inset-0 p-[4.5%] [transform:rotateY(-7deg)_rotateX(3deg)]`} style={{ ['--fd' as string]: '0s' }}>
          <div className="flex items-center justify-between text-[clamp(8px,1.6vw,11px)] font-semibold tracking-wide text-slate-200">
            <span>{t('hero.vis.title')}</span><span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-sky-200">YTD</span>
          </div>
          <div className="mt-[3%] flex items-baseline gap-2">
            <span className="font-display text-[clamp(15px,3.4vw,26px)] font-extrabold leading-none text-white">AED 4.82M</span>
            <span className="inline-flex items-center gap-0.5 text-[clamp(8px,1.5vw,11px)] font-bold text-emerald-300"><TrendingUp size={11} aria-hidden />+12.4%</span>
          </div>
          <svg viewBox="0 0 144 84" preserveAspectRatio="none" className="mt-[3%] h-[52%] w-full overflow-visible" aria-hidden>
            <defs>
              <linearGradient id={`${gid}a`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#60a5fa" stopOpacity=".5" /><stop offset="1" stopColor="#60a5fa" stopOpacity="0" /></linearGradient>
              <linearGradient id={`${gid}s`} x1="0" x2="1"><stop offset="0" stopColor="#38bdf8" /><stop offset="1" stopColor="#a5b4fc" /></linearGradient>
            </defs>
            {[20, 42, 64].map((y) => <line key={y} x1="0" x2="144" y1={y} y2={y} stroke="rgba(148,184,255,.14)" strokeWidth=".6" />)}
            <path d={`${AREA} L144 84 L0 84 Z`} fill={`url(#${gid}a)`} className="hv-fade" />
            <path d={AREA} fill="none" stroke={`url(#${gid}s)`} strokeWidth="2.2" strokeLinecap="round" pathLength={1} className="hv-draw" />
          </svg>
          <div className="mt-[2%] flex justify-between text-[clamp(6px,1.1vw,9px)] font-medium uppercase tracking-wider text-slate-400">
            {['Jan', 'Mar', 'May', 'Jul', 'Sep'].map((m) => <span key={m}>{m}</span>)}
          </div>
        </motion.div>
      </div>

      {/* floating KPI: gross margin */}
      <div className="hv-layer absolute right-[1%] top-[5%] w-[38%]" style={{ ['--d' as string]: 22 }}>
        <motion.div {...enter(0.18)} className={`${panel} hv-float relative p-[7%]`} style={{ ['--fd' as string]: '-1.6s' }}>
          <p className="text-[clamp(7px,1.35vw,10px)] font-semibold uppercase tracking-[.14em] text-slate-300">{t('hero.margin')}</p>
          <p className="mt-1 font-display text-[clamp(14px,3vw,22px)] font-extrabold leading-none text-white">38.6%</p>
          <svg viewBox="0 0 80 28" className="mt-2 h-[clamp(14px,3vw,22px)] w-full overflow-visible" aria-hidden>
            <path d={SPARK} fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" pathLength={1} className="hv-draw" style={{ animationDelay: '1.1s' }} />
          </svg>
        </motion.div>
      </div>

      {/* floating donut: cash position */}
      <div className="hv-layer absolute bottom-[5%] left-[0%] w-[36%]" style={{ ['--d' as string]: 28 }}>
        <motion.div {...enter(0.3)} className={`${panel} hv-float relative flex items-center gap-[8%] p-[7%]`} style={{ ['--fd' as string]: '-3.1s' }}>
          <svg viewBox="0 0 36 36" className="h-[clamp(26px,6vw,44px)] w-[clamp(26px,6vw,44px)] shrink-0 -rotate-90" aria-hidden>
            <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(148,184,255,.2)" strokeWidth="4" />
            <circle cx="18" cy="18" r="14" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" pathLength={100} strokeDasharray="100" className="hv-ring" />
          </svg>
          <div className="min-w-0">
            <p className="truncate text-[clamp(7px,1.3vw,10px)] font-semibold uppercase tracking-[.12em] text-slate-300">{t('hero.vis.cash')}</p>
            <p className="font-display text-[clamp(11px,2.3vw,17px)] font-extrabold leading-tight text-white">AED 1.24M</p>
          </div>
        </motion.div>
      </div>

      {/* floating bars: net profit */}
      <div className="hv-layer absolute bottom-[3%] right-[3%] w-[42%]" style={{ ['--d' as string]: 16 }}>
        <motion.div {...enter(0.42)} className={`${panel} hv-float relative p-[6%]`} style={{ ['--fd' as string]: '-4.4s' }}>
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[clamp(7px,1.3vw,10px)] font-semibold uppercase tracking-[.12em] text-slate-300">{t('hero.vis.net')}</p>
            <p className="font-display text-[clamp(11px,2.3vw,17px)] font-extrabold text-white">AED 612K</p>
          </div>
          <div className="mt-2 flex h-[clamp(26px,6.4vw,48px)] items-end gap-[6%]">
            {BARS.map((h, i) => <span key={i} className="hv-bar block flex-1 rounded-t-[3px] bg-gradient-to-t from-blue-600/70 to-sky-300" style={{ height: `${h}%`, animationDelay: `${0.9 + i * 0.07}s` }} />)}
          </div>
        </motion.div>
      </div>

      {/* floating status chip */}
      <div className="hv-layer absolute left-[3%] top-[3%]" style={{ ['--d' as string]: 34 }}>
        <motion.div {...enter(0.55)} className={`${panel} hv-float relative flex items-center gap-1.5 rounded-full px-3 py-1.5`} style={{ ['--fd' as string]: '-2.2s' }}>
          <ShieldCheck size={13} className="text-emerald-300" aria-hidden />
          <span className="whitespace-nowrap text-[clamp(7px,1.35vw,10px)] font-semibold text-slate-100">{t('hero.vis.ok')}</span>
        </motion.div>
      </div>

      <p className="absolute -bottom-1 start-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium tracking-wide text-slate-400/80 rtl:translate-x-1/2">{t('hero.vis.demo')}</p>
    </div>
  )
}
