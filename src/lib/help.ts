/** The Help centre is a static, self-contained portal served from /help/ (public/help). Every Help link in the site points here. */
export const HELP_URL = '/help/'

/** The portal keeps its own language choice; when it has none yet, start it in the language the visitor is browsing the site in. */
export function syncHelpLang(lang: string) {
  try { if (!localStorage.getItem('help-lang')) localStorage.setItem('help-lang', lang) } catch { /* storage unavailable: the portal falls back to the browser language */ }
}
