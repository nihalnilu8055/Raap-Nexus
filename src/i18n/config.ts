export type Lang = 'en' | 'ar' | 'fr' | 'de' | 'es'
export interface LangDef { code: Lang; native: string; english: string; dir: 'ltr' | 'rtl'; locale: string; og: string }

/** Add a language: append here, add locales/<code>.json and a prerender entry happens automatically. */
export const LANGS: LangDef[] = [
  { code: 'en', native: 'English', english: 'English', dir: 'ltr', locale: 'en', og: 'en_US' },
  { code: 'ar', native: 'العربية', english: 'Arabic', dir: 'rtl', locale: 'ar', og: 'ar_AE' },
  { code: 'fr', native: 'Français', english: 'French', dir: 'ltr', locale: 'fr', og: 'fr_FR' },
  { code: 'de', native: 'Deutsch', english: 'German', dir: 'ltr', locale: 'de', og: 'de_DE' },
  { code: 'es', native: 'Español', english: 'Spanish', dir: 'ltr', locale: 'es', og: 'es_ES' },
]
export const LANG_CODES = LANGS.map((l) => l.code)
export const DEFAULT_LANG: Lang = 'en'
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://raap-nexus-new.vercel.app'
export const isLang = (v: unknown): v is Lang => typeof v === 'string' && LANG_CODES.includes(v as Lang)
export const langDef = (l: Lang) => LANGS.find((x) => x.code === l)!
