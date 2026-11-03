# RaapNexus – SEO keyword strategy and mapping

Status: **planning document, not measured data.** No search-volume, competition or ranking figures are claimed here. Validate every keyword in Google Keyword Planner and Search Console (see GOOGLE-SETUP-GUIDE.md) before investing further.

## 1. What the site actually is (this decides what we may target)
The site is a **single-page marketing site per language** (`/en/`, `/ar/`, `/fr/`, `/de/`, `/es/`). It presents RaapNexus as a finance platform with four services (Tax Auditing, Financial Auditing, Financial Analysis, Business Analysis) and AI-assisted analysis of ERP financial data. There are no separate service pages, and none were created just to hold keywords. The ERP demo (`/erp/dashboard.html`) is a product sample and is not an SEO landing page.

Consequence: one URL per language must carry the whole keyword set, so we target **one theme per heading** instead of repeating every phrase.

## 2. Keyword mapping (actual pages)
| URL | Page role | Primary focus | Supporting phrases (use naturally, only where true) |
|---|---|---|---|
| `/en/` | Home (all content) | RaapNexus; finance platform; ultimate finance platform | financial management platform, business finance platform, digital finance solutions |
| `/en/` – H2/H3 "Tax Auditing" | Section | tax auditing; tax audit solutions | tax compliance, VAT review, tax audit software |
| `/en/` – H3 "Financial Auditing" | Section | financial auditing; financial audit solutions | ledger-to-bank tracing, financial compliance and auditing |
| `/en/` – H3 "Financial Analysis" | Section | financial analysis; financial performance analysis | financial reporting and analysis, financial insights |
| `/en/` – H3 "Business Analysis" | Section | business analysis; business performance analysis | business decision support, business performance insights |
| `/ar/ /fr/ /de/ /es/` | Translated home | The same themes in each language (translated keyword research, **not** literal translation) | – |
| Contact (modal, not a URL) | Conversion | – (no index target) | – |

Not mapped (no matching page or unverified service): "in India" / "in UAE" geo-modifiers, "for SMEs", "internal financial audit", "tax audit software" as a product claim. Add them only when (a) the company confirms it serves that market/offering and (b) a real page or section exists for it. Dedicated pages later: `/en/tax-auditing/`, `/en/financial-auditing/`, etc. – create them only with genuine content.

## 3. Intent and priority (qualitative judgement, to be verified)
| Group | Typical intent | Notes |
|---|---|---|
| Brand: RaapNexus | Navigational | Will rank for the brand once indexed; no competition. |
| Finance / financial management platform | Commercial investigation | Very broad and competitive (large vendors); expect slow progress. |
| Tax / financial auditing *services* | Commercial, often local | Dominated by audit firms; the site positions a **platform**, so prefer "software/solutions/platform" wording where accurate. |
| Financial / business analysis | Informational + commercial | Broad; long-tail phrases are more realistic. |
| Country modifiers (India, UAE) | Local-commercial | Needs verified presence/offer and likely dedicated pages. |

Recommended first-wave targets: **RaapNexus**, **finance platform**, **tax auditing solutions**, **financial audit solutions**, **financial analysis platform**, **business performance analysis**. Re-rank after 4–8 weeks of Search Console data.

## 4. Where keywords live in the implementation
- `<title>` (EN): `RaapNexus | Tax Auditing, Financial Auditing & Business Analysis`
- Meta description (EN): `Explore RaapNexus, your finance platform for tax auditing, financial auditing, financial analysis, and business analysis. Gain clearer financial insights and make informed business decisions.`
- One `<h1>` per page; the service names are headings (H3 in the prerendered fallback, section headings in the app).
- Per-language title/description/canonical/hreflang/Open Graph are generated from the locale files by `scripts/prerender.mjs` and `src/i18n/seo.ts`.
- `meta keywords` is kept for completeness only; Google ignores it.

## 5. Next steps requiring access you control
1. Keyword Planner: export volume/competition for India and the GCC markets for each group above.
2. Search Console: after 2–4 weeks check the Queries report and move proven queries into headings/copy.
3. Decide with the business whether to build dedicated service pages (recommended once real content exists).
