import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, Maximize, Minimize, Pause, Play, RotateCcw, Volume1, Volume2, VolumeX } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { LOCAL_DEMO_VIDEO } from '../../data/localVideo'

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]
const fmt = (s: number) => { if (!Number.isFinite(s) || s < 0) s = 0; const m = Math.floor(s / 60), r = Math.floor(s % 60); return `${m}:${r < 10 ? '0' : ''}${r}` }
const btn = 'grid h-8 w-8 shrink-0 sm:h-9 sm:w-9 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/12 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 motion-reduce:transition-none'
const range = 'rn-range cursor-pointer appearance-none bg-transparent focus:outline-none'
const IC = 18

/**
 * Native <video> player with RaapNexus controls (no player library). The portrait video keeps its own aspect ratio (object-contain, never cropped):
 * the frame is sized by the video, capped to the viewport height. The <video> element is only created near the viewport and preloads metadata only;
 * the poster is shown (with a play button) until the visitor presses play. Never autoplays.
 */
export default function LocalVideoPlayer({ video, title }: { video: typeof LOCAL_DEMO_VIDEO; title: string }) {
  const { t } = useI18n()
  const box = useRef<HTMLDivElement>(null)
  const vid = useRef<HTMLVideoElement>(null)
  const [near, setNear] = useState(false)
  const [started, setStarted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [cur, setCur] = useState(0)
  const [dur, setDur] = useState(0)
  const [buf, setBuf] = useState(0)
  const [vol, setVol] = useState(1)
  const [muted, setMuted] = useState(false)
  const [rate, setRate] = useState(1)
  const [menu, setMenu] = useState(false)
  const [volOpen, setVolOpen] = useState(false) // touch: tap on the speaker reveals the slider (hover/focus reveal it via CSS)
  const lastVol = useRef(1)
  const touchTap = useRef(false)
  const volGrp = useRef<HTMLDivElement>(null)
  const [fs, setFs] = useState(false)
  const [wait, setWait] = useState(false)
  const [err, setErr] = useState(false)

  useEffect(() => {
    const el = box.current
    if (!el || typeof IntersectionObserver === 'undefined') { setNear(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect() } }, { rootMargin: '400px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const h = () => setFs(document.fullscreenElement === box.current)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  // touch: keep the slider open while it is being used, close it after a short idle or on a tap elsewhere
  useEffect(() => {
    if (!volOpen) return
    const id = window.setTimeout(() => setVolOpen(false), 4000)
    const away = (e: PointerEvent) => { if (!volGrp.current?.contains(e.target as Node)) setVolOpen(false) }
    document.addEventListener('pointerdown', away)
    return () => { window.clearTimeout(id); document.removeEventListener('pointerdown', away) }
  }, [volOpen, vol, muted])

  const toggle = useCallback(() => {
    const v = vid.current; if (!v) return
    setStarted(true)
    if (v.paused || v.ended) { void v.play().catch(() => { /* blocked or failed: the error event / paused state shows it */ }) } else v.pause()
  }, [])
  const seek = (x: number) => { const v = vid.current; if (v) { v.currentTime = x; setCur(x) } }
  // state is read back from the element (onVolumeChange), so the icon always matches the real volume
  const setVolume = (x: number) => { const v = vid.current; if (!v) return; x = Math.min(1, Math.max(0, x)); if (x > 0) lastVol.current = x; v.volume = x; v.muted = x === 0 }
  const mute = () => {
    const v = vid.current; if (!v) return
    if (v.muted || v.volume === 0) { v.muted = false; if (v.volume === 0) v.volume = lastVol.current || 0.6 } else v.muted = true // muting keeps v.volume, so unmuting restores it
  }
  const onMuteKey = (e: React.KeyboardEvent) => {
    const v = vid.current; if (!v) return
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); setVolume((v.muted ? 0 : v.volume) + 0.1) }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); setVolume((v.muted ? 0 : v.volume) - 0.1) }
  }
  const speed = (r: number) => { const v = vid.current; if (v) v.playbackRate = r; setRate(r); setMenu(false) }
  const full = () => {
    const el = box.current, v = vid.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null
    if (!el || !v) return
    if (document.fullscreenElement) { void document.exitFullscreen(); return }
    if (el.requestFullscreen) void el.requestFullscreen().catch(() => v.webkitEnterFullscreen?.())
    else v.webkitEnterFullscreen?.() // iOS Safari: native fullscreen of the video itself
  }
  const retry = () => { setErr(false); setWait(true); vid.current?.load() }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLButtonElement) return
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); toggle() }
    else if (e.key === 'ArrowRight') seek(Math.min(dur, cur + 5))
    else if (e.key === 'ArrowLeft') seek(Math.max(0, cur - 5))
    else if (e.key === 'f') full()
    else if (e.key === 'm') mute()
  }
  const pct = dur ? (cur / dur) * 100 : 0
  const shown = muted ? 0 : vol
  const Vol = shown === 0 ? VolumeX : shown < 0.5 ? Volume1 : Volume2

  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: `calc(min(78svh, 780px) * ${video.width} / ${video.height})` }} data-component="local-video">
      <div aria-hidden className="pointer-events-none absolute inset-x-8 -bottom-5 h-14 rounded-full bg-blue-500/30 blur-2xl" />
      <div className="relative overflow-hidden rounded-[22px] border border-white/15 bg-gradient-to-b from-[#142757] via-[#0b1738] to-[#070f27] p-2 shadow-[0_30px_70px_-30px_rgba(0,0,0,.95),0_0_0_1px_rgba(125,170,255,.08)] sm:p-2.5">
        <div ref={box} role="group" aria-label={title} tabIndex={-1} onKeyDown={onKey}
          className={`group/vp relative overflow-hidden bg-[#040a1c] ${fs ? 'grid h-screen w-screen place-items-center rounded-none' : 'rounded-[14px]'}`}
          style={fs ? undefined : { aspectRatio: `${video.width} / ${video.height}` }}>
          {near ? (
            <video ref={vid} src={video.src} poster={video.poster} width={video.width} height={video.height} preload="metadata" playsInline controlsList="nodownload" aria-label={title}
              onClick={toggle} onPlay={() => { setPlaying(true); setStarted(true) }} onPause={() => setPlaying(false)} onVolumeChange={(e) => { setVol(e.currentTarget.volume); setMuted(e.currentTarget.muted) }} onEnded={() => setPlaying(false)}
              onLoadedMetadata={(e) => { setDur(e.currentTarget.duration); setWait(false) }} onDurationChange={(e) => setDur(e.currentTarget.duration)}
              onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)} onProgress={(e) => { const v = e.currentTarget; if (v.buffered.length) setBuf(v.buffered.end(v.buffered.length - 1)) }}
              onWaiting={() => setWait(true)} onCanPlay={() => setWait(false)} onPlaying={() => setWait(false)} onError={() => { setErr(true); setWait(false); setPlaying(false) }}
              className={`block bg-[#040a1c] object-contain ${fs ? 'h-full w-full' : 'absolute inset-0 h-full w-full'}`} />
          ) : (
            <img src={video.poster} alt="" width={video.width} height={video.height} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-contain" />
          )}

          {!started && !err && (
            <button type="button" onClick={toggle} aria-label={t('videos.play', { title })} className="group/play absolute inset-0 grid place-items-center bg-[#040a1c]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-300">
              <span aria-hidden className="relative grid h-[72px] w-[72px] place-items-center rounded-full bg-white/95 text-[#0b1b46] shadow-[0_14px_40px_-10px_rgba(0,0,0,.8)] transition duration-300 group-hover/play:scale-110 group-hover/play:bg-sky-300">
                <span className="absolute inset-0 rounded-full border-2 border-sky-300/70 animate-[ping_2.4s_cubic-bezier(0,0,.2,1)_infinite] motion-reduce:animate-none" />
                <Play size={28} className="translate-x-0.5 fill-current rtl:-scale-x-100" />
              </span>
            </button>
          )}

          {wait && started && !err && <div role="status" className="pointer-events-none absolute inset-0 grid place-items-center"><Loader2 aria-label={t('videos.loading')} className="animate-spin text-white drop-shadow" size={38} /></div>}

          {err && (
            <div role="alert" className="absolute inset-0 grid place-items-center bg-[#040a1c]/92 p-6 text-center">
              <div>
                <p className="font-display text-base font-bold text-white">{t('videos.errTitle')}</p>
                <p className="mt-1 text-sm text-slate-300">{t('videos.errText')}</p>
                <button type="button" onClick={retry} className="mt-4 inline-flex items-center gap-2 rounded-full border border-sky-400/50 bg-sky-400/15 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-sky-400/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"><RotateCcw size={14} aria-hidden />{t('videos.retry')}</button>
              </div>
            </div>
          )}

          {started && !err && (
            <div className="vp-bar absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#020611]/90 via-[#020611]/55 to-transparent px-2 pb-1.5 pt-9 sm:px-3">
              <input type="range" min={0} max={dur || 0} step={0.1} value={cur} onChange={(e) => seek(+e.target.value)} aria-label={t('videos.player.seek')} aria-valuetext={`${fmt(cur)} / ${fmt(dur)}`}
                className={`${range} rn-seek block h-5 w-full`} style={{ ['--p' as string]: `${pct}%`, ['--b' as string]: `${dur ? (buf / dur) * 100 : 0}%` }} />
              <div className="flex items-center gap-0.5">
                <button type="button" onClick={toggle} aria-label={playing ? t('videos.player.pause') : t('videos.play', { title })} className={btn}>{playing ? <Pause size={IC} className="fill-current" aria-hidden /> : <Play size={IC} className="fill-current rtl:-scale-x-100" aria-hidden />}</button>
                <span className="vp-time whitespace-nowrap px-1.5 text-xs font-medium tabular-nums text-slate-100/90" dir="ltr">{fmt(cur)} <span className="text-slate-400">/</span> {fmt(dur)}</span>
                <span className="ms-auto" />
                <div ref={volGrp} className={`vol-grp relative flex items-center ${volOpen ? 'vol-open' : ''}`}>
                  <div className="vol-pop absolute end-full top-1/2 flex h-8 w-[80px] -translate-y-1/2 items-center rounded-full bg-[#0a1230]/90 px-2.5 shadow-lg ring-1 ring-white/10 backdrop-blur">
                    <input type="range" min={0} max={1} step={0.05} value={shown} onChange={(e) => setVolume(+e.target.value)} aria-label={t('videos.player.volume')} aria-valuetext={`${Math.round(shown * 100)}%`}
                      className={`${range} rn-vol block h-5 w-full`} style={{ ['--p' as string]: `${shown * 100}%`, ['--b' as string]: '0%' }} />
                  </div>
                  <button type="button" aria-label={shown === 0 ? t('videos.player.unmute') : t('videos.player.mute')}
                    onPointerDown={(e) => { touchTap.current = e.pointerType !== 'mouse' }} onKeyDown={onMuteKey}
                    onClick={() => { mute(); if (touchTap.current) setVolOpen(true); touchTap.current = false }} className={btn}><Vol size={IC} aria-hidden /></button>
                </div>
                <div className="relative">
                  <button type="button" onClick={() => setMenu((m) => !m)} aria-label={t('videos.player.speed')} aria-haspopup="menu" aria-expanded={menu} className={`${btn} w-auto min-w-8 px-1.5 sm:min-w-9 sm:px-2 text-xs font-semibold tabular-nums`}>{rate}×</button>
                  {menu && (
                    <ul role="menu" className="absolute bottom-full end-0 mb-2 min-w-[84px] overflow-hidden rounded-xl border border-white/15 bg-[#0a1230]/95 py-1 shadow-xl backdrop-blur">
                      {SPEEDS.map((r) => <li key={r} role="none"><button role="menuitemradio" aria-checked={r === rate} type="button" onClick={() => speed(r)} className={`block w-full px-3 py-1.5 text-start text-sm tabular-nums transition hover:bg-white/10 focus:bg-white/10 focus:outline-none ${r === rate ? 'font-bold text-sky-300' : 'text-slate-200'}`}>{r}×</button></li>)}
                    </ul>
                  )}
                </div>
                <button type="button" onClick={full} aria-label={fs ? t('videos.player.exitFullscreen') : t('videos.player.fullscreen')} className={btn}>{fs ? <Minimize size={IC} aria-hidden /> : <Maximize size={IC} aria-hidden />}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
