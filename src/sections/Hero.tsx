import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion } from 'framer-motion'
import CtaButton from '../components/ui/CtaButton'
import HeroVisual from '../components/ui/HeroVisual'
import { useI18n } from '../i18n'
import { useNearView } from '../components/ui/useNearView'
import { Boundary, isMobile, webglSupported } from '../lib/webgl'
import { EASE, gsap, scrollState, ScrollTrigger } from '../lib/motion'

const DepthScene = lazy(() => import('../three/HeroDepthScene'))

export default function Hero() {
  const { t } = useI18n()
  const WORDS = [t('hero.l1'), t('hero.l2')]
  const wrap = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const canvasBox = useRef<HTMLDivElement>(null)
  const reduced = !!useReducedMotion()
  const prog = useMotionValue(0)
  const { ref: depthRef, inView } = useNearView<HTMLDivElement>('0px')
  const [depth] = useState(() => typeof window !== 'undefined' && webglSupported() && !isMobile())
  const [lite] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024)
  // one passive pointer listener feeds the 3D rig (normalised -1..1); no per-event React work
  useEffect(() => {
    if (reduced || !depth) return
    const mv = (e: PointerEvent) => { if (e.pointerType === 'touch') return; scrollState.px = (e.clientX / innerWidth) * 2 - 1; scrollState.py = -((e.clientY / innerHeight) * 2 - 1) }
    window.addEventListener('pointermove', mv, { passive: true })
    return () => { window.removeEventListener('pointermove', mv); scrollState.px = 0; scrollState.py = 0 }
  }, [reduced, depth])
  // Hero → dashboard transition: the camera dollies into the core while the copy dissolves.
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap.current, start: 'top top', end: 'bottom bottom', scrub: 0.6,
          onUpdate: (s) => { scrollState.hero = s.progress; prog.set(Math.min(1, s.progress / 0.75)) },
        },
      })
      tl.to(content.current, { y: -70, opacity: 0, ease: 'none', duration: 0.45 }, 0)
        .to(canvasBox.current, { scale: 1.12, opacity: 0, ease: 'power1.in', duration: 0.4 }, 0.6)
    }, wrap)
    return () => { ctx.revert(); scrollState.hero = 0; prog.set(0); ScrollTrigger.refresh() }
  }, [reduced, prog])

  return (
    <div ref={wrap} id="top" className={reduced ? 'relative' : 'relative h-[165vh]'}>
      <section aria-label={t('hero.label')} className="sticky top-0 h-screen min-h-[620px] w-full overflow-hidden bg-[#040a1c]">
        {/* cinematic backdrop, fades in first */}
        <motion.div aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }} className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 55% at 70% 45%, rgba(37,99,235,.38), transparent 70%), radial-gradient(ellipse 50% 40% at 15% 100%, rgba(14,165,233,.16), transparent 70%), linear-gradient(180deg,#040a1c 0%,#071331 100%)' }} />
        <div aria-hidden className="absolute inset-0 opacity-[.35]" style={{ backgroundImage: 'linear-gradient(rgba(148,184,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(148,184,255,.07) 1px,transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 70% 60% at 65% 45%,#000,transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 65% 45%,#000,transparent 75%)' }} />

        <div ref={canvasBox} className="absolute inset-0 will-change-transform">
          {/* artwork box: square, sized from the viewport so it never overlaps the copy on desktop and never gets cropped */}
          <div className="absolute left-1/2 top-[11%] w-[min(100vw,60vh)] -translate-x-1/2 md:left-auto md:right-[-3vw] lg:right-[1.5vw] md:top-1/2 md:w-[min(46vw,82vh)] md:translate-x-0 md:-translate-y-[47%] lg:w-[min(51vw,90vh)] 2xl:right-[3vw] 2xl:w-[min(51vw,92vh)]">
            {depth && !reduced && (
              <div ref={depthRef} aria-hidden className="pointer-events-none absolute inset-[-22%]">
                <Boundary fallback={null}><Suspense fallback={null}><DepthScene lite={lite} active={inView} /></Suspense></Boundary>
              </div>
            )}
            <HeroVisual alt={t('hero.visualAlt')} progress={prog} />
          </div>
        </div>

        <div ref={content} className="relative z-10 mx-auto flex h-full max-w-[1320px] flex-col justify-end px-6 pb-14 pt-28 sm:px-10 md:justify-center md:pb-0">
          <p className="mb-4 hidden text-xs font-bold uppercase tracking-[0.3em] text-sky-300 sm:block">{t('hero.eyebrow')}</p>
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
            {t('hero.sub')}
          </motion.p>
          <motion.div initial={reduced ? false : { opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, ease: EASE, delay: 1.7 }} className="mt-8">
            <CtaButton label={t('hero.cta')} />
          </motion.div>
        </div>

        <motion.div aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4, duration: 1 }} className="absolute bottom-6 start-1/2 hidden -translate-x-1/2 rtl:translate-x-1/2 md:block">
          <div className="h-10 w-px bg-gradient-to-b from-sky-300/0 via-sky-300/70 to-sky-300/0" style={{ animation: 'floatSubtle 2.4s ease-in-out infinite' }} />
        </motion.div>
      </section>
    </div>
  )
}
