// TEST FIXTURE ONLY (never shipped): a local fake of the YouTube Data API v3 playlistItems/videos endpoints, 62 items over 2 pages.
import http from 'node:http'
export const N = 62
const id = (i) => 'vid' + String(i).padStart(8, '0') // 11 chars
const items = Array.from({ length: N }, (_, i) => ({ snippet: { title: i === 5 ? 'Private video' : i === 9 ? 'Deleted video' : `Fixture video ${i + 1}`, resourceId: { videoId: id(i) } }, status: { privacyStatus: 'public' } }))
export const expected = items.map((x, i) => i).filter((i) => ![5, 9, 12, 20].includes(i)).map(id) // 5/9 hidden titles, 12 missing from videos.list, 20 not embeddable
export function start(port, key = 'TESTKEY') {
  return new Promise((res) => {
    const s = http.createServer((req, rs) => {
      const u = new URL(req.url, 'http://x'); const send = (c, b) => { rs.writeHead(c, { 'content-type': 'application/json' }); rs.end(JSON.stringify(b)) }
      if (u.searchParams.get('key') !== key) return send(403, { error: { status: 'PERMISSION_DENIED', errors: [{ reason: 'keyInvalid' }] } })
      if (u.pathname === '/playlistItems') {
        if (u.searchParams.get('playlistId') === 'PRIVATE') return send(404, { error: { errors: [{ reason: 'playlistNotFound' }] } })
        const start = u.searchParams.get('pageToken') ? 50 : 0
        const slice = items.slice(start, start + 50)
        return send(200, { items: slice, nextPageToken: start === 0 ? 'PAGE2' : undefined })
      }
      if (u.pathname === '/videos') {
        const ids = u.searchParams.get('id').split(',')
        return send(200, { items: ids.map((v) => ({ v, i: +v.slice(3) })).filter((x) => x.i !== 12).map((x) => ({ id: x.v, contentDetails: { duration: ['PT45S', 'PT3M5S', 'PT1H2M3S', 'P0D'][x.i % 4] }, status: { privacyStatus: 'public', uploadStatus: 'processed', embeddable: x.i !== 20 } })) })
      }
      send(404, {})
    }).listen(port, () => res(s))
  })
}
if (process.argv[1]?.endsWith('fake-youtube.mjs')) start(4510).then(() => console.log('fake youtube on 4510'))
