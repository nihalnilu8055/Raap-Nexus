import { useLayoutEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { gsap } from '../../lib/motion'

/** Connective tissue between sections: colour hand-off + a data line drawn as you scroll. */
export default function Bridge({ from, to, stroke = '#3b82f6' }: { from: string; to: string; stroke?: string }) {
  const root = useRef<HTMLDivElement>(null)
  const reduced = !!useReducedMotion()
  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      const line = root.current!.querySelector<SVGLineElement>('line')!
      const dot = root.current!.querySelector<HTMLElement>('.dot')!
      gsap.set(line, { strokeDasharray: 1, strokeDashoffset: 1 })
      gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 90%', end: 'bottom 35%', scrub: 0.5 } })
        .to(line, { strokeDashoffset: 0, ease: 'none' }, 0)
        .fromTo(dot, { top: '0%' }, { top: '100%', ease: 'none' }, 0)
    }, root)
    return () => ctx.revert()
  }, [reduced])
  return (
    <div ref={root} aria-hidden className="relative h-24 sm:h-28" style={{ background: `linear-gradient(180deg, ${from}, ${to})` }}>
      <svg viewBox="0 0 2 100" preserveAspectRatio="none" className="absolute inset-y-0 left-1/2 h-full w-3 -translate-x-1/2 overflow-visible">
        <line x1="1" y1="0" x2="1" y2="100" pathLength={1} stroke={stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" opacity={reduced ? 0.6 : 1} />
      </svg>
      <span className="dot absolute left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" style={{ top: reduced ? '50%' : '0%', boxShadow: `0 0 12px 3px ${stroke}` }} />
    </div>
  )
}
