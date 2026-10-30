import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import CtaButton from '../components/ui/CtaButton'
import Fallback3D from '../components/ui/Fallback3D'
import { Boundary, isMobile, webglSupported } from '../lib/webgl'
import { EASE, gsap, scrollState, ScrollTrigger } from '../lib/motion'

const HeroScene = lazy(() => import('../three/finance/HeroFinance'))

const WORDS = ['The Ultimate', 'Finance Platform.']

export default function Hero() {
  const wrap = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const canvasBox = useRef<HTMLDivElement>(null)
  const reduced = !!useReducedMotion()
  const [webgl] = useState(webglSupported)
  const [mobile] = useState(isMobile)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 })
    if (wrap.current) io.observe(wrap.current)
    return () => io.disconnect()
  }, [])

  // Hero → dashboard transition: the camera dollies into the core while the copy dissolves.
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap.current, start: 'top top', end: 'bottom bottom', scrub: 0.6,
          onUpdate: (s) => { scrollState.hero = s.progress },
        },
      })
      tl.to(content.current, { y: -70, opacity: 0, ease: 'none', duration: 0.45 }, 0)
        .to(canvasBox.current, { scale: 1.12, opacity: 0, ease: 'power1.in', duration: 0.4 }, 0.6)
    }, wrap)
    return () => { ctx.revert(); scrollState.hero = 0; ScrollTrigger.refresh() }
  }, [reduced])

  return (
    <div ref={wrap} id="top" className={reduced ? 'relative' : 'relative h-[165vh]'}>
      <section aria-label="RaapNexus, the ultimate finance platform" className="sticky top-0 h-screen min-h-[620px] w-full overflow-hidden bg-[#040a1c]">
        {/* cinematic backdrop, fades in first */}
        <motion.div aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }} className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 55% at 70% 45%, rgba(37,99,235,.38), transparent 70%), radial-gradient(ellipse 50% 40% at 15% 100%, rgba(14,165,233,.16), transparent 70%), linear-gradient(180deg,#040a1c 0%,#071331 100%)' }} />
        <div aria-hidden className="absolute inset-0 opacity-[.35]" style={{ backgroundImage: 'linear-gradient(rgba(148,184,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(148,184,255,.07) 1px,transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 70% 60% at 65% 45%,#000,transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 65% 45%,#000,transparent 75%)' }} />

        <div ref={canvasBox} className="absolute inset-0 will-change-transform">
          {webgl ? (
            <Boundary fallback={<Fallback3D className="h-full w-full opacity-80" />}>
              <Suspense fallback={<Fallback3D className="h-full w-full opacity-40" />}>
                <HeroScene reduced={reduced} mobile={mobile} active={visible} />
              </Suspense>
            </Boundary>
          ) : (
            <Fallback3D className="h-full w-full opacity-80 md:translate-x-[18%]" />
          )}
        </div>

        <div ref={content} className="relative z-10 mx-auto flex h-full max-w-[1320px] flex-col justify-end px-6 pb-14 pt-28 sm:px-10 md:justify-center md:pb-0">
          <p className="mb-4 hidden text-xs font-bold uppercase tracking-[0.3em] text-sky-300 sm:block">RaapNexus</p>
          <h1 className="font-display text-[clamp(2.3rem,5vw,4.6rem)] md:max-w-[640px] font-extrabold leading-[0.98] tracking-[-0.035em] text-white">
            {WORDS.map((w, i) => (
              <span key={w} className="block overflow-hidden pb-[0.08em]">
                <motion.span className={`block ${i === 1 ? 'bg-gradient-to-r from-sky-200 via-sky-400 to-blue-500 bg-clip-text text-transparent' : ''}`}
                  initial={reduced ? false : { y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.9 + i * 0.14 }}>
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 1.5 }}
            className="mt-5 max-w-md text-lg text-slate-300 sm:text-xl">
            Smarter financial insights. Confident business decisions.
          </motion.p>
          <motion.div initial={reduced ? false : { opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, ease: EASE, delay: 1.7 }} className="mt-8">
            <CtaButton label="Explore RaapNexus" />
          </motion.div>
        </div>

        {!mobile && (
          <div aria-hidden className="pointer-events-none absolute inset-0 z-[5] hidden lg:block">
            {[{ l: 'Revenue YTD', v: 'AED 47.6M', c: 'text-sky-300', s: 'right-[6%] top-[22%]', d: 2.0 }, { l: 'Sales growth', v: '+14.1%', c: 'text-emerald-300', s: 'right-[34%] top-[16%]', d: 2.3 }, { l: 'Gross margin', v: '44.7%', c: 'text-violet-300', s: 'right-[10%] bottom-[18%]', d: 2.6 }].map((k) => (
              <motion.div key={k.l} initial={reduced ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: k.d }} className={`absolute ${k.s}`}>
                <div className="rounded-2xl border border-white/15 bg-[#0d1b4a]/70 px-4 py-2.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,.6)]" style={{ animation: reduced ? undefined : `floatY ${5 + k.d}s ease-in-out infinite` }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">{k.l}</p>
                  <p className={`font-display text-xl font-extrabold ${k.c}`}>{k.v}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <motion.div aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4, duration: 1 }} className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block">
          <div className="h-10 w-px bg-gradient-to-b from-sky-300/0 via-sky-300/70 to-sky-300/0" style={{ animation: 'floatSubtle 2.4s ease-in-out infinite' }} />
        </motion.div>
      </section>
    </div>
  )
}
