/**
 * Official brand marks for the orbiting ERP labels. Files live in /public/assets/erp (served locally, never hotlinked).
 * `ar` = width / height of the mark, so the <img> gets its final box up-front (no layout shift, no distortion).
 */
export interface ErpLogo { src: string; ar: number }
const E = '/assets/erp/'
export const ERP_LOGOS: Record<string, ErpLogo> = {
  'SAP': { src: E + 'sap.svg', ar: 1.982 },
  'Oracle': { src: E + 'oracle.svg', ar: 1.581 },
  'Odoo': { src: E + 'odoo.svg', ar: 1 },
  'Microsoft Dynamics 365': { src: E + 'dynamics-365.svg', ar: 0.837 },
  'NetSuite': { src: E + 'netsuite.png', ar: 1 },
  'Sage': { src: E + 'sage.svg', ar: 1.768 },
  'Unit4': { src: E + 'unit4.png', ar: 1 },
  'Infor': { src: E + 'infor.png', ar: 1 },
  'Tally': { src: E + 'tally.png', ar: 2 },
  'Zoho Books': { src: E + 'zoho-books.png', ar: 1 },
  'Acumatica': { src: E + 'acumatica.png', ar: 1 },
  'IFS': { src: E + 'ifs.png', ar: 1 },
  'QuickBooks': { src: E + 'quickbooks.svg', ar: 1 },
  'Focus ERP': { src: E + 'focus-erp.png', ar: 1 },
  'Workday': { src: E + 'workday.svg', ar: 0.773 },
  // 'Epicor': add public/assets/erp/epicor.(svg|png) and an entry here — until then the label keeps its original dot.
}
