import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import en from './locales/en.json'
import ar from './locales/ar.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import es from './locales/es.json'
import hi from './locales/hi.json'
import { CURRENCIES, DEFAULT_CUR, DEFAULT_LANG, COUNTRY_CUR, SOURCE_CUR, isCur, isLang, langDef, type Cur, type Lang } from './config'
import { browserLang, detectCountry, langForCountry } from './detect'
import { cachedRates, loadRates, type Rates } from './rates'
import { store } from './storage'
import { applyHead } from './seo'

const DICTS: Record<Lang, unknown> = { en, ar, fr, de, es, hi }
type Dict = Record<string, unknown>

function pick(o: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((a, k) => (a && typeof a === 'object' ? (a as Dict)[k] : undefined), o)
}

export interface Suggest { lang?: Lang; cur?: Cur }
interface Ctx {
  lang: Lang
  dir: 'ltr' | 'rtl'
  t: (key: string, vars?: Record<string, string>) => string
  /** raw value (arrays/objects) */
  tr: <T = unknown>(key: string) => T
  setLang: (l: Lang) => void
  currency: Cur
  setCurrency: (c: Cur) => void
  /** Format a sample figure authored in AED in the selected currency (falls back to AED if no live rate). */
  money: (aed: number, opts?: { compact?: boolean; digits?: number }) => string
  converted: boolean
  fmtNum: (n: number, digits?: number) => string
  suggest: Suggest
  resolveSuggest: (kind: 'lang' | 'cur', action: 'accept' | 'keep' | 'dismiss') => void
  rootPath: string
}
const C = createContext<Ctx | null>(null)
export const useI18n = () => { const c = useContext(C); if (!c) throw new Error('I18nProvider missing'); return c }
export const useT = () => useI18n().t

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const nav = useNavigate()
  const loc = useLocation()
  const def = langDef(lang)
  const [currency, setCur] = useState<Cur>(() => { const s = store.get('cur'); return isCur(s) ? s : DEFAULT_CUR })
  const [rates, setRates] = useState<Rates | null>(() => cachedRates()?.rates ?? null)
  const [country, setCountry] = useState<string | undefined>()
  const [tick, setTick] = useState(0)

  useEffect(() => { document.documentElement.lang = def.locale; document.documentElement.dir = def.dir; applyHead(lang) }, [lang, def])
  useEffect(() => { let on = true; loadRates().then((r) => on && r && setRates(r)); return () => { on = false } }, [])
  useEffect(() => { let on = true; detectCountry().then((c) => on && setCountry(c)); return () => { on = false } }, [])

  const t = useCallback((key: string, vars?: Record<string, string>) => {
    let v = pick(DICTS[lang], key)
    if (typeof v !== 'string') v = pick(DICTS[DEFAULT_LANG], key)
    let s = typeof v === 'string' ? v : key
    if (vars) for (const k of Object.keys(vars)) s = s.replace(`{${k}}`, vars[k])
    return s
  }, [lang])
  const tr = useCallback(<T,>(key: string) => (pick(DICTS[lang], key) ?? pick(DICTS[DEFAULT_LANG], key)) as T, [lang])

  const setLang = useCallback((l: Lang) => {
    store.set('lang', l); store.set('lang.explicit', '1')
    const rest = loc.pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '')
    nav(`/${l}${rest === '/' ? '/' : rest}${loc.search}${loc.hash}`)
  }, [loc, nav])
  const setCurrency = useCallback((c: Cur) => { store.set('cur', c); store.set('cur.explicit', '1'); setCur(c) }, [])

  const rate = currency === SOURCE_CUR ? 1 : rates?.[currency]
  const converted = currency === SOURCE_CUR || typeof rate === 'number'
  const shownCur: Cur = typeof rate === 'number' ? currency : SOURCE_CUR
  const money = useCallback((aed: number, opts?: { compact?: boolean; digits?: number }) => {
    const v = aed * (typeof rate === 'number' ? rate : 1)
    try {
      return new Intl.NumberFormat(opts?.compact && def.code === 'hi' ? 'en' : def.locale, { style: 'currency', currency: shownCur, notation: opts?.compact ? 'compact' : 'standard', maximumFractionDigits: opts?.digits ?? (opts?.compact ? 2 : CURRENCIES.find((c) => c.code === shownCur)!.fraction) }).format(v)
    } catch { return `${shownCur} ${v.toFixed(2)}` }
  }, [rate, shownCur, def.locale])
  const fmtNum = useCallback((n: number, digits = 0) => new Intl.NumberFormat(def.locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n), [def.locale])

  // Suggestions: never override an explicit choice, never repeat after dismissal.
  const suggest = useMemo<Suggest>(() => {
    void tick
    const out: Suggest = {}
    if (!store.get('lang.explicit') && store.get('lang.dismissed') !== '1') {
      const bl = browserLang()
      const cand = bl && bl !== 'en' ? bl : langForCountry(country) ?? bl
      if (cand && cand !== lang && isLang(cand)) out.lang = cand
    }
    if (!store.get('cur.explicit') && store.get('cur.dismissed') !== '1' && country) {
      const c = COUNTRY_CUR[country]
      if (c && c !== currency) out.cur = c
    }
    return out
  }, [country, lang, currency, tick])

  const resolveSuggest = useCallback((kind: 'lang' | 'cur', action: 'accept' | 'keep' | 'dismiss') => {
    if (kind === 'lang') {
      if (action === 'accept' && suggest.lang) setLang(suggest.lang)
      else { store.set('lang.dismissed', '1'); if (action === 'keep') { store.set('lang', lang); store.set('lang.explicit', '1') } }
    } else {
      if (action === 'accept' && suggest.cur) setCurrency(suggest.cur)
      else { store.set('cur.dismissed', '1'); if (action === 'keep') { store.set('cur.explicit', '1') } }
    }
    setTick((x) => x + 1)
  }, [suggest, setLang, setCurrency, lang])

  const value: Ctx = { lang, dir: def.dir, t, tr, setLang, currency, setCurrency, money, converted, fmtNum, suggest, resolveSuggest, rootPath: `/${lang}/` }
  return <C.Provider value={value}>{children}</C.Provider>
}

/** Translate with an explicit language (used by the suggestion toast to speak the suggested language). */
export function tFor(lang: Lang, key: string, vars?: Record<string, string>): string {
  let v = pick(DICTS[lang], key)
  if (typeof v !== 'string') v = pick(DICTS[DEFAULT_LANG], key)
  let s = typeof v === 'string' ? v : key
  if (vars) for (const k of Object.keys(vars)) s = s.replace(`{${k}}`, vars[k])
  return s
}
