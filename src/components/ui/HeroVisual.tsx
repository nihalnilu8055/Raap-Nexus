import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'framer-motion'
import Fallback3D from './Fallback3D'
import { EASE } from '../../lib/motion'

const SRC = '/assets/hero/raapnexus-finance-platform-hero'
// the hub core inside the transparent artwork (percent of the image box) - used to lift it forward as its own depth layer
const CX = 50.3, CY = 48.4, CR = 11.8
// three depth bands: core (lifted), inner ring + cyan nodes (mid), outer orbit + purple ERP pills (pushed back)
const midMask = `radial-gradient(circle at ${CX}% ${CY}%, transparent ${CR * 0.8}%, #000 ${CR * 0.8 + 0.4}%, #000 39.5%, transparent 41.5%)`
const farMask = `radial-gradient(circle at ${CX}% ${CY}%, transparent 38.5%, #000 40.5%)`
const coreMask = `radial-gradient(circle at ${CX}% ${CY}%, #000 ${CR}%, transparent ${CR + 0.4}%)`

function Art({ mask, className = '', eager }: { mask?: string; className?: string; eager?: boolean }) {
  return (
    <picture className={`absolute inset-0 block ${className}`} style={mask ? { WebkitMaskImage: mask, maskImage: mask } : undefined}>
      <source type="image/webp" srcSet={`${SRC}-600.webp 600w, ${SRC}-900.webp 900w, ${SRC}-1600.webp 1600w`} sizes="(min-width: 768px) 48vw, 100vw" />
      <img src={`${SRC}.png`} alt="" width={1600} height={1600} draggable={false} decoding="async" {...(eager ? { fetchPriority: 'high' as const } : { loading: 'lazy' as const })}
        className="block h-full w-full select-none object-contain" />
    </picture>
  )
}

/** Hero artwork: transparent PNG in three depth layers (glow, ring+pills, core) with a gentle float, pointer tilt and entrance. */
export default function HeroVisual({ alt, progress }: { alt: string; progress?: MotionValue<number> }) {
  const reduced = !!useReducedMotion()
  const zero = useMotionValue(0)
  const p = progress ?? zero // hero scroll progress 0..1
  const [failed, setFailed] = useState(false)
  // motion amplitude: full on desktop, reduced on tablet, light on phones
  const amp = useRef(1)
  useEffect(() => {
    const set = () => { const w = window.innerWidth; amp.current = w >= 1024 ? 1 : w >= 768 ? 0.6 : 0.4 }
    set(); window.addEventListener('resize', set, { passive: true }); return () => window.removeEventListener('resize', set)
  }, [])
  const mx = useMotionValue(0), my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 70, damping: 16 }), sy = useSpring(my, { stiffness: 70, damping: 16 })
  const rY = useTransform(sx, [-1, 1], [-9, 9]), rX = useTransform(sy, [-1, 1], [7, -7])
  // scroll response: the artwork turns away, drifts right/up and separates into depth as the hero scrolls out
  // five-stage scroll story, all scrubbed by hero progress p (0..1): 1 settle -> 2 depth split -> 3 cinematic rotation -> 4 immersive exit drift
  const k = (v: number) => v * amp.current
  const sRY = useTransform(p, [0, 0.3, 0.7, 1], [0, -5, -22, -30]), sRXr = useTransform(p, [0, 0.3, 0.7, 1], [0, 3, 9, 12])
  const sYr = useTransform(p, [0, 0.35, 0.7, 1], [0, -10, -30, -64]), sXr = useTransform(p, [0, 0.4, 0.7, 1], [0, 6, 22, 52])
  const sSr = useTransform(p, [0, 0.35, 0.7, 1], [1, 1.01, 0.96, 0.86])
  const rotYs = useTransform(sRY, (v) => k(v)), rotXs = useTransform(sRXr, (v) => k(v))
  const yS = useTransform(sYr, (v) => k(v)), xS = useTransform(sXr, (v) => k(v))
  const sS = useTransform(sSr, (v) => 1 + (v - 1) * (0.5 + 0.5 * amp.current))
  const coreZ = useTransform(p, [0, 0.4, 1], [70, 112, 132]), outerZ = useTransform(p, [0, 0.4, 1], [0, -55, -100])
  const midZ = useTransform(p, [0, 0.4, 1], [0, 8, 26]), glowZ = useTransform(p, [0, 0.4, 1], [-90, -150, -210])
  const coreZs = useTransform(coreZ, (v) => 70 + (v - 70) * amp.current), outerZs = useTransform(outerZ, (v) => v * amp.current)
  const midZs = useTransform(midZ, (v) => v * amp.current), glowZs = useTransform(glowZ, (v) => -90 + (v + 90) * amp.current)
  const glowS = useTransform(p, [0, 1], [1, 1.5]), glowO = useTransform(p, [0, 0.8, 1], [1, 0.9, 0.2])
  // lighting + shadow follow the stages: glow trails, ground shadow slides/fades, sheen crosses the hub
  const glowDX = useTransform(p, [0, 1], [0, -34]), glowDY = useTransform(p, [0, 1], [0, 24])
  const shadowX = useTransform(p, [0, 1], [0, 46]), shadowO = useTransform(p, [0, 0.8, 1], [1, 0.6, 0])
  const sheenX = useTransform(p, [0, 1], ['-30%', '70%']), sheenO = useTransform(p, [0, 0.5, 1], [0.0, 0.55, 0.1])
  // the lifted core is shifted back by the rotation's own parallax (z*sin), so it stays seated in the ring while still gaining depth
  const rad = Math.PI / 180
  const coreX = useTransform([sx, rotYs, rY, coreZs] as MotionValue<number>[], ([a, b, c, z]: number[]) => a * 5 - z * Math.sin((b + c) * rad))
  const coreY = useTransform([sy, rotXs, rX, coreZs] as MotionValue<number>[], ([a, b, c, z]: number[]) => a * 4 + z * Math.sin((b + c) * rad))
  const glowX = useTransform([sx, glowDX] as MotionValue<number>[], ([a, b]: number[]) => a * -14 + b * amp.current), glowY = useTransform([sy, glowDY] as MotionValue<number>[], ([a, b]: number[]) => a * -10 + b * amp.current)

  if (failed) return <Fallback3D className="aspect-square w-full" />
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType === 'touch') return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1); my.set(((e.clientY - r.top) / r.height) * 2 - 1)
  }
  const reset = () => { mx.set(0); my.set(0) }

  return (
    <div role="img" data-cursor="visual" aria-label={alt} onPointerMove={onMove} onPointerLeave={reset} style={{ perspectiveOrigin: `${CX}% ${CY}%` }} className="relative aspect-square w-full [perspective:1300px]">
      {/* probe: if the artwork cannot load, fall back */}
      <img src={`${SRC}-600.webp`} alt="" width={1} height={1} className="pointer-events-none absolute h-px w-px opacity-0" onError={() => setFailed(true)} />
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.88, rotateX: 14, rotateY: -10, y: 30 }} animate={{ opacity: 1, scale: 1, rotateX: 0, rotateY: 0, y: 0 }} transition={{ duration: 1.5, ease: EASE }}
        className="absolute inset-0 [transform-style:preserve-3d]">
        <motion.div style={reduced ? undefined : { rotateX: rotXs, rotateY: rotYs, x: xS, y: yS, scale: sS }} className="absolute inset-0 [transform-style:preserve-3d]">
        <motion.div style={reduced ? undefined : { rotateX: rX, rotateY: rY }} className="absolute inset-0 [transform-style:preserve-3d]">
          <div className={`absolute inset-0 [transform-style:preserve-3d] ${reduced ? '' : '[animation:hvFloat_9s_ease-in-out_infinite]'}`}>
            <motion.div aria-hidden style={reduced ? undefined : { x: shadowX, opacity: shadowO }} className="pointer-events-none absolute inset-x-[22%] bottom-[2%] h-[7%]">
              <div className={`h-full w-full rounded-full bg-black/50 blur-2xl ${reduced ? '' : '[animation:hvShadow_9s_ease-in-out_infinite]'}`} />
            </motion.div>
            {/* back: soft light behind the hub */}
            <motion.div aria-hidden initial={reduced ? false : { opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.8, delay: 0.1, ease: EASE }} className="pointer-events-none absolute inset-0">
              <motion.div style={reduced ? undefined : { x: glowX, y: glowY, translateZ: glowZs, scale: glowS, opacity: glowO }} className="absolute inset-[14%]">
                <div className={`absolute inset-0 rounded-full ${reduced ? '' : '[animation:hvDriftC_13s_ease-in-out_infinite]'} bg-[radial-gradient(circle,rgba(56,130,255,.42),rgba(110,90,255,.18)_45%,transparent_70%)] blur-2xl`} />
              </motion.div>
            </motion.div>
            {/* far: outer orbit and ERP pills, pushed back */}
            <motion.div initial={reduced ? false : { opacity: 0, y: 34, translateZ: -260 }} animate={{ opacity: 1, y: 0, translateZ: 0 }} transition={{ duration: 1.6, ease: EASE }} className="absolute inset-0 [transform-style:preserve-3d]">
              <motion.div style={reduced ? undefined : { translateZ: outerZs }} className="absolute inset-0 [transform-style:preserve-3d]">
                <div className={`absolute inset-0 ${reduced ? '' : '[animation:hvDriftC_13s_ease-in-out_infinite]'}`}><Art mask={farMask} eager /></div>
              </motion.div>
            </motion.div>
            {/* mid: inner ring, links and primary nodes */}
            <motion.div initial={reduced ? false : { opacity: 0, y: 26, translateZ: -120 }} animate={{ opacity: 1, y: 0, translateZ: 0 }} transition={{ duration: 1.4, delay: 0.15, ease: EASE }} className="absolute inset-0 [transform-style:preserve-3d]">
              <motion.div style={reduced ? undefined : { translateZ: midZs }} className="absolute inset-0 [transform-style:preserve-3d]">
                <div className={`absolute inset-0 ${reduced ? '' : '[animation:hvDriftA_11s_ease-in-out_infinite]'}`}><Art mask={midMask} /></div>
              </motion.div>
            </motion.div>
            {/* front: the RAAP NEXUS core, lifted toward the viewer */}
            <motion.div initial={reduced ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.4, ease: EASE }} className="absolute inset-0 [transform-style:preserve-3d]">
            <motion.div style={reduced ? undefined : { x: coreX, y: coreY, translateZ: coreZs }} className="absolute inset-0 [transform-style:preserve-3d]">
              <div className={`absolute inset-0 ${reduced ? '' : '[animation:hvDriftB_7s_ease-in-out_infinite,hvPulse_5s_ease-in-out_infinite]'}`}>
                <div className="absolute inset-0 overflow-hidden" style={{ WebkitMaskImage: coreMask, maskImage: coreMask }}>
                  <Art />
                  {!reduced && <span aria-hidden className="absolute inset-y-0 -start-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent [animation:hvSweep_7s_ease-in-out_infinite]" />}
                  {!reduced && <motion.span aria-hidden style={{ x: sheenX, opacity: sheenO }} className="absolute inset-y-0 start-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent" />}
                </div>
              </div>
            </motion.div>
            </motion.div>
          </div>
        </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
