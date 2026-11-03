import SiteNav from '../components/layout/SiteNav'
import SiteFooter from '../components/layout/SiteFooter'
import Bridge from '../components/ui/Bridge'
import Hero from '../sections/Hero'
import Platform from '../sections/Platform'
import Services from '../sections/Services'
import FinIntel from '../sections/FinIntel'
import AuditSection from '../sections/AuditSection'
import AiFinance from '../sections/AiFinance'
import Deployment from '../sections/Deployment'
import VideoGallery from '../sections/VideoGallery'
import FinalCta from '../sections/FinalCta'
import CursorFX from '../components/CursorFX'
import ContactModal from '../components/ContactModal'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useI18n } from '../i18n'

/** Story: hero → dashboard → four services → financial intelligence → audit & verification → AI → deployment → demo videos → CTA. */
export default function Home() {
  const { t } = useI18n()
  const { hash } = useLocation()
  // arriving from another page (e.g. the demo library) with #section: scroll once the sections have mounted
  useEffect(() => {
    if (!hash) return
    const id = decodeURIComponent(hash.slice(1)); const tm = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' }), 350)
    return () => window.clearTimeout(tm)
  }, [hash])
  return (
    <div className="w-full overflow-x-clip bg-[#040a1c] text-slate-900">
      <a href="#platform" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">{t('nav.skip')}</a>
      <SiteNav />
      <main>
        <Hero />
        <Platform />
        <Services />
        <Bridge from="#e8f0ff" to="#040a1c" />
        <FinIntel />
        <AuditSection />
        <Bridge from="#031018" to="#050824" stroke="#8b7bff" />
        <AiFinance />
        <Deployment />
        <VideoGallery />
        <FinalCta />
      </main>
      <SiteFooter />
      <ContactModal />
      <CursorFX />
    </div>
  )
}
