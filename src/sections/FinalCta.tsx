import { useLayoutEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import CtaButton from '../components/ui/CtaButton'
import { EASE, gsap } from '../lib/motion'

export default function FinalCta() {
  const root = useRef<HTMLElement>(null)
  const reduced = !!useReducedMotion()
  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      root.current!.querySelectorAll<SVGGeometryElement>('.draw').forEach((p, i) => {
        const len = p.getTotalLength()
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
        gsap.to(p, { strokeDashoffset: 0, duration: 2.2, delay: i * 0.2, ease: 'power2.out', scrollTrigger: { trigger: root.current, start: 'top 70%', once: true } })
      })
    }, root)
    return () => ctx.revert()
  }, [reduced])
  return (
    <section ref={root} id="about" aria-labelledby="cta-h" className="relative overflow-hidden bg-[#040a1c] px-6 py-28 text-center sm:py-36">
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(37,99,235,.35), transparent 70%)' }} />
      <svg aria-hidden viewBox="0 0 800 400" className="absolute left-1/2 top-1/2 w-[min(1000px,150vw)] -translate-x-1/2 -translate-y-1/2 opacity-60">
        {[60, 110, 165, 225].map((r) => <ellipse key={r} className="draw" cx="400" cy="200" rx={r * 1.6} ry={r * 0.7} fill="none" stroke="#5ec8ff" strokeOpacity=".28" strokeWidth="1" />)}
      </svg>
      <div className="relative">
        <motion.h2 id="cta-h" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE }} className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          Bring your finances into <span className="bg-gradient-to-r from-sky-200 to-blue-500 bg-clip-text text-transparent">one platform.</span>
        </motion.h2>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE, delay: 0.15 }} className="mt-9">
          <CtaButton label="Explore RaapNexus" />
        </motion.div>
      </div>
    </section>
  )
}
