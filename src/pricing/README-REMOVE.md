# Pricing page: how to remove it completely

Everything Pricing-specific is tagged `PRICING-PAGE (removable)`. Find every place with:
`grep -rn "PRICING-PAGE" src scripts public vercel.json`

1. **Nav** `src/components/layout/SiteNav.tsx`: delete the three `PRICING-PAGE` start/end blocks (`PRICING_LABEL`, `onPricing`, `pricingDesktop`/`pricingMobile`); change both `<Fragment key={l.id}>{l.id === 'about' && ...}<li>...</li></Fragment>` back to `<li key={l.id}>...</li>`; restore the import to `import { useEffect, useRef, useState } from 'react'`.
2. **Route** `src/components/layout/LangRoute.tsx`: delete the lazy `PricingPage` import line and the `PRICING-PAGE start/end` route block.
3. **Static pages + sitemap** `scripts/prerender.mjs`: delete the `PRICING-PAGE start/end` block and the `['pricing', 0.8]` sitemap entry.
4. **Delete folders**: `src/pricing/` (page, components, data, styles, this file) and `public/assets/pricing/` (logos).
5. **Dependencies**: none were added; nothing to uninstall.
6. `npm run build` must pass; `/en/pricing` then falls back to the normal site.
