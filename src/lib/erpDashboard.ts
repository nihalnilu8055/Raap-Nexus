/** Open the ERP dashboard inside the page from anywhere (hero, services, footer). The modal itself is mounted once in Home. */
export const openErpDashboard = () => window.dispatchEvent(new CustomEvent('open-erp-dashboard'))

/** A plain left click opens the in-page dashboard; modified clicks (new tab / window) keep the normal link behaviour. */
export function erpLinkClick(e: React.MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  e.preventDefault(); openErpDashboard()
}
