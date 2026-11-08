import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from '../Logo'
import { Mail } from 'lucide-react'
import CtaButton from '../ui/CtaButton'
import { openContact } from '../../lib/contact'
import { EASE } from '../../lib/motion'
import { useI18n } from '../../i18n'
import { LanguageSelector } from './Selectors'

const LINKS = [
  { label: 'nav.platform', id: 'platform', also: [] as string[] },
  { label: 'nav.services', id: 'services', also: ['intelligence', 'audit'] },
  { label: 'nav.ai', id: 'ai', also: [] as string[] },
  { label: 'nav.about', id: 'about', also: [] as string[] },
]

export default function SiteNav() {
  const { t, lang } = useI18n()
  const loc = useLocation()
  const nav = useNavigate()
  const homePath = `/${lang}`
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('')
  const toggle = useRef<HTMLButtonElement>(null)

  // single rAF-throttled scroll handler: compact state with hysteresis (like the reference, the bar never hides)
  useEffect(() => {
    let raf = 0
    const run = () => { const y = Math.max(0, window.scrollY); setScrolled((s) => (s ? y > 16 : y > 56)) }
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(run) }
    run()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll) }
  }, [])
  // a route change (e.g. logo from another language path) always starts at the top
  useEffect(() => { if (!window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior }) }, [loc.pathname])
  const goHome = (e: React.MouseEvent) => {
    setOpen(false)
    if (loc.pathname.replace(/\/+$/, '') === homePath) {
      e.preventDefault()
      if (window.location.hash) history.replaceState(null, '', homePath)
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    }
  }

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setCurrent(LINKS.find((l) => l.id === e.target.id || l.also.includes(e.target.id))?.id ?? '')),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    LINKS.forEach((l) => [l.id, ...l.also].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el) }))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); toggle.current?.focus() } }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open])

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    const el = document.getElementById(id)
    if (!el) { nav(`/${lang}/#${id}`); return } // on another page (e.g. the demo library): go home, then to the section
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
    // the page above the target can still change height while the smooth scroll runs (pinned sections refresh, lazy media), which leaves the
    // scroll short: after it settles, keep correcting until the section sits exactly at the top (stops on any user scroll input or after 3s)
    let stop = false
    const cancel = () => { stop = true }
    window.addEventListener('wheel', cancel, { once: true, passive: true }); window.addEventListener('touchstart', cancel, { once: true, passive: true }); window.addEventListener('keydown', cancel, { once: true })
    const t0 = performance.now(); let ok = 0
    const tick = () => {
      if (stop || performance.now() - t0 > 3500) return
      if (Math.abs(el.getBoundingClientRect().top) > 4) { ok = 0; if (performance.now() - t0 > 900) el.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' }) } else ok++
      if (ok < 4) window.setTimeout(tick, 150)
    }
    window.setTimeout(tick, 700)
  }

  return (
    <header className={`fixed inset-x-0 top-0 z-50 flex justify-center px-3 transition-[padding] duration-500 ease-[cubic-bezier(.22,1,.36,1)] sm:px-5 ${scrolled ? 'pt-2 sm:pt-3' : 'pt-3 sm:pt-5'}`}>
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        aria-label={t('nav.primary')}
        className={`relative flex w-full items-center justify-between rounded-full border px-3 ps-4 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] sm:ps-5 ${scrolled ? 'max-w-[1120px] border-white/10 bg-[#0a162e]/90 py-[3px] shadow-[0_18px_50px_-16px_rgba(0,0,0,.6)] backdrop-saturate-150' : 'max-w-[1240px] border-white/10 bg-[#0a162e]/[.97] py-1 shadow-[0_10px_40px_-18px_rgba(0,0,0,.6)]'}`}
      >
        <Link to={homePath} onClick={goHome} className="flex items-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue" aria-label={t('nav.home')}>
          <span className={`flex items-center origin-left transition-transform duration-500 rtl:origin-right ${scrolled ? 'scale-[.86]' : 'scale-100'}`}><Logo size="sm" surface="header" /></span>
        </Link>
        <ul className="hidden items-center gap-0 xl:flex">
          {LINKS.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} onClick={go(l.id)} aria-current={current === l.id ? 'true' : undefined}
                className={`relative rounded-full px-3 py-2 transition-[background-color,color,transform] duration-200 hover:bg-electric-blue/10 active:scale-95 font-display text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue ${current === l.id ? 'text-sky-300' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
                {t(l.label)}
                {current === l.id && <motion.span layoutId="navdot" className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-electric-blue" />}
              </a>
            </li>
          ))}
          <li>
            <Link to={`/${lang}/help`} className="relative rounded-full px-3 py-2 transition-[background-color,color,transform] duration-200 hover:bg-electric-blue/10 active:scale-95 font-display text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue ${current === l.id ? 'text-sky-300' : 'text-slate-300 hover:bg-white/10 hover:text-white'} text-slate-300 hover:bg-white/10 hover:text-white">{t('nav.help')}</Link>
          </li>
        </ul>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 md:flex"><LanguageSelector tone="dark" /></div>
          <div className="hidden xl:block"><CtaButton label={t('nav.contact')} variant="blue" small icon={Mail} onClick={openContact} /></div>
          <button ref={toggle} type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? t('nav.menuClose') : t('nav.menuOpen')}
            className="grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue xl:hidden">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div id="mobile-menu" initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.25, ease: EASE }}
              className="absolute inset-x-0 top-[calc(100%+10px)] rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl xl:hidden">
              <ul className="flex flex-col">
                {LINKS.map((l) => (
                  <li key={l.id}><a href={`#${l.id}`} onClick={go(l.id)} className="block rounded-2xl px-4 py-3 font-display text-lg font-bold text-slate-900 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue">{t(l.label)}</a></li>
                ))}
                <li><Link to={`/${lang}/help`} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 font-display text-lg font-bold text-slate-900 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue">{t('nav.help')}</Link></li>
              </ul>
              <div className="mt-2 grid gap-2 px-1 md:hidden"><LanguageSelector full /></div>
              <div className="mt-2 px-1 pb-1"><CtaButton label={t('nav.contact')} variant="blue" icon={Mail} onClick={() => { setOpen(false); openContact() }} /></div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  )
}
