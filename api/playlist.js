// Vercel Serverless Function: GET /api/playlist
// Returns the complete, current list of PUBLIC, embeddable videos of the RaapNexus YouTube playlist, in playlist order.
// Method: YouTube Data API v3  playlistItems.list (all pages, via nextPageToken)  +  videos.list (duration, privacy, embeddable) in batches of 50.
// The API key stays on the server (environment variable); the browser only ever receives { videos: [{ id, title, duration }] }.
//   YOUTUBE_API_KEY      required – a YouTube Data API v3 key (Google Cloud Console; restrict it to "YouTube Data API v3")
//   YOUTUBE_PLAYLIST_ID  optional – defaults to the RaapNexus playlist
//   YOUTUBE_API_URL      optional – override of the API origin (used by tests)
// Responses are CDN-cached for an hour (stale-while-revalidate a day), so the API is called a handful of times per day, not per visit.
const DEFAULT_PLAYLIST = 'PLEMXetHdTT-8'
const API = 'https://www.googleapis.com/youtube/v3'
const HIDDEN_TITLES = new Set(['private video', 'deleted video'])

export function parseDuration(iso) {
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(String(iso || ''))
  if (!m) return null
  const s = (+m[1] || 0) * 86400 + (+m[2] || 0) * 3600 + (+m[3] || 0) * 60 + (+m[4] || 0)
  return s > 0 ? s : null // live / premiere placeholders report 0
}

class UpstreamError extends Error { constructor(status, reason) { super(reason || 'upstream'); this.status = status; this.reason = reason } }

async function get(fetchImpl, base, path, params, key) {
  const u = new URL(base + path)
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v)
  u.searchParams.set('key', key)
  const r = await fetchImpl(u, { headers: { accept: 'application/json' } })
  const body = await r.json().catch(() => ({}))
  if (!r.ok) throw new UpstreamError(r.status, body?.error?.errors?.[0]?.reason || body?.error?.status || 'upstream') // never echo the URL (it contains the key)
  return body
}

/** Pure + injectable so it can be tested against a local fake YouTube API. */
export async function loadPlaylist({ key, playlistId = DEFAULT_PLAYLIST, base = API, fetchImpl = fetch }) {
  const items = []
  let pageToken = ''
  for (let page = 0; page < 40; page++) { // hard stop at 2000 items
    const p = { part: 'snippet,status', playlistId, maxResults: '50' }
    if (pageToken) p.pageToken = pageToken
    const d = await get(fetchImpl, base, '/playlistItems', p, key)
    for (const it of d.items || []) {
      const id = it?.snippet?.resourceId?.videoId
      const title = String(it?.snippet?.title || '').trim()
      if (!id || HIDDEN_TITLES.has(title.toLowerCase())) continue // private or deleted entries are anonymised by YouTube
      items.push({ id, title })
    }
    pageToken = d.nextPageToken || ''
    if (!pageToken) break
  }
  const info = new Map()
  for (let i = 0; i < items.length; i += 50) {
    const ids = items.slice(i, i + 50).map((v) => v.id).join(',')
    const d = await get(fetchImpl, base, '/videos', { part: 'contentDetails,status', id: ids, maxResults: '50' }, key)
    for (const v of d.items || []) info.set(v.id, v)
  }
  const seen = new Set()
  const videos = []
  for (const v of items) {
    const x = info.get(v.id)
    if (!x || seen.has(v.id)) continue // not returned = deleted/private/unavailable
    if (x.status?.embeddable === false) continue
    if (x.status?.privacyStatus && x.status.privacyStatus !== 'public' && x.status.privacyStatus !== 'unlisted') continue
    if (x.status?.uploadStatus && x.status.uploadStatus !== 'processed') continue
    seen.add(v.id)
    videos.push({ id: v.id, title: v.title, duration: parseDuration(x.contentDetails?.duration) })
  }
  return { videos, total: videos.length, fetchedAt: new Date().toISOString() }
}

export default async function handler(req, res) {
  res.setHeader('content-type', 'application/json; charset=utf-8')
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.setHeader('allow', 'GET, HEAD'); return res.status(405).send(JSON.stringify({ error: 'method_not_allowed' })) }
  const key = process.env.YOUTUBE_API_KEY
  if (!key) { res.setHeader('cache-control', 'no-store'); return res.status(503).send(JSON.stringify({ error: 'not_configured' })) }
  try {
    const data = await loadPlaylist({ key, playlistId: process.env.YOUTUBE_PLAYLIST_ID || DEFAULT_PLAYLIST, base: process.env.YOUTUBE_API_URL || API })
    res.setHeader('cache-control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).send(JSON.stringify(data))
  } catch (e) {
    res.setHeader('cache-control', 'no-store')
    return res.status(502).send(JSON.stringify({ error: 'upstream', status: e.status || 0, reason: e.reason || 'unknown' }))
  }
}
