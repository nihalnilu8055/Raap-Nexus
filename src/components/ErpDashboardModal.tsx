import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Loader2, RefreshCw, X } from 'lucide-react'
import { useI18n } from '../i18n'
import { EASE } from '../lib/motion'
import { ROUTES } from '../config/routes'

type Status = 'loading' | 'ready' | 'error'
const LOAD_TIMEOUT = 20000

/**
 * The ERP dashboard, shown inside the page. The iframe is mounted only while the panel is open and gets a fresh `key` on every open, so each
 * opening loads the dashboard document again and its own scripts run again (it is same-origin: /erp/dashboard.html). While it is open it is never
 * reloaded. Nothing is calculated here: all figures come from the dashboard's own code.
 */
export default function ErpDashboardModal() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [run, setRun] = useState(0)
  const [status, setStatus] = useState<Status>('loading')
  const panel = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  const back = useRef<HTMLElement | null>(null)

  const close = useCallback(() => setOpen(false), [])
  const load = useCallback(() => { setStatus('loading'); setRun((n) => n + 1) }, [])

  useEffect(() => {
    const h = () => { back.current = document.activeElement as HTMLElement; load(); setOpen(true) }
    window.addEventListener('open-erp-dashboard', h)
    return () => window.removeEventListener('open-erp-dashboard', h)
  }, [load])

  // modal behaviour: scroll lock without moving the page, Esc, focus trap on the panel's own controls, focus return
  useEffect(() => {
    if (!open) return
    const sbw = window.innerWidth - document.documentElement.clientWidth
    const prevO = document.body.style.overflow, prevP = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'; if (sbw > 0) document.body.style.paddingRight = `${sbw}px`
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); close() } }
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = prevO; document.body.style.paddingRight = prevP; back.current?.focus?.() }
  }, [open, close])

  // a frame that never finishes (network, server down) must not spin forever
  useEffect(() => {
    if (!open || status !== 'loading') return
    const tm = window.setTimeout(() => setStatus('error'), LOAD_TIMEOUT)
    return () => window.clearTimeout(tm)
  }, [open, status, run])

  const onLoad = () => {
    // same-origin, so the loaded document can be checked: an error page / missing file has no dashboard in it
    try {
      const d = frame.current?.contentDocument
      if (!d || !d.querySelector('.topbar, .sidebar, main')) { setStatus('error'); return }
    } catch { /* cross-origin (should not happen): trust the load */ }
    setStatus('ready')
    // Esc must also work while the dashboard has focus (key events inside the frame do not reach this page). The document is new on every load, so no listener is ever duplicated.
    try { frame.current?.contentDocument?.addEventListener('keydown', (e) => { if (e.key === 'Escape') close() }) } catch { /* ignore */ }
    frame.current?.focus()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex flex-col bg-[#040a1c]/80 p-0 backdrop-blur-sm sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <motion.div ref={panel} role="dialog" aria-modal="true" aria-label={t('erp.title')} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.35, ease: EASE }}
            className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-hidden bg-white shadow-[0_40px_120px_-30px_rgba(10,25,90,.8)] sm:rounded-2xl">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 py-1.5 pe-1.5 ps-4">
              <p className="truncate font-display text-sm font-bold text-slate-800">{t('erp.title')}</p>
              <button type="button" onClick={close} autoFocus aria-label={t('erp.close')} className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue"><X size={20} aria-hidden /></button>
            </div>
            <div className="relative min-h-0 flex-1 bg-[#faf9f5]">
              <iframe key={run} ref={frame} src={ROUTES.ERP_STANDALONE} title={t('erp.title')} onLoad={onLoad} onError={() => setStatus('error')}
                sandbox="allow-same-origin allow-scripts allow-forms" referrerPolicy="same-origin"
                className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-300 ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`} />
              {status === 'loading' && (
                <div role="status" className="absolute inset-0 grid place-items-center text-slate-600"><span className="flex items-center gap-3 font-semibold"><Loader2 size={22} className="animate-spin motion-reduce:animate-none" aria-hidden />{t('erp.loading')}</span></div>
              )}
              {status === 'error' && (
                <div role="alert" className="absolute inset-0 grid place-items-center p-6 text-center">
                  <div className="max-w-sm">
                    <AlertTriangle size={30} className="mx-auto text-amber-500" aria-hidden />
                    <p className="mt-3 font-semibold text-slate-900">{t('erp.error')}</p>
                    <button type="button" onClick={load} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-electric-blue px-5 font-display text-sm font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"><RefreshCw size={16} aria-hidden />{t('erp.retry')}</button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
