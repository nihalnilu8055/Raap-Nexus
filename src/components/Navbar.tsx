import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Play, ExternalLink, ArrowRight } from 'lucide-react'
import Logo from './Logo'
import { ROUTES } from '../config/routes'

const navLinks = [
  { label: 'Interactive Demo', href: ROUTES.SECTIONS.INTERACTIVE_DEMO },
  { label: 'Application Suite', href: ROUTES.SECTIONS.APPLICATION_SUITE },
  { label: 'Multi-LLM & Sovereignty', href: ROUTES.SECTIONS.SOVEREIGNTY },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24)

      // Determine active section
      const sections = ['interactive-demo', 'application-suite', 'ai-sovereignty']
      const scrollPos = window.scrollY + 200

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(`#${sectionId}`)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  const handleNavClick = (href: string) => {
    setMobileOpen(false)
    if (href.startsWith('#')) {
      const el = document.querySelector(href)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs py-2.5'
            : 'bg-transparent py-4 sm:py-5'
        }`}
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group flex items-center focus:outline-none" aria-label="RaapNexus Homepage">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 border border-slate-200/90 px-3 py-1.5 rounded-full backdrop-blur-md shadow-2xs">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href
              return (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 focus:outline-none ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {link.label}
                </button>
              )
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to={ROUTES.ERP_SANDBOX}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Sandbox Workstation
            </Link>

            <a
              href={ROUTES.ERP_STANDALONE}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs py-2.5 px-4.5 flex items-center gap-1.5 font-bold tracking-wide uppercase shadow-blue-glow"
              title="Launch standalone authentic ERP application dashboard"
            >
              <Play size={13} className="fill-white" />
              <span>Live ERP Demo</span>
              <ExternalLink size={12} className="opacity-80" />
            </a>
          </div>

          {/* Mobile hamburger menu button */}
          <div className="flex sm:hidden items-center gap-2">
            <a
              href={ROUTES.ERP_STANDALONE}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-[11px] py-1.5 px-3 flex items-center gap-1 font-bold uppercase"
            >
              <Play size={10} className="fill-white" /> Live ERP
            </a>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              className="relative flex flex-col justify-between p-6 pt-24 h-full w-4/5 max-w-xs bg-white border-l border-slate-200 ml-auto shadow-2xl overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              <div className="flex flex-col gap-2">
                <div className="mb-4 pb-3 border-b border-slate-100">
                  <Logo size="sm" />
                </div>
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.href)}
                    className="flex items-center justify-between text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <span>{link.label}</span>
                    <ArrowRight size={14} className="text-slate-400" />
                  </button>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
                <a
                  href={ROUTES.ERP_STANDALONE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full justify-center text-xs py-3 uppercase tracking-wider font-bold"
                >
                  <Play size={13} className="fill-white" /> Open Standalone ERP
                </a>
                <Link
                  to={ROUTES.ERP_SANDBOX}
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary w-full justify-center text-xs py-2.5 uppercase tracking-wider font-bold"
                >
                  Sandbox Workstation
                </Link>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
