// PRICING-PAGE (removable): see src/pricing/README-REMOVE.md
import { useEffect, useState } from 'react'
import SiteNav from '../components/layout/SiteNav'
import SiteFooter from '../components/layout/SiteFooter'
import ContactModal from '../components/ContactModal'
import { useI18n } from '../i18n'
import { LANGS, SITE_URL, type Lang } from '../i18n/config'
import { applyHead } from '../i18n/seo'
import Hero from './Hero'
import Calculator from './Calculator'
import { AddOns, Approval, DbConnectors, Faq, FinalCta, FreeConnectors, FreePlan, Payments, Profiles, Scenarios, type Preset } from './Sections'
import { EMPTY, type Selection } from './data'
import './pricing.css'

export const PRICING_TITLE = 'Pricing | RaapNexus — Start Free, Pay Only for What You Need'
export const PRICING_DESC = 'RaapNexus pricing in USD: a free baseline with free connectors, add-ons, ERP and accounting software profiles, paid database connectors and a pricing calculator. Every purchase is reviewed and approved by Techlogica.'

const setMeta = (sel: string, make: () => HTMLElement, attrs: Record<string, string>) => {
  let el = document.head.querySelector<HTMLElement>(sel)
  if (!el) { el = make(); document.head.appendChild(el) }
  for (const k of Object.keys(attrs)) el.setAttribute(k, attrs[k])
}
const metaTag = (name: string, content: string, prop = false) =>
  setMeta(prop ? `meta[property="${name}"]` : `meta[name="${name}"]`, () => { const m = document.createElement('meta'); m.setAttribute(prop ? 'property' : 'name', name); return m }, { content })

/** Head tags for this page only (the global SEO file is untouched). On leaving, the shared applyHead() puts the home page's tags back. */
function usePricingHead(lang: Lang) {
  useEffect(() => {
    const apply = () => {
      const url = `${SITE_URL}/${lang}/pricing`
      document.title = PRICING_TITLE
      metaTag('description', PRICING_DESC); metaTag('og:title', PRICING_TITLE, true); metaTag('og:description', PRICING_DESC, true); metaTag('og:url', url, true)
      metaTag('twitter:title', PRICING_TITLE); metaTag('twitter:description', PRICING_DESC)
      setMeta('link[rel="canonical"]', () => { const l = document.createElement('link'); l.rel = 'canonical'; return l }, { href: url })
      document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((n) => n.remove())
      for (const l of [...LANGS.map((x) => x.code), 'x-default']) { const a = document.createElement('link'); a.rel = 'alternate'; a.hreflang = l; a.href = `${SITE_URL}/${l === 'x-default' ? 'en' : l}/pricing`; document.head.appendChild(a) }
    }
    apply(); const t = window.setTimeout(apply, 0) // after the shared provider has written its own head
    return () => { window.clearTimeout(t); applyHead(lang, 'home') }
  }, [lang])
}

/** PRICING-PAGE (removable). Same shell as every other page (SiteNav, SiteFooter, ContactModal). */
export default function PricingPage() {
  const { lang, t } = useI18n()
  const [sel, setSel] = useState<Selection>({ ...EMPTY })
  usePricingHead(lang)
  const load = (p: Preset) => setSel({ ...EMPTY, ...p, profiles: p.profiles ?? [], connectors: p.connectors ?? [] })
  return (
    <div className="px w-full overflow-x-clip bg-[#040a1c] text-slate-200">
      <a href="#pricing-hero" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-slate-900">{t('nav.skip')}</a>
      <SiteNav />
      <main>
        <Hero />
        <FreePlan />
        <FreeConnectors />
        <AddOns />
        <Profiles />
        <DbConnectors />
        <Payments />
        <Approval />
        <Calculator sel={sel} setSel={setSel} />
        <Scenarios onLoad={load} />
        <Faq />
        <FinalCta lang={lang} />
      </main>
      <SiteFooter />
      <ContactModal />
    </div>
  )
}
