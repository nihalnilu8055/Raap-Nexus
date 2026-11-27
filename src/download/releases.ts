// DOWNLOAD-APP (removable): live GitHub release lookup for the Download section, see README-REMOVE.md in this folder
import { useCallback, useEffect, useState } from 'react'

/** Only the repository identity is configured here. No version numbers and no installer URLs are stored anywhere in the site. */
export const REPO = { owner: 'santoputhoor', name: 'raap-nexus-releases' } as const
export const LATEST_API = `https://api.github.com/repos/${REPO.owner}/${REPO.name}/releases/latest`
export const RELEASES_PAGE = `https://github.com/${REPO.owner}/${REPO.name}/releases`

export type Plat = 'windows' | 'macos' | 'mobile'
export interface Asset { name: string; url: string; size: number }
export interface Release { tag: string; title: string; publishedAt: string; pageUrl: string; assets: Asset[] }
export type FailReason = 'rate-limit' | 'network' | 'http' | 'none' | 'invalid'
export type ReleaseState =
  | { status: 'loading' }
  | { status: 'ready'; release: Release; checkedAt: number }
  | { status: 'stale'; release: Release; checkedAt: number; reason: FailReason; retryAt?: number }
  | { status: 'error'; reason: FailReason; retryAt?: number }

/** Test seams (the site itself passes nothing): a fetch, a storage and a clock, plus a request log used by the preview. */
export interface RequestLog { at: number; kind: 'cache' | 'request' | 'backoff'; note: string; ifNoneMatch?: string | null; status?: number | 'network error' | 'timeout' }
export interface Source { fetcher?: typeof fetch; storage?: Pick<Storage, 'getItem' | 'setItem'> | null; now?: () => number; log?: (e: RequestLog) => void }

const KEY = 'rn-latest-release-v1'
const FAIL_KEY = 'rn-latest-release-fail-v1'
/** A cached release is trusted for 30 minutes. After that one conditional request (If-None-Match) revalidates it; a 304 answer costs no API quota. */
export const TTL_MS = 30 * 60 * 1000
/** After a failed check (rate limit, outage) the API is left alone for 5 minutes. */
export const BACKOFF_MS = 5 * 60 * 1000
const TIMEOUT_MS = 8000

/* ---------------------------------------------------------------- asset detection (by inspecting real asset names) */

export interface Verdict { plat: Plat | null; score: number; why: string }
const JUNK = /\.(blockmap|ya?ml|sha\d*|sha256|sig|asc|txt|md|json|pem|sbom|spdx)$/
const SOURCE_ARCHIVE = /(\.tar\.gz|\.tgz|\.tar\.xz|\.tar\.bz2)$/

/** Decides, from the file name alone, which platform an asset installs on (or null) and how good a match it is. */
export function judge(rawName: string): Verdict {
  const n = rawName.toLowerCase()
  const no = (why: string): Verdict => ({ plat: null, score: 0, why })
  if (JUNK.test(n)) return no('checksum / metadata file')
  if (SOURCE_ARCHIVE.test(n) || /^source[ -_]?code/.test(n) || /^v?\d[\w.-]*\.(zip|tar)$/.test(n) && !/(mac|darwin|osx|win|android)/.test(n)) return no('source archive, not an installer')
  if (/\.aab$/.test(n)) return no('Play Store bundle, cannot be installed directly')
  if (/\.ipa$/.test(n)) return no('iOS package, cannot be installed directly')
  if (/\.(deb|rpm|appimage|snap|flatpak)$/.test(n)) return no('Linux package, not offered')
  if (/\.apk$/.test(n)) return { plat: 'mobile', score: 5 + (/universal/.test(n) ? 2 : 0) - (/debug/.test(n) ? 4 : 0), why: 'Android package (.apk)' }
  const otherOs = /(linux|android)/.test(n)
  if (!otherOs && /\.(dmg|pkg)$/.test(n)) return { plat: 'macos', score: (/\.dmg$/.test(n) ? 6 : 5) + (/universal/.test(n) ? 2 : 0), why: /\.dmg$/.test(n) ? 'macOS disk image (.dmg)' : 'macOS installer (.pkg)' }
  if (!otherOs && /\.zip$/.test(n) && /(mac|darwin|osx)/.test(n)) return { plat: 'macos', score: 3 + (/universal/.test(n) ? 2 : 0), why: 'zipped macOS app (name says mac)' }
  if (!otherOs && !/(mac|darwin|osx)/.test(n) && /\.(exe|msi|msix)$/.test(n)) {
    const base = /\.exe$/.test(n) ? 4 : /\.msi$/.test(n) ? 3 : 2
    return { plat: 'windows', score: base + (/(setup|install)/.test(n) ? 3 : 0) - (/portable/.test(n) ? 4 : 0) - (/arm64/.test(n) ? 1 : 0), why: 'Windows installer (' + (n.match(/\.\w+$/)?.[0] ?? '') + ')' }
  }
  return no('not an installer for Windows, macOS or Android')
}

export interface Explained { asset: Asset; verdict: Verdict; chosen: boolean }
/** Picks the best installer per platform and explains the verdict for every asset (used by the preview). */
export function explain(assets: Asset[]): { picks: Record<Plat, Asset | null>; rows: Explained[] } {
  const rows = assets.map((asset) => ({ asset, verdict: judge(asset.name), chosen: false }))
  const picks: Record<Plat, Asset | null> = { windows: null, macos: null, mobile: null }
  ;(['windows', 'macos', 'mobile'] as Plat[]).forEach((p) => {
    const c = rows.filter((r) => r.verdict.plat === p).sort((a, b) => b.verdict.score - a.verdict.score || a.asset.name.localeCompare(b.asset.name))[0]
    if (c) { c.chosen = true; picks[p] = c.asset }
  })
  return { picks, rows }
}

/* ---------------------------------------------------------------- reading the API answer */

/** The link must point at this repository's own release-asset path for this tag and name; anything else (source ZIPs, other repos, other hosts) is refused. */
function assetUrlOk(url: unknown, tag: string, name: string): boolean {
  try {
    if (typeof url !== 'string') return false
    const u = new URL(url)
    if (u.protocol !== 'https:' || u.hostname !== 'github.com') return false
    const p = u.pathname.split('/').map((s) => decodeURIComponent(s))
    return p.length === 7 && p[1].toLowerCase() === REPO.owner && p[2].toLowerCase() === REPO.name && p[3] === 'releases' && p[4] === 'download' && p[5] === tag && p[6] === name
  } catch { return false }
}

export function normalize(raw: unknown): Release | null {
  const r = raw as Record<string, unknown> | null
  if (!r || typeof r !== 'object' || typeof r.tag_name !== 'string' || !r.tag_name || r.draft === true || r.prerelease === true) return null
  const tag = r.tag_name
  const list = Array.isArray(r.assets) ? (r.assets as Record<string, unknown>[]) : []
  const assets: Asset[] = list
    .filter((a) => a && typeof a.name === 'string' && a.state === 'uploaded' && typeof a.size === 'number' && a.size > 0 && assetUrlOk(a.browser_download_url, tag, a.name as string))
    .map((a) => ({ name: a.name as string, url: a.browser_download_url as string, size: a.size as number }))
  const page = typeof r.html_url === 'string' && r.html_url.startsWith(`https://github.com/${REPO.owner}/${REPO.name}/`) ? r.html_url : RELEASES_PAGE
  return { tag, title: typeof r.name === 'string' && r.name ? r.name : tag, publishedAt: typeof r.published_at === 'string' ? r.published_at : '', pageUrl: page, assets }
}

/* ---------------------------------------------------------------- loading with cache, revalidation and graceful failure */

interface Cached { t: number; etag: string | null; release: Release }
const store = (s: Source) => { try { return s.storage === undefined ? window.localStorage : s.storage } catch { return null } }
const readCache = (s: Source): Cached | null => {
  try { const v = JSON.parse(store(s)?.getItem(KEY) ?? 'null') as Cached | null; return v && typeof v.t === 'number' && v.release && typeof v.release.tag === 'string' && Array.isArray(v.release.assets) ? v : null } catch { return null }
}
const writeCache = (s: Source, c: Cached) => { try { store(s)?.setItem(KEY, JSON.stringify(c)) } catch { /* private mode / quota: just no caching */ } }
const readFail = (s: Source): { until: number; reason: FailReason; retryAt?: number } | null => { try { return JSON.parse(store(s)?.getItem(FAIL_KEY) ?? 'null') } catch { return null } }
const writeFail = (s: Source, v: { until: number; reason: FailReason; retryAt?: number } | null) => { try { store(s)?.setItem(FAIL_KEY, JSON.stringify(v)) } catch { /* ignore */ } }

const inflight = new WeakMap<object, Promise<ReleaseState>>()
const DEFAULT: Source = {}

export function loadLatest(src: Source = DEFAULT, force = false): Promise<ReleaseState> {
  const running = inflight.get(src); if (running && !force) return running
  const p = run(src, force).finally(() => inflight.delete(src))
  inflight.set(src, p); return p
}

async function run(src: Source, force: boolean): Promise<ReleaseState> {
  const now = src.now ?? Date.now, log = src.log ?? (() => {}), cached = readCache(src)
  const fresh = (c: Cached): ReleaseState => ({ status: 'ready', release: c.release, checkedAt: c.t })
  if (cached && !force && now() - cached.t < TTL_MS) { log({ at: now(), kind: 'cache', note: `Cache hit (${Math.round((now() - cached.t) / 60000)} min old, limit 30): no request sent` }); return fresh(cached) }
  const fail = (reason: FailReason, retryAt?: number): ReleaseState => {
    writeFail(src, { until: now() + BACKOFF_MS, reason, retryAt })
    return cached ? { status: 'stale', release: cached.release, checkedAt: cached.t, reason, retryAt } : { status: 'error', reason, retryAt }
  }
  const f = readFail(src)
  if (!force && f && f.until > now()) { log({ at: now(), kind: 'backoff', note: `Last check failed (${f.reason}): not asking GitHub again for ${Math.ceil((f.until - now()) / 60000)} min` }); return cached ? { status: 'stale', release: cached.release, checkedAt: cached.t, reason: f.reason, retryAt: f.retryAt } : { status: 'error', reason: f.reason, retryAt: f.retryAt } }
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), TIMEOUT_MS)
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
  if (cached?.etag) headers['If-None-Match'] = cached.etag
  try {
    const res = await (src.fetcher ?? fetch)(LATEST_API, { headers, signal: ctl.signal })
    log({ at: now(), kind: 'request', note: `GET releases/latest`, ifNoneMatch: headers['If-None-Match'] ?? null, status: res.status })
    if (res.status === 304 && cached) { const c = { ...cached, t: now() }; writeCache(src, c); writeFail(src, null); return fresh(c) }
    if (res.status === 200) {
      const release = normalize(await res.json())
      if (!release) return fail('invalid')
      const c = { t: now(), etag: res.headers.get('etag'), release }; writeCache(src, c); writeFail(src, null); return fresh(c)
    }
    if (res.status === 404) { writeFail(src, null); return { status: 'error', reason: 'none' } }
    const reset = Number(res.headers.get('x-ratelimit-reset'))
    if (res.status === 429 || (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0')) return fail('rate-limit', reset ? reset * 1000 : undefined)
    return fail('http')
  } catch (e) {
    log({ at: now(), kind: 'request', note: 'GET releases/latest', ifNoneMatch: headers['If-None-Match'] ?? null, status: (e as Error)?.name === 'AbortError' ? 'timeout' : 'network error' })
    return fail('network')
  } finally { clearTimeout(timer) }
}

export function useLatestRelease(src: Source = DEFAULT) {
  const [state, setState] = useState<ReleaseState>({ status: 'loading' })
  useEffect(() => {
    let alive = true
    setState({ status: 'loading' }); loadLatest(src).then((s) => alive && setState(s))
    // coming back to the tab later re-checks (cheap: usually answered from the cache or by a 304)
    const onVis = () => { if (document.visibilityState === 'visible') loadLatest(src).then((s) => alive && setState(s)) }
    document.addEventListener('visibilitychange', onVis)
    return () => { alive = false; document.removeEventListener('visibilitychange', onVis) }
  }, [src])
  const retry = useCallback(() => { setState({ status: 'loading' }); loadLatest(src, true).then(setState) }, [src])
  return { state, retry }
}

/* ---------------------------------------------------------------- display helpers */

export const formatSize = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1024).toFixed(1)} KB`)
export const formatDate = (iso: string) => { const d = new Date(iso); return isNaN(+d) ? '' : new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(d) }
export const extOf = (name: string) => name.match(/\.[A-Za-z0-9]+$/)?.[0] ?? ''
