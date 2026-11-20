import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Cookie, X } from 'lucide-react'
import { getConsent, onConsentChange, setConsent, type Consent } from '../lib/consent'
import { isLang } from '../i18n'

/** Cookie banner + preferences panel (CONSENT-FEATURE, removable). English text; the three buttons are deliberately identical in weight. */
const CATS = [
  { id: 'necessary', title: 'Strictly Necessary', text: 'Needed for the site to work, for example to remember your language and your cookie choice. Always on.' },
  { id: 'functional', title: 'Functional', text: 'Remember optional settings such as display or help-centre preferences so you do not have to set them again.' },
  { id: 'analytics', title: 'Analytics', text: 'Help us understand, in aggregate, which pages are used and where the site could be clearer.' },
  { id: 'marketing', title: 'Marketing', text: 'Would be used to measure campaigns or show relevant offers.' },
] as const
type Sw = { functional: boolean; analytics: boolean; marketing: boolean }
const btn = 'inline-flex min-h-[44px] items-center justify-center rounded-full border border-sky-300/50 bg-white/5 px-4 py-2 text-center text-sm font-semibold leading-tight text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300'

export default function CookieConsent() {
  const loc = useLocation()
  const seg = loc.pathname.split('/')[1]
  const lang = isLang(seg) ? seg : 'en'
  const [saved, setSaved] = useState<Consent | null>(() => getConsent())
  const [open, setOpen] = useState(false)
  const [sw, setSw] = useState<Sw>({ functional: false, analytics: false, marketing: false })
  const opener = useRef<HTMLElement | null>(null)
  const dlg = useRef<HTMLDivElement>(null)
  const [msg, setMsg] = useState('')

  useEffect(() => onConsentChange(setSaved), [])
  const show = useCallback(() => {
    opener.current = document.activeElement as HTMLElement | null
    const c = getConsent()
    setSw({ functional: !!c?.functional, analytics: !!c?.analytics, marketing: !!c?.marketing })
    setMsg(''); setOpen(true)
  }, [])
  useEffect(() => { window.addEventListener('open-cookie-settings', show); return () => window.removeEventListener('open-cookie-settings', show) }, [show])
  const close = useCallback(() => { setOpen(false); const o = opener.current; if (o && document.contains(o)) o.focus() }, [])
  useEffect(() => {
    if (!open) return
    dlg.current?.querySelector<HTMLElement>('button')?.focus()
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); return }
      if (e.key !== 'Tab' || !dlg.current) return
      const f = [...dlg.current.querySelectorAll<HTMLElement>('button:not([disabled])')]
      if (!f.length) return
      const a = f[0], z = f[f.length - 1]
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() }
    }
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [open, close])

  const all = () => setConsent({ choice: 'all', functional: true, analytics: true, marketing: true })
  const none = () => setConsent({ choice: 'none', functional: false, analytics: false, marketing: false })
  const finish = (m: string) => { setMsg(m); window.setTimeout(close, 700) }

  return (
    <>
      {!saved && !open && (
        <div role="region" aria-label="Cookie consent" className="fixed inset-x-2 bottom-2 z-[90] sm:inset-x-4 sm:bottom-4">
          <div className="mx-auto grid max-w-[1120px] gap-3 rounded-2xl border border-sky-300/30 bg-[#071028]/95 p-3 text-slate-200 shadow-2xl backdrop-blur sm:p-4 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-6">
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-white"><Cookie size={18} className="text-sky-400" aria-hidden /> Your Privacy Matters</h2>
              <p className="mt-1 break-words text-[13px] leading-relaxed text-slate-300">
                We use essential cookies to make this site work. With your permission we would also like to use optional cookies to remember your preferences and to understand how the site is used so we can improve it.{' '}
                <span className="max-[440px]:hidden">You choose, and you can change your mind at any time in Cookie Settings. </span>
                Read our <Link to={`/${lang}/cookie-policy`} className="text-sky-400 underline underline-offset-2">Cookie Policy</Link> and <Link to={`/${lang}/privacy-policy`} className="text-sky-400 underline underline-offset-2">Privacy Policy</Link>.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 lg:w-[540px]">
              <button type="button" onClick={all} className={btn}>Accept All</button>
              <button type="button" onClick={none} className={btn}>Reject Optional</button>
              <button type="button" onClick={show} className={btn}>Customize Preferences</button>
            </div>
          </div>
        </div>
      )}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#02060f]/75 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}>
          <div ref={dlg} role="dialog" aria-modal="true" aria-labelledby="ck-title" className="flex max-h-[94%] w-full max-w-[640px] flex-col overflow-auto rounded-t-3xl border border-sky-300/30 bg-[#071028] text-slate-200 shadow-2xl sm:rounded-3xl">
            <header className="sticky top-0 z-10 flex items-start justify-between gap-3 bg-[#071028] px-5 pb-2 pt-5">
              <h2 id="ck-title" className="font-display text-xl font-extrabold text-white">Cookie Preferences</h2>
              <button type="button" onClick={close} aria-label="Close preferences" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"><X size={20} aria-hidden /></button>
            </header>
            <p className="px-5 text-sm text-slate-300">Choose which categories you allow. Strictly Necessary items are always on because the site cannot work without them.</p>
            <ul className="grid gap-2.5 px-5 py-3">
              {CATS.map((c) => (
                <li key={c.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 rounded-2xl border border-white/10 bg-[#0e1e44]/40 p-4">
                  <h3 id={`ck-${c.id}`} className="font-display text-[15px] font-bold text-white">{c.title}</h3>
                  {c.id === 'necessary'
                    ? <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-400">Always active</span>
                    : <button type="button" role="switch" aria-checked={sw[c.id]} aria-labelledby={`ck-${c.id}`} onClick={() => setSw((s) => ({ ...s, [c.id]: !s[c.id] }))}
                        className={`relative h-[30px] w-[52px] rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${sw[c.id] ? 'border-sky-400 bg-blue-700' : 'border-sky-300/40 bg-[#14213f]'}`}>
                        <span className={`absolute left-[3px] top-[3px] h-[22px] w-[22px] rounded-full transition-transform ${sw[c.id] ? 'translate-x-[22px] bg-white' : 'bg-slate-400'}`} />
                      </button>}
                  <p className="col-span-2 text-[13.5px] text-slate-400">{c.text}</p>
                </li>
              ))}
            </ul>
            <p role="status" className="min-h-[18px] px-5 text-xs text-emerald-400">{msg}</p>
            <footer className="sticky bottom-0 grid grid-cols-3 gap-2 border-t border-white/10 bg-[#071028] px-5 pb-5 pt-3">
              <button type="button" className={btn} onClick={() => { setConsent({ choice: 'custom', ...sw }); finish('Preferences saved. You can change them any time from Cookie Settings.') }}>Save Preferences</button>
              <button type="button" className={btn} onClick={() => { none(); setSw({ functional: false, analytics: false, marketing: false }); finish('Optional cookies rejected.') }}>Reject Optional</button>
              <button type="button" className={btn} onClick={() => { all(); setSw({ functional: true, analytics: true, marketing: true }); finish('All cookies accepted.') }}>Accept All</button>
            </footer>
          </div>
        </div>
      )}
    </>
  )
}
