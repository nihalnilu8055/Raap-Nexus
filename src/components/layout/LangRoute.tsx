import { lazy, Suspense, useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { I18nProvider, DEFAULT_LANG, isLang } from '../../i18n'
import { browserLang } from '../../i18n/detect'
import { store } from '../../i18n/storage'
import Home from '../../pages/Home'
const VideoLibrary = lazy(() => import('../../pages/VideoLibrary')) // the library is a separate route chunk: it is not downloaded for the home page
import NotFound from '../../pages/NotFound'
const LegalPage = lazy(() => import('../../pages/LegalPage')) // LEGAL-PAGES (removable): own chunk, not downloaded for the home page
const PricingPage = lazy(() => import('../../pricing/PricingPage')) // PRICING-PAGE (removable): own chunk, not downloaded for the home page
const LEGAL = ['privacy-policy', 'cookie-policy', 'terms', 'disclaimer'] as const
const HelpCenter = lazy(() => import('../../help/HelpCenter')) // the portal (styles, behaviour) is its own chunk: the home page never downloads it

export function RootRedirect() {
  // explicit > saved > browser language > English. Country is only ever a (dismissable) suggestion.
  const saved = store.get('lang')
  const target = isLang(saved) ? saved : browserLang() ?? DEFAULT_LANG
  return <Navigate to={`/${target}/${window.location.hash}`} replace />
}

let navigated = false // true once the first page has mounted

export default function LangRoute() {
  const { lang, '*': rest = '' } = useParams()
  // soft fade only when moving between pages (never on first load, so it cannot delay the first paint); opacity only, so fixed layers keep working
  const animate = navigated
  useEffect(() => { navigated = true }, [])
  if (lang === 'hi') return <Navigate to="/en/" replace /> // Hindi was retired; keep old links alive
  if (!isLang(lang)) return <NotFound />
  const seg = rest.split('/').filter(Boolean)
  // Help Center: /:lang/help and /:lang/help/:article (own page chrome, so it renders outside the site's I18nProvider)
  if (seg[0] === 'help') {
    return seg.length > 2 ? <NotFound /> : <Suspense fallback={<div className="min-h-screen bg-[#f5f7fb]" />}><HelpCenter lang={lang} slug={seg[1]} /></Suspense>
  }
  if (seg[0] === 'demo-videos' && seg.length === 1) return <Navigate to={`/${lang}/videos`} replace /> // old URL kept alive (servers send a real 301 first)
  if (seg.length === 1 && (LEGAL as readonly string[]).includes(seg[0])) {
    return <I18nProvider lang={lang}><Suspense fallback={<div className="min-h-screen bg-[#040a1c]" />}><LegalPage slug={seg[0] as (typeof LEGAL)[number]} /></Suspense></I18nProvider>
  }
  // PRICING-PAGE (removable) — start
  if (seg[0] === 'pricing' && seg.length === 1) {
    return <I18nProvider lang={lang}><motion.div key="pricing" initial={animate ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.35, ease: 'easeOut' }}><Suspense fallback={<div className="min-h-screen bg-[#040a1c]" />}><PricingPage /></Suspense></motion.div></I18nProvider>
  }
  // PRICING-PAGE (removable) — end
  const videos = seg[0] === 'videos' && seg.length === 1
  return (
    <I18nProvider lang={lang}>
      <motion.div key={videos ? 'videos' : 'home'} initial={animate ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
        {videos ? <Suspense fallback={<div className="min-h-screen bg-[#040a1c]" />}><VideoLibrary /></Suspense> : <Home />}
      </motion.div>
    </I18nProvider>
  )
}
