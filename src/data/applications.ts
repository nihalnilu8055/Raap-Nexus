import { BarChart3, Boxes, Building2, Database, Landmark, ShoppingCart, TrendingUp, type LucideIcon } from 'lucide-react'

/**
 * Only modules present in the RaapNexus ERP (verified against its module list:
 * Accounts, Sales, Purchase, Inventory, Masters, Reports, Asset Category / Asset Depreciation Booking).
 * HR, Projects and CRM are NOT in the ERP and are intentionally absent.
 */
export interface AppModule {
  id: string
  name: string
  short: string
  blurb: string
  color: string
  Icon: LucideIcon
  shot?: string
  alt?: string
}

export const APPS: AppModule[] = [
  { id: 'finance', name: 'Finance & Accounting', short: 'Finance', blurb: 'Ledgers, payments and statements, always reconciled.', color: '#3b82f6', Icon: Landmark, shot: 'cashflow', alt: 'Cash flow report in the RaapNexus ERP' },
  { id: 'sales', name: 'Sales Management', short: 'Sales', blurb: 'From quotation to invoice, with live performance.', color: '#10b981', Icon: TrendingUp, shot: 'sales', alt: 'Sales analysis in the RaapNexus ERP' },
  { id: 'purchase', name: 'Purchase Management', short: 'Purchase', blurb: 'Orders, receipts and supplier entries in one flow.', color: '#f59e0b', Icon: ShoppingCart },
  { id: 'inventory', name: 'Inventory Management', short: 'Inventory', blurb: 'Stock, transfers and adjustments across locations.', color: '#06b6d4', Icon: Boxes, shot: 'materials', alt: 'Materials view in the RaapNexus ERP' },
  { id: 'assets', name: 'Fixed Assets', short: 'Assets', blurb: 'Asset categories and scheduled depreciation booking.', color: '#a78bfa', Icon: Building2 },
  { id: 'masters', name: 'Masters', short: 'Masters', blurb: 'One source of truth for items, parties and settings.', color: '#94a3b8', Icon: Database },
  { id: 'analytics', name: 'Reporting & Analytics', short: 'Analytics', blurb: 'Reports and dashboards drawn from every module.', color: '#f472b6', Icon: BarChart3, shot: 'summary', alt: 'Executive summary in the RaapNexus ERP' },
]

/** Illustrative cross-module flows (indices into APPS). */
export const FLOWS = [
  { id: 'sales-flow', label: 'Sales → Inventory → Finance', route: [1, 3, 0], note: 'An invoice moves stock and reaches the ledger.' },
  { id: 'purchase-flow', label: 'Purchase → Inventory → Finance', route: [2, 3, 0], note: 'Goods received update stock; the supplier entry reaches accounts.' },
]
