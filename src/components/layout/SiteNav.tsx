import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Logo from '../Logo'
import CtaButton from '../ui/CtaButton'
import { EASE } from '../../lib/motion'

const LINKS = [
  { label: 'Platform', id: 'platform', also: [] as string[] },
  { label: 'Financial Services', id: 'services', also: ['intelligence', 'audit'] },
  { label: 'AI Intelligence', id: 'ai', also: [] as string[] },
  { label: 'About', id: 'about', also: [] as string[] },
]

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('')
  const toggle = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-5 sm:pt-4">
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        aria-label="Primary"
        className={`relative flex w-full max-w-[1040px] items-center justify-between rounded-full border px-3 py-1 pl-4 sm:pl-5 backdrop-blur-xl transition-all duration-500 ${scrolled ? 'border-slate-200/80 bg-white/[.98] shadow-[0_10px_40px_-12px_rgba(15,23,42,.35)]' : 'border-white/30 bg-white/[.98] shadow-[0_10px_40px_-18px_rgba(15,23,42,.5)]'}`}
      >
        <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue" aria-label="RaapNexus home">
          <Logo size="sm" />
        </a>
        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} onClick={go(l.id)} aria-current={current === l.id ? 'true' : undefined}
                className={`relative rounded-full px-4 py-2 font-display text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue ${current === l.id ? 'text-electric-blue' : 'text-slate-600 hover:text-slate-900'}`}>
                {l.label}
                {current === l.id && <motion.span layoutId="navdot" className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-electric-blue" />}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <div className="hidden lg:block"><CtaButton label="Explore Platform" variant="blue" small /></div>
          <button ref={toggle} type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'}
            className="grid h-10 w-10 place-items-center rounded-full text-slate-800 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue lg:hidden">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div id="mobile-menu" initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.25, ease: EASE }}
              className="absolute inset-x-0 top-[calc(100%+10px)] rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur-xl lg:hidden">
              <ul className="flex flex-col">
                {LINKS.map((l) => (
                  <li key={l.id}><a href={`#${l.id}`} onClick={go(l.id)} className="block rounded-2xl px-4 py-3 font-display text-lg font-bold text-slate-900 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue">{l.label}</a></li>
                ))}
              </ul>
              <div className="mt-2 px-1 pb-1"><CtaButton label="Explore Platform" variant="blue" /></div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  )
}
