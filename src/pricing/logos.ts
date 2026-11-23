// PRICING-PAGE (removable): part of the self-contained Pricing feature, see README-REMOVE.md
/** Brand marks used on the pricing page (files in /public/assets/pricing). `ar` = width/height so every <img> gets its final box up-front: no distortion, no cropping.
 * Names without an entry (Dolibarr, NG Restaurant POS, OData, REST) have no supplied/authentic mark and render a neutral monogram/icon instead. */
export interface Mark { src: string; ar: number; alt: string }
export const MARKS: Record<string, Mark> = {
  odoo: { src: '/assets/pricing/odoo.svg', ar: 3.033, alt: 'Odoo logo' },
  erpnext: { src: '/assets/pricing/erpnext.svg', ar: 1.0, alt: 'ERPNext logo' },
  sap: { src: '/assets/pricing/sap.svg', ar: 1.982, alt: 'SAP logo' },
  dynamics: { src: '/assets/pricing/dynamics-365.svg', ar: 0.837, alt: 'Microsoft Dynamics logo' },
  netsuite: { src: '/assets/pricing/netsuite.png', ar: 1.0, alt: 'Oracle NetSuite logo' },
  sage: { src: '/assets/pricing/sage.svg', ar: 1.768, alt: 'Sage logo' },
  tally: { src: '/assets/pricing/tally.png', ar: 2.0, alt: 'Tally logo' },
  quickbooks: { src: '/assets/pricing/quickbooks.svg', ar: 1.0, alt: 'QuickBooks logo' },
  xero: { src: '/assets/pricing/xero.svg', ar: 1.0, alt: 'Xero logo' },
  zoho: { src: '/assets/pricing/zoho.svg', ar: 2.291, alt: 'Zoho logo' },
  shopify: { src: '/assets/pricing/shopify.svg', ar: 0.882, alt: 'Shopify logo' },
  woocommerce: { src: '/assets/pricing/woocommerce.svg', ar: 4.602, alt: 'WooCommerce logo' },
  sqlserver: { src: '/assets/pricing/sqlserver.svg', ar: 1.231, alt: 'Microsoft SQL Server logo' },
  oracle: { src: '/assets/pricing/oracle-wordmark.svg', ar: 6.8, alt: 'Oracle logo' },
  postgresql: { src: '/assets/pricing/postgresql.svg', ar: 0.966, alt: 'PostgreSQL logo' },
  mysql: { src: '/assets/pricing/mysql.svg', ar: 1.459, alt: 'MySQL logo' },
  graphql: { src: '/assets/pricing/graphql.svg', ar: 0.892, alt: 'GraphQL logo' },
}
