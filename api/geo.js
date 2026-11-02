// Vercel Edge Function: returns only the visitor's country code, taken from the CDN's coarse IP→country header.
// No IP is stored or returned, no precise location is read, no browser permission is requested.
export const config = { runtime: 'edge' }

export default function handler(req) {
  const country = req.headers.get('x-vercel-ip-country') || null
  return new Response(JSON.stringify({ country }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'private, no-store' },
  })
}
