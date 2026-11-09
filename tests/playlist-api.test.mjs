import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { start, expected } from './fake-youtube.mjs'
import handler, { loadPlaylist, parseDuration } from '../api/playlist.js'
const srv = await start(4510); const BASE = 'http://127.0.0.1:4510'
// --- Node (Vercel) -----------------------------------------------------------------------------------------------
const d = await loadPlaylist({ key: 'TESTKEY', base: BASE })
assert.deepEqual(d.videos.map((v) => v.id), expected); assert.equal(d.total, 58)
assert.equal(d.videos[0].title, 'Fixture video 1'); assert.equal(d.videos[0].duration, 45); assert.equal(d.videos[1].duration, 185); assert.equal(d.videos[2].duration, 3723); assert.equal(d.videos[3].duration, null)
assert.equal(parseDuration('PT10M'), 600); assert.equal(parseDuration('garbage'), null)
const run = async (env) => { Object.assign(process.env, env); let status, body, headers = {}; await handler({ method: 'GET' }, { status(c) { status = c; return this }, setHeader(k, v) { headers[k.toLowerCase()] = v }, send(b) { body = JSON.parse(b) } }); return { status, body, headers } }
delete process.env.YOUTUBE_API_KEY
let r = await run({}); assert.equal(r.status, 503); assert.equal(r.body.error, 'not_configured')
r = await run({ YOUTUBE_API_KEY: 'TESTKEY', YOUTUBE_API_URL: BASE }); assert.equal(r.status, 200); assert.equal(r.body.total, 58); assert.match(r.headers['cache-control'], /s-maxage=3600/)
r = await run({ YOUTUBE_API_KEY: 'WRONG' }); assert.equal(r.status, 502); assert.equal(r.body.reason, 'keyInvalid'); assert.ok(!JSON.stringify(r.body).includes('WRONG'), 'key must never be echoed')
r = await run({ YOUTUBE_API_KEY: 'TESTKEY', YOUTUBE_PLAYLIST_ID: 'PRIVATE' }); assert.equal(r.status, 502); assert.equal(r.body.reason, 'playlistNotFound')
console.log('node handler OK: 58 of 62 items kept (2 hidden titles, 1 missing, 1 non-embeddable), pagination, errors, no key leak')
// --- PHP (cPanel) ------------------------------------------------------------------------------------------------
const php = (env, port) => spawn('php', ['-S', `127.0.0.1:${port}`, '-t', 'public'], { env: { ...process.env, ...env }, stdio: 'ignore' })
const wait = (ms) => new Promise((x) => setTimeout(x, ms))
const get = async (port) => { const x = await fetch(`http://127.0.0.1:${port}/api/playlist.php`); return { status: x.status, body: await x.json() } }
let p = php({ YOUTUBE_API_KEY: '', YOUTUBE_API_URL: BASE }, 4521); await wait(800)
let q = await get(4521); assert.equal(q.status, 503); assert.equal(q.body.error, 'not_configured'); p.kill()
p = php({ YOUTUBE_API_KEY: 'TESTKEY', YOUTUBE_API_URL: BASE, YOUTUBE_PLAYLIST_ID: 'PLTESTA' }, 4522); await wait(800)
q = await get(4522); assert.equal(q.status, 200); assert.deepEqual(q.body.videos.map((v) => v.id), expected); assert.equal(q.body.videos[2].duration, 3723); assert.equal(q.body.videos[3].duration, null); p.kill()
p = php({ YOUTUBE_API_KEY: 'WRONG', YOUTUBE_API_URL: BASE, YOUTUBE_PLAYLIST_ID: 'PLTESTB' }, 4523); await wait(800)
q = await get(4523); assert.equal(q.status, 502); assert.equal(q.body.reason, 'keyInvalid'); assert.ok(!JSON.stringify(q.body).includes('WRONG')); p.kill()
console.log('php endpoint OK: 58 videos, durations, 503 without key, 502 with bad key, no key leak')
srv.close(); process.exit(0)
