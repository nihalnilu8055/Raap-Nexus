import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'framer-motion'
import { useI18n } from '../../i18n'
import { Boundary, webglSupported } from '../../lib/webgl'
import { DEFAULT_TARGET, layout, orbitState, place, WORD_TARGET, type OrbitLayout } from '../../lib/orbit'
import { EASE } from '../../lib/motion'

const Scene = lazy(() => import('../../three/HeroOrbitScene'))

const OMEGA = (Math.PI * 2) / 90 // one full turn every 90 s
const SLOW = 0.16 // speed multiplier while a word is hovered / focused
declare global { interface Window { __RN_ORBIT_SPEED?: number; __RN_ORBIT?: { rho: () => number; set: (r: number) => void } } }

/**
 * Hero model: the capital-R icon in a glass/metal sphere with two rings of ERP names orbiting it.
 * - Labels are real <button>s positioned by ONE rAF loop (shared maths in lib/orbit) so they are always upright, selectable and accessible.
 * - A lazily loaded WebGL scene (sphere, R plane, trails, particles) is drawn behind them; without WebGL a CSS sphere + the R image take over.
 */
export default function HeroOrbit({ alt, progress }: { alt: string; progress?: MotionValue<number> }) {
  const { t } = useI18n()
  const reduced = !!useReducedMotion()
  const box = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(600)
  const L = useMemo<OrbitLayout>(() => layout(W), [W])
  const [gl] = useState(() => typeof window !== 'undefined' && webglSupported())
  const [idle, setIdle] = useState(false)
  const [inView, setInView] = useState(true)
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState(-1)
  const [rove, setRove] = useState(0)
  const btns = useRef<(HTMLButtonElement | null)[]>([])
  const lines = useRef<(SVGLineElement | null)[]>([])
  const tip = useRef<HTMLDivElement>(null)
  const st = useRef({ rho: 0, speed: 1, active: -1, hv: [] as number[], hover: -1, pin: -1, running: false, raf: 0, last: 0, scroll: 0 })
  const lite = useMemo(() => W < 560 || (navigator.hardwareConcurrency ?? 8) <= 4, [W])

  // size
  useEffect(() => {
    const el = box.current!
    const ro = new ResizeObserver(() => setW(Math.round(el.getBoundingClientRect().width) || 600))
    ro.observe(el); setW(Math.round(el.getBoundingClientRect().width) || 600)
    return () => ro.disconnect()
  }, [])
  useEffect(() => { const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }; const go = () => setIdle(true); if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 2500 }); else setTimeout(go, 1200) }, [])

  // ---- draw (positions, depth, spokes, tooltip) -------------------------------------------------------------------
  const draw = useCallback(() => {
    const s = st.current, rho = s.rho + s.scroll
    orbitState.rho = rho; orbitState.W = W
    L.words.forEach((w, i) => {
      const el = btns.current[i]; if (!el) return
      const p = place(L, w, rho)
      orbitState.pos[i] = p
      const depth = 0.5 + 0.5 * Math.sin(p.a * 2 + w.ring * 1.7) // 0..1, a quiet wobble in depth: scale only ever shrinks (never exceeds the validated size)
      const hv = s.hv[i] ?? 0
      const sc = (0.94 + 0.06 * depth) * (1 + 0.1 * hv)
      el.style.transform = `translate3d(calc(-50% + ${p.x.toFixed(2)}px), calc(-50% + ${p.y.toFixed(2)}px), 0) scale(${sc.toFixed(4)})`
      el.style.opacity = String((0.84 + 0.16 * depth + 0.2 * hv).toFixed(3))
      el.style.zIndex = String(w.ring === 0 ? 20 + Math.round(depth * 5) : 10 + Math.round(depth * 5) + (hv > 0.5 ? 40 : 0))
      const ln = lines.current[i]
      if (ln) {
        const d = Math.hypot(p.x, p.y) || 1, k = L.sphere * 1.18 / d
        ln.setAttribute('x1', (p.x * k).toFixed(1)); ln.setAttribute('y1', (p.y * k).toFixed(1)); ln.setAttribute('x2', p.x.toFixed(1)); ln.setAttribute('y2', p.y.toFixed(1))
      }
    })
    const tp = tip.current, ai = s.active >= 0 ? s.active : -1
    if (tp) {
      const p = ai >= 0 ? orbitState.pos[ai] : undefined
      if (!p) tp.style.opacity = '0'
      else {
        const tw = tp.offsetWidth, th = tp.offsetHeight, below = p.y < W * 0.18
        const x = Math.max(-W / 2 + tw / 2 + 4, Math.min(W / 2 - tw / 2 - 4, p.x))
        const y = below ? p.y + L.f * 1.2 + 22 : p.y - th - L.f * 0.6 - 8
        tp.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), ${(y + th * 0).toFixed(1)}px, 0)`
        tp.style.opacity = '1'
      }
    }
  }, [L, W])

  // ---- master loop ------------------------------------------------------------------------------------------------
  const loop = useCallback((now: number) => {
    const s = st.current
    const dt = Math.min(0.05, (now - s.last) / 1000 || 0.016); s.last = now
    const target = s.active >= 0 ? SLOW : 1
    s.speed += (target - s.speed) * (1 - Math.exp(-dt * 4))
    s.rho += dt * OMEGA * s.speed * (window.__RN_ORBIT_SPEED ?? 1)
    orbitState.speed = s.speed
    L.words.forEach((_, i) => { const h = s.hv[i] ?? 0, tg = i === s.active ? 1 : 0; s.hv[i] = h + (tg - h) * (1 - Math.exp(-dt * 9)) })
    draw()
    s.raf = s.running ? requestAnimationFrame(loop) : 0
  }, [L, draw])

  const start = useCallback(() => { const s = st.current; if (s.running || reduced) return; s.running = true; s.last = performance.now(); s.raf = requestAnimationFrame(loop) }, [loop, reduced])
  const stop = useCallback(() => { const s = st.current; s.running = false; cancelAnimationFrame(s.raf); s.raf = 0 }, [])

  useEffect(() => {
    if (reduced) { stop(); draw(); return }
    const el = box.current!
    let vis = true, view = true
    const upd = () => { setInView(view); if (vis && view) start(); else stop() }
    const io = new IntersectionObserver(([e]) => { view = e.isIntersecting; upd() }, { threshold: 0 })
    const vc = () => { vis = !document.hidden; upd() }
    io.observe(el); document.addEventListener('visibilitychange', vc); upd()
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', vc); stop() }
  }, [reduced, start, stop, draw])
  useEffect(() => { draw() }, [draw, L])
  useEffect(() => { window.__RN_ORBIT = { rho: () => st.current.rho, set: (r) => { st.current.rho = r; draw() } }; return () => { delete window.__RN_ORBIT } }, [draw])
  // hero scroll adds a little rotation (both rings together, so spacing is untouched)
  const zero = useMotionValue(0)
  const p = progress ?? zero
  useEffect(() => p.on('change', (v) => { st.current.scroll = v * 0.7; orbitState.scroll = v; if (reduced) draw() }), [p, reduced, draw])

  // ---- interaction ------------------------------------------------------------------------------------------------
  const sync = () => { const s = st.current; const a = s.hover >= 0 ? s.hover : s.pin; s.active = a; orbitState.hover = a; setActive(a); if (reduced) draw() }
  const activate = (i: number) => { st.current.hover = i; sync() }
  const clear = (i?: number) => { if (i !== undefined && st.current.hover !== i) return; st.current.hover = -1; sync() }
  const pinTimer = useRef(0)
  const go = (i: number) => {
    const name = L.words[i].name, id = WORD_TARGET[name] ?? DEFAULT_TARGET
    st.current.pin = i; sync(); window.clearTimeout(pinTimer.current); pinTimer.current = window.setTimeout(() => { st.current.pin = -1; sync() }, 2600)
    const el = document.getElementById(id)
    if (el) { el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); history.replaceState(null, '', `#${id}`) }
  }
  useEffect(() => () => window.clearTimeout(pinTimer.current), [])
  const onMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType === 'touch') return
    const r = box.current!.getBoundingClientRect()
    orbitState.px = ((e.clientX - r.left) / r.width) * 2 - 1; orbitState.py = ((e.clientY - r.top) / r.height) * 2 - 1
  }
  const onLeave = () => { orbitState.px = 0; orbitState.py = 0 }
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = L.words.length; let j = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % n
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + n) % n
    else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = n - 1
    if (j >= 0) { e.preventDefault(); setRove(j); btns.current[j]?.focus() }
  }

  // ---- scroll story (same stages as before: settle → depth split → rotation → drift out) ----------------------------
  const amp = useRef(1)
  useEffect(() => { const set = () => { const w = window.innerWidth; amp.current = w >= 1024 ? 1 : w >= 768 ? 0.6 : 0.4 }; set(); window.addEventListener('resize', set, { passive: true }); return () => window.removeEventListener('resize', set) }, [])
  const rotY = useTransform(p, [0, 0.3, 0.7, 1], [0, -5, -22, -30]), rotX = useTransform(p, [0, 0.3, 0.7, 1], [0, 3, 9, 12])
  const yS = useTransform(p, [0, 0.35, 0.7, 1], [0, -10, -30, -64]), xS = useTransform(p, [0, 0.4, 0.7, 1], [0, 6, 22, 52])
  const sS = useTransform(p, [0, 0.35, 0.7, 1], [1, 1.01, 0.96, 0.86])
  const rotYa = useTransform(rotY, (v) => v * amp.current * 0.8), rotXa = useTransform(rotX, (v) => v * amp.current * 0.8)
  const yA = useTransform(yS, (v) => v * amp.current), xA = useTransform(xS, (v) => v * amp.current), sA = useTransform(sS, (v) => 1 + (v - 1) * (0.5 + 0.5 * amp.current))
  const glowO = useTransform(p, [0, 0.8, 1], [1, 0.9, 0.2])

  const sphereD = L.sphere * 2, iconH = W * 0.13
  const showScene = gl && !reduced && idle && inView
  const tipIdx = active // hovered, focused or just-clicked word (a click pins it for a moment)

  return (
    <div ref={box} role="group" aria-label={alt} data-cursor="visual" data-orbit onPointerMove={onMove} onPointerLeave={onLeave} className="relative aspect-square w-full [perspective:1300px]">
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.3, ease: EASE }}
        className="absolute inset-0">
        <motion.div style={reduced ? undefined : { rotateY: rotYa, rotateX: rotXa, x: xA, y: yA, scale: sA }} className="absolute inset-0">
          {/* soft light behind the model */}
          <motion.div aria-hidden style={reduced ? undefined : { opacity: glowO }} className="pointer-events-none absolute inset-[10%] rounded-full bg-[radial-gradient(circle,rgba(56,130,255,.34),rgba(110,90,255,.14)_46%,transparent_70%)] blur-2xl" />

          {/* rings + spokes (SVG, always present) */}
          <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox={`${-W / 2} ${-W / 2} ${W} ${W}`}>
            <defs>
              <linearGradient id="orb-spoke" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7cc0ff" stopOpacity=".5" /><stop offset="1" stopColor="#7cc0ff" stopOpacity=".05" /></linearGradient>
            </defs>
            <circle r={L.R1} fill="none" stroke="rgba(120,200,255,.28)" strokeWidth="1" strokeDasharray="3 7" />
            <circle r={L.R2} fill="none" stroke="rgba(160,140,255,.24)" strokeWidth="1" strokeDasharray="3 8" />
            {L.words.map((w, i) => (
              <line key={w.name} ref={(el) => { lines.current[i] = el }} stroke={i === tipIdx ? 'rgba(160,220,255,.85)' : w.ring === 0 ? 'rgba(110,190,255,.2)' : 'rgba(150,140,255,.15)'} strokeWidth={i === tipIdx ? 1.4 : 1} style={{ transition: 'stroke .25s' }} />
            ))}
          </svg>

          {/* core: DOM version (shown first, and kept when WebGL is unavailable / motion is reduced) */}
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 transition-opacity duration-700" style={{ width: sphereD, height: sphereD, transform: 'translate(-50%,-50%)', opacity: ready ? 0 : 1 }}>
            <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 32% 26%, #6fb4ff 0%, #2a64e6 30%, #0e2a78 62%, #060d2c 100%)', boxShadow: '0 0 0 1px rgba(150,200,255,.45), inset 0 -10px 30px rgba(0,0,0,.45), 0 0 60px rgba(50,110,255,.45), 0 30px 50px -20px rgba(0,0,0,.7)' }} />
            <div className="absolute inset-[-7%] rounded-full border border-sky-300/30" />
            <img src="/assets/r-icon.png" alt="" width={714} height={798} draggable={false} decoding="async" fetchPriority="high"
              className="absolute left-1/2 top-1/2 block select-none drop-shadow-[0_6px_10px_rgba(2,10,40,.55)]" style={{ height: iconH, width: 'auto', transform: 'translate(-50%,-50%)' }} />
          </div>

          {/* WebGL scene */}
          {showScene && (
            <div aria-hidden className="pointer-events-none absolute inset-[-4%] transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }}>
              <Boundary fallback={null}><Suspense fallback={null}><Scene lite={lite} active={inView} onReady={() => setReady(true)} /></Suspense></Boundary>
            </div>
          )}

          {/* orbiting words */}
          <div role="list" className="absolute inset-0" style={{ fontSize: L.f }}>
            {L.words.map((w, i) => {
              const parts = w.name === 'Microsoft Dynamics 365' ? (L.compact ? ['Microsoft', 'Dynamics', '365'] : ['Microsoft', 'Dynamics 365']) : [w.name]
              const isA = i === tipIdx
              return (
                <button key={w.name} ref={(el) => { btns.current[i] = el }} type="button" role="listitem"
                  tabIndex={i === rove ? 0 : -1}
                  aria-label={t('hero.orbit.aria', { name: w.name })} aria-describedby={isA ? 'orbit-tip' : undefined}
                  data-orbit-word={w.name} data-ring={w.ring} data-active={isA ? 'true' : undefined}
                  onPointerEnter={(e) => { if (e.pointerType !== 'touch') activate(i) }} onPointerLeave={(e) => { if (e.pointerType !== 'touch') clear(i) }}
                  onPointerDown={(e) => { if (e.pointerType === 'touch') { activate(i); window.setTimeout(() => clear(i), 2400) } }}
                  onFocus={() => { setRove(i); activate(i) }} onBlur={() => clear(i)} onKeyDown={(e) => onKey(e, i)} onClick={() => go(i)}
                  style={{ fontSize: L.f, lineHeight: 1.2, padding: L.compact ? '6px 6px' : '6px 8px', willChange: 'transform' }}
                  className={`group absolute left-1/2 top-1/2 inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap border text-center font-semibold tracking-tight text-white backdrop-blur-[2px] transition-[border-color,background-color,box-shadow] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#040a1c] ${parts.length > 2 ? 'rounded-2xl' : 'rounded-full'} ${w.ring === 0 ? 'border-sky-400/70 bg-[#0a1c46]/85' : 'border-violet-400/60 bg-[#14183f]/85'} ${isA ? (w.ring === 0 ? '!border-sky-200 !bg-[#10306f] shadow-[0_0_22px_rgba(80,190,255,.65)]' : '!border-violet-200 !bg-[#2a2470] shadow-[0_0_22px_rgba(150,130,255,.65)]') : 'shadow-[0_6px_18px_-8px_rgba(0,0,0,.7)]'}`}>
                  {!L.compact && <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full ${w.ring === 0 ? 'bg-sky-400' : 'bg-violet-400'}`} />}
                  <span className="leading-[1.15]">{parts.map((s, k) => <span key={k} className="block">{s}</span>)}</span>
                </button>
              )
            })}
          </div>

          {/* tooltip: short, contextual, never the only place the information lives */}
          <div ref={tip} id="orbit-tip" role="tooltip" aria-hidden={tipIdx < 0}
            className="pointer-events-none absolute left-1/2 top-1/2 z-[80] rounded-xl border border-white/15 bg-[#071330]/95 px-3 py-2 text-center text-white opacity-0 shadow-[0_14px_40px_-12px_rgba(0,0,0,.8)] backdrop-blur transition-opacity duration-200"
            style={{ width: Math.min(230, W * 0.62), fontSize: Math.max(11, L.f), lineHeight: 1.3 }}>
            {tipIdx >= 0 && (<><b className="block text-[1.05em]">{L.words[tipIdx].name}</b><span className="block text-white/75">{t('hero.orbit.tip', { name: L.words[tipIdx].name })}</span></>)}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
