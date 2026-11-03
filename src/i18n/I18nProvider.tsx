import { createContext, useCallback, useContext, useEffect, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import en from './locales/en.json'
import ar from './locales/ar.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import es from './locales/es.json'
import { DEFAULT_LANG, langDef, type Lang } from './config'
import { store } from './storage'
import { applyHead, VIDEOS_SLUG } from './seo'

const DICTS: Record<Lang, unknown> = { en, ar, fr, de, es }
type Dict = Record<string, unknown>

function pick(o: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((a, k) => (a && typeof a === 'object' ? (a as Dict)[k] : undefined), o)
}

interface Ctx {
  lang: Lang
  dir: 'ltr' | 'rtl'
  t: (key: string, vars?: Record<string, string>) => string
  /** raw value (arrays/objects) */
  tr: <T = unknown>(key: string) => T
  setLang: (l: Lang) => void
  /** Compact locale-aware number (e.g. 47.6M) for sample dashboard figures. */
  fmtCompact: (n: number) => string
  fmtNum: (n: number, digits?: number) => string
  rootPath: string
}
const C = createContext<Ctx | null>(null)
export const useI18n = () => { const c = useContext(C); if (!c) throw new Error('I18nProvider missing'); return c }
export const useT = () => useI18n().t

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const nav = useNavigate()
  const loc = useLocation()
  const def = langDef(lang)

  const isVideos = loc.pathname.replace(/\/+$/, '').endsWith('/' + VIDEOS_SLUG)
  useEffect(() => { document.documentElement.lang = def.locale; document.documentElement.dir = def.dir; applyHead(lang, isVideos ? 'videos' : 'home') }, [lang, def, isVideos])

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

  const fmtNum = useCallback((n: number, digits = 0) => new Intl.NumberFormat(def.locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n), [def.locale])

  const fmtCompact = useCallback((n: number) => new Intl.NumberFormat(def.locale, { notation: 'compact', maximumFractionDigits: 2 }).format(n), [def.locale])

  const value: Ctx = { lang, dir: def.dir, t, tr, setLang, fmtCompact, fmtNum, rootPath: `/${lang}/` }
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
