import { Reveal } from '../ui/Reveal'
import Logo from '../Logo'
import { ERP_URL } from '../../config/routes'
import { useI18n } from '../../i18n'

const NAV = [
  { label: 'nav.platform', id: 'platform' },
  { label: 'nav.services', id: 'services' },
  { label: 'nav.ai', id: 'ai' },
  { label: 'nav.about', id: 'about' },
]
const SERVICES = [
  { label: 'services.items.0.name', id: 'tax' },
  { label: 'services.items.1.name', id: 'audit' },
  { label: 'services.items.2.name', id: 'analysis' },
  { label: 'services.items.3.name', id: 'business' },
]
const link = 'group relative inline-block py-1 text-sm text-slate-300 transition-colors hover:text-white focus:outline-none focus-visible:text-white focus-visible:underline'
const bar = 'absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-sky-400 transition-transform duration-300 group-hover:scale-x-100'

export default function SiteFooter() {
  const { t } = useI18n()
  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const goService = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    window.dispatchEvent(new CustomEvent('select-service', { detail: id }))
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return (
    <footer className="bg-[#040a1c] px-6 pb-8 pt-16 text-slate-400">
      <div className="mx-auto max-w-[1200px]">
        <Reveal><div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <span className="inline-block rounded-full bg-white px-4 py-2"><Logo size="md" /></span>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-300">{t('footer.desc')}</p>
          </div>
          <nav aria-label={t('footer.explore')}>
            <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t('footer.explore')}</h2>
            <ul className="mt-4">
              {NAV.map((l) => <li key={l.id}><a href={`#${l.id}`} onClick={go(l.id)} className={link}>{t(l.label)}<span className={bar} /></a></li>)}
            </ul>
          </nav>
          <nav aria-label={t('footer.servicesAria')}>
            <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t('footer.services')}</h2>
            <ul className="mt-4">
              {SERVICES.map((l) => <li key={l.id}><a href="#services" onClick={goService(l.id)} className={link}>{t(l.label)}<span className={bar} /></a></li>)}
            </ul>
          </nav>
          <div>
            <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t('footer.erp')}</h2>
            <ul className="mt-4"><li><a href={ERP_URL} className={link}>{t('nav.cta')}<span className={bar} /></a></li></ul>
          </div>
        </div></Reveal>
        <Reveal delay={0.15}><div className="mt-12 border-t border-white/10 pt-6 text-center text-sm sm:text-start">
          <p dir="ltr" className="text-balance"><span>© 2026 RaapNexus. All rights reserved.</span> <span className="text-slate-500">|</span> <span className="text-slate-400">Designed &amp; Developed by Techlogica.</span></p>
        </div></Reveal>
      </div>
    </footer>
  )
}
