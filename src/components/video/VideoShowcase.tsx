import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Maximize2, Minimize2, PictureInPicture2, Play, X } from 'lucide-react'
import { Tilt } from '../ui/Reveal'
import PlayerIframe from './PlayerIframe'
import { useI18n } from '../../i18n'
import { EASE } from '../../lib/motion'
import { categorySlug, fallbackThumbnailUrl, LOCAL_FALLBACK_THUMB, thumbnailUrl, type DemoVideo } from '../../data/videos'

type Mode = 'inline' | 'expanded' | 'compact'
const PLAY_EVENT = 'rn-video-play'
const FOCUSABLE = 'button, [href], input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])'

const ctl = 'grid h-8 w-8 place-items-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300'

/**
 * The ONE video component used by the landing page and the library: a premium software-window mockup that
 * shows the real video thumbnail, plays the video inline (lazy-mounted embed), and can expand or float as a mini window.
 * Only one video plays at a time.
 */
export default function VideoShowcase({ video, float = false, floatDelay = 0, priority = false, level = 3 }: { video: DemoVideo; float?: boolean; floatDelay?: number; priority?: boolean; level?: 2 | 3 }) {
  const { t } = useI18n()
  const reduced = !!useReducedMotion()
  const [playing, setPlaying] = useState(false)
  const [mode, setMode] = useState<Mode>('inline')
  const [start, setStart] = useState(0)
  const [src, setSrc] = useState(thumbnailUrl(video))
  const time = useRef(0)
  const expandBtn = useRef<HTMLButtonElement>(null)
  const miniBtn = useRef<HTMLButtonElement>(null)
  const cat = t(`videos.cat.${categorySlug(video.category)}`)
  const Title = level === 2 ? 'h2' : 'h3' // keeps the heading outline unbroken: library cards sit directly under the page h1

  const onThumbError = () => setSrc((s) => (s === LOCAL_FALLBACK_THUMB ? s : s === fallbackThumbnailUrl(video) || !video.maxResThumbnail ? LOCAL_FALLBACK_THUMB : fallbackThumbnailUrl(video)))
  const onProgress = useCallback((s: number) => { time.current = s }, [])
  const begin = () => { window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: video.id })); time.current = 0; setStart(0); setPlaying(true) }
  const go = (m: Mode) => { setStart(Math.floor(time.current)); setMode(m) }
  const stop = () => { setPlaying(false); setMode('inline'); setStart(0); time.current = 0 }
  const play = () => { begin(); setMode('inline') }
  const expand = () => { if (!playing) begin(); go('expanded') }
  const mini = () => { if (!playing) begin(); go('compact') }

  // only one video plays at a time
  useEffect(() => {
    const h = (e: Event) => { if ((e as CustomEvent).detail !== video.id) stop() }
    window.addEventListener(PLAY_EVENT, h)
    return () => window.removeEventListener(PLAY_EVENT, h)
  }, [video.id])

  // expanded view: Escape closes, focus is kept inside, the page does not move, focus returns to the button that opened it
  const dialog = useRef<HTMLDivElement>(null)
  const closeExpanded = () => { go('inline'); window.setTimeout(() => expandBtn.current?.focus(), 0) }
  useEffect(() => {
    if (!(playing && mode === 'expanded')) return
    const y = window.scrollY, root = document.documentElement, prev = root.style.overflow
    root.style.overflow = 'hidden'
    window.setTimeout(() => dialog.current?.querySelector<HTMLElement>('[data-close]')?.focus(), 30)
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); closeExpanded(); return }
      if (e.key !== 'Tab' || !dialog.current) return
      const f = [...dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((x) => !x.hasAttribute('disabled'))
      if (!f.length) return
      const first = f[0], last = f[f.length - 1], a = document.activeElement
      if (!dialog.current.contains(a)) { e.preventDefault(); first.focus() }
      else if (e.shiftKey && a === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('keydown', key); root.style.overflow = prev; window.scrollTo(0, y) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, mode])

  const player = <PlayerIframe key={mode} video={video} start={start} onProgress={onProgress} />
  const fade = reduced ? { duration: 0 } : { duration: 0.35, ease: EASE }

  return (
    <div className={float && !reduced ? 'rn-float' : ''} style={float && !reduced ? { animationDelay: `${floatDelay}s` } : undefined} data-component="video-showcase" data-video-id={video.youtubeId}>
      <Tilt disabled={playing} max={4} lift={16} className="h-full">
        <figure className="group/frame relative m-0">
          <div aria-hidden className="pointer-events-none absolute inset-x-10 -bottom-5 h-14 rounded-full bg-blue-500/30 blur-2xl transition duration-500 group-hover/frame:bg-sky-400/40" />
          <div className="relative overflow-hidden rounded-[22px] border border-white/15 bg-gradient-to-b from-[#142757] via-[#0b1738] to-[#070f27] shadow-[0_30px_70px_-30px_rgba(0,0,0,.95),0_0_0_1px_rgba(125,170,255,.08)] transition duration-500 group-hover/frame:border-sky-300/40 group-hover/frame:shadow-[0_40px_90px_-30px_rgba(37,99,235,.55),0_0_0_1px_rgba(125,170,255,.18)]">
            {/* software-window toolbar */}
            <div className="flex h-11 items-center gap-3 border-b border-white/10 bg-white/[0.04] px-3 sm:px-4">
              <span aria-hidden className="flex gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-slate-500/70" /><i className="h-2.5 w-2.5 rounded-full bg-slate-500/50" /><i className="h-2.5 w-2.5 rounded-full bg-slate-500/30" /></span>
              <span className="mx-auto hidden min-w-0 max-w-[60%] truncate rounded-md bg-white/[0.06] px-3 py-1 text-[11px] font-medium tracking-wide text-slate-300 sm:block">{t('videos.frameLabel')} · {cat}</span>
              <span className="ms-auto flex items-center gap-1 sm:ms-0">
                <button ref={miniBtn} type="button" onClick={mini} aria-label={t('videos.miniWindow')} title={t('videos.miniWindow')} className={ctl}><PictureInPicture2 size={16} aria-hidden /></button>
                <button ref={expandBtn} type="button" onClick={expand} aria-label={t('videos.expand')} title={t('videos.expand')} className={ctl}><Maximize2 size={15} aria-hidden /></button>
              </span>
            </div>
            {/* screen (always 16:9) */}
            <div className="relative aspect-video w-full overflow-hidden bg-[#040a1c]">
              <img src={src} onError={onThumbError} alt={t('videos.alt', { title: video.title })} width={1280} height={720} loading={priority ? 'eager' : 'lazy'} decoding="async" draggable={false}
                className={`h-full w-full object-cover transition duration-700 ease-out ${playing ? 'scale-105 opacity-40 blur-[2px]' : 'group-hover/frame:scale-[1.04] motion-reduce:group-hover/frame:scale-100'}`} />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#040a1c]/80 via-transparent to-[#040a1c]/20" />
              {!playing && (
                <button type="button" onClick={play} aria-label={t('videos.play', { title: video.title })} className="group/play absolute inset-0 grid place-items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-300">
                  <span aria-hidden className="relative grid h-16 w-16 place-items-center rounded-full bg-white/95 text-[#0b1b46] shadow-[0_14px_40px_-10px_rgba(0,0,0,.8)] transition duration-300 group-hover/play:scale-110 group-hover/play:bg-sky-300 sm:h-[72px] sm:w-[72px]">
                    <span className="absolute inset-0 rounded-full border-2 border-sky-300/70 animate-[ping_2.4s_cubic-bezier(0,0,.2,1)_infinite] motion-reduce:animate-none" />
                    <Play size={26} className="translate-x-0.5 fill-current rtl:-scale-x-100" />
                  </span>
                </button>
              )}
              {/* soft light reflection */}
              <span aria-hidden className="rn-sheen pointer-events-none absolute inset-0" />
              {playing && mode === 'inline' && player}
              {playing && mode !== 'inline' && (
                <div className="absolute inset-0 grid place-items-center p-4 text-center">
                  <div className="text-sm text-sky-100">
                    <p>{mode === 'expanded' ? t('videos.inExpanded') : t('videos.inMini')}</p>
                    {mode === 'compact' && <button type="button" onClick={() => go('inline')} className="mt-3 inline-flex items-center gap-2 rounded-full border border-sky-400/50 bg-sky-400/15 px-4 py-1.5 font-semibold text-white transition hover:bg-sky-400/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"><Minimize2 size={14} aria-hidden />{t('videos.returnToFrame')}</button>}
                  </div>
                </div>
              )}
            </div>
          </div>
          <figcaption className="px-1 pt-5">
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300">{cat}</p>
            <Title className="mt-1.5 font-display text-lg font-bold leading-snug text-white sm:text-xl">{video.title}</Title>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{video.description}</p>
          </figcaption>
        </figure>
      </Tilt>

      {/* expanded view (portal, centred, 16:9, responsive) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {playing && mode === 'expanded' && (
            <motion.div key="exp" ref={dialog} role="dialog" aria-modal="true" aria-label={video.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade}
              onMouseDown={(e) => { if (e.target === e.currentTarget) closeExpanded() }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020611]/90 p-3 backdrop-blur-md sm:p-6">
              <motion.div initial={reduced ? false : { scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} exit={reduced ? undefined : { scale: 0.96, y: 8 }} transition={fade}
                className="w-[min(96vw,calc((100svh-6.5rem)*16/9))] overflow-hidden rounded-2xl border border-white/15 bg-[#0a1230] shadow-[0_40px_120px_-30px_rgba(37,99,235,.6)]">
                <div className="flex h-12 items-center gap-3 border-b border-white/10 bg-white/[0.04] ps-4 pe-2">
                  <p className="min-w-0 flex-1 truncate font-display text-sm font-bold text-white">{video.title}</p>
                  <button type="button" onClick={() => go('compact')} aria-label={t('videos.miniWindow')} title={t('videos.miniWindow')} className={ctl}><PictureInPicture2 size={16} aria-hidden /></button>
                  <button type="button" data-close onClick={closeExpanded} aria-label={t('videos.closeExpanded')} title={t('videos.closeExpanded')} className={`${ctl} h-9 w-9`}><X size={20} aria-hidden /></button>
                </div>
                <div className="relative aspect-video w-full">{player}</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>, document.body)}

      {/* mini window (portal): the page stays fully scrollable underneath */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {playing && mode === 'compact' && (
            <motion.div key="mini" role="region" aria-label={video.title} initial={reduced ? false : { opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduced ? undefined : { opacity: 0, y: 16, scale: 0.97 }} transition={fade}
              className="fixed bottom-3 end-3 z-[90] w-[min(92vw,360px)] overflow-hidden rounded-xl border border-white/20 bg-[#0a1230] shadow-[0_24px_60px_-20px_rgba(0,0,0,.9),0_0_0_1px_rgba(125,170,255,.15)] sm:bottom-5 sm:end-5">
              <div className="flex h-9 items-center gap-1 border-b border-white/10 bg-white/[0.05] ps-3 pe-1">
                <p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-200">{video.title}</p>
                <button type="button" onClick={() => { go('inline'); window.setTimeout(() => miniBtn.current?.focus(), 0) }} aria-label={t('videos.returnToFrame')} title={t('videos.returnToFrame')} className={`${ctl} h-7 w-7`}><Minimize2 size={14} aria-hidden /></button>
                <button type="button" onClick={stop} aria-label={t('videos.closeMini')} title={t('videos.closeMini')} className={`${ctl} h-7 w-7`}><X size={15} aria-hidden /></button>
              </div>
              <div className="relative aspect-video w-full">{player}</div>
            </motion.div>
          )}
        </AnimatePresence>, document.body)}
    </div>
  )
}
