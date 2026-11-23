// PRICING-PAGE (removable): part of the self-contained Pricing feature, see README-REMOVE.md
/**
 * RaapNexus pricing model — the single source of truth for the Pricing page and its calculator.
 * All amounts are USD and exclude applicable local taxes. Nothing here is rounded, derived or invented.
 */
export type Billing = 'monthly' | 'one-time'

export const FREE_BASELINE = { users: 3, dashboards: 5, workflows: 3, profiles: 1 } as const

export interface AddOn { id: string; name: string; kind: 'Limit' | 'Feature'; baseline: string; adds: string; price: number; billing: Billing; text: string }
export const ADD_ONS: AddOn[] = [
  { id: 'users', name: 'Extra users', kind: 'Limit', baseline: '3', adds: '+1', price: 1, billing: 'monthly', text: 'Additional accounts that can sign in.' },
  { id: 'dashboards', name: 'Extra dashboards', kind: 'Limit', baseline: '5', adds: '+1', price: 1, billing: 'one-time', text: 'Additional business dashboards.' },
  { id: 'workflows', name: 'Extra workflows', kind: 'Limit', baseline: '3', adds: '+1', price: 1, billing: 'one-time', text: 'Additional automations.' },
  { id: 'lines', name: 'Customer channel lines', kind: 'Limit', baseline: '0', adds: '+1', price: 1, billing: 'one-time', text: 'Additional WhatsApp or Instagram lines for customer communication.' },
  { id: 'approvals', name: 'Approvals', kind: 'Feature', baseline: 'Off', adds: '—', price: 10, billing: 'one-time', text: 'Enables the multi-level approval and sign-off engine.' },
  { id: 'phone', name: 'Phone mode', kind: 'Feature', baseline: 'Off', adds: '—', price: 10, billing: 'one-time', text: 'Allows the customer to use RaapNexus remotely from a phone.' },
  { id: 'domain', name: 'Company web address', kind: 'Feature', baseline: 'Off', adds: '—', price: 1, billing: 'monthly', text: 'Gives the installation its own company subdomain.' },
  { id: 'slots', name: 'Software profiles', kind: 'Limit', baseline: '1', adds: '+1', price: 10, billing: 'one-time', text: 'Adds additional slots for connecting business-system knowledge profiles.' },
]
export const PRICE = Object.fromEntries(ADD_ONS.map((a) => [a.id, a.price])) as Record<string, number>

export interface Profile { id: string; name: string; logo: string }
export interface Tier { id: 1 | 2 | 3 | 4; name: string; price: number; profiles: Profile[] }
export const TIERS: Tier[] = [
  { id: 1, name: 'Premium ERP', price: 100, profiles: [
    { id: 'odoo', name: 'Odoo', logo: 'odoo' }, { id: 'erpnext', name: 'ERPNext', logo: 'erpnext' }, { id: 's4', name: 'SAP S/4HANA', logo: 'sap' },
    { id: 'dyn', name: 'Microsoft Dynamics', logo: 'dynamics' }, { id: 'netsuite', name: 'Oracle NetSuite', logo: 'netsuite' } ] },
  { id: 2, name: 'Mid-Market ERP', price: 50, profiles: [
    { id: 'sapb1', name: 'SAP Business One', logo: 'sap' }, { id: 'nav', name: 'Microsoft Dynamics NAV', logo: 'dynamics' }, { id: 'sage50', name: 'Sage 50', logo: 'sage' },
    { id: 'sageacc', name: 'Sage Accounting', logo: 'sage' }, { id: 'dolibarr', name: 'Dolibarr', logo: 'dolibarr' } ] },
  { id: 3, name: 'Standard', price: 20, profiles: [{ id: 'tallyprime', name: 'TallyPrime', logo: 'tally' }] },
  { id: 4, name: 'Entry / Small Business', price: 1, profiles: [
    { id: 'qb', name: 'QuickBooks', logo: 'quickbooks' }, { id: 'xero', name: 'Xero', logo: 'xero' }, { id: 'zohobooks', name: 'Zoho Books', logo: 'zoho' },
    { id: 'shopify', name: 'Shopify', logo: 'shopify' }, { id: 'woo', name: 'WooCommerce', logo: 'woocommerce' }, { id: 'ngpos', name: 'NG Restaurant POS', logo: 'ngpos' } ] },
]
export const ALL_PROFILES = TIERS.flatMap((t) => t.profiles.map((p) => ({ ...p, tier: t.id, price: t.price, tierName: t.name })))

export interface Connector { id: string; name: string; logo: string; price: 100 | 20 }
export const PAID_CONNECTORS: Connector[] = [
  { id: 'mssql', name: 'SQL Server', logo: 'sqlserver', price: 100 }, { id: 'oracle', name: 'Oracle', logo: 'oracle', price: 100 },
  { id: 'hana', name: 'SAP HANA', logo: 'sap', price: 100 }, { id: 'odata', name: 'OData Service', logo: 'odata', price: 100 },
  { id: 'pg', name: 'PostgreSQL', logo: 'postgresql', price: 20 }, { id: 'mysql', name: 'MySQL / MariaDB', logo: 'mysql', price: 20 },
  { id: 'rest', name: 'REST API', logo: 'rest', price: 20 }, { id: 'graphql', name: 'GraphQL API', logo: 'graphql', price: 20 },
  { id: 'tally', name: 'Tally', logo: 'tally', price: 20 },
]
/** Connector made specifically for a software profile → included free when that profile is purchased. Only pairs stated as such are listed. */
export const INCLUDED_WITH: Record<string, string> = { tally: 'tallyprime' }

export interface FreeConnector { id: string; name: string; text: string; icon: 'remote' | 'local' | 'sqlite' | 'folder' }
export const FREE_CONNECTORS: FreeConnector[] = [
  { id: 'remote', name: 'Remote MCP Server', text: 'Connect using an MCP server URL.', icon: 'remote' },
  { id: 'local', name: 'Local MCP Server', text: 'Connect using a local command.', icon: 'local' },
  { id: 'sqlite', name: 'SQLite Database', text: 'Read-only access to local SQLite files.', icon: 'sqlite' },
  { id: 'folder', name: 'Folder of Files', text: 'Connect Excel, Word, PDF, CSV, text, JSON and Markdown files.', icon: 'folder' },
]

export interface Selection { users: number; dashboards: number; workflows: number; lines: number; slots: number; approvals: boolean; phone: boolean; domain: boolean; profiles: string[]; connectors: string[] }
export const EMPTY: Selection = { users: 0, dashboards: 0, workflows: 0, lines: 0, slots: 0, approvals: false, phone: false, domain: false, profiles: [], connectors: [] }

export interface Line { label: string; detail: string; amount: number; note?: string }
export interface Result {
  baseline: typeof FREE_BASELINE; totals: { users: number; dashboards: number; workflows: number; lines: number; profileSlots: number }
  monthly: Line[]; oneTime: Line[]; included: Line[]
  monthlyTotal: number; oneTimeTotal: number; firstMonth: number
  slotsNeeded: number; slotsAvailable: number; slotShortfall: number
}

/** Pure calculation. Required profile slots are never added silently: a shortfall is reported separately (slotShortfall × $10 one-time). */
export function calculate(s: Selection): Result {
  const monthly: Line[] = [], oneTime: Line[] = [], included: Line[] = []
  if (s.users) monthly.push({ label: 'Extra users', detail: `${s.users} × $${PRICE.users}`, amount: s.users * PRICE.users })
  if (s.domain) monthly.push({ label: 'Company web address', detail: `$${PRICE.domain}`, amount: PRICE.domain })
  for (const id of s.profiles) { const p = ALL_PROFILES.find((x) => x.id === id); if (p) monthly.push({ label: `${p.name} profile`, detail: `${p.tierName} · $${p.price}`, amount: p.price }) }
  for (const id of s.connectors) {
    const c = PAID_CONNECTORS.find((x) => x.id === id); if (!c) continue
    const match = INCLUDED_WITH[c.id]
    if (match && s.profiles.includes(match)) included.push({ label: `${c.name} connector`, detail: 'Included with the matching software profile', amount: 0 })
    else monthly.push({ label: `${c.name} connector`, detail: `$${c.price}`, amount: c.price })
  }
  if (s.dashboards) oneTime.push({ label: 'Extra dashboards', detail: `${s.dashboards} × $${PRICE.dashboards}`, amount: s.dashboards * PRICE.dashboards })
  if (s.workflows) oneTime.push({ label: 'Extra workflows', detail: `${s.workflows} × $${PRICE.workflows}`, amount: s.workflows * PRICE.workflows })
  if (s.lines) oneTime.push({ label: 'Customer channel lines', detail: `${s.lines} × $${PRICE.lines}`, amount: s.lines * PRICE.lines })
  if (s.approvals) oneTime.push({ label: 'Approvals', detail: `$${PRICE.approvals}`, amount: PRICE.approvals })
  if (s.phone) oneTime.push({ label: 'Phone mode', detail: `$${PRICE.phone}`, amount: PRICE.phone })
  if (s.slots) oneTime.push({ label: 'Extra software-profile slots', detail: `${s.slots} × $${PRICE.slots}`, amount: s.slots * PRICE.slots })
  const monthlyTotal = monthly.reduce((a, l) => a + l.amount, 0), oneTimeTotal = oneTime.reduce((a, l) => a + l.amount, 0)
  const slotsAvailable = FREE_BASELINE.profiles + s.slots, slotsNeeded = s.profiles.length
  return {
    baseline: FREE_BASELINE,
    totals: { users: FREE_BASELINE.users + s.users, dashboards: FREE_BASELINE.dashboards + s.dashboards, workflows: FREE_BASELINE.workflows + s.workflows, lines: s.lines, profileSlots: slotsAvailable },
    monthly, oneTime, included, monthlyTotal, oneTimeTotal, firstMonth: monthlyTotal + oneTimeTotal,
    slotsNeeded, slotsAvailable, slotShortfall: Math.max(0, slotsNeeded - slotsAvailable),
  }
}
