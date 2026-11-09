import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Reveal } from '../components/ui/Reveal'
import LocalVideoPlayer from '../components/video/LocalVideoPlayer'
import { LOCAL_DEMO_VIDEO } from '../data/localVideo'
import { useI18n } from '../i18n'

/**
 * Landing section: the first real RaapNexus demo video (local file, portrait) as the single featured video, plus one button
 * that opens the /:lang/demo-videos page (the 10 demo videos).
 */
export default function VideoGallery() {
  const { t, lang } = useI18n()
  return (
    <section id="demo-videos" aria-labelledby="vg-h" className="relative overflow-hidden bg-[#040a1c] px-6 py-20 sm:py-28">
      {/* quiet animated backdrop: drifting navy/blue light + slow ERP data-flow lines (transform/opacity only; static for reduced motion) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="vg-blob absolute -start-32 top-10 h-[460px] w-[460px] rounded-full bg-blue-600/25 blur-[120px]" />
        <div className="vg-blob vg-blob-b absolute -end-24 bottom-0 h-[420px] w-[420px] rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="vg-flow absolute inset-x-0 top-[34%] h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />
        <div className="vg-flow vg-flow-b absolute inset-x-0 top-[66%] h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
      </div>
      <div className="relative mx-auto max-w-[1200px]">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-20">
          <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-start">
            <Reveal><p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300">{t('videos.frameLabel')}</p></Reveal>
            <Reveal delay={0.08}><h2 id="vg-h" className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">{t('videos.heading')}</h2></Reveal>
            <Reveal delay={0.16}><p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">{t('videos.text')}</p></Reveal>
          </div>
          <Reveal variant="depth" delay={0.12} className="w-full lg:w-[min(46vw,430px)]"><LocalVideoPlayer video={LOCAL_DEMO_VIDEO} title={t('videos.frameLabel')} /></Reveal>
        </div>
        <Reveal delay={0.2} className="mt-14 flex justify-center">
          <Link to={`/${lang}/demo-videos`} className="group inline-flex min-h-12 items-center gap-2 rounded-full border border-sky-400/40 bg-sky-400/10 px-7 py-3 font-display text-base font-bold text-white transition duration-300 hover:border-sky-300 hover:bg-sky-400/20 hover:shadow-[0_12px_36px_-12px_rgba(56,189,248,.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
            {t('videos.cta')}
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" aria-hidden />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
