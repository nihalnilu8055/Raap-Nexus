<?php
// Apache / cPanel equivalent of api/playlist.js: GET /api/playlist  (routed here by public/.htaccess)
// Returns the complete, current list of PUBLIC, embeddable videos of the RaapNexus YouTube playlist, in playlist order:
//   { "videos": [ { "id", "title", "duration" } ], "total": N, "fetchedAt": "..." }
// Method: YouTube Data API v3 playlistItems.list (every page) + videos.list (duration, privacy, embeddable).
// The API key is NEVER in this file or in the web root. Provide it in ONE of these ways:
//   1. environment variable YOUTUBE_API_KEY  (cPanel > Setup PHP / MultiPHP INI Editor or the host's env settings), or
//   2. a file ONE LEVEL ABOVE the web root named  raapnexus-youtube.php  containing:   <?php return ['key' => 'YOUR_KEY'];
// Optional: YOUTUBE_PLAYLIST_ID, YOUTUBE_API_URL (tests only). The result is cached on disk for one hour (stale copy served if YouTube is down).
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function out(int $status, array $body, string $cache): void {
  http_response_code($status);
  header('Cache-Control: ' . $cache);
  echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

if (!in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', ['GET', 'HEAD'], true)) { header('Allow: GET, HEAD'); out(405, ['error' => 'method_not_allowed'], 'no-store'); }

$key = getenv('YOUTUBE_API_KEY') ?: '';
if ($key === '') {
  $cfg = dirname($_SERVER['DOCUMENT_ROOT'] ?? __DIR__) . '/raapnexus-youtube.php';
  if (is_file($cfg)) { $c = include $cfg; if (is_array($c) && !empty($c['key'])) $key = (string)$c['key']; }
}
if ($key === '') out(503, ['error' => 'not_configured'], 'no-store');

$playlist = getenv('YOUTUBE_PLAYLIST_ID') ?: 'PLEMXetHdTT-8';
$base = getenv('YOUTUBE_API_URL') ?: 'https://www.googleapis.com/youtube/v3';
$cacheFile = sys_get_temp_dir() . '/raapnexus-playlist-' . md5($playlist) . '.json';
$ttl = 3600;

if (is_file($cacheFile) && time() - filemtime($cacheFile) < $ttl) {
  $hit = file_get_contents($cacheFile);
  if ($hit !== false && $hit !== '') { header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: public, max-age=300'); echo $hit; exit; }
}

function yt(string $base, string $path, array $params, string $key): array {
  $params['key'] = $key;
  $url = $base . $path . '?' . http_build_query($params);
  $ctx = stream_context_create(['http' => ['timeout' => 12, 'ignore_errors' => true, 'header' => "Accept: application/json\r\n"]]);
  $raw = @file_get_contents($url, false, $ctx);
  $status = 0;
  foreach (($http_response_header ?? []) as $h) if (preg_match('#^HTTP/\S+\s+(\d{3})#', $h, $m)) $status = (int)$m[1];
  $data = is_string($raw) ? json_decode($raw, true) : null;
  if ($status < 200 || $status >= 300 || !is_array($data)) {
    $reason = is_array($data) ? ($data['error']['errors'][0]['reason'] ?? ($data['error']['status'] ?? 'upstream')) : 'unreachable';
    throw new RuntimeException(json_encode(['status' => $status, 'reason' => (string)$reason])); // never echo the URL (it contains the key)
  }
  return $data;
}

function duration(?string $iso): ?int {
  if (!$iso || !preg_match('/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/', $iso, $m)) return null;
  $s = ((int)($m[1] ?? 0)) * 86400 + ((int)($m[2] ?? 0)) * 3600 + ((int)($m[3] ?? 0)) * 60 + (int)($m[4] ?? 0);
  return $s > 0 ? $s : null;
}

try {
  $items = []; $token = '';
  for ($page = 0; $page < 40; $page++) {
    $p = ['part' => 'snippet,status', 'playlistId' => $playlist, 'maxResults' => '50'];
    if ($token !== '') $p['pageToken'] = $token;
    $d = yt($base, '/playlistItems', $p, $key);
    foreach (($d['items'] ?? []) as $it) {
      $id = $it['snippet']['resourceId']['videoId'] ?? '';
      $title = trim((string)($it['snippet']['title'] ?? ''));
      if ($id === '' || in_array(strtolower($title), ['private video', 'deleted video'], true)) continue;
      $items[] = ['id' => $id, 'title' => $title];
    }
    $token = (string)($d['nextPageToken'] ?? '');
    if ($token === '') break;
  }
  $info = [];
  foreach (array_chunk($items, 50) as $chunk) {
    $d = yt($base, '/videos', ['part' => 'contentDetails,status', 'id' => implode(',', array_column($chunk, 'id')), 'maxResults' => '50'], $key);
    foreach (($d['items'] ?? []) as $v) $info[$v['id']] = $v;
  }
  $videos = []; $seen = [];
  foreach ($items as $v) {
    $x = $info[$v['id']] ?? null;
    if (!$x || isset($seen[$v['id']])) continue;
    $st = $x['status'] ?? [];
    if (($st['embeddable'] ?? true) === false) continue;
    if (isset($st['privacyStatus']) && !in_array($st['privacyStatus'], ['public', 'unlisted'], true)) continue;
    if (isset($st['uploadStatus']) && $st['uploadStatus'] !== 'processed') continue;
    $seen[$v['id']] = true;
    $videos[] = ['id' => $v['id'], 'title' => $v['title'], 'duration' => duration($x['contentDetails']['duration'] ?? null)];
  }
  $json = json_encode(['videos' => $videos, 'total' => count($videos), 'fetchedAt' => gmdate('c')], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  @file_put_contents($cacheFile, $json, LOCK_EX);
  header('Cache-Control: public, max-age=300');
  echo $json;
} catch (Throwable $e) {
  if (is_file($cacheFile)) { $stale = file_get_contents($cacheFile); if ($stale) { header('Cache-Control: public, max-age=60'); echo $stale; exit; } }
  $info = json_decode($e->getMessage(), true);
  out(502, ['error' => 'upstream', 'status' => (int)($info['status'] ?? 0), 'reason' => (string)($info['reason'] ?? 'unknown')], 'no-store');
}
