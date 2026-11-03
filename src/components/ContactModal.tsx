import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Loader2, Send, X } from 'lucide-react'
import { useI18n } from '../i18n'
import { EASE } from '../lib/motion'
import { trackLead } from '../lib/analytics'
import { CONTACT_EMAIL, CONTACT_MAILTO } from '../config/contact'
import { LIMITS, validate, type ContactValues } from '../lib/contact'

const EMPTY: ContactValues = { name: '', company: '', email: '', phone: '', country: '', subject: '', message: '', consent: false }
type Status = 'idle' | 'sending' | 'success' | 'error'
const field = 'mt-1.5 block w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue'

export default function ContactModal() {
  const { t, lang } = useI18n()
  const [open, setOpen] = useState(false)
  const [v, setV] = useState<ContactValues>(EMPTY)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [serverMsg, setServerMsg] = useState('')
  const [hp, setHp] = useState('') // honeypot: real users never see or fill this
  const opened = useRef(0)
  const lock = useRef(false) // blocks double submission even before React re-renders
  const panel = useRef<HTMLDivElement>(null)
  const back = useRef<HTMLElement | null>(null)
  const uid = useId()
  const errors = validate(v)
  const show = (k: keyof ContactValues) => (touched[k] || touched.__all) && errors[k]

  const close = useCallback(() => { setOpen(false) }, [])
  useEffect(() => {
    const h = () => { back.current = document.activeElement as HTMLElement; opened.current = Date.now(); setStatus('idle'); setServerMsg(''); setTouched({}); setOpen(true) }
    window.addEventListener('open-contact', h)
    return () => window.removeEventListener('open-contact', h)
  }, [])

  // modal behaviour: scroll lock without moving the page, focus trap, Esc, focus return
  useEffect(() => {
    if (!open) return
    const sbw = window.innerWidth - document.documentElement.clientWidth
    const prevO = document.body.style.overflow, prevP = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'; if (sbw > 0) document.body.style.paddingRight = `${sbw}px`
    const t0 = setTimeout(() => { if (panel.current && !panel.current.contains(document.activeElement)) panel.current.querySelector<HTMLElement>('input,textarea')?.focus() }, 60) // never steal focus from a field the visitor already chose
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return }
      if (e.key !== 'Tab' || !panel.current) return
      const f = [...panel.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]):not([tabindex="-1"]),textarea,select')].filter((x) => x.offsetParent !== null)
      if (!f.length) return
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', key)
    return () => { clearTimeout(t0); document.removeEventListener('keydown', key); document.body.style.overflow = prevO; document.body.style.paddingRight = prevP; back.current?.focus?.() }
  }, [open, close])

  const set = <K extends keyof ContactValues>(k: K, val: ContactValues[K]) => setV((p) => ({ ...p, [k]: val }))
  const blur = (k: string) => () => setTouched((p) => ({ ...p, [k]: true }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lock.current || status === 'sending') return
    setTouched({ __all: true })
    if (Object.keys(errors).length) { panel.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(); return }
    lock.current = true; setStatus('sending'); setServerMsg('')
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ ...v, website: hp, elapsed: Date.now() - opened.current, lang }) })
      let j: { ok?: boolean; error?: string } = {}
      try { j = await r.json() } catch { /* non-JSON error page */ }
      if (r.ok && j.ok === true) { trackLead(); setStatus('success'); setV(EMPTY); setTouched({}) }
      else { setServerMsg(r.status === 429 ? t('contact.errorRate') : r.status === 503 ? t('contact.errorUnavailable') : t('contact.errorGeneric')); setStatus('error') }
    } catch { setServerMsg(t('contact.errorGeneric')); setStatus('error') }
    finally { lock.current = false }
  }

  const Err = ({ k }: { k: keyof ContactValues }) => (show(k) ? <p id={`${uid}-${k}-e`} role="alert" className="mt-1 text-sm font-medium text-red-600">{t(`contact.e.${errors[k]}`)}</p> : null)
  const a11y = (k: keyof ContactValues) => ({ 'aria-invalid': show(k) ? true : undefined, 'aria-describedby': show(k) ? `${uid}-${k}-e` : undefined, onBlur: blur(k), id: `${uid}-${k}`, disabled: status === 'sending' })
  const border = (k: keyof ContactValues) => (show(k) ? 'border-red-400' : 'border-slate-300')
  const Label = ({ k, req }: { k: keyof ContactValues; req?: boolean }) => (
    <label htmlFor={`${uid}-${k}`} className="block text-sm font-semibold text-slate-800">{t(`contact.${k}`)}{req ? <span aria-hidden className="text-red-500"> *</span> : <span className="ms-1 font-normal text-slate-500">({t('contact.optional')})</span>}</label>
  )

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] grid place-items-end bg-[#040a1c]/70 backdrop-blur-sm sm:place-items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}>
          <motion.div ref={panel} role="dialog" aria-modal="true" aria-labelledby={`${uid}-title`} initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.97 }} transition={{ duration: 0.4, ease: EASE }}
            className="relative max-h-[94dvh] w-full max-w-[640px] overflow-y-auto overscroll-contain rounded-t-3xl border border-white/60 bg-white p-5 shadow-[0_40px_120px_-30px_rgba(10,25,90,.8)] sm:rounded-3xl sm:p-8">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-sky-400 via-electric-blue to-indigo-500" />
            <button type="button" onClick={close} aria-label={t('contact.close')} className="absolute end-3 top-3 grid h-10 w-10 place-items-center rounded-full text-slate-500 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue"><X size={20} aria-hidden /></button>

            {status === 'success' ? (
              <div className="py-8 text-center" role="status">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={30} aria-hidden /></span>
                <h2 id={`${uid}-title`} className="mt-4 font-display text-2xl font-extrabold text-slate-900">{t('contact.successTitle')}</h2>
                <p className="mx-auto mt-2 max-w-sm text-slate-600">{t('contact.successBody')}</p>
                <button type="button" onClick={close} className="mt-6 rounded-full bg-electric-blue px-6 py-2.5 font-display font-bold text-white hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2">{t('contact.done')}</button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <h2 id={`${uid}-title`} className="pe-10 font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{t('contact.title')}</h2>
                <p className="mt-1.5 text-slate-600">{t('contact.intro')}</p>
                <p className="mt-1 text-sm text-slate-500"><a href={CONTACT_MAILTO} dir="ltr" className="font-semibold text-electric-blue underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue">{CONTACT_EMAIL}</a></p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div><Label k="name" req /><input {...a11y('name')} value={v.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" maxLength={LIMITS.name + 20} className={`${field} ${border('name')}`} /><Err k="name" /></div>
                  <div><Label k="company" /><input {...a11y('company')} value={v.company} onChange={(e) => set('company', e.target.value)} autoComplete="organization" maxLength={LIMITS.company + 20} className={`${field} ${border('company')}`} /><Err k="company" /></div>
                  <div><Label k="email" req /><input {...a11y('email')} type="email" inputMode="email" dir="ltr" value={v.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" className={`${field} ${border('email')}`} /><Err k="email" /></div>
                  <div><Label k="phone" /><input {...a11y('phone')} type="tel" inputMode="tel" dir="ltr" value={v.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" className={`${field} ${border('phone')}`} /><Err k="phone" /></div>
                  <div><Label k="country" /><input {...a11y('country')} value={v.country} onChange={(e) => set('country', e.target.value)} autoComplete="country-name" className={`${field} ${border('country')}`} /><Err k="country" /></div>
                  <div><Label k="subject" req /><input {...a11y('subject')} value={v.subject} onChange={(e) => set('subject', e.target.value)} maxLength={LIMITS.subject + 20} className={`${field} ${border('subject')}`} /><Err k="subject" /></div>
                  <div className="sm:col-span-2">
                    <Label k="message" req />
                    <textarea {...a11y('message')} rows={5} value={v.message} onChange={(e) => set('message', e.target.value)} className={`${field} resize-y ${border('message')}`} />
                    <div className="flex items-start justify-between gap-3"><Err k="message" /><p className={`ms-auto mt-1 text-xs tabular-nums ${v.message.length > LIMITS.message ? 'text-red-600' : 'text-slate-400'}`}>{t('contact.chars', { n: String(v.message.length), max: String(LIMITS.message) })}</p></div>
                  </div>
                  {/* honeypot */}
                  <div aria-hidden className="absolute -start-[9999px] top-auto h-0 w-0 overflow-hidden"><label>Website<input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} name="website" /></label></div>
                  <div className="sm:col-span-2">
                    <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
                      <input id={`${uid}-consent`} type="checkbox" checked={v.consent} onChange={(e) => set('consent', e.target.checked)} onBlur={blur('consent')} disabled={status === 'sending'} aria-invalid={show('consent') ? true : undefined} aria-describedby={show('consent') ? `${uid}-consent-e` : undefined}
                        className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 accent-[#2563eb]" />
                      <span>{t('contact.consent')}<span aria-hidden className="text-red-500"> *</span></span>
                    </label>
                    <Err k="consent" />
                  </div>
                </div>
                {status === 'error' && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{serverMsg}</p>}
                <button type="submit" disabled={status === 'sending'} aria-busy={status === 'sending'}
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-electric-blue px-6 py-3 font-display text-base font-bold text-white shadow-[0_10px_28px_-10px_rgba(37,99,235,.8)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto">
                  {status === 'sending' ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <Send size={18} className="rtl:-scale-x-100" aria-hidden />}
                  {status === 'sending' ? t('contact.sending') : t('contact.send')}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
