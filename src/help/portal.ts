/* Raap Nexus Help Center behaviour: a port of the original assets/help.js (language, theme, search, contents list, picture zoom, mobile menu) that works
   inside a container instead of owning the whole document, and navigates through the app's router. The logic and texts are unchanged except where marked. */
/* eslint-disable @typescript-eslint/no-explicit-any */
const LANGS: [string, string][] = [['en', 'English'], ['ar', 'العربية'], ['ur', 'اردو'], ['fr', 'Français'], ['de', 'Deutsch'], ['es', 'Español'], ['it', 'Italiano'], ['pt-BR', 'Português (Brasil)'], ['ru', 'Русский'], ['tr', 'Türkçe'],
  ['hi', 'हिन्दी'], ['te', 'తెలుగు'], ['ta', 'தமிழ்'], ['ml', 'മലയാളം'], ['id', 'Bahasa Indonesia'], ['zh-CN', '简体中文'], ['ja', '日本語'], ['ko', '한국어']]
const RTL: Record<string, number> = { ar: 1, ur: 1 }
const BASE = '/help-center/'
const BACK: Record<string, string> = { en: 'Back to RaapNexus', ar: 'العودة إلى RaapNexus', fr: 'Retour à RaapNexus', de: 'Zurück zu RaapNexus', es: 'Volver a RaapNexus' }
const W = window as any

export interface PortalOpts {
  siteLang: string
  /** open an in-app route (e.g. /en/help/install#s2) */
  go: (path: string) => void
  /** the visitor changed the portal language or direction */
  onLang?: (lang: string, dir: 'ltr' | 'rtl') => void
  /** the page title the portal wants (after translation) */
  onTitle?: (title: string) => void
}

export const helpPath = (siteLang: string, slug: string, hash = '') => `/${siteLang}/help${slug && slug !== 'index' ? '/' + slug : ''}${hash}`

/** `install.html#x` -> { slug: 'install', hash: '#x' } (null for anything that is not a portal page) */
export function parsePortalHref(href: string | null) {
  const m = (href || '').match(/^([\w-]+)\.html(#.*)?$/)
  return m ? { slug: m[1], hash: m[2] || '' } : null
}

function store(k: string, v?: string): string | null {
  try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); return v } catch { return null }
}

export function mountPortal(root: HTMLElement, o: PortalOpts): () => void {
  const D = W.HELP_DATA || { chrome: { en: {} }, ui: {} }
  const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = root) => r.querySelector(s) as T | null
  const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = root) => Array.prototype.slice.call(r.querySelectorAll(s)) as T[]
  const off: (() => void)[] = []
  const on = (t: EventTarget, e: string, f: any, opt?: any) => { t.addEventListener(e, f, opt); off.push(() => t.removeEventListener(e, f, opt)) }
  let dead = false

  function pickLang() {
    const q = (location.search.match(/[?&]lang=([\w-]+)/) || [])[1]
    const want = q || store('help-lang') || o.siteLang || navigator.language || 'en'
    let hit = LANGS.filter((l) => l[0].toLowerCase() === want.toLowerCase())[0]
    if (!hit) { const base = want.split('-')[0].toLowerCase(); hit = LANGS.filter((l) => l[0].split('-')[0].toLowerCase() === base)[0] }
    return hit ? hit[0] : 'en'
  }
  let lang = pickLang()
  const T = (key: string, vars?: Record<string, string>) => {
    let s = (D.chrome[lang] || {})[key] || (D.chrome.en || {})[key] || key
    if (vars) Object.keys(vars).forEach((k) => { s = s.replace('{' + k + '}', vars[k]) })
    return s
  }
  const TR = (id: string, f: string) => { const t = (W.HELP_T || {})[lang]; return t && t[id] && t[id][f] }

  function theme(v?: string) {
    if (v) store('help-theme', v)
    const t = v || store('help-theme')
    if (t) root.setAttribute('data-theme', t)
    else if (matchMedia('(prefers-color-scheme: dark)').matches) root.setAttribute('data-theme', 'dark')
  }
  theme()

  function loadText(cb: () => void) {
    if (lang === 'en' || (W.HELP_T || {})[lang]) return cb()
    const sc = document.createElement('script'); sc.src = BASE + 'assets/t/' + lang + '.js'; sc.onload = sc.onerror = () => cb(); document.head.appendChild(sc)
  }
  let io: IntersectionObserver | null = null
  function buildToc() {
    const toc = $('#toc'); if (!toc) return
    toc.innerHTML = ''
    const hs = $$('article h2')
    hs.forEach((h, i) => { if (!h.id) h.id = 's' + (i + 1); const a = document.createElement('a'); a.href = '#' + h.id; a.textContent = h.textContent; toc.appendChild(a) })
    ;(toc.parentNode as HTMLElement).style.display = hs.length ? '' : 'none'
    if (io) io.disconnect()
    if ('IntersectionObserver' in window && hs.length) {
      const links = $$('a', toc)
      io = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) links.forEach((l) => l.classList.toggle('on', l.getAttribute('href') === '#' + e.target.id)) }) }, { rootMargin: '-80px 0px -70% 0px' })
      hs.forEach((h) => io!.observe(h))
    }
  }
  /** portal links (`x.html`) become real app URLs, so open-in-new-tab and copy-link work */
  function fixLinks() {
    $$<HTMLAnchorElement>('a[href]').forEach((a) => {
      const p = parsePortalHref(a.getAttribute('href'))
      if (p) a.setAttribute('href', helpPath(o.siteLang, p.slug, p.hash))
    })
  }
  function applyText() {
    $$('[data-tx]').forEach((n) => {
      if (n.getAttribute('data-en') === null) n.setAttribute('data-en', n.innerHTML)
      const k = n.getAttribute('data-tx')!.split('|')
      n.innerHTML = TR(k[0], k[1]) || n.getAttribute('data-en')!
    })
    const id = root.getAttribute('data-page'), t = TR(id || '', 't')
    if (id && id !== 'home') { const h = $('article h1'); o.onTitle?.((t ? h!.textContent : (h ? h.getAttribute('data-en') : '')) + ' · Raap Nexus Help') }
    buildToc(); fixLinks()
  }
  function applyUi() {
    const ui = D.ui[lang] || {}
    $$('.ui').forEach((n) => { const k = n.getAttribute('data-ui') || n.textContent || ''; n.setAttribute('data-ui', k); n.textContent = ui[k] || k })
    $$<HTMLImageElement>('img[data-shot]').forEach((im) => {
      const name = im.getAttribute('data-shot')
      im.onerror = () => { im.onerror = null; im.src = BASE + 'shots/en/' + name + '.webp' }
      im.src = BASE + 'shots/' + lang + '/' + name + '.webp'
    })
    $$('[data-t]').forEach((n) => { n.textContent = T(n.getAttribute('data-t')!, { v: W.HELP_VERSION || '' }) })
  }
  function apply() {
    const dir = RTL[lang] ? 'rtl' : 'ltr'
    root.setAttribute('lang', lang); root.setAttribute('dir', dir); o.onLang?.(lang, dir)
    $$('[data-t]').forEach((n) => { n.textContent = T(n.getAttribute('data-t')!, { v: W.HELP_VERSION || '' }) })
    $$('[data-tp]').forEach((n) => n.setAttribute('placeholder', T(n.getAttribute('data-tp')!)))
    $$('[data-tt]').forEach((n) => { const s = T(n.getAttribute('data-tt')!); n.setAttribute('title', s); n.setAttribute('aria-label', s) })
    const sel = $<HTMLSelectElement>('#lang'); if (sel) sel.value = lang
    const bk = $('#openapp'); if (bk) bk.textContent = BACK[lang.split('-')[0]] || BACK.en
    const want = lang
    loadText(() => { if (!dead && want === lang) { applyText(); applyUi() } })
  }

  // ---- build (once per page) ----
  const sel = $<HTMLSelectElement>('#lang')
  if (sel) {
    LANGS.forEach((l) => { const op = document.createElement('option'); op.value = l[0]; op.textContent = l[1]; sel.appendChild(op) })
    on(sel, 'change', () => { lang = sel.value; store('help-lang', lang); apply() })
  }
  const tb = $('#theme'); if (tb) on(tb, 'click', () => theme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'))
  const mb = $('.menu'); if (mb) on(mb, 'click', () => root.classList.toggle('nav'))
  $$('.side a').forEach((a) => on(a, 'click', () => root.classList.remove('nav')))

  // INTEGRATION: the original showed "Open Raap Nexus" only when served by the desktop app; here it is the way back to the website (header + mobile menu)
  const back = $<HTMLAnchorElement>('#openapp')
  if (back) { back.hidden = false; back.removeAttribute('data-t'); back.setAttribute('href', `/${o.siteLang}/`) }
  const side = $('.side')
  if (side) { const a = document.createElement('a'); a.className = 'hc-back'; a.setAttribute('href', `/${o.siteLang}/`); a.textContent = BACK[lang.split('-')[0]] || BACK.en; side.insertBefore(a, side.firstChild) }

  // picture zoom
  const lb = document.createElement('div'); lb.className = 'lb'; lb.innerHTML = '<img alt=""><button type="button" data-t="close"></button>'; root.appendChild(lb)
  const closeLb = () => lb.classList.remove('on')
  on(lb, 'click', closeLb)
  on(document, 'keydown', (e: KeyboardEvent) => { if (e.key === 'Escape') { closeLb(); root.classList.remove('nav'); const r = $('.results'); if (r) r.classList.remove('on') } })
  on(root, 'click', (e: MouseEvent) => {
    const im = e.target as HTMLElement
    if (im.tagName === 'IMG' && im.closest && im.closest('figure:not(.gif)')) { const li = $<HTMLImageElement>('img', lb)!; li.src = (im as HTMLImageElement).src; li.alt = (im as HTMLImageElement).alt; lb.classList.add('on') }
  })

  // route links without a page load (plain left clicks only; modified clicks keep the browser behaviour)
  on(root, 'click', (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = (e.target as HTMLElement).closest?.('a[href]') as HTMLAnchorElement | null
    if (!a || a.target === '_blank') return
    const h = a.getAttribute('href') || ''
    if (h.startsWith('/') && !h.startsWith('//')) { e.preventDefault(); root.classList.remove('nav'); o.go(h) }
  })

  // search (INTEGRATION: result titles/summaries were never filled in by the original code, so each hit now carries them)
  $$('.search').forEach((box) => {
    const input = $<HTMLInputElement>('input', box)!, out = $('.results', box)!
    let selIdx = -1
    const run = () => {
      const q = input.value.trim().toLowerCase()
      if (q.length < 2) { out.classList.remove('on'); return }
      const words = q.split(/\s+/)
      const hits = ((W.HELP_SEARCH || []) as any[]).map((a) => {
        let s = 0
        const ti = TR(a.id, 't') || a.title, su = (TR(a.id, 's') || a.summary).replace(/<[^>]+>/g, '')
        const t = (ti + ' ' + a.title).toLowerCase(), m = su.toLowerCase(), x = ((TR(a.id, 'x') || '') + ' ' + a.text).toLowerCase()
        for (let i = 0; i < words.length; i++) {
          const w = words[i]; let f = 0
          if (t.indexOf(w) > -1) f += 10
          if (m.indexOf(w) > -1) f += 4
          if (x.indexOf(w) > -1) f += 1 + Math.min(3, x.split(w).length - 2)
          if (!f) return { a, s: 0, ti, su }
          s += f
        }
        return { a, s, ti, su }
      }).filter((h) => h.s > 0).sort((a, b) => b.s - a.s).slice(0, 8)
      out.innerHTML = hits.length ? hits.map((h) => '<a href="' + helpPath(o.siteLang, h.a.id) + '"><b>' + h.ti + '</b><small>' + h.su + '</small></a>').join('') : '<div class="none">' + T('noresult') + '</div>'
      out.classList.add('on'); selIdx = -1
    }
    on(input, 'input', run)
    on(input, 'keydown', (e: KeyboardEvent) => {
      const as = $$<HTMLAnchorElement>('a', out)
      if (e.key === 'ArrowDown' && as.length) { selIdx = (selIdx + 1) % as.length; e.preventDefault() }
      else if (e.key === 'ArrowUp' && as.length) { selIdx = (selIdx - 1 + as.length) % as.length; e.preventDefault() }
      else if (e.key === 'Enter' && as.length) { o.go(as[Math.max(selIdx, 0)].getAttribute('href')!) }
      as.forEach((a, i) => a.classList.toggle('sel', i === selIdx))
    })
    on(document, 'click', (e: MouseEvent) => { if (!box.contains(e.target as Node)) out.classList.remove('on') })
  })
  on(document, 'keydown', (e: KeyboardEvent) => {
    if (e.key === '/' && !/input|textarea|select/i.test((document.activeElement as HTMLElement)?.tagName || '')) { const i = $<HTMLInputElement>('.top .search input') || $<HTMLInputElement>('.search input'); if (i) { e.preventDefault(); i.focus() } }
  })

  apply()
  fixLinks()
  return () => { dead = true; if (io) io.disconnect(); off.forEach((f) => f()) }
}
