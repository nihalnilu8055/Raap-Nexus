import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Play } from 'lucide-react'
import { useI18n } from '../../i18n'
import { glInfo, useSceneGate } from '../../lib/gate'
import { Boundary, isMobile, webglSupported } from '../../lib/webgl'

const Scene = lazy(() => import('../../three/ComingSoonScene')) // its own chunk: never fetched until the Video section is near the viewport
const CONNECTED = /[؀-ۿऀ-ॿ]/

/** Dimensional "COMING SOON": every unit holds a navy extrusion layer and a satin face layer, so the two can never drift apart while a letter animates. */
function Title({ text }: { text: string }) {
  const joined = CONNECTED.test(text)
  const units = joined ? text.split(' ') : [...text]
  const k = Math.min(1, 8.2 / units.length) * (joined ? 1.05 : 1)
  return (
    <span aria-hidden className={`cs-t${joined ? ' cs-w' : ''}`} style={{ fontSize: `calc(clamp(2.05rem, 7.2vw, 5.4rem) * ${k.toFixed(3)})` }}>
      {units.map((u, i) => u === ' '
        ? <i key={i} className="cs-sp" />
        : <i key={i} style={{ ['--i' as string]: i }}><b className="cs-back">{u}</b><b className="cs-front">{u}</b></i>)}
    </span>
  )
}

/**
 * Premium 3D "coming soon" stage for the Video section: a floating glass video screen (CSS 3D, always rendered = the no-WebGL fallback),
 * two depth panels, light trails, and an optional WebGL layer of particles / orbit rings that exists only while the section is on screen.
 */
export default function ComingSoon({ headingId = 'vg-h' }: { headingId?: string } = {}) {
  const { t } = useI18n()
  const reduced = !!useReducedMotion()
  const stage = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)   // title reveal + animations run
  const [live, setLive] = useState(false)       // WebGL scene is mounted (within 200px of the viewport)
  const [ready, setReady] = useState(false) // the title reveal plays first; the WebGL ambience starts only once it has finished (keeps the main thread free)
  const go = useSceneGate()                      // never before page load; software-rendered GL waits for a real interaction
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const a = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); else setInView(false) }, { threshold: 0.15 })
    const b = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { rootMargin: '200px 0px' })
    a.observe(el); b.observe(el)
    return () => { a.disconnect(); b.disconnect() }
  }, [])
  useEffect(() => { if (!inView || ready) return; const id = window.setTimeout(() => setReady(true), 1900); return () => clearTimeout(id) }, [inView, ready])
  const gl = useMemo(() => typeof window !== 'undefined' && webglSupported(), [])
  const lite = typeof window !== 'undefined' && (isMobile() || glInfo().software)
  const showGl = !reduced && gl && go && live && ready
  const title = t('videos.soon.title')

  return (
    <div ref={stage} className={`cs-stage${inView ? ' cs-in' : ''}`} data-component="coming-soon">
      <div aria-hidden className="cs-halo" />
      <div aria-hidden className="cs-trail" /><div aria-hidden className="cs-trail cs-trail-b" />
      {showGl && (
        <div aria-hidden className="cs-gl">
          <Boundary fallback={null}><Suspense fallback={null}><Scene active={inView} lite={lite} /></Suspense></Boundary>
        </div>
      )}
      <div className="cs-rig">
        {/* depth panels */}
        <div aria-hidden className="cs-panel cs-p1"><i className="cs-dotb" /><span className="cs-ln" style={{ width: '64%' }} /><span className="cs-ln" style={{ width: '42%' }} />
          <span className="cs-bars"><i style={{ height: '38%' }} /><i style={{ height: '70%' }} /><i style={{ height: '52%' }} /><i style={{ height: '88%' }} /></span></div>
        <div aria-hidden className="cs-panel cs-p2"><i className="cs-dotb" /><span className="cs-ln" style={{ width: '72%' }} /><span className="cs-ln" style={{ width: '48%' }} /><span className="cs-ln" style={{ width: '58%' }} /></div>
        {/* the screen */}
        <div aria-hidden className="cs-screen">
          <div className="cs-bar"><span className="flex gap-1.5"><i /><i /><i /></span><span className="cs-url" /></div>
          <div className="cs-grid" /><span className="cs-sweep" />
          <span className="cs-foot"><i /><i /><i /></span>
          <span className="cs-ring"><Play size={20} className="translate-x-px fill-current rtl:-scale-x-100" /></span>
        </div>
        <h2 id={headingId} className="cs-title">
          <span className="sr-only">{title}</span>
          <Title text={title} />
        </h2>
      </div>
    </div>
  )
}
