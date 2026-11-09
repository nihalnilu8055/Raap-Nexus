import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SITE_URL } from '../i18n/config'
import { mountPortal } from './portal'
import './help.css'

/** Help Center: the original portal pages (public/help-center/*.html) rendered inside the app at /:lang/help and /:lang/help/:article.
 *  The page markup and texts are the originals; styles are scoped under .hc and behaviour comes from ./portal. */
const BASE = '/help-center/'
const W = window as unknown as { HELP_SEARCH?: { id: string }[]; HELP_DATA?: unknown }

let scriptsReady: Promise<void> | null = null
function loadScript(src: string) {
  return new Promise<void>((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = () => res(); s.onerror = () => rej(new Error(src)); document.head.appendChild(s) })
}
/** data.js (portal texts) and search.js (article index) are plain files from the original portal, loaded once on first visit */
function loadData() { return scriptsReady ??= Promise.all([loadScript(BASE + 'assets/data.js'), loadScript(BASE + 'assets/search.js')]).then(() => undefined) }

function setMeta(name: string, content: string) {
  let m = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!m) { m = document.createElement('meta'); m.name = name; document.head.appendChild(m) }
  m.content = content
}

export default function HelpCenter({ lang, slug }: { lang: string; slug?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const nav = useNavigate()
  const { hash } = useLocation()
  const [missing, setMissing] = useState<false | 'article' | 'content'>(false)
  const page = slug || 'index'

  useEffect(() => {
    let cancel: (() => void) | null = null, dead = false
    const prev = { lang: document.documentElement.lang, dir: document.documentElement.dir }
    setMissing(false)
    ;(async () => {
      await loadData()
      const known = (W.HELP_SEARCH || []).map((a) => a.id)
      if (dead) return
      if (page !== 'index' && !known.includes(page)) { setMissing('article'); return }
      const html = await fetch(`${BASE}${page}.html`).then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.text() })
      if (dead || !ref.current) return
      const doc = new DOMParser().parseFromString(html, 'text/html')
      doc.body.querySelectorAll('script').forEach((s) => s.remove())
      // original pages use relative asset paths (assets/…, shots/…, gifs/…): point them at the portal folder
      doc.querySelectorAll(".note-lang").forEach((n) => n.remove()) // footer disclaimer intentionally not shown
      const inner = doc.body.innerHTML.replace(/(src|href)="(assets|shots|gifs)\//g, `$1="${BASE}$2/`)
      const root = ref.current
      root.innerHTML = inner
      root.setAttribute('data-page', doc.body.getAttribute('data-page') || 'home')
      root.classList.remove('nav')
      document.title = doc.title || 'Raap Nexus Help'
      setMeta('description', doc.querySelector('meta[name="description"]')?.getAttribute('content') || 'Raap Nexus help centre')
      const canon = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (canon) canon.href = `${SITE_URL}/${lang}/help${page === 'index' ? '' : '/' + page}`
      cancel = mountPortal(root, {
        siteLang: lang,
        go: (p) => nav(p),
        onLang: (l, d) => { document.documentElement.lang = l; document.documentElement.dir = d },
        onTitle: (t) => { document.title = t },
      })
      document.documentElement.style.scrollPaddingTop = '82px'
      const target = hash && document.getElementById(hash.slice(1))
      if (target) target.scrollIntoView(); else window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    })().catch(() => { if (!dead) setMissing('content') })
    return () => { dead = true; cancel?.(); document.documentElement.style.scrollPaddingTop = ''; document.documentElement.lang = prev.lang; document.documentElement.dir = prev.dir }
    // hash changes inside a page are plain in-page scrolls: only the page itself reloads the portal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, lang])

  return (
    <div ref={ref} className="hc" data-page={page}>
      {missing && (
        <main style={{ padding: '96px 24px', textAlign: 'center' }}>
          <h1>{missing === 'article' ? '404' : 'Help Center unavailable'}</h1>
          <p>{missing === 'article' ? 'This help article does not exist.' : 'The Help Center content could not be loaded (public/help-center is missing from this build).'}</p>
          <a href={`/${lang}/help`}>Help centre</a>
        </main>
      )}
    </div>
  )
}
