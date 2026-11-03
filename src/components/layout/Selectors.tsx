import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { LANGS, langDef, useI18n, type Lang } from '../../i18n'
import { EASE } from '../../lib/motion'

interface Opt { value: string; primary: string; secondary: string }

function Menu({ icon: Icon, label, current, shortLabel, options, onPick, tone = 'light', full = false, footer }: {
  icon: typeof Globe; label: string; current: string; shortLabel: string; options: Opt[]; onPick: (v: string) => void; tone?: 'light' | 'dark'; full?: boolean; footer?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const btn = useRef<HTMLButtonElement>(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const down = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', down)
    return () => document.removeEventListener('mousedown', down)
  }, [open])
  useEffect(() => { if (open) setIdx(Math.max(0, options.findIndex((o) => o.value === current))) }, [open, options, current])
  useEffect(() => { if (open) document.getElementById(`${id}-${idx}`)?.focus() }, [open, idx, id])

  const key = (e: React.KeyboardEvent) => {
    if (!open) { if (['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); setOpen(true) } return }
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); btn.current?.focus() }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => (i + 1) % options.length) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => (i - 1 + options.length) % options.length) }
    else if (e.key === 'Home') { e.preventDefault(); setIdx(0) }
    else if (e.key === 'End') { e.preventDefault(); setIdx(options.length - 1) }
    else if (e.key === 'Tab') setOpen(false)
  }
  const pick = (v: string) => { setOpen(false); btn.current?.focus(); if (v !== current) onPick(v) }
  const dark = tone === 'dark'
  return (
    <div ref={root} className={`relative ${full ? 'w-full' : ''}`} onKeyDown={key}>
      <button ref={btn} type="button" aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-list`} aria-label={`${label}: ${shortLabel}`} onClick={() => setOpen((o) => !o)}
        className={`flex h-10 items-center gap-1.5 rounded-full px-3 font-display text-[13px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue ${full ? 'w-full justify-between' : ''} ${dark ? 'border border-white/15 bg-white/5 text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'}`}>
        <span className="flex items-center gap-1.5"><Icon size={15} aria-hidden /><span>{shortLabel}</span></span>
        <ChevronDown size={13} aria-hidden className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul id={`${id}-list`} role="listbox" aria-label={label} initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.18, ease: EASE }}
            className="absolute end-0 top-[calc(100%+8px)] z-[70] max-h-[min(70vh,22rem)] min-w-[12.5rem] overflow-auto rounded-2xl border border-slate-200 bg-white p-1.5 text-start shadow-2xl">
            {options.map((o, i) => {
              const sel = o.value === current
              return (
                <li key={o.value} role="option" aria-selected={sel} id={`${id}-${i}`} tabIndex={-1} onClick={() => pick(o.value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(o.value) } }}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none hover:bg-slate-50 focus:bg-sky-50 ${sel ? 'font-bold text-electric-blue' : ''}`}>
                  <span className="flex flex-col"><span className="font-display font-semibold">{o.primary}</span><span className="text-[11px] font-normal text-slate-500">{o.secondary}</span></span>
                  {sel && <Check size={15} aria-hidden />}
                </li>
              )
            })}
            {footer && <li role="presentation" className="mt-1 border-t border-slate-100 px-3 py-2 text-[11px] leading-snug text-slate-500">{footer}</li>}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export function LanguageSelector({ tone, full }: { tone?: 'light' | 'dark'; full?: boolean }) {
  const { lang, setLang, t } = useI18n()
  return <Menu icon={Globe} label={t('nav.language')} current={lang} shortLabel={langDef(lang).native} tone={tone} full={full}
    options={LANGS.map((l) => ({ value: l.code, primary: l.native, secondary: l.english }))} onPick={(v) => setLang(v as Lang)} />
}
