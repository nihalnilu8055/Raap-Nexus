import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { gsap, ScrollTrigger } from '../../lib/motion'
import { useI18n } from '../../i18n'

/** Animated figure. `millions`: `to` is a sample figure in millions, shown as a compact number (e.g. 47.6M). */
export default function CountUp({ to, decimals = 0, prefix = '', suffix = '', millions = false }: { to: number; decimals?: number; prefix?: string; suffix?: string; millions?: boolean }) {
  const el = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()
  const { fmtNum, fmtCompact } = useI18n()
  useEffect(() => {
    const node = el.current!
    const fmt = (v: number) => millions ? fmtCompact(v * 1e6) : `${prefix}${fmtNum(v, decimals)}${suffix}`
    if (reduced) { node.textContent = fmt(to); return }
    const o = { v: 0 }
    node.textContent = fmt(0)
    const st = ScrollTrigger.create({
      trigger: node,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: () => { node.textContent = fmt(o.v) } }),
    })
    return () => st.kill()
  }, [to, decimals, prefix, suffix, reduced, millions, fmtNum, fmtCompact])
  return <span ref={el} className="tabular-nums" dir="ltr" style={{ unicodeBidi: 'isolate' }}>{millions ? fmtCompact(to * 1e6) : `${prefix}${fmtNum(to, decimals)}${suffix}`}</span>
}
