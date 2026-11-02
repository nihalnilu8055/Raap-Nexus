export type Lang = 'en' | 'ar' | 'fr' | 'de' | 'es' | 'hi'
export interface LangDef { code: Lang; native: string; english: string; dir: 'ltr' | 'rtl'; locale: string; og: string }

/** Add a language: append here, add locales/<code>.json and a prerender entry happens automatically. */
export const LANGS: LangDef[] = [
  { code: 'en', native: 'English', english: 'English', dir: 'ltr', locale: 'en', og: 'en_US' },
  { code: 'ar', native: 'العربية', english: 'Arabic', dir: 'rtl', locale: 'ar', og: 'ar_AE' },
  { code: 'fr', native: 'Français', english: 'French', dir: 'ltr', locale: 'fr', og: 'fr_FR' },
  { code: 'de', native: 'Deutsch', english: 'German', dir: 'ltr', locale: 'de', og: 'de_DE' },
  { code: 'es', native: 'Español', english: 'Spanish', dir: 'ltr', locale: 'es', og: 'es_ES' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi', dir: 'ltr', locale: 'hi', og: 'hi_IN' },
]
export const LANG_CODES = LANGS.map((l) => l.code)
export const DEFAULT_LANG: Lang = 'en'
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://raap-nexus-new.vercel.app'
export const isLang = (v: unknown): v is Lang => typeof v === 'string' && LANG_CODES.includes(v as Lang)
export const langDef = (l: Lang) => LANGS.find((x) => x.code === l)!

/** Country (ISO-3166 alpha-2) → suggested language. Suggestion only, never forced. */
export const COUNTRY_LANG: Record<string, Lang> = {
  AE: 'ar', SA: 'ar', QA: 'ar', KW: 'ar', OM: 'ar', BH: 'ar', EG: 'ar', JO: 'ar', LB: 'ar', IQ: 'ar', MA: 'ar', DZ: 'ar', TN: 'ar',
  FR: 'fr', BE: 'fr', LU: 'fr', MC: 'fr', SN: 'fr', CI: 'fr',
  DE: 'de', AT: 'de', LI: 'de',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
  IN: 'hi',
  US: 'en', GB: 'en', CA: 'en', AU: 'en', IE: 'en', NZ: 'en',
}

export type Cur = 'USD' | 'AED' | 'SAR' | 'INR' | 'EUR' | 'GBP' | 'QAR' | 'KWD' | 'OMR' | 'BHD'
export const CURRENCIES: { code: Cur; name: string; fraction: number }[] = [
  { code: 'USD', name: 'US Dollar', fraction: 2 }, { code: 'AED', name: 'UAE Dirham', fraction: 2 }, { code: 'SAR', name: 'Saudi Riyal', fraction: 2 },
  { code: 'INR', name: 'Indian Rupee', fraction: 2 }, { code: 'EUR', name: 'Euro', fraction: 2 }, { code: 'GBP', name: 'British Pound', fraction: 2 },
  { code: 'QAR', name: 'Qatari Riyal', fraction: 2 }, { code: 'KWD', name: 'Kuwaiti Dinar', fraction: 3 }, { code: 'OMR', name: 'Omani Rial', fraction: 3 }, { code: 'BHD', name: 'Bahraini Dinar', fraction: 3 },
]
export const CUR_CODES = CURRENCIES.map((c) => c.code)
export const isCur = (v: unknown): v is Cur => typeof v === 'string' && CUR_CODES.includes(v as Cur)
export const SOURCE_CUR: Cur = 'AED' // currency in which the sample dashboard figures are authored
export const DEFAULT_CUR: Cur = 'AED'

export const COUNTRY_CUR: Record<string, Cur> = {
  US: 'USD', IN: 'INR', AE: 'AED', SA: 'SAR', QA: 'QAR', KW: 'KWD', OM: 'OMR', BH: 'BHD', GB: 'GBP',
  FR: 'EUR', DE: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR', IE: 'EUR', AT: 'EUR', PT: 'EUR', FI: 'EUR', GR: 'EUR',
}
