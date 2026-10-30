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
import FinalCta from '../sections/FinalCta'

/** Story: hero → dashboard → four services → financial intelligence → audit & verification → AI → CTA. */
export default function Home() {
  return (
    <div className="w-full overflow-x-clip bg-[#040a1c] text-slate-900">
      <a href="#platform" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
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
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  )
}
