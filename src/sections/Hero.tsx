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

// Latin words are revealed letter by letter; connected scripts (Arabic, Devanagari) are revealed as whole words so letters never get separated
const CONNECTED = /[\u0600-\u06FF\u0900-\u097F]/
function KeyWord({ text }: { text: string }) {
  const units = CONNECTED.test(text) ? [text] : [...text]
  return <span className="hx-kw">{units.map((u, i) => <i key={i} className="hx-u" style={{ ['--i' as string]: i }}>{u}</i>)}</span>
}

// Entrance timeline (seconds): [lead-in word, key word, underline, closing words] for each statement
const TIMELINE = [[0.15, 0.3, 1.05, 1.3], [1.7, 1.85, 2.6, 2.85]]

export default function Hero() {
  const { t } = useI18n()
  const lines = [
    { pre: t('hero.c1pre'), w: t('hero.c1w'), post: t('hero.c1post') },
    { pre: t('hero.c2pre'), w: t('hero.c2w'), post: t('hero.c2post') },
  ]
  // the two key words are the visual anchors: longer words in other languages scale down a little so they always fit the copy column
  const keyK = Math.min(1, 9 / Math.max(...lines.map((l) => [...l.w].length)))
  const wrap = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const canvasBox = useRef<HTMLDivElement>(null)
  const head = useRef<HTMLHeadingElement>(null)
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
      // The text side is never empty and nothing is added or removed: the two statements take turns as the focus while the supporting line and the
      // button stay put. Once the hero unpins, the copy and the artwork scroll away with the section, so no empty stage is left behind.
      const rows = head.current ? gsap.utils.toArray<HTMLElement>(head.current.querySelectorAll('.hx-row')) : []
      const keys = head.current ? gsap.utils.toArray<HTMLElement>(head.current.querySelectorAll('.hx-key')) : []
      if (rows.length === 2) {
        gsap.set(keys, { transformOrigin: document.documentElement.dir === 'rtl' ? 'right bottom' : 'left bottom' })
        tl.to(rows[1], { opacity: 0.38, ease: 'none', duration: 0.12 }, 0.04)
          .to(keys[0], { scale: 1.06, ease: 'none', duration: 0.12 }, 0.04)
          .to(rows[0], { opacity: 0.38, ease: 'none', duration: 0.14 }, 0.38)
          .to(keys[0], { scale: 1, ease: 'none', duration: 0.14 }, 0.38)
          .to(rows[1], { opacity: 1, ease: 'none', duration: 0.14 }, 0.38)
          .to(keys[1], { scale: 1.06, ease: 'none', duration: 0.14 }, 0.38)
          .to(rows[0], { opacity: 1, ease: 'none', duration: 0.14 }, 0.74)
          .to(keys[1], { scale: 1, ease: 'none', duration: 0.14 }, 0.74)
      }
      tl.to(canvasBox.current, { scale: 1.08, opacity: 0.4, ease: 'power1.in', duration: 0.4 }, 0.6)
    }, wrap)
    return () => { ctx.revert(); scrollState.hero = 0; prog.set(0); ScrollTrigger.refresh() }
  }, [reduced, prog])

  return (
    <div ref={wrap} id="top" className={reduced ? 'relative' : 'relative h-[175vh]'}>
      <section aria-label={t('hero.label')} className="sticky top-0 h-screen min-h-[620px] w-full overflow-hidden bg-[#040a1c]">
        {/* cinematic backdrop, fades in first */}
        <motion.div aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }} className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 55% at 70% 45%, rgba(37,99,235,.38), transparent 70%), radial-gradient(ellipse 50% 40% at 15% 100%, rgba(14,165,233,.16), transparent 70%), linear-gradient(180deg,#040a1c 0%,#071331 100%)' }} />
        <div aria-hidden className="absolute inset-0 opacity-[.35]" style={{ backgroundImage: 'linear-gradient(rgba(148,184,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(148,184,255,.07) 1px,transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 70% 60% at 65% 45%,#000,transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 65% 45%,#000,transparent 75%)' }} />

        <div ref={canvasBox} className="absolute inset-0 will-change-transform">
          {/* artwork box: square, sized from the viewport so it never overlaps the copy on desktop and never gets cropped */}
          <div className="absolute left-1/2 top-[11%] w-[min(100vw,60vh,max(240px,calc(100svh-400px)))] -translate-x-1/2 md:w-[min(86vw,52vh)] lg:left-auto lg:right-[1.5vw] lg:top-1/2 lg:w-[min(43vw,90vh)] xl:w-[min(48vw,90vh)] lg:translate-x-0 lg:-translate-y-[47%] 2xl:right-[3vw] rtl:lg:right-auto rtl:lg:left-[1.5vw] rtl:2xl:right-auto rtl:2xl:left-[3vw] 2xl:w-[min(46vw,92vh)]">
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
          {/* the sentence is exposed once to assistive tech; the styled copy is decorative (aria-hidden) so nothing is read twice */}
          <div className="hx-wrap pointer-events-none">
          <h1 ref={head} className={`hx-h1 pointer-events-auto w-fit max-w-full font-display text-white md:max-w-[640px]`} style={{ ['--k' as string]: keyK }}>
            <span className="sr-only">{lines.map((l) => `${l.pre} ${l.w} ${l.post}`.replace(/[\s.。]+$/, '')).join('. ')}.</span>
            <span aria-hidden className="block">
              {lines.map((l, i) => (
                <span key={i} className="hx-row" style={{ ['--t0' as string]: `${TIMELINE[i][0]}s`, ['--t1' as string]: `${TIMELINE[i][1]}s`, ['--t2' as string]: `${TIMELINE[i][2]}s`, ['--t3' as string]: `${TIMELINE[i][3]}s` }}>
                  <span className="hx-pre">{l.pre}</span>
                  <span className="hx-key"><KeyWord text={l.w} /></span>
                  <span className="hx-post">{l.post}</span>
                </span>
              ))}
            </span>
          </h1>
          </div>
        <motion.div initial={reduced ? false : { opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, ease: EASE, delay: 0.85 }} className="pointer-events-auto mt-9 flex w-fit flex-wrap items-center gap-3">
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
