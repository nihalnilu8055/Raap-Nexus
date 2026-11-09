import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Play, X } from 'lucide-react'
import { DEMO_VIDEO_IDS } from '../../data/demoVideos'
import { EASE } from '../../lib/motion'
import { useI18n } from '../../i18n'

const FOCUSABLE = 'button, [href], iframe, [tabindex]:not([tabindex="-1"])'
const thumb = (id: string, q: 'mqdefault' | 'hqdefault', ext: 'webp' | 'jpg') => ext === 'webp' ? `https://i.ytimg.com/vi_webp/${id}/${q}.webp` : `https://i.ytimg.com/vi/${id}/${q}.jpg`

function Card({ id, n, onOpen }: { id: string; n: number; onOpen: (id: string, n: number, el: HTMLElement) => void }) {
  const { t } = useI18n()
  const [jpg, setJpg] = useState(false) // WebP first; JPEG if a video has no WebP rendition
  const ext = jpg ? 'jpg' : 'webp'
  return (
    <li>
      <button type="button" onClick={(e) => onOpen(id, n, e.currentTarget)} aria-label={t('videos.gal.play', { n: String(n) })} className="group block w-full focus:outline-none">
        <span className="relative block aspect-video overflow-hidden rounded-xl border border-white/10 bg-[#071229] shadow-[0_18px_40px_-24px_rgba(0,0,0,.9)] transition duration-300 group-hover:-translate-y-1 group-hover:border-sky-300/50 group-hover:shadow-[0_22px_48px_-20px_rgba(56,189,248,.45)] group-focus-visible:ring-2 group-focus-visible:ring-sky-300 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
          <img
            src={thumb(id, 'mqdefault', ext)} srcSet={`${thumb(id, 'mqdefault', ext)} 320w, ${thumb(id, 'hqdefault', ext)} 480w`}
            sizes="(min-width:1280px) 290px, (min-width:1024px) 31vw, (min-width:540px) 46vw, 92vw"
            alt="" width={320} height={180} loading={n <= 4 ? 'eager' : 'lazy'} decoding="async" fetchPriority={n <= 2 ? 'high' : 'auto'}
            onError={() => setJpg(true)}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#040a1c]/60 via-transparent to-transparent" />
          <span aria-hidden className="absolute inset-0 grid place-items-center">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-white/40 bg-[#040a1c]/55 text-white backdrop-blur transition duration-300 group-hover:scale-110 group-hover:border-sky-300 group-hover:bg-sky-500/80 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
              <Play size={20} className="translate-x-px fill-current rtl:-translate-x-px rtl:-scale-x-100" />
            </span>
          </span>
        </span>
      </button>
    </li>
  )
}

function Player({ id, n, onClose }: { id: string; n: number; onClose: () => void }) {
  const { t } = useI18n()
  const reduced = !!useReducedMotion()
  const box = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const b = document.body, sbw = window.innerWidth - document.documentElement.clientWidth
    const po = b.style.overflow, pp = b.style.paddingRight
    b.style.overflow = 'hidden'; if (sbw > 0) b.style.paddingRight = `${sbw}px`
    closeBtn.current?.focus({ preventScroll: true })
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
      if (e.key !== 'Tab' || !box.current) return
      const f = [...box.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (!f.length) return
      const first = f[0], last = f[f.length - 1], a = document.activeElement
      if (e.shiftKey && a === first) { e.preventDefault(); last.focus() } else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('keydown', key); b.style.overflow = po; b.style.paddingRight = pp }
  }, [onClose])
  const label = t('videos.gal.player', { n: String(n) })
  return (
    <motion.div role="dialog" aria-modal="true" aria-label={label}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#020611]/95 p-3 backdrop-blur-sm sm:p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.25 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div ref={box} className="w-full max-w-[1000px]" initial={reduced ? false : { opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }} transition={{ duration: reduced ? 0 : 0.35, ease: EASE }}>
        <div className="mb-3 flex justify-end">
          <button ref={closeBtn} type="button" onClick={onClose} aria-label={t('videos.gal.close')}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-sky-400/40 bg-sky-400/10 text-white transition hover:border-sky-300 hover:bg-sky-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
            <X size={20} aria-hidden />
          </button>
        </div>
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_30px_80px_-30px_rgba(37,99,235,.55)]">
          <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`} title={label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        </div>
      </motion.div>
    </motion.div>
  )
}

/** The 10 demo videos (src/data/demoVideos.ts) as a thumbnail grid. No iframe exists until a thumbnail is clicked; only one player is ever mounted. */
export default function DemoGallery() {
  const { t } = useI18n()
  const [active, setActive] = useState<{ id: string; n: number } | null>(null)
  const opener = useRef<HTMLElement | null>(null)
  const open = useCallback((id: string, n: number, el: HTMLElement) => { opener.current = el; setActive({ id, n }) }, [])
  const close = useCallback(() => { setActive(null); requestAnimationFrame(() => opener.current?.focus({ preventScroll: true })) }, [])
  return (
    <section aria-labelledby="dv-h" className="mt-12 sm:mt-14">
      <h2 id="dv-h" className="sr-only">{t('videos.gal.heading')}</h2>
      <ul className="grid grid-cols-1 gap-5 min-[540px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {DEMO_VIDEO_IDS.map((id, i) => <Card key={id} id={id} n={i + 1} onOpen={open} />)}
      </ul>
      <AnimatePresence>{active && <Player key={active.id} id={active.id} n={active.n} onClose={close} />}</AnimatePresence>
    </section>
  )
}
