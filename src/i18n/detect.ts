import { isLang, type Lang } from './config'

/** First supported language in the browser's preference list (used only for the very first redirect from "/"). */
export function browserLang(): Lang | undefined {
  try {
    for (const l of navigator.languages ?? [navigator.language]) {
      const c = l.toLowerCase().split('-')[0]
      if (isLang(c)) return c
    }
  } catch { /* ignore */ }
  return undefined
}
