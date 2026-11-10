import { useReducedMotion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import SiteNav from '../components/layout/SiteNav'
import SiteFooter from '../components/layout/SiteFooter'
import ContactModal from '../components/ContactModal'
import CursorFX from '../components/CursorFX'
import DemoGallery from '../components/video/DemoGallery'
import LibraryHero from '../components/video/LibraryHero'
import '../components/video/library.css'
import { useI18n } from '../i18n'

/** /:lang/videos – hero + the demo videos as a gallery (see DemoGallery). */
export default function VideoLibrary() {
  const { t, lang } = useI18n()
  const reduced = !!useReducedMotion()
  return (
    <div className="w-full overflow-x-clip bg-[#040a1c] text-slate-200">
      <a href="#library" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-slate-900">{t('nav.skip')}</a>
      <SiteNav />
      <main id="library" data-vl-reduced={reduced ? '' : undefined} className="relative overflow-hidden px-4 pb-24 pt-24 sm:px-6 sm:pt-28">
        <div className="relative mx-auto max-w-[1280px]">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-400">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to={`/${lang}/`} className="transition-colors hover:text-white focus:outline-none focus-visible:underline">{t('videos.back')}</Link></li>
              <li aria-hidden><ChevronRight size={14} className="rtl:-scale-x-100" /></li>
              <li aria-current="page" className="text-slate-200">{t('videos.crumb')}</li>
            </ol>
          </nav>

          <LibraryHero lite={reduced} />

          <DemoGallery />
        </div>
      </main>
      <SiteFooter />
      <ContactModal />
      <CursorFX />
    </div>
  )
}
