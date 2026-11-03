/**
 * Single source of truth for the ERP demo video gallery (landing section + /:lang/demo-videos library).
 * To add or replace a video: edit ONLY this file. Thumbnails are generated from `youtubeId`; no UI component needs changing.
 *
 * Videos play INLINE on the site through YouTube's privacy-enhanced embed (youtube-nocookie.com), loaded only after the visitor presses Play.
 * The landing page shows exactly MAX_FEATURED (2) featured videos; the library shows all of them.
 *
 * isTemporary: true  => placeholder third-party video used while the real RaapNexus demos are produced. These are NOT
 *                      official RaapNexus product demonstrations (the public UI deliberately does not label them; this flag and
 *                      `channel` exist for the team). Replace each entry with a real RaapNexus video and set isTemporary to false.
 */
export type VideoCategory =
  | 'Finance & Accounting'
  | 'Sales'
  | 'Purchase'
  | 'Inventory'
  | 'HR & Payroll'
  | 'Reporting & Analytics'
  | 'Business Management'

export interface DemoVideo {
  id: string
  title: string
  description: string
  /** 11-character YouTube video ID */
  youtubeId: string
  category: VideoCategory
  featured: boolean
  displayOrder: number
  /** true = temporary third-party placeholder (see header comment) */
  isTemporary: boolean
  /** Channel credit, shown for temporary third-party videos */
  channel?: string
  /** true only if https://img.youtube.com/vi/<id>/maxresdefault.jpg was confirmed to exist (1280x720). Otherwise hqdefault is used. */
  maxResThumbnail?: boolean
}

/** Display order of category filters (only categories that actually have videos are ever shown). */
export const CATEGORY_ORDER: VideoCategory[] = ['Finance & Accounting', 'Sales', 'Purchase', 'Inventory', 'HR & Payroll', 'Reporting & Analytics', 'Business Management']
export const MAX_FEATURED = 2

/*
 * Temporary entries. Verified 2026-11-03 in a real browser against YouTube's oEmbed endpoint (HTTP 200, title/channel below)
 * and by loading hqdefault.jpg (480x360) and, where flagged, maxresdefault.jpg (1280x720).
 */
export const VIDEOS: DemoVideo[] = [
  {
    id: 'temp-finance-accounting-01',
    title: 'Complete Accounting Management Software Demo',
    description: 'Billing, inventory and financial reports in one accounting workflow.',
    youtubeId: 'OF7MzBZM5_U',
    category: 'Finance & Accounting',
    featured: true, displayOrder: 1, isTemporary: true, channel: 'Switcher Techno', maxResThumbnail: true,
  },
  {
    id: 'temp-finance-accounting-02',
    title: 'SAP Business One Financial Module',
    description: 'A walkthrough of financial management for growing SMEs.',
    youtubeId: '3FGgWM7GRak',
    category: 'Finance & Accounting',
    featured: true, displayOrder: 2, isTemporary: true, channel: 'ProjectLine Solutions', maxResThumbnail: true,
  },
  {
    id: 'temp-finance-accounting-03',
    title: 'Infor SyteLine ERP Accounting Demo Video',
    description: 'How a manufacturing ERP accounting module handles day-to-day financial transactions.',
    youtubeId: 'hSf-_hbtgvk',
    category: 'Finance & Accounting',
    featured: false, displayOrder: 3, isTemporary: true, channel: 'Godlan ERP',
  },
  {
    id: 'temp-business-management-01',
    title: 'Business Management ERP Demo',
    description: 'CRM, sales, accounting, inventory and payroll working together in one system.',
    youtubeId: 'jgfXJpbnCHM',
    category: 'Business Management',
    featured: false, displayOrder: 4, isTemporary: true, channel: 'MedWay', maxResThumbnail: true,
  },
]

/** Watch URL on YouTube. */
export const youtubeUrl = (v: Pick<DemoVideo, 'youtubeId'>) => `https://www.youtube.com/watch?v=${v.youtubeId}`

/** Privacy-enhanced embed URL (no cookies until played). Never shown in the UI. */
export const embedUrl = (v: Pick<DemoVideo, 'youtubeId'>, o: { start?: number; origin?: string } = {}) =>
  `https://www.youtube-nocookie.com/embed/${v.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&enablejsapi=1${o.origin ? `&origin=${encodeURIComponent(o.origin)}` : ''}${o.start && o.start > 0 ? `&start=${Math.floor(o.start)}` : ''}`
export const thumbnailUrl = (v: Pick<DemoVideo, 'youtubeId' | 'maxResThumbnail'>) =>
  `https://img.youtube.com/vi/${v.youtubeId}/${v.maxResThumbnail ? 'maxresdefault' : 'hqdefault'}.jpg`
export const fallbackThumbnailUrl = (v: Pick<DemoVideo, 'youtubeId'>) => `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`
export const LOCAL_FALLBACK_THUMB = '/assets/videos/video-thumbnail-fallback.svg'

const byOrder = (a: DemoVideo, b: DemoVideo) => a.displayOrder - b.displayOrder
export const allVideos = (): DemoVideo[] => [...VIDEOS].sort(byOrder)
export const featuredVideos = (): DemoVideo[] => allVideos().filter((v) => v.featured).slice(0, MAX_FEATURED)
export const categoriesInUse = (): VideoCategory[] => CATEGORY_ORDER.filter((c) => VIDEOS.some((v) => v.category === c))
export const categorySlug = (c: VideoCategory) => ({ 'Finance & Accounting': 'finance', Sales: 'sales', Purchase: 'purchase', Inventory: 'inventory', 'HR & Payroll': 'hr', 'Reporting & Analytics': 'reporting', 'Business Management': 'business' })[c]
