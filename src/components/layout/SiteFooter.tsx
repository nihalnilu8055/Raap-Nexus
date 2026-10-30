import Logo from '../Logo'
import { ERP_URL } from '../../config/routes'

const NAV = [
  { label: 'Platform', id: 'platform' },
  { label: 'Financial Services', id: 'services' },
  { label: 'AI Intelligence', id: 'ai' },
  { label: 'About', id: 'about' },
]
const SERVICES = [
  { label: 'Tax Auditing', id: 'tax' },
  { label: 'Financial Auditing', id: 'audit' },
  { label: 'Financial Analysis', id: 'analysis' },
  { label: 'Business Analysis', id: 'business' },
]
const link = 'group relative inline-block py-1 text-sm text-slate-300 transition-colors hover:text-white focus:outline-none focus-visible:text-white focus-visible:underline'
const bar = 'absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-sky-400 transition-transform duration-300 group-hover:scale-x-100'

export default function SiteFooter() {
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
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <span className="inline-block rounded-full bg-white px-4 py-2"><Logo size="md" /></span>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-300">The Ultimate Finance Platform.</p>
          </div>
          <nav aria-label="Footer">
            <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Explore</h2>
            <ul className="mt-4">
              {NAV.map((l) => <li key={l.id}><a href={`#${l.id}`} onClick={go(l.id)} className={link}>{l.label}<span className={bar} /></a></li>)}
            </ul>
          </nav>
          <nav aria-label="Financial services">
            <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Services</h2>
            <ul className="mt-4">
              {SERVICES.map((l) => <li key={l.id}><a href="#services" onClick={goService(l.id)} className={link}>{l.label}<span className={bar} /></a></li>)}
            </ul>
          </nav>
          <div>
            <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-slate-500">ERP</h2>
            <ul className="mt-4"><li><a href={ERP_URL} className={link}>Explore Platform<span className={bar} /></a></li></ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-sm">
          <p>© {new Date().getFullYear()} RaapNexus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
