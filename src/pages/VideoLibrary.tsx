import { motion, useReducedMotion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import SiteNav from '../components/layout/SiteNav'
import SiteFooter from '../components/layout/SiteFooter'
import ContactModal from '../components/ContactModal'
import CursorFX from '../components/CursorFX'
import DemoGallery from '../components/video/DemoGallery'
import { EASE } from '../lib/motion'
import { useI18n } from '../i18n'

/** /:lang/demo-videos – hero + the 10 demo videos as a gallery (see DemoGallery). */
export default function VideoLibrary() {
  const { t, lang } = useI18n()
  const reduced = !!useReducedMotion()
  return (
    <div className="w-full overflow-x-clip bg-[#040a1c] text-slate-200">
      <a href="#library" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-slate-900">{t('nav.skip')}</a>
      <SiteNav />
      <main id="library" className="relative overflow-hidden px-4 pb-24 pt-28 sm:px-6 sm:pt-36">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="vg-blob absolute -start-32 top-0 h-[420px] w-[420px] rounded-full bg-blue-600/20 blur-[110px]" />
          <div className="vg-blob vg-blob-b absolute -end-24 top-1/3 h-[380px] w-[380px] rounded-full bg-cyan-500/10 blur-[110px]" />
        </div>
        <div className="relative mx-auto max-w-[1280px]">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-400">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to={`/${lang}/`} className="transition-colors hover:text-white focus:outline-none focus-visible:underline">{t('videos.back')}</Link></li>
              <li aria-hidden><ChevronRight size={14} className="rtl:-scale-x-100" /></li>
              <li aria-current="page" className="text-slate-200">{t('videos.crumb')}</li>
            </ol>
          </nav>

          <motion.header initial={reduced ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="mx-auto mt-8 max-w-3xl text-center">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl sm:leading-[1.1]">{t('videos.libTitle')}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">{t('videos.libText')}</p>
          </motion.header>

          <DemoGallery />
        </div>
      </main>
      <SiteFooter />
      <ContactModal />
      <CursorFX />
    </div>
  )
}
