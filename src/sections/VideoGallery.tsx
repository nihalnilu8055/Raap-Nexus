import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Reveal } from '../components/ui/Reveal'
import LocalVideoPlayer from '../components/video/LocalVideoPlayer'
import ComingSoon from '../components/video/ComingSoon'
import { LOCAL_DEMO_VIDEO } from '../data/localVideo'
import { useI18n } from '../i18n'

/**
 * Landing section: the first real RaapNexus demo video (local file, portrait) as the single featured video, plus one button.
 * The button opens the Coming Soon experience in a modal: more videos are on the way. The /:lang/demo-videos library route is untouched.
 */
export default function VideoGallery() {
  const { t, lang } = useI18n()
  const [open, setOpen] = useState(false)
  const reduced = !!useReducedMotion()
  const opener = useRef<HTMLElement | null>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  // modal behaviour: lock scroll without moving the page, Esc closes, Tab stays inside, focus returns to the button
  useEffect(() => {
    if (!open) return
    const b = document.body, sbw = window.innerWidth - document.documentElement.clientWidth
    const po = b.style.overflow, pp = b.style.paddingRight
    b.style.overflow = 'hidden'; if (sbw > 0) b.style.paddingRight = `${sbw}px`
    closeBtn.current?.focus({ preventScroll: true })
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close() }
      else if (e.key === 'Tab') { e.preventDefault(); closeBtn.current?.focus({ preventScroll: true }) } // the close button is the only control
    }
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('keydown', key); b.style.overflow = po; b.style.paddingRight = pp; opener.current?.focus({ preventScroll: true }) }
  }, [open, close])
  // placeholder anchors (href="#") must never jump the page to the top
  const guard = (e: React.MouseEvent) => { if ((e.target as HTMLElement).closest('a[href="#"]')) e.preventDefault() }
  return (
    <section id="demo-videos" aria-labelledby="vg-h" onClick={guard} className="relative overflow-hidden bg-[#040a1c] px-6 py-24 sm:py-32">
      {/* quiet animated backdrop: drifting navy/blue light + slow ERP data-flow lines (transform/opacity only; static for reduced motion) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="vg-blob absolute -start-32 top-10 h-[460px] w-[460px] rounded-full bg-blue-600/25 blur-[120px]" />
        <div className="vg-blob vg-blob-b absolute -end-24 bottom-0 h-[420px] w-[420px] rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="vg-flow absolute inset-x-0 top-[34%] h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />
        <div className="vg-flow vg-flow-b absolute inset-x-0 top-[66%] h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
      </div>
      <div className="relative mx-auto max-w-[1200px]">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-20">
          <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-start">
            <Reveal><p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300">{t('videos.frameLabel')}</p></Reveal>
            <Reveal delay={0.08}><h2 id="vg-h" className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">{t('videos.heading')}</h2></Reveal>
            <Reveal delay={0.16}><p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">{t('videos.text')}</p></Reveal>
          </div>
          <Reveal variant="depth" delay={0.12} className="w-full lg:w-[min(46vw,430px)]"><LocalVideoPlayer video={LOCAL_DEMO_VIDEO} title={t('videos.frameLabel')} /></Reveal>
        </div>
        <Reveal delay={0.2} className="mt-14 flex justify-center">
          <Link to={`/${lang}/demo-videos`} onClick={(e) => { e.preventDefault(); opener.current = e.currentTarget; setOpen(true) }} className="group inline-flex min-h-12 items-center gap-2 rounded-full border border-sky-400/40 bg-sky-400/10 px-7 py-3 font-display text-base font-bold text-white transition duration-300 hover:border-sky-300 hover:bg-sky-400/20 hover:shadow-[0_12px_36px_-12px_rgba(56,189,248,.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
            {t('videos.cta')}
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" aria-hidden />
          </Link>
        </Reveal>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div ref={dialog} role="dialog" aria-modal="true" aria-label={t('videos.soon.title')}
            className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-[#020611]/[0.97] px-4 py-16"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.35 }}
            onClick={(e) => { if (e.target === e.currentTarget || !(e.target as HTMLElement).closest('.cs-stage,button')) close() }}>
            <button ref={closeBtn} type="button" onClick={close} aria-label={t('contact.close')}
              className="absolute end-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-sky-400/40 bg-sky-400/10 text-white transition hover:border-sky-300 hover:bg-sky-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:end-6 sm:top-6">
              <X size={20} aria-hidden />
            </button>
            <motion.div className="w-full max-w-[860px]" initial={reduced ? false : { opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }} transition={{ duration: reduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}>
              <div className="mb-6 text-center"><p className="cs-eyebrow"><i aria-hidden />{t('videos.soon.label')}</p></div>
              <ComingSoon headingId="vg-modal-h" />
              <p className="mx-auto mt-8 max-w-xl text-center text-base leading-relaxed text-slate-300 sm:text-lg">{t('videos.soon.text')}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
