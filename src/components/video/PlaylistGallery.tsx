import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ExternalLink, Play, X } from 'lucide-react'
import { PLAYLIST_URL } from '../../data/playlist'
import { EASE } from '../../lib/motion'
import { useI18n } from '../../i18n'

interface PlVideo { id: string; title: string; duration: number | null }
type State = { s: 'loading' } | { s: 'ready'; videos: PlVideo[] } | { s: 'error'; code: 'not_configured' | 'failed' }

const PAGE = 12
const FOCUSABLE = 'button, [href], iframe, [tabindex]:not([tabindex="-1"])'
const thumb = (id: string, q: 'mqdefault' | 'hqdefault', ext: 'webp' | 'jpg') => ext === 'webp' ? `https://i.ytimg.com/vi_webp/${id}/${q}.webp` : `https://i.ytimg.com/vi/${id}/${q}.jpg`
const fmt = (s: number) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}` }
const valid = (v: unknown): v is PlVideo => !!v && typeof (v as PlVideo).id === 'string' && /^[\w-]{11}$/.test((v as PlVideo).id) && typeof (v as PlVideo).title === 'string'

function Card({ v, i, onOpen }: { v: PlVideo; i: number; onOpen: (v: PlVideo, el: HTMLElement) => void }) {
  const { t } = useI18n()
  const [jpg, setJpg] = useState(false) // WebP is requested first; fall back to JPEG if a video has no WebP rendition
  const ext = jpg ? 'jpg' : 'webp'
  return (
    <li>
      <button type="button" onClick={(e) => onOpen(v, e.currentTarget)} aria-label={t('videos.play', { title: v.title })}
        className="group block w-full text-start focus:outline-none">
        <span className="relative block aspect-video overflow-hidden rounded-xl border border-white/10 bg-[#071229] shadow-[0_18px_40px_-24px_rgba(0,0,0,.9)] transition duration-300 group-hover:-translate-y-1 group-hover:border-sky-300/50 group-hover:shadow-[0_22px_48px_-20px_rgba(56,189,248,.45)] group-focus-visible:ring-2 group-focus-visible:ring-sky-300 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
          <img
            src={thumb(v.id, 'mqdefault', ext)} srcSet={`${thumb(v.id, 'mqdefault', ext)} 320w, ${thumb(v.id, 'hqdefault', ext)} 480w`}
            sizes="(min-width:1280px) 290px, (min-width:768px) 31vw, (min-width:540px) 46vw, 92vw"
            alt="" width={320} height={180} loading={i < 4 ? 'eager' : 'lazy'} decoding="async" fetchPriority={i < 2 ? 'high' : 'auto'}
            onError={() => setJpg(true)}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#040a1c]/70 via-transparent to-transparent opacity-80" />
          <span aria-hidden className="absolute inset-0 grid place-items-center">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-white/40 bg-[#040a1c]/55 text-white backdrop-blur transition duration-300 group-hover:scale-110 group-hover:border-sky-300 group-hover:bg-sky-500/80 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
              <Play size={20} className="translate-x-px fill-current rtl:-translate-x-px rtl:-scale-x-100" />
            </span>
          </span>
          {v.duration ? <span aria-hidden className="absolute bottom-2 end-2 rounded-md bg-[#040a1c]/85 px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-white">{fmt(v.duration)}</span> : null}
        </span>
        <span className="mt-3 block line-clamp-2 px-0.5 font-display text-[15px] font-semibold leading-snug text-slate-100 transition-colors group-hover:text-white">{v.title}</span>
      </button>
    </li>
  )
}

function Player({ v, onClose }: { v: PlVideo; onClose: () => void }) {
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
  return (
    <motion.div role="dialog" aria-modal="true" aria-label={t('videos.pl.player', { title: v.title })}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#020611]/95 p-3 backdrop-blur-sm sm:p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.25 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div ref={box} className="w-full max-w-[1000px]" initial={reduced ? false : { opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }} transition={{ duration: reduced ? 0 : 0.35, ease: EASE }}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="min-w-0 truncate font-display text-base font-bold text-white sm:text-lg">{v.title}</h2>
          <button ref={closeBtn} type="button" onClick={onClose} aria-label={t('videos.pl.close')}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sky-400/40 bg-sky-400/10 text-white transition hover:border-sky-300 hover:bg-sky-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
            <X size={20} aria-hidden />
          </button>
        </div>
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_30px_80px_-30px_rgba(37,99,235,.55)]">
          <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&playsinline=1`} title={t('videos.pl.player', { title: v.title })}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        </div>
      </motion.div>
    </motion.div>
  )
}

/** The complete RaapNexus YouTube playlist as a thumbnail grid. Data comes from /api/playlist (server-side YouTube Data API, key never in the browser).
 *  No iframe exists until a card is clicked, and only one player is ever mounted. */
export default function PlaylistGallery() {
  const { t } = useI18n()
  const reduced = !!useReducedMotion()
  const [state, setState] = useState<State>({ s: 'loading' })
  const [shown, setShown] = useState(PAGE)
  const [active, setActive] = useState<PlVideo | null>(null)
  const [attempt, setAttempt] = useState(0)
  const opener = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const ac = new AbortController()
    setState({ s: 'loading' })
    fetch('/api/playlist', { headers: { accept: 'application/json' }, signal: ac.signal })
      .then(async (r) => {
        const d = await r.json().catch(() => null)
        if (!r.ok) { setState({ s: 'error', code: d?.error === 'not_configured' ? 'not_configured' : 'failed' }); return }
        if (!d || !Array.isArray(d.videos)) throw new Error('bad payload')
        setState({ s: 'ready', videos: d.videos.filter(valid) })
      })
      .catch((e) => { if (e?.name !== 'AbortError') setState({ s: 'error', code: 'failed' }) })
    return () => ac.abort()
  }, [attempt])

  const open = useCallback((v: PlVideo, el: HTMLElement) => { opener.current = el; setActive(v) }, [])
  const close = useCallback(() => { setActive(null); requestAnimationFrame(() => opener.current?.focus({ preventScroll: true })) }, [])

  const yt = <a href={PLAYLIST_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 transition-colors hover:text-white focus:outline-none focus-visible:underline">{t('videos.pl.open')}<ExternalLink size={14} aria-hidden /></a>
  const videos = state.s === 'ready' ? state.videos : []
  return (
    <section aria-labelledby="pl-h" className="mt-12 sm:mt-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <h2 id="pl-h" className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{t('videos.pl.allTitle')}</h2>
          {state.s === 'ready' && videos.length > 0 && <p role="status" className="mt-1 text-sm text-slate-400">{t('videos.pl.count', { n: String(videos.length) })}</p>}
        </div>
        {yt}
      </div>

      {state.s === 'loading' && (
        <ul aria-hidden className="grid grid-cols-1 gap-x-5 gap-y-8 min-[540px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i}><div className={`aspect-video rounded-xl bg-white/[0.06] ${reduced ? '' : 'animate-pulse'}`} /><div className={`mt-3 h-4 w-4/5 rounded bg-white/[0.06] ${reduced ? '' : 'animate-pulse'}`} /></li>
          ))}
        </ul>
      )}

      {state.s === 'error' && (
        <div role="alert" className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center">
          <p className="font-display text-xl font-bold text-white">{t(state.code === 'not_configured' ? 'videos.pl.unavailTitle' : 'videos.pl.errTitle')}</p>
          <p className="mx-auto mt-2 max-w-md text-slate-400">{t(state.code === 'not_configured' ? 'videos.pl.unavailText' : 'videos.pl.errText')}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {state.code === 'failed' && <button type="button" onClick={() => setAttempt((n) => n + 1)} className="rounded-full border border-sky-400/40 bg-sky-400/10 px-6 py-2.5 font-semibold text-white transition hover:bg-sky-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">{t('videos.retry')}</button>}
            <a href={PLAYLIST_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-2.5 font-semibold text-white transition hover:border-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">{t('videos.pl.open')}<ExternalLink size={14} aria-hidden /></a>
          </div>
        </div>
      )}

      {state.s === 'ready' && videos.length === 0 && <p className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center text-slate-300">{t('videos.pl.empty')}</p>}

      {videos.length > 0 && (
        <>
          <ul className="grid grid-cols-1 gap-x-5 gap-y-8 min-[540px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {videos.slice(0, shown).map((v, i) => <Card key={v.id} v={v} i={i} onOpen={open} />)}
          </ul>
          {shown < videos.length && (
            <div className="mt-10 flex justify-center">
              <button type="button" onClick={() => setShown((n) => n + PAGE)} className="inline-flex min-h-12 items-center rounded-full border border-sky-400/40 bg-sky-400/10 px-7 py-3 font-display text-base font-bold text-white transition duration-300 hover:border-sky-300 hover:bg-sky-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
                {t('videos.pl.loadMore')}
              </button>
            </div>
          )}
        </>
      )}
      <AnimatePresence>{active && <Player key={active.id} v={active} onClose={close} />}</AnimatePresence>
    </section>
  )
}
