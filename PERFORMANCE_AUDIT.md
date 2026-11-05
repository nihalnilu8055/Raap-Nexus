# RaapNexus — Performance Audit (Phase 1)

Date: Thu 5 Nov 2026. **Read-only audit: no source files were modified.** Measurements are in `PERFORMANCE_BASELINE.md` (local Lighthouse, 3 runs each; PageSpeed Insights and the live site were unreachable from the work environment, and Google Fonts could not be measured).

## 1. Architecture

| Area | Finding |
|---|---|
| Stack | Vite 5 + React 18 + TypeScript (strict), Tailwind 3, react-router 6, framer-motion 11, GSAP 3 + ScrollTrigger, three 0.169 + @react-three/fiber 8 |
| Rendering | Client-side SPA. `scripts/prerender.mjs` writes per-language `index.html` (SEO head, JSON-LD, a text-only SEO body) for en/ar/fr/de/es; React replaces `#root` at runtime (no hydration of real markup) |
| Routing / i18n | `/:lang` → `LangRoute` (lazy `VideoLibrary`), JSON locale files bundled into the main chunk |
| Chunks | `manualChunks`: vendor, charts (empty), motion, gsap, three. All home sections are statically imported into `index` |
| 3D | 10 R3F `<Canvas>` files: HeroOrbitScene, HeroDepthScene (desktop), NetworkScene, FinIntel, Audit, AuditIntel, FlowCore, Engine, Deploy (+ dead `HeroScene.tsx`). Each is `lazy()` and mounts near the viewport; most use `frameloop={active ? 'always' : 'never'}`. DPR caps 1.25–1.75 |
| Animation | GSAP ScrollTrigger in Hero, FlowCore, AuditSection, AiFinance, Deployment, CountUp (12 `scrollTrigger`/`ScrollTrigger.create` sites, 2 scroll listeners, 5 rAF call sites in app code); framer-motion for entrances |
| Assets | `public/assets`: hero art (webp 600/900/1600 + 595 KB PNG, **no longer referenced**), 11 product screenshots (webp 1440×900, 100–140 KB), provider SVGs, logos, `r-icon.png` |
| Fonts | Google Fonts CSS (Manrope 4 weights, Inter 4, JetBrains Mono 2) via `preload … onload` swap; preconnect to fonts.googleapis.com / fonts.gstatic.com |
| Third-party | None at runtime except Google Fonts and YouTube (thumbnails `img.youtube.com`; iframe `youtube-nocookie.com` only after click). GA4 only if `VITE_GA_MEASUREMENT_ID` is set (it loads nothing otherwise) |
| Vercel | `vercel.json`: security headers; `/assets/*.(js|css|woff2)` immutable 1 y; `/assets/*.(webp|png|svg|jpg)` 7 d + SWR; rewrites/redirects per language. No header rule for HTML, favicons or `/erp/` |

## 2. Baseline (details in PERFORMANCE_BASELINE.md)

| | Mobile (median of 3) | Desktop (median of 3) |
|---|---:|---:|
| Score | **38** (reported by you: 43) | **50** (reported: 54) |
| LCP | 10.6 s | 2.3 s |
| TBT | 7.3 s | 1.7 s |
| FCP / CLS | 0.92 s / 0 | 0.25 s / 0 |
| Transfer / requests | 1.68 MB / 20 | 1.88 MB / 23 |
| Initial JS (gz) | 205 KB | 205 KB |

## 3. The 10 biggest bottlenecks, ranked by impact

### 1. WebGL scene start-up during the load window — dominant cost
- **Evidence:** with only the `three` chunk blocked, mobile TBT drops 7.3 s → 0.25–0.45 s and the score 38 → 66/95 (2 runs). Long tasks of 4.6 s, 1.2 s and 0.8 s fall at 8–11 s, after `three-*.js` (requested at ~0.57 s) and `HeroOrbitScene` load. Software GL in the lab (and PSI) makes each frame/shader compile expensive on the main/raster path.
- **Why:** `HeroOrbit` mounts its scene after `requestIdleCallback` (≤2.5 s timeout) and `Hero` mounts `HeroDepthScene` on desktop the same way — both inside Lighthouse's measurement window.
- **Opportunity:** the largest available (TBT, LCP, TTI, Speed Index all follow). Start scenes after the page is interactive/first user input or a safe delay, keep the identical scene once it starts (the DOM/CSS core already renders the full R-in-sphere first).
- **Risk:** medium — the hero visual must still appear (it does: DOM version fades to WebGL). Needs visual-regression check.

### 2. LCP element is client-rendered hero text delayed by the blocked main thread
- **Evidence:** Lighthouse LCP element = hero sub-paragraph (`p.pointer-events-auto`, "Smarter financial insights…"); FCP is 0.92 s but LCP 10.6 s; element render delay ≈ 4.1 s in the breakdown. The text carries a framer-motion entrance (opacity 0→1, 0.7 s delay) and React must render before it exists (SPA; prerendered body is SEO-only).
- **Opportunity:** mostly resolves with #1; additionally keep the LCP text paintable without waiting for long tasks (no behavioural change).
- **Risk:** low–medium (hero animation timing must stay the same).

### 3. `three` chunk: 815 KB raw / 219 KB gz, 3.3 s script evaluation
- **Evidence:** bootup table: `three-*.js` 3,312 ms scripting; the chunk is the largest transfer after images.
- **Opportunity:** keep it out of the load window (#1), prefetch only after idle; check imports are tree-shake friendly (named imports are used; `RoomEnvironment` from examples).
- **Risk:** low.

### 4. Oversized images — Lighthouse image-delivery estimate 1,046 KiB
- `r-icon.png` 330 KB at 714×798, displayed at 48–96 px (the CSS fallback core) — **and fetched twice** (322 KB × 2: the `<link rel=preload>` plus the `<img>`/WebGL texture request) = 644 KB.
- `logo-header.png` 196 KB at 1063×244, displayed at 157×36.
- `logo-light.png` 96 KB (footer logo) is downloaded at load although it is far below the fold.
- Product screenshots 1440×900 (100–140 KB each) shown at ≤ ~700 px wide; two are fetched in the initial mobile load.
- **Note:** `r-icon.png`, `logo-header.png` and the preload were added in the last two tasks; this is a regression from those changes, not a legacy issue.
- **Opportunity:** high, zero visual change (same artwork, right-sized WebP/PNG, one fetch, `loading="lazy"` for the footer logo, `srcset` for screenshots). Transparency must be preserved (WebP alpha is fine).
- **Risk:** low.

### 5. Everything on the home page is in one eager chunk (+ two animation libraries up front)
- **Evidence:** `index` 260 KB (83 KB gz) + `motion` 41 KB gz + `gsap` 28 KB gz + `vendor` 53 KB gz = 205 KB gz before first render; Lighthouse "unused JavaScript" ≈ 100 KiB (550 ms); bootup: vendor 2.6 s total, motion 0.5 s.
- **Opportunity:** lazy-load below-the-fold sections (they are already `near`-mounted), load GSAP ScrollTrigger only when first needed; the hero keeps framer-motion.
- **Risk:** medium (section order, anchors `#platform` etc., ScrollTrigger refresh, SEO prerender text stays).

### 6. Scenes are never unmounted: 5–6 live WebGL canvases and ~2,500 rAF callbacks while scrolling
- **Evidence:** Playwright: canvases alive after scrolling 5 (mobile) / 6 (desktop); `frameloop` stops rendering off-screen but contexts, geometries and textures stay allocated; 8 `getContext('webgl*')` calls happened in the first second for one visible canvas (feature detection + R3F).
- **Opportunity:** memory/GPU headroom on low-end phones, fewer long tasks on scroll; unmount (and dispose) a scene once it is far from the viewport, cache the WebGL support probe.
- **Risk:** medium (scene re-entry must restart smoothly with no visible pop).

### 7. Web fonts: 3 families / 10 weights from two third-party origins — *not measured here*
- **Evidence (static):** `index.html` lines 11–15; Google CSS then `fonts.gstatic.com` WOFF2 files. The sandbox cannot reach Google, so impact is unknown; the swap pattern avoids render blocking but adds a request chain and delays correct typography (CLS 0 in lab without fonts).
- **Opportunity:** self-hosted latin-subset WOFF2 (same families/weights) removes two connections; preload only Manrope 800 + Inter 400.
- **Risk:** low; typography must be visually identical (verify metrics).

### 8. Render-blocking CSS and GPU-costly effects
- **Evidence:** render-blocking insight: `index.css` (16 KB gz) ≈ 280–310 ms; ~30 `blur-*`/`backdrop-blur` usages (header, hero glows, tooltips). Paint/composite itself is small (0.2 s), so this is minor.
- **Opportunity:** small; inline critical CSS is possible but adds risk. Low priority.

### 9. Caching and delivery rules (Vercel config)
- **Evidence:** `vercel.json` gives images 7 d + SWR while hashed JS/CSS get 1 y immutable; no rule for `/favicon*`, `/icon-*`, `/site.webmanifest`, `/erp/`; `r-icon.png`, `logo*.png` are unhashed so a long TTL needs renaming. The local "cache" insight (1.6 MB) is a local-server artefact, not a Vercel finding.
- **Opportunity:** modest repeat-visit gains; zero effect on first-load lab score.
- **Risk:** low.

### 10. Dead assets and code in the deployment
- **Evidence:** `public/assets/hero/*` (595 KB PNG ×2 + webp sets, ~2 MB total) are no longer referenced after the orbit change; `src/components/ui/HeroVisual.tsx` and `src/three/HeroScene.tsx` have no importers; `recharts` is only used by `DashboardPreview` (non-home pages) and produces an empty `charts` chunk on the home page.
- **Opportunity:** smaller deploy, no first-load effect. Do not remove `recharts` until the product-detail route is checked.
- **Risk:** low (but needs your confirmation before deleting files).

### Looked at and found NOT to be problems
- CLS is 0 on both form factors; images have width/height (`unsized-images` passes).
- DOM size is small (~950 nodes), JS heap 18–20 MB, forced reflow ≈ 48 ms, style/layout 0.8 s.
- GSAP: 12 ScrollTrigger sites, all created inside `gsap.context` and reverted on unmount; no duplicate scroll listeners (2 total). No evidence it is a bottleneck by itself (the 4.6 s "gsap.js" long task coincides with scene rendering, not with timeline work).
- Third-party: none beyond fonts/YouTube; analytics is inert without an ID.

## 4. Recommended implementation order

| Order | Change | Evidence | Expected effect | Visual risk |
|---|---|---|---|---|
| 1 | Images: right-size `r-icon`, `logo-header`, footer logo; single fetch; `srcset` for screenshots; lazy footer logo | #4 | −0.6 to −1 MB transfer; faster LCP/SI | none |
| 2 | Move scene start-up out of the load window (hero orbit + depth scene), keep identical scenes | #1, #3 | largest TBT/LCP/TTI gain (diagnostic: TBT 7.3 s → <0.5 s) | low |
| 3 | Keep LCP text independent of scene work; no change to animation | #2 | LCP | none |
| 4 | Scene lifecycle: cache WebGL probe; dispose/unmount far scenes | #6 | memory, scroll smoothness | low–medium |
| 5 | Lazy-load below-the-fold sections and GSAP | #5 | −50–100 KB initial JS | medium |
| 6 | Self-host fonts (latin WOFF2) | #7 | needs real-world verification | low |
| 7 | Cache headers, dead asset clean-up (with your OK) | #9, #10 | repeat visits / deploy size | none |

## 5. Targets — honest expectation
The diagnostic shows mobile 90+ is reachable in the lab only if the 3D start-up leaves the measured window; images alone will not get there. Desktop 95+ is less certain (desktop TBT 1.7 s also comes from the depth scene). Final numbers will be measured, not promised.

## 6. Limits of this audit
No PSI/field data, no web-font timings, no real-device GPU profile, local server instead of Vercel CDN. Re-measure on the deployed URL after any deploy.
