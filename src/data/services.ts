import { BarChart3, LineChart, ReceiptText, ShieldCheck, type LucideIcon } from 'lucide-react'

/**
 * The four core financial services. `availability` is deliberately honest:
 *  - available: visible in the RaapNexus sample dashboard today
 *  - partial:   some supporting data exists, dedicated views are planned
 * KPI figures are taken from the sample ("ABC Company") dashboard and are demonstration data.
 */
export interface Service {
  id: string
  name: string
  Icon: LucideIcon
  blurb: string
  availability: 'available' | 'partial'
  note: string
  shot: string
  alt: string
  kpis: { key: string; to: number; decimals: number; prefix?: string; suffix?: string; millions?: boolean }[]
}

export const SERVICES: Service[] = [
  { id: 'tax', name: 'Tax Auditing', Icon: ReceiptText, blurb: 'Tax data and compliance review, alongside your ledgers.', availability: 'partial',
    note: 'VAT balances appear in the sample balance sheet. Dedicated tax-audit views are planned.', shot: 'balance', alt: 'Balance sheet showing input and output VAT balances',
    kpis: [{ key: 'outputVat', to: 0.76, decimals: 2, millions: true }, { key: 'inputVat', to: 0.61, decimals: 2, millions: true }] },
  { id: 'audit', name: 'Financial Auditing', Icon: ShieldCheck, blurb: 'Transaction review, reconciliation and a clear audit trail.', availability: 'available',
    note: 'Trial balance checks and ranked red-flag review are in the sample dashboard.', shot: 'anomalies', alt: 'Anomalies and red flags review in the RaapNexus ERP dashboard',
    kpis: [{ key: 'flagged', to: 9, decimals: 0 }, { key: 'balanced', to: 9, decimals: 0, suffix: ' / 9' }] },
  { id: 'analysis', name: 'Financial Analysis', Icon: LineChart, blurb: 'Revenue, expenses, cash flow and profitability trends.', availability: 'available',
    note: 'Monthly P&L, cash flow and expense views are in the sample dashboard.', shot: 'pnl', alt: 'Monthly profit and loss statement in the RaapNexus ERP dashboard',
    kpis: [{ key: 'revenue', to: 47.6, decimals: 1, millions: true }, { key: 'cash', to: 0.92, decimals: 2, millions: true }] },
  { id: 'business', name: 'Business Analysis', Icon: BarChart3, blurb: 'Performance, cost and margin insight for better decisions.', availability: 'available',
    note: 'Performance, margin and sales analysis are in the sample dashboard.', shot: 'dashboard', alt: 'Performance dashboard with margin gauges',
    kpis: [{ key: 'growth', to: 14.1, decimals: 1, prefix: '+', suffix: '%' }, { key: 'margin', to: 44.7, decimals: 1, suffix: '%' }] },
]
