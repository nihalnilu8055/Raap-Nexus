import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion } from 'framer-motion'
import CtaButton from '../components/ui/CtaButton'
import HeroOrbit from '../components/ui/HeroOrbit'
import { useI18n } from '../i18n'
import { useNearView } from '../components/ui/useNearView'
import { Boundary, isMobile, webglSupported } from '../lib/webgl'
import { useSceneGate } from '../lib/gate'
import { EASE, gsap, scrollState, ScrollTrigger } from '../lib/motion'

const DepthScene = lazy(() => import('../three/HeroDepthScene'))

export default function Hero() {
  const { t } = useI18n()
  const bring = t('hero.bring'), PRE = t('hero.pre'), PRE2 = t('hero.pre2'), W1 = t('hero.w1'), W2 = t('hero.w2')
  // the static word is the visual anchor: longer words in other languages scale down so it always fits the copy column
  const bringK = Math.min(1, 5.4 / [...bring].length) * (/[\u0600-\u06FF\u0900-\u097F]/.test(bring) ? 0.8 : 1)
  const wrap = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const canvasBox = useRef<HTMLDivElement>(null)
  const reduced = !!useReducedMotion()
  const prog = useMotionValue(0)
  const { ref: depthRef, inView } = useNearView<HTMLDivElement>('0px')
  const [depthOK] = useState(() => typeof window !== 'undefined' && webglSupported() && !isMobile())
  // the WebGL depth stage is decorative: it starts only after the page has loaded (and, without a GPU, on first interaction) so it never competes with the headline (LCP)
  const idle = useSceneGate()
  const depth = depthOK && idle
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
          <div className="absolute left-1/2 top-[11%] w-[min(100vw,60vh)] -translate-x-1/2 md:w-[min(86vw,52vh)] lg:left-auto lg:right-[1.5vw] lg:top-1/2 lg:w-[min(51vw,90vh)] lg:translate-x-0 lg:-translate-y-[47%] 2xl:right-[3vw] 2xl:w-[min(46vw,92vh)]">
            {depth && !reduced && (
              <div ref={depthRef} aria-hidden className="pointer-events-none absolute inset-[-22%]">
                <Boundary fallback={null}><Suspense fallback={null}><DepthScene lite={lite} active={inView} /></Suspense></Boundary>
              </div>
            )}
            <HeroOrbit alt={t('hero.visualAlt')} progress={prog} />
          </div>
        </div>

        <div ref={content} className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1760px] flex-col justify-end px-6 pb-14 pt-28 sm:px-10 min-[1400px]:px-14 lg:justify-center lg:pb-0">
          <p className="mb-4 hidden text-xs font-bold uppercase tracking-[0.3em] text-sky-300 sm:block">{t('hero.eyebrow')}</p>
          {/* both statements are exposed once to assistive tech; the animated copy is decorative (aria-hidden), so nothing is announced per frame */}
          <h1 className="hx-stage pointer-events-auto w-fit max-w-full font-display text-white md:max-w-[640px]">
            <span className="sr-only">{bring} {PRE} {W1}. {bring} {PRE2} {W2}.</span>
            <span aria-hidden className="block">
              <span className="hx-bring" style={{ fontSize: `calc(clamp(3.6rem, 8.6vw, 8.2rem) * ${bringK})` }}>
                <span className="hx-bring__back uppercase">{bring}</span>
                <span className="hx-bring__front uppercase">{bring}</span>
              </span>
              <span className="hx-line mt-[.5rem] text-[clamp(1.35rem,2.9vw,2.9rem)] font-bold leading-[1.14] tracking-[-0.02em]">
                <span className="hx-flip">
                  <span className="hx-card">
                    <span className="hx-ph hx-front"><span className="hx-pre">{PRE} </span><span className="hx-w">{W1}</span></span>
                    <span className="hx-ph hx-back"><span className="hx-pre">{PRE2} </span><span className="hx-w">{W2}</span></span>
                  </span>
                </span>
              </span>
            </span>
          </h1>
          <motion.p initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}
            className="pointer-events-auto mt-5 w-fit max-w-md text-lg text-slate-300 sm:text-xl">
            {t('hero.sub')}
          </motion.p>
          <motion.div initial={reduced ? false : { opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, ease: EASE, delay: 0.85 }} className="pointer-events-auto mt-8 flex w-fit flex-wrap items-center gap-3">
            <CtaButton label={t('nav.cta')} />
          </motion.div>
        </div>

        <motion.div aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4, duration: 1 }} className="absolute bottom-6 start-1/2 hidden -translate-x-1/2 rtl:translate-x-1/2 md:block">
          <div className="h-10 w-px bg-gradient-to-b from-sky-300/0 via-sky-300/70 to-sky-300/0" style={{ animation: 'floatSubtle 2.4s ease-in-out infinite' }} />
        </motion.div>
      </section>
    </div>
  )
}
