import { Instagram, Linkedin } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Reveal } from '../ui/Reveal'
import Logo from '../Logo'
import { ERP_URL } from '../../config/routes'
import { openContact } from '../../lib/contact'
import { openCookieSettings } from '../../lib/consent'
import { erpLinkClick } from '../../lib/erpDashboard'
import { CONTACT_EMAIL, CONTACT_MAILTO } from '../../config/contact'
import { useI18n } from '../../i18n'

const SERVICES = [
  { label: 'services.items.0.name', id: 'tax' },
  { label: 'services.items.1.name', id: 'audit' },
  { label: 'services.items.2.name', id: 'analysis' },
  { label: 'services.items.3.name', id: 'business' },
]
const link = 'group relative inline-block py-2 text-sm text-slate-300 transition-colors hover:text-white focus:outline-none focus-visible:text-white focus-visible:underline'
// Official pages are not available yet: both links are placeholders ('#') until real URLs are provided.
const SOCIALS = [
  { label: 'Instagram', href: '#', Icon: Instagram, hover: 'hover:border-[#E4405F]/60 hover:bg-[#E4405F]/15 hover:text-[#ff6b8a] focus-visible:text-[#ff6b8a]' },
  { label: 'LinkedIn', href: '#', Icon: Linkedin, hover: 'hover:border-[#4aa3ff]/60 hover:bg-[#0A66C2]/25 hover:text-[#6bb6ff] focus-visible:text-[#6bb6ff]' },
]
const bar = 'absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-sky-400 transition-transform duration-300 group-hover:scale-x-100'

export default function SiteFooter() {
  const { t, lang } = useI18n()
  const nav = useNavigate()
  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) { nav(`/${lang}/#${id}`); return } // not on the home page (e.g. demo library)
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const goService = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (!document.getElementById('services')) { nav(`/${lang}/#services`); return }
    window.dispatchEvent(new CustomEvent('select-service', { detail: id }))
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return (
    <footer className="bg-[#040a1c] px-6 pb-8 pt-16 text-slate-400">
      <div className="mx-auto max-w-[1200px]">
        <Reveal><div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-[1.5fr_1fr_1.2fr_1fr_1.2fr]">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Logo size="md" surface="dark" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-300">{t('footer.desc')}</p>
          </div>
          <nav aria-label="Company" className="min-w-0">
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Company</p>
            <ul className="mt-4">
              <li><a href="#about" onClick={go('about')} className={link}>{t('nav.about')}<span className={bar} /></a></li>
              <li><button type="button" onClick={openContact} className={`${link} text-start`}>{t('nav.contact')}<span className={bar} /></button></li>
              <li><Link to={`/${lang}/videos`} className={link}>Demo Videos<span className={bar} /></Link></li>
            </ul>
          </nav>
          <nav aria-label="Platform" className="min-w-0">
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Platform</p>
            <ul className="mt-4">
              <li><a href="#platform" onClick={go('platform')} className={link}>Financial Intelligence<span className={bar} /></a></li>
              {SERVICES.map((l) => <li key={l.id}><a href="#services" onClick={goService(l.id)} className={link}>{t(l.label)}<span className={bar} /></a></li>)}
              <li><a href="#ai" onClick={go('ai')} className={link}>AI Agents<span className={bar} /></a></li>
              <li><a href={ERP_URL} target="_blank" rel="noopener noreferrer" onClick={erpLinkClick} className={link}>{t('nav.cta')}<span className={bar} /></a></li>
            </ul>
          </nav>
          <nav aria-label="Resources" className="min-w-0">
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Resources</p>
            <ul className="mt-4">
              <li><Link to={`/${lang}/help`} className={link}>Documentation<span className={bar} /></Link></li>
              <li><Link to={`/${lang}/help/faq`} className={link}>FAQs<span className={bar} /></Link></li>
              <li><Link to={`/${lang}/privacy-policy`} className={link}>Privacy Policy<span className={bar} /></Link></li>
              <li><Link to={`/${lang}/cookie-policy`} className={link}>Cookie Policy<span className={bar} /></Link></li>
              <li><Link to={`/${lang}/terms`} className={link}>Terms &amp; Conditions<span className={bar} /></Link></li>
              <li><Link to={`/${lang}/disclaimer`} className={link}>Disclaimer<span className={bar} /></Link></li>
            </ul>
          </nav>
          <div className="min-w-0">
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t('nav.contact')}</p>
            <ul className="mt-4">
              <li><a href={CONTACT_MAILTO} dir="ltr" className={`${link} break-all`}>{CONTACT_EMAIL}<span className={bar} /></a></li>
            </ul>
          </div>
        </div></Reveal>
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-white/10 pt-6 text-sm sm:flex-row sm:justify-between">
          <p dir="ltr" className="text-balance text-center sm:text-start"><span>© {new Date().getFullYear()} RaapNexus. All rights reserved.</span> <span className="text-slate-500 max-sm:hidden">|</span> <span className="text-slate-400 max-sm:block">Designed &amp; Developed by <a href="https://techlogica.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-200 underline-offset-4 transition-colors hover:text-sky-300 hover:underline focus:outline-none focus-visible:text-sky-300 focus-visible:underline">Techlogica</a>.</span></p>
          <button type="button" onClick={openCookieSettings} className="min-h-[40px] px-2 text-sm font-semibold text-slate-200 underline underline-offset-4 hover:text-sky-300 focus:outline-none focus-visible:text-sky-300">Cookie Settings</button>
          <ul className="flex items-center gap-3">
            {SOCIALS.map(({ label, href, Icon, hover }) => (
              <li key={label}>
                <a href={href} aria-label={label} title={label} className={`grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition duration-300 hover:-translate-y-0.5 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 motion-reduce:transition-colors motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 ${hover}`}>
                  <Icon size={18} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
