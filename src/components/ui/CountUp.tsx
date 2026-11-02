import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { gsap, ScrollTrigger } from '../../lib/motion'
import { useI18n } from '../../i18n'

/** Animated figure. `aedMillions`: `to` is a sample amount in AED millions, shown in the selected currency (original AED if no live rate). */
export default function CountUp({ to, decimals = 0, prefix = '', suffix = '', aedMillions = false }: { to: number; decimals?: number; prefix?: string; suffix?: string; aedMillions?: boolean }) {
  const el = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()
  const { fmtNum, money } = useI18n()
  useEffect(() => {
    const node = el.current!
    const fmt = (v: number) => aedMillions ? money(v * 1e6, { compact: true }) : `${prefix}${fmtNum(v, decimals)}${suffix}`
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
  }, [to, decimals, prefix, suffix, reduced, aedMillions, fmtNum, money])
  return <span ref={el} className="tabular-nums" dir="ltr" style={{ unicodeBidi: 'isolate' }}>{aedMillions ? money(to * 1e6, { compact: true }) : `${prefix}${fmtNum(to, decimals)}${suffix}`}</span>
}
