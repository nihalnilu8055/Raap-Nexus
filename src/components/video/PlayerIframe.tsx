import { useEffect, useRef, useState } from 'react'
import { Loader2, RotateCcw } from 'lucide-react'
import { embedUrl, type DemoVideo } from '../../data/videos'
import { useI18n } from '../../i18n'

const LOAD_TIMEOUT_MS = 15000

/**
 * The inline player: YouTube's privacy-enhanced embed (youtube-nocookie.com). It is only mounted after the visitor presses Play.
 * - shows a loading animation until the embed document has loaded, and an error state (with retry) if it never loads or the player reports an error
 * - reports playback position (YouTube's postMessage "listening" API) so the position survives moving between inline / expanded / mini window
 */
export default function PlayerIframe({ video, start, onProgress }: { video: DemoVideo; start: number; onProgress: (seconds: number) => void }) {
  const { t } = useI18n()
  const ref = useRef<HTMLIFrameElement>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (state !== 'loading') return
    const tm = window.setTimeout(() => setState((s) => (s === 'loading' ? 'error' : s)), LOAD_TIMEOUT_MS)
    return () => window.clearTimeout(tm)
  }, [state, attempt])

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow || typeof e.data !== 'string') return
      let d: { event?: string; info?: { currentTime?: number } } | null = null
      try { d = JSON.parse(e.data) } catch { return }
      if (!d) return
      if (d.event === 'onError') setState('error')
      else if (d.event === 'infoDelivery' && typeof d.info?.currentTime === 'number') onProgress(d.info.currentTime)
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [onProgress])

  const onLoad = () => {
    setState('ready')
    try { ref.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*') } catch { /* progress tracking is optional */ }
  }
  return (
    <div className="absolute inset-0 bg-black">
      {state !== 'error' && (
        <iframe
          key={attempt} ref={ref} onLoad={onLoad}
          src={embedUrl(video, { start, origin: window.location.origin })}
          title={t('videos.playerTitle', { title: video.title })}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      )}
      {state === 'loading' && (
        <div role="status" className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[#0b1b46] to-[#040a1c]">
          <div className="flex flex-col items-center gap-3 text-sm text-sky-100">
            <Loader2 size={30} className="animate-spin text-sky-300 motion-reduce:animate-none" aria-hidden />
            <span>{t('videos.loading')}</span>
          </div>
        </div>
      )}
      {state === 'error' && (
        <div role="alert" className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[#0b1b46] to-[#040a1c] p-4 text-center">
          <div>
            <p className="font-display text-base font-bold text-white sm:text-lg">{t('videos.errTitle')}</p>
            <p className="mt-1 text-sm text-slate-300">{t('videos.errText')}</p>
            <button type="button" onClick={() => { setState('loading'); setAttempt((a) => a + 1) }} className="mt-4 inline-flex items-center gap-2 rounded-full border border-sky-400/50 bg-sky-400/15 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-400/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
              <RotateCcw size={15} aria-hidden /> {t('videos.retry')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
