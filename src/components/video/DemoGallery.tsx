import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Play, X } from 'lucide-react'
import { DEMO_VIDEOS } from '../../data/demoVideos'
import { useI18n } from '../../i18n'

const FOCUSABLE = 'button, [href], iframe, [tabindex]:not([tabindex="-1"])'
const thumb = (id: string, q: 'mqdefault' | 'hqdefault', ext: 'webp' | 'jpg') => ext === 'webp' ? `https://i.ytimg.com/vi_webp/${id}/${q}.webp` : `https://i.ytimg.com/vi/${id}/${q}.jpg`

const TILT = 9 // max degrees; the approved hover effect (see .vc-card in index.css)
const finePointer = () => typeof matchMedia === 'function' && matchMedia('(hover: hover) and (pointer: fine)').matches
const calmMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

function Card({ id, title, n, d, onOpen }: { id: string; title: string; n: number; d: number; onOpen: (id: string, title: string, el: HTMLElement) => void }) {
  const { t } = useI18n()
  const [jpg, setJpg] = useState(false) // WebP first; JPEG if a video has no WebP rendition
  const ext = jpg ? 'jpg' : 'webp'
  const card = useRef<HTMLButtonElement>(null)
  const raf = useRef(0)
  // Cursor tracking: mouse only (never touch/pen), one rAF-throttled style write per move, no idle loop.
  const move = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'mouse' || !finePointer()) return
    const el = card.current; if (!el) return
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      el.classList.add('vc-on')
      el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`); el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`)
      if (!calmMotion()) { el.style.setProperty('--ry', `${((x - 0.5) * 2 * TILT).toFixed(2)}deg`); el.style.setProperty('--rx', `${((0.5 - y) * 2 * TILT).toFixed(2)}deg`) }
    })
  }
  const reset = () => {
    cancelAnimationFrame(raf.current)
    const el = card.current; if (!el) return
    el.classList.remove('vc-on')
    for (const k of ['--rx', '--ry', '--gx', '--gy']) el.style.removeProperty(k)
  }
  useEffect(() => () => cancelAnimationFrame(raf.current), [])
  return (
    <li className="vc-slot" style={{ ['--d' as string]: d }}>
      <button ref={card} type="button" onClick={(e) => onOpen(id, title, e.currentTarget)} aria-label={t('videos.play', { title })}
        onPointerMove={move} onPointerLeave={reset} onBlur={reset} className="vc-card">
        <span className="vc-thumb">
          <img
            src={thumb(id, 'mqdefault', ext)} srcSet={`${thumb(id, 'mqdefault', ext)} 320w, ${thumb(id, 'hqdefault', ext)} 480w`}
            sizes="(min-width:1280px) 290px, (min-width:1024px) 31vw, (min-width:540px) 46vw, 92vw"
            alt="" width={320} height={180} loading={n <= 4 ? 'eager' : 'lazy'} decoding="async" fetchPriority={n <= 2 ? 'high' : 'auto'}
            onError={() => setJpg(true)} className="vc-img" />
          <span aria-hidden className="vc-shade" />
          <span aria-hidden className="vc-glare" />
          <span aria-hidden className="vc-play"><Play size={14} className="vc-play-i" /></span>
        </span>
        <span className="vc-body">
          <span className="vc-title" title={title}>{title}</span>
          <span className="vc-kind">{t('videos.gal.kind')}</span>
        </span>
      </button>
    </li>
  )
}

/** Modal player. Grows out of the clicked card and shrinks back into it (FLIP); reduced motion = plain fade. Real YouTube iframe, unchanged. */
function Player({ id, title, opener, onClosed }: { id: string; title: string; opener: HTMLElement | null; onClosed: () => void }) {
  const { t } = useI18n()
  const reduced = !!useReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const dlg = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const closing = useRef(false)
  const timer = useRef(0)
  const [open, setOpen] = useState(false)
  const fromCard = useCallback(() => {
    const d = dlg.current
    if (reduced || !opener || !d) return ''
    const c = opener.getBoundingClientRect(), r = d.getBoundingClientRect()
    if (!r.width) return ''
    const k = c.width / r.width
    return `translate(${(c.left + c.width / 2 - (r.left + r.width / 2)).toFixed(1)}px,${(c.top + c.height / 2 - (r.top + r.height / 2)).toFixed(1)}px) scale(${k.toFixed(3)})`
  }, [reduced, opener])
  const requestClose = useCallback(() => {
    if (closing.current) return
    closing.current = true; setOpen(false)
    if (dlg.current) dlg.current.style.transform = fromCard()
    timer.current = window.setTimeout(onClosed, reduced ? 260 : 560)
  }, [fromCard, onClosed, reduced])
  useLayoutEffect(() => {
    const d = dlg.current; if (!d) return
    d.style.transition = 'none'; d.style.transform = fromCard(); void d.offsetWidth
    const r = requestAnimationFrame(() => { d.style.transition = ''; d.style.transform = ''; setOpen(true) })
    return () => cancelAnimationFrame(r)
  }, [fromCard])
  useEffect(() => {
    const b = document.body, sbw = window.innerWidth - document.documentElement.clientWidth
    const po = b.style.overflow, pp = b.style.paddingRight
    b.style.overflow = 'hidden'; if (sbw > 0) b.style.paddingRight = `${sbw}px`
    closeBtn.current?.focus({ preventScroll: true })
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); requestClose(); return }
      if (e.key !== 'Tab' || !root.current) return
      const f = [...root.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (!f.length) return
      const first = f[0], last = f[f.length - 1], a = document.activeElement
      if (e.shiftKey && a === first) { e.preventDefault(); last.focus() } else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('keydown', key); clearTimeout(timer.current); b.style.overflow = po; b.style.paddingRight = pp }
  }, [requestClose])
  return (
    <div ref={root} role="dialog" aria-modal="true" aria-label={title} className={`lm${open ? ' lm-open' : ''}`}>
      <div className="lm-back" onClick={requestClose} />
      <div ref={dlg} className="lm-dialog">
        <div className="lm-head">
          <h3 className="min-w-0 font-display text-base font-bold leading-snug text-white sm:text-lg">{title}</h3>
          <button ref={closeBtn} type="button" onClick={requestClose} aria-label={t('videos.gal.close')}
            className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full border border-sky-400/40 bg-sky-400/10 text-white transition hover:rotate-90 hover:border-sky-300 hover:bg-sky-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
            <X size={20} aria-hidden />
          </button>
        </div>
        <div className="lm-frame">
          <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`} title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        </div>
      </div>
    </div>
  )
}

/** The demo videos (src/data/demoVideos.ts) as a thumbnail grid. No iframe exists until a thumbnail is clicked; only one player is ever mounted. */
export default function DemoGallery() {
  const { t } = useI18n()
  const reduced = !!useReducedMotion()
  const [active, setActive] = useState<{ id: string; title: string } | null>(null)
  const opener = useRef<HTMLElement | null>(null)
  const sec = useRef<HTMLElement>(null)
  const open = useCallback((id: string, title: string, el: HTMLElement) => { opener.current = el; setActive({ id, title }) }, [])
  const closed = useCallback(() => { setActive(null); requestAnimationFrame(() => opener.current?.focus({ preventScroll: true })) }, [])
  // Scroll reveal. Cards stay visible in the prerendered HTML / without JS / with reduced motion; the hidden start state is armed here, before first paint.
  useLayoutEffect(() => {
    const el = sec.current
    if (!el || reduced || typeof IntersectionObserver === 'undefined') return
    el.classList.add('lg-pre')
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('lg-in'); io.unobserve(e.target) } }), { threshold: 0.12, rootMargin: '0px 0px -4% 0px' })
    el.querySelectorAll('.vc-slot, .lg-divider').forEach((n) => io.observe(n))
    const safety = window.setTimeout(() => el.querySelectorAll('.vc-slot, .lg-divider').forEach((n) => n.classList.add('lg-in')), 2500)
    return () => { io.disconnect(); clearTimeout(safety); el.classList.remove('lg-pre') }
  }, [reduced])
  return (
    <section ref={sec} aria-labelledby="dv-h" className="lg mt-4 sm:mt-6">
      <h2 id="dv-h" className="sr-only">{t('videos.gal.heading')}</h2>
      <div aria-hidden className="lg-divider" />
      <ul className="grid grid-cols-1 gap-x-5 gap-y-6 min-[540px]:grid-cols-2 sm:gap-y-7 min-[900px]:grid-cols-3 min-[1180px]:grid-cols-4">
        {DEMO_VIDEOS.map((v, i) => <Card key={v.id} id={v.id} title={v.title} n={i + 1} d={i % 4} onOpen={open} />)}
      </ul>
      {active && <Player key={active.id} id={active.id} title={active.title} opener={opener.current} onClosed={closed} />}
    </section>
  )
}
