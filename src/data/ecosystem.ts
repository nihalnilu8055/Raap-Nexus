/** Only modules that exist in the RaapNexus ERP (Accounts, Sales, Purchase, Inventory, Masters, Reports). */
export interface EcoModule {
  id: string
  label: string
  blurb: string
  shot?: string
  alt?: string
}

export const MODULES: EcoModule[] = [
  { id: 'finance', label: 'Finance', blurb: 'Ledgers, payments and statements, always reconciled.', shot: 'cashflow', alt: 'Cash flow report in the RaapNexus ERP' },
  { id: 'sales', label: 'Sales', blurb: 'From quotation to invoice, with live performance.', shot: 'sales', alt: 'Sales analysis in the RaapNexus ERP' },
  { id: 'purchase', label: 'Purchasing', blurb: 'Orders, receipts and supplier entries in one flow.' },
  { id: 'inventory', label: 'Inventory', blurb: 'Stock, transfers and adjustments across locations.', shot: 'materials', alt: 'Materials view in the RaapNexus ERP' },
  { id: 'masters', label: 'Masters', blurb: 'One source of truth for items, parties and settings.' },
  { id: 'analytics', label: 'Analytics', blurb: 'Reports and dashboards drawn from every module.', shot: 'summary', alt: 'Executive summary in the RaapNexus ERP' },
]
