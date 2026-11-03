import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronRight, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import SiteNav from '../components/layout/SiteNav'
import SiteFooter from '../components/layout/SiteFooter'
import ContactModal from '../components/ContactModal'
import CursorFX from '../components/CursorFX'
import VideoShowcase from '../components/video/VideoShowcase'
import { allVideos, categoriesInUse, categorySlug, type VideoCategory } from '../data/videos'
import { EASE } from '../lib/motion'
import { useI18n } from '../i18n'

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').trim()

/** /:lang/demo-videos – the complete, filterable library. All data comes from src/data/videos.ts. */
export default function VideoLibrary() {
  const { t, lang } = useI18n()
  const reduced = !!useReducedMotion()
  const videos = useMemo(allVideos, [])
  const cats = useMemo(categoriesInUse, [])
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<VideoCategory | 'all'>('all')
  const shown = videos.filter((v) => (cat === 'all' || v.category === cat) && (!q.trim() || norm(v.title).includes(norm(q))))
  const filtered = q.trim() !== '' || cat !== 'all'
  const reset = () => { setQ(''); setCat('all') }
  const pill = (on: boolean) => `min-h-10 rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${on ? 'border-sky-300 bg-sky-400/20 text-white shadow-[0_8px_24px_-12px_rgba(56,189,248,.7)]' : 'border-white/15 bg-white/5 text-slate-300 hover:border-sky-400/50 hover:text-white'}`
  return (
    <div className="w-full overflow-x-clip bg-[#040a1c] text-slate-200">
      <a href="#library" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-slate-900">{t('nav.skip')}</a>
      <SiteNav />
      <main id="library" className="relative overflow-hidden px-6 pb-24 pt-32 sm:pt-40">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="vg-blob absolute -start-32 top-0 h-[420px] w-[420px] rounded-full bg-blue-600/20 blur-[110px]" />
          <div className="vg-blob vg-blob-b absolute -end-24 top-1/3 h-[380px] w-[380px] rounded-full bg-cyan-500/10 blur-[110px]" />
        </div>
        <div className="relative mx-auto max-w-[1200px] min-[1440px]:max-w-[1400px]">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-400">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to={`/${lang}/`} className="transition-colors hover:text-white focus:outline-none focus-visible:underline">{t('videos.back')}</Link></li>
              <li aria-hidden><ChevronRight size={14} className="rtl:-scale-x-100" /></li>
              <li aria-current="page" className="text-slate-200">{t('videos.crumb')}</li>
            </ol>
          </nav>
          <motion.div initial={reduced ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="mt-6 max-w-3xl">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{t('videos.libTitle')}</h1>
            <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">{t('videos.libText')}</p>
          </motion.div>

          <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div role="group" aria-label={t('videos.filter')} className="flex flex-wrap gap-2">
              <button type="button" aria-pressed={cat === 'all'} onClick={() => setCat('all')} className={pill(cat === 'all')}>{t('videos.all')}</button>
              {cats.map((c) => <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={pill(cat === c)}>{t(`videos.cat.${categorySlug(c)}`)}</button>)}
            </div>
            <div className="relative w-full lg:max-w-sm">
              <label htmlFor="vl-search" className="sr-only">{t('videos.search')}</label>
              <Search size={18} aria-hidden className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input id="vl-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('videos.searchPlaceholder')} autoComplete="off"
                className="min-h-12 w-full rounded-full border border-white/15 bg-white/5 ps-11 pe-11 text-base text-white placeholder:text-slate-500 transition focus:border-sky-300 focus:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60" />
              {q && <button type="button" onClick={() => setQ('')} aria-label={t('videos.clear')} className="absolute end-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-300 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"><X size={16} aria-hidden /></button>}
            </div>
          </div>
          <p role="status" aria-live="polite" className="mt-4 text-sm text-slate-400">{t('videos.count', { n: String(shown.length), total: String(videos.length) })}</p>

          {shown.length > 0 ? (
            <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3 min-[1440px]:grid-cols-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {shown.map((v, i) => (
                  <motion.li key={v.id} layout={!reduced} initial={reduced ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, scale: 0.96 }} transition={{ duration: 0.5, ease: EASE, delay: reduced ? 0 : Math.min(i, 7) * 0.06 }}>
                    <VideoShowcase video={v} priority={i < 2} level={2} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center">
              <p className="font-display text-xl font-bold text-white">{t('videos.empty')}</p>
              <p className="mt-2 text-slate-400">{t('videos.emptyHint')}</p>
              {filtered && <button type="button" onClick={reset} className="mt-6 rounded-full border border-sky-400/40 bg-sky-400/10 px-6 py-2.5 font-semibold text-white transition hover:bg-sky-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">{t('videos.clear')}</button>}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
      <ContactModal />
      <CursorFX />
    </div>
  )
}
