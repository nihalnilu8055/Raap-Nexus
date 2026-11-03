# Google setup guide for RaapNexus (beginner friendly)

Production site: https://raap-nexus-new.vercel.app/  ·  Sitemap: https://raap-nexus-new.vercel.app/sitemap.xml

> A `*.vercel.app` address is a shared Vercel domain. You **cannot add DNS records** there, so DNS (Domain property) verification is only possible once RaapNexus has its own domain (e.g. `raapnexus.com`). Until then use the **URL-prefix** method in Step 1B. When the custom domain is connected, also update `VITE_SITE_URL` in Vercel and rebuild so canonicals, hreflang and the sitemap use the new domain.

## Step 1 – Google Search Console  https://search.google.com/search-console/
1. Sign in with the Google account that should own the data (use a shared company account, not a personal one).
2. Click **Add property**.
### 1A. Domain property (needs your own domain – recommended)
3. Choose **Domain**, enter `yourdomain.com`, click **Continue**.
4. Google shows a **TXT record** (starts with `google-site-verification=`). Copy it.
5. Open your domain provider (GoDaddy, Namecheap, Cloudflare, etc.) → **DNS settings** → **Add record**: Type `TXT`, Host/Name `@`, Value = the copied text, TTL default. Save.
6. Back in Search Console click **Verify** (DNS can take minutes to 48 h; click again later if it fails).
### 1B. URL-prefix property (works on vercel.app)
3. Choose **URL prefix**, enter `https://raap-nexus-new.vercel.app/`.
4. Pick **HTML tag**; Google gives `<meta name="google-site-verification" content="...">`. Send me the code (or add it to `index.html` head) and redeploy; then click **Verify**. (HTML-file upload is also accepted.)
### After verification
7. **Sitemaps** (left menu) → enter `sitemap.xml` → **Submit**. Status should become *Success* (5 URLs, one per language).
8. **URL inspection** (top bar) → paste `https://raap-nexus-new.vercel.app/en/` → wait → **Request indexing**. Repeat for `/ar/`, `/fr/`, `/de/`, `/es/`.
9. Monitor: **Pages** (indexing errors), **Performance** (clicks, impressions, CTR, position), **Core Web Vitals**, **Mobile usability / Page experience**.

## Step 2 – Google Analytics 4  https://analytics.google.com/
1. Sign in → **Admin** (gear) → **Create → Account** → then **Create → Property** (name `RaapNexus`, set time zone/currency for *reporting* only).
2. **Data streams → Add stream → Web**, URL `https://raap-nexus-new.vercel.app`, name `RaapNexus website`, keep Enhanced measurement ON, **Create stream**.
3. Copy the **Measurement ID** (`G-XXXXXXXXXX`).
4. In Vercel: **Project → Settings → Environment Variables** → add `VITE_GA_MEASUREMENT_ID` = your ID (Production). **Redeploy** (it is read at build time). The ID is public by design; never put secrets in `VITE_` variables. If unset, analytics is fully disabled – nothing is loaded.
5. Test: open **Reports → Realtime**, visit the site in another tab; you should appear within ~30 s.
6. Track contact form leads: the site sends an anonymous `generate_lead` event (no form contents) only after the email provider accepts the message. In GA4: **Admin → Events** → mark `generate_lead` as **Key event**.
7. Monitor: **Reports → Acquisition → Traffic acquisition** (sources), **Engagement → Pages and screens**, **Key events**.
8. Privacy: GA4 uses cookies. Depending on your audience (UAE, EU/UK, India) you may need a consent banner and a published Privacy Policy. This site has no privacy policy page yet and no cookie banner – decide with your legal adviser before enabling analytics for EU/UK visitors.

## Step 3 – Google Business Profile  https://www.google.com/business/
A Business Profile is for businesses with a **real, verifiable location** that customers visit, or a service-area business with a real address (hidden from public if needed). Google verifies by postcard/phone/video and rejects virtual or invented addresses. 
- If RaapNexus/Techlogica has a genuine office → create a profile for the verified business name and address.
- If not → **do not create one**. Never use a made-up address for SEO; it can get the profile suspended.

## Step 4 – Google Keyword Planner  https://ads.google.com/home/tools/keyword-planner/
1. Sign in to Google Ads (create an account; you can skip creating a campaign – choose **Switch to Expert Mode → Create an account without a campaign**).
2. **Tools → Keyword Planner → Discover new keywords**. Enter seeds such as `tax auditing software`, `financial audit solutions`, `finance platform`.
3. Set **Location**: India, United Arab Emirates, Saudi Arabia, Qatar, Kuwait, Oman, Bahrain (run each separately or together) and **Language**.
4. Read **Avg. monthly searches** (ranges unless you run ads), **Competition**, and **top-of-page bid** (a hint at commercial value).
5. High intent = phrases like "software", "solutions", "services", "audit firm", "pricing". Export to CSV and update `docs/SEO-KEYWORD-MAPPING.md`.

## Step 5 – Ongoing monitoring (monthly, 30 minutes)
- **Indexing:** Search Console → Pages; every language URL should be *Indexed*. Fix reported reasons.
- **Clicks/impressions:** Performance → compare last 28 days vs previous period.
- **Low CTR:** filter queries with many impressions but CTR under ~2% and rewrite the title/description (`src/i18n/locales/<lang>.json → meta`).
- **Rankings:** Performance → Queries → note average position for brand and target phrases.
- **Broken links:** Search Console shows 404s; also crawl the site with a free tool (e.g. Screaming Frog free tier) quarterly.
- **Core Web Vitals:** Search Console → Core Web Vitals (field data) and https://pagespeed.web.dev/ for lab data.
- **Content updates:** when services change, update the locale JSON files, rebuild, redeploy, then request re-indexing for the changed URL.
