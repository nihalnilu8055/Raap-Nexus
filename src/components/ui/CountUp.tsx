import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { gsap, ScrollTrigger } from '../../lib/motion'

export default function CountUp({ to, decimals = 0, prefix = '', suffix = '' }: { to: number; decimals?: number; prefix?: string; suffix?: string }) {
  const el = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    const node = el.current!
    const fmt = (v: number) => `${prefix}${v.toFixed(decimals)}${suffix}`
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
  }, [to, decimals, prefix, suffix, reduced])
  return <span ref={el} className="tabular-nums">{prefix}{to.toFixed(decimals)}{suffix}</span>
}
