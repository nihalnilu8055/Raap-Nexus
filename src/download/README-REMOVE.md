# Download section: how to remove it completely

Tagged `DOWNLOAD-APP (removable)`. Find every place: `grep -rn "DOWNLOAD-APP" src`

1. `src/pages/Home.tsx`: delete the `DownloadSection` import line and the `<DownloadSection />` line.
2. `src/components/layout/SiteNav.tsx`: delete the `DL_LABEL` line, the two header `<a href="#download">` links (desktop pill + round icon), the mobile-menu "Download" `<li>`, and `Download` from the lucide import (`import { Menu, X } from 'lucide-react'`).
3. Delete the folder `src/download/`.
4. No dependencies were added. Run `npm run build`.

Note: `releases.ts` (in this folder) looks up the latest GitHub release at run time, so installer links update without rebuilding the site. It is removed together with the folder.
