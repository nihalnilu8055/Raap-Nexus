# RaapNexus — Performance Baseline

Recorded: Thu 5 Nov 2026 (IST). **No source code was changed to produce these numbers.**
Build tested: current `main` working copy after the logo / hero-orbit / header work (`npm run build`, `dist/` served by `tests/serve.mjs` with gzip).

## How this was measured (and what could not be)

| Item | Detail |
|---|---|
| Tool | Lighthouse 13.6.0 CLI (performance category), headless Chromium 153, 3 runs per form factor |
| Mobile | Lighthouse default mobile: Moto G Power emulation, simulated Slow 4G, 4x CPU slowdown |
| Desktop | `--preset=desktop` (simulated throttling) |
| URL | `http://localhost:4310/en/` — the production build served locally |
| WebGL | Software rendering (SwiftShader) — the same situation PageSpeed Insights' lab runs are in (no GPU) |
| **Not possible** | **Google PageSpeed Insights and the live site could not be reached** from the work environment (egress proxy blocks `googleapis.com` and `raap-nexus-new.vercel.app`). Google Fonts (`fonts.googleapis.com`) is also blocked, so **web-font cost is not included** in these numbers. |
| Differences vs Vercel | Local server has gzip, no brotli, no CDN, ~0 ms latency (Lighthouse simulates latency), and no Cache-Control headers (so Lighthouse's "cache" findings are not representative of Vercel). |
| INP | Not measurable in a Lighthouse navigation run (needs real interactions / field data). TBT is reported as the lab proxy. |

Sanity check: the local lab scores (mobile 38, desktop 50) are close to the figures you reported from PageSpeed Insights (43 / 54), so the local lab reproduces the same problem.

## Results (3 runs each)

### Mobile

| Metric | Run 1 | Run 2 | Run 3 | Median |
|---|---:|---:|---:|---:|
| **Performance score** | 38 | 39 | 38 | **38** |
| FCP | 921 ms | 922 ms | 909 ms | 921 ms |
| **LCP** | 10,670 ms | 10,470 ms | 10,631 ms | **10,631 ms** |
| **TBT** | 7,809 ms | 6,475 ms | 7,279 ms | **7,279 ms** |
| CLS | 0 | 0 | 0 | 0 |
| Speed Index | 6,874 ms | 6,738 ms | 7,145 ms | 6,874 ms |
| TTI | 16,725 ms | 16,174 ms | 17,454 ms | 16,725 ms |
| Page transfer | 1,680 KB | 1,680 KB | 1,749 KB | 1,680 KB |
| Requests | 20 | 20 | 21 | 20 |
| Main-thread work | 22.6 s | 21.0 s | 23.3 s | 22.6 s |
| JS execution (bootup) | 5.4 s | 4.8 s | 5.2 s | 5.2 s |

### Desktop

| Metric | Run 1 | Run 2 | Run 3 | Median |
|---|---:|---:|---:|---:|
| **Performance score** | 49 | 57 | 50 | **50** |
| FCP | 255 ms | 246 ms | 251 ms | 251 ms |
| **LCP** | 2,357 ms | 1,484 ms | 2,265 ms | **2,265 ms** |
| **TBT** | 2,057 ms | 1,689 ms | 1,622 ms | **1,689 ms** |
| CLS | 0 | 0 | 0 | 0 |
| Speed Index | 3,835 ms | 3,378 ms | 4,010 ms | 3,835 ms |
| TTI | 6,383 ms | 3,482 ms | 3,526 ms | 3,526 ms |
| Page transfer | 1,880 KB | 1,752 KB | 1,880 KB | 1,880 KB |
| Requests | 23 | 22 | 23 | 23 |
| Main-thread work | 15.6 s | 13.3 s | 16.5 s | 15.6 s |

Run-to-run spread is real (desktop 49–57), so single scores should not be compared with a few-point difference.

## Bundle sizes (production build)

| Chunk | Raw | Gzip | Loaded |
|---|---:|---:|---|
| `index` (app + all home sections) | 260.6 KB | 83.3 KB | initial |
| `vendor` (react, react-dom, router) | 162.1 KB | 52.9 KB | initial (modulepreload) |
| `motion` (framer-motion) | 123.5 KB | 41.3 KB | initial (modulepreload) |
| `gsap` (+ScrollTrigger) | 70.4 KB | 27.8 KB | initial (modulepreload) |
| **Initial JS total** | **616.6 KB** | **205.3 KB** | |
| `three` + R3F | 815.2 KB | 219.0 KB | lazy, but requested ~0.6 s after load by the hero scene |
| 8 scene chunks | 5–15 KB each | 2–6 KB | lazy |
| CSS `index` | 93.1 KB | 16.1 KB | initial, render-blocking |

## Diagnostic experiment (no code change)

To measure how much the 3D layer costs in the lab, the `three-*.js` chunk was **blocked at the network level** (Lighthouse `--blocked-url-patterns`), mobile, 2 runs:

| Run | Score | FCP | LCP | TBT | Speed Index |
|---|---:|---:|---:|---:|---:|
| three blocked #1 | 95 | 905 ms | 905 ms | 253 ms | 2,883 ms |
| three blocked #2 | 66 | 907 ms | 6,382 ms | 453 ms | 2,708 ms |

TBT falls from ~7.3 s to 0.25–0.45 s. Run 2's late LCP shows the result is not stable with only two samples; treat it as "WebGL is the dominant cost", not as a score promise.

## Runtime observations (Playwright, mobile 390×844 and desktop 1440×900)

| Observation | Mobile | Desktop |
|---|---|---|
| `<canvas>` elements 1 s / 6 s after load (no scrolling) | 1 / 1 | 1 / 2 |
| `getContext('webgl*')` calls in first second | 8 | 8 |
| Canvases alive at the same time after scrolling the page | 5 | 6 |
| `requestAnimationFrame` calls while scrolling (~13 s) | ~2,500 | ~1,360 |
| DOM nodes | 946 | 967 |
| JS heap after load | 18 MB | 20 MB |

Not measured: GPU memory, real-device behaviour, field (CrUX) data.
