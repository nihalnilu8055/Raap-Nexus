import { useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import SiteNav from '../components/layout/SiteNav'
import SiteFooter from '../components/layout/SiteFooter'
import ContactModal from '../components/ContactModal'
import { useI18n } from '../i18n'
import { DOCS, LEGAL_DRAFT, type LegalSlug } from './legalContent'

/** /:lang/privacy-policy | cookie-policy | terms | disclaimer (LEGAL-PAGES, removable). Draft text: kept out of search results until approved. */
export default function LegalPage({ slug }: { slug: LegalSlug }) {
  const { t, lang } = useI18n()
  const doc = DOCS[slug]
  useEffect(() => {
    // runs after the language provider has set the home-page head, then overrides it for this page
    const id = window.setTimeout(() => {
      document.title = `${doc.title} | RaapNexus`
      const origin = window.location.origin
      let c = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (c) c.href = `${origin}/${lang}/${slug}`
      let r = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
      if (LEGAL_DRAFT) { if (!r) { r = document.createElement('meta'); r.name = 'robots'; document.head.appendChild(r) } r.content = 'noindex, follow' }
      document.getElementById('ld-json')?.remove()
    }, 0)
    return () => { window.clearTimeout(id); document.head.querySelector('meta[name="robots"][content^="noindex"]')?.remove() }
  }, [doc, lang, slug])
  return (
    <div className="w-full overflow-x-clip bg-[#040a1c] text-slate-200">
      <a href="#legal-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-slate-900">{t('nav.skip')}</a>
      <SiteNav />
      <main id="legal-main" className="px-4 pb-20 pt-24 sm:px-6 sm:pt-28">
        <div className="mx-auto max-w-[1200px]">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-400">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to={`/${lang}/`} className="text-sky-400 underline underline-offset-2">{t('videos.back')}</Link></li>
              <li aria-hidden><ChevronRight size={14} className="rtl:-scale-x-100" /></li>
              <li aria-current="page" className="text-slate-200">{doc.title}</li>
            </ol>
          </nav>
          <h1 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">{doc.title}</h1>
          <p className="mt-3 max-w-[70ch] text-slate-300">{doc.intro}</p>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-slate-400"><span>Last updated: 20 November 2026</span></p>
          {LEGAL_DRAFT && <p role="note" className="my-5 max-w-[75ch] rounded-2xl border border-white/10 bg-[#0e1e44]/40 p-4 text-sm text-slate-300">This document is being finalised and may be updated.</p>}
          <div className="grid gap-7 lg:grid-cols-[260px_1fr] lg:items-start">
            <details open className="rounded-2xl border border-white/10 bg-[#0e1e44]/50 px-4 lg:sticky lg:top-24 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between font-display text-sm font-bold text-white lg:pointer-events-none">On this page <span aria-hidden>▾</span></summary>
              <ol className="grid gap-0.5 pb-3 ps-4 text-sm">
                {doc.sections.map((s, i) => <li key={s.h}><a href={`#s${i}`} className="inline-block min-h-[32px] py-1.5 text-slate-300 hover:text-sky-300 hover:underline">{s.h}</a></li>)}
              </ol>
            </details>
            <article className="min-w-0 [&_a]:break-words [&_li]:max-w-[75ch] [&_p]:max-w-[75ch] [&_p+p]:mt-2.5 [&_ul]:mt-2.5 [&_ul]:grid [&_ul]:list-disc [&_ul]:gap-1.5 [&_ul]:ps-5">
              {doc.sections.map((s, i) => (
                <section key={s.h} id={`s${i}`} tabIndex={-1} className="scroll-mt-24 border-t border-white/10 py-5 first:border-t-0 first:pt-0 text-slate-300">
                  <h2 className="mb-2.5 font-display text-xl font-bold text-white sm:text-2xl">{i + 1}. {s.h}</h2>
                  {s.body(lang)}
                </section>
              ))}
            </article>
          </div>
        </div>
      </main>
      <SiteFooter />
      <ContactModal />
    </div>
  )
}
