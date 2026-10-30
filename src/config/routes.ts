/**
 * Centralized Route & Demo Destination Configuration for RaapNexus
 * All marketing CTAs, sandbox launchers, and navigation anchors point here.
 */

/** Single official ERP destination used by every marketing CTA. */
export const ERP_URL = 'https://raap-nexus-new.vercel.app/erp/dashboard.html'

export const ROUTES = {
  HOME: '/',
  // Primary standalone authentic ERP dashboard:
  ERP_STANDALONE: '/erp/dashboard.html',
  // Workstation sandbox wrapper with scenario selectors:
  ERP_SANDBOX: '/demo',
  // Direct module shortcuts inside the standalone ERP dashboard:
  ERP_MODULES: {
    SUMMARY: '/erp/dashboard.html#summary',
    PNL: '/erp/dashboard.html#monthlypl',
    TRIAL_BALANCE: '/erp/dashboard.html#trialbalance',
    BALANCE_SHEET: '/erp/dashboard.html#balancesheet',
    CASH_FLOW: '/erp/dashboard.html#cashflow',
    AGEING: '/erp/dashboard.html#ageing',
    ANOMALIES: '/erp/dashboard.html#anomalies',
    SALES: '/erp/dashboard.html#salesman',
  },
  // In-page section anchor links:
  SECTIONS: {
    INTERACTIVE_DEMO: '#interactive-demo',
    APPLICATION_SUITE: '#application-suite',
    SOVEREIGNTY: '#ai-sovereignty',
    BOOK_DEMO: '#book-demo',
  },
} as const

export type ErpModuleKey = keyof typeof ROUTES.ERP_MODULES

/**
 * Returns the destination URL for a given demo type.
 * @param type 'standalone' for direct original ERP dashboard; 'sandbox' for workstation view
 * @param module Optional module shortcut
 */
export function getDemoUrl(type: 'standalone' | 'sandbox' = 'standalone', module?: ErpModuleKey): string {
  if (type === 'standalone') {
    return module ? ROUTES.ERP_MODULES[module] : ROUTES.ERP_STANDALONE
  }
  return module ? `${ROUTES.ERP_SANDBOX}?module=${module.toLowerCase()}` : ROUTES.ERP_SANDBOX
}
