import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { EASE } from '../../lib/motion'

type Variant = 'rise' | 'depth' | 'left' | 'right' | 'scale'
const wide = () => typeof window !== 'undefined' && window.innerWidth >= 768

/** Scroll-triggered reveal with a per-section style. Replays when scrolling back up (once:false) so reverse scroll feels continuous. */
export function Reveal({ children, variant = 'rise', delay = 0, className = '', as = 'div' }: { children: ReactNode; variant?: Variant; delay?: number; className?: string; as?: 'div' | 'li' | 'ul' | 'p' }) {
  const reduced = !!useReducedMotion()
  const [w, setW] = useState(true)
  useEffect(() => setW(wide()), [])
  const M = motion[as] as typeof motion.div
  if (reduced) { const T = as; return <T className={className}>{children}</T> }
  const from =
    variant === 'depth' ? { opacity: 0, y: 48, rotateX: w ? 14 : 0, scale: 0.96 }
    : variant === 'left' ? { opacity: 0, x: w ? -48 : 0, y: w ? 0 : 24 }
    : variant === 'right' ? { opacity: 0, x: w ? 48 : 0, y: w ? 0 : 24 }
    : variant === 'scale' ? { opacity: 0, scale: 0.92, y: 20 }
    : { opacity: 0, y: 32 }
  return (
    <M initial={from} whileInView={{ opacity: 1, x: 0, y: 0, rotateX: 0, scale: 1 }} viewport={{ once: false, amount: 0.15, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.9, ease: EASE, delay }} style={{ transformPerspective: 1200 }} className={className}>
      {children}
    </M>
  )
}

/** Pointer-driven 3D tilt with a soft light glare. Desktop pointers only; inert for touch and reduced motion. */
export function Tilt({ children, className = '', max = 7, lift = 14, disabled = false }: { children: ReactNode; className?: string; max?: number; lift?: number; disabled?: boolean }) {
  const reduced = !!useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0), y = useMotionValue(0), h = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 160, damping: 18 }), sy = useSpring(y, { stiffness: 160, damping: 18 }), sh = useSpring(h, { stiffness: 140, damping: 20 })
  const rY = useTransform(sx, [-1, 1], [-max, max]), rX = useTransform(sy, [-1, 1], [max, -max]), z = useTransform(sh, [0, 1], [0, lift])
  const gx = useTransform(sx, [-1, 1], ['10%', '90%']), gy = useTransform(sy, [-1, 1], ['10%', '90%'])
  const glare = useTransform([gx, gy, sh] as never, ([a, b, o]: (string | number)[]) => `radial-gradient(circle at ${a} ${b}, rgba(255,255,255,${0.16 * (o as number)}), transparent 55%)`)
  useEffect(() => { if (disabled) { x.set(0); y.set(0); h.set(0) } }, [disabled, x, y, h])
  if (reduced) return <div className={className}>{children}</div>
  const move = (e: React.PointerEvent) => {
    if (disabled || e.pointerType === 'touch' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set(((e.clientX - r.left) / r.width) * 2 - 1); y.set(((e.clientY - r.top) / r.height) * 2 - 1); h.set(1)
  }
  const leave = () => { x.set(0); y.set(0); h.set(0) }
  return (
    <motion.div ref={ref} onPointerMove={move} onPointerLeave={leave} style={{ rotateX: rX, rotateY: rY, translateZ: z, transformPerspective: 900 }} className={`relative will-change-transform [transform-style:preserve-3d] ${className}`}>
      {children}
      <motion.span aria-hidden style={{ background: glare }} className="pointer-events-none absolute inset-0 rounded-[inherit]" />
    </motion.div>
  )
}
