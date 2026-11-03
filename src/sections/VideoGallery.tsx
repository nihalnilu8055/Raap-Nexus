import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Reveal } from '../components/ui/Reveal'
import VideoShowcase from '../components/video/VideoShowcase'
import { featuredVideos } from '../data/videos'
import { useI18n } from '../i18n'

/** Landing section: exactly the featured demo videos (max 2, from src/data/videos.ts) in software-window mockups + one link to the library. */
export default function VideoGallery() {
  const { t, lang } = useI18n()
  const videos = featuredVideos()
  if (!videos.length) return null
  return (
    <section id="demo-videos" aria-labelledby="vg-h" className="relative overflow-hidden bg-[#040a1c] px-6 py-24 sm:py-32">
      {/* quiet animated backdrop: drifting navy/blue light + slow ERP data-flow lines (transform/opacity only; static for reduced motion) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="vg-blob absolute -start-32 top-10 h-[460px] w-[460px] rounded-full bg-blue-600/25 blur-[120px]" />
        <div className="vg-blob vg-blob-b absolute -end-24 bottom-0 h-[420px] w-[420px] rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="vg-flow absolute inset-x-0 top-[34%] h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />
        <div className="vg-flow vg-flow-b absolute inset-x-0 top-[66%] h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
      </div>
      <div className="relative mx-auto max-w-[1200px]">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal><h2 id="vg-h" className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">{t('videos.heading')}</h2></Reveal>
          <Reveal delay={0.1}><p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">{t('videos.text')}</p></Reveal>
        </div>
        <ul className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-10">
          {videos.map((v, i) => (
            <Reveal as="li" key={v.id} variant="depth" delay={0.12 + i * 0.16} className="[perspective:1200px]"><VideoShowcase video={v} float floatDelay={i * 1.6} /></Reveal>
          ))}
        </ul>
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
