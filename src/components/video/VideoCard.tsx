import { useState } from 'react'
import { ArrowUpRight, Play, Youtube } from 'lucide-react'
import { Tilt } from '../ui/Reveal'
import { useI18n } from '../../i18n'
import { categorySlug, fallbackThumbnailUrl, LOCAL_FALLBACK_THUMB, thumbnailUrl, youtubeUrl, type DemoVideo } from '../../data/videos'

/**
 * One demo-video card. The whole card is a plain link that opens the video on YouTube in a NEW TAB
 * (no iframe, no modal, no in-page playback). Thumbnail comes from the YouTube ID; if it fails to load it falls back
 * to hqdefault.jpg and finally to a local branded placeholder (always 16:9).
 */
export default function VideoCard({ video, priority = false }: { video: DemoVideo; priority?: boolean }) {
  const { t } = useI18n()
  const [src, setSrc] = useState(thumbnailUrl(video))
  const onError = () => setSrc((s) => (s === LOCAL_FALLBACK_THUMB ? s : s === fallbackThumbnailUrl(video) || !video.maxResThumbnail ? LOCAL_FALLBACK_THUMB : fallbackThumbnailUrl(video)))
  const cat = t(`videos.cat.${categorySlug(video.category)}`)
  return (
    <Tilt className="h-full" max={5} lift={10}>
      <a
        href={youtubeUrl(video)} target="_blank" rel="noopener noreferrer"
        aria-label={`${video.title}. ${t('videos.watch')}. ${t('videos.opens')}`}
        data-video-id={video.youtubeId}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-[#071027]/90 shadow-[0_18px_40px_-22px_rgba(0,0,0,.9)] ring-0 transition duration-500 hover:border-sky-400/50 hover:shadow-[0_26px_60px_-24px_rgba(56,130,255,.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
          <img
            src={src} onError={onError} alt={t('videos.alt', { title: video.title })} width={1280} height={720}
            loading={priority ? 'eager' : 'lazy'} decoding="async" draggable={false}
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#040a1c]/85 via-[#040a1c]/10 to-transparent transition-opacity duration-500 group-hover:opacity-80" />
          {/* animated play icon */}
          <span aria-hidden className="absolute inset-0 grid place-items-center">
            <span className="relative grid h-14 w-14 place-items-center rounded-full bg-white/95 text-[#0b1b46] shadow-[0_10px_30px_-8px_rgba(0,0,0,.7)] transition duration-300 group-hover:scale-110 group-hover:bg-sky-300">
              <span className="absolute inset-0 rounded-full border border-sky-300/70 opacity-0 group-hover:animate-[ping_1.5s_cubic-bezier(0,0,.2,1)_infinite] group-hover:opacity-100 motion-reduce:animate-none" />
              <Play size={22} className="translate-x-0.5 fill-current rtl:-scale-x-100" />
            </span>
          </span>
          <span className="absolute end-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
            <Youtube size={14} className="text-red-500" aria-hidden /> {t('videos.youtube')}
          </span>
          {video.isTemporary && <span className="absolute start-2.5 top-2.5 rounded-full border border-amber-300/40 bg-amber-300/15 px-2 py-1 text-[11px] font-semibold text-amber-200 backdrop-blur">{t('videos.sample')}</span>}
        </div>
        <div className="flex flex-1 flex-col p-5 transition-transform duration-500 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 motion-reduce:transform-none">
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300">{cat}</p>
          <h3 className="mt-2 line-clamp-2 font-display text-lg font-bold leading-snug text-white">{video.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-300">{video.description}</p>
          {video.isTemporary && video.channel && <p className="mt-2 text-xs text-slate-500">{t('videos.source', { channel: video.channel })}</p>}
          <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-sky-300 transition-colors group-hover:text-white">
            {t('videos.watch')}
            <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" aria-hidden />
          </span>
        </div>
      </a>
    </Tilt>
  )
}
