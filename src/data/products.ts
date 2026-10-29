// Central product configuration — add/remove/reorder products here
export interface ProductFeature {
  text: string
}

export interface Product {
  id: string
  slug: string
  name: string
  category: string
  tagline: string
  description: string
  features: ProductFeature[]
  badge?: string
  isPlanned?: boolean
  accentColor: string
  dashboardModule: string
}

export const PRODUCTS: Product[] = [
  {
    id: 'raapnexus-erp',
    slug: 'raapnexus-erp',
    name: 'RaapNexus ERP',
    category: 'Enterprise Resource Planning',
    tagline: 'The intelligent ERP that understands your business language.',
    description:
      'A comprehensive, AI-augmented ERP system covering financial accounting, sales, inventory, procurement, and operations — with conversational business intelligence built in.',
    features: [
      { text: 'Conversational AI query over all business data' },
      { text: 'Financial accounting and trial balance reporting' },
      { text: 'Sales, invoicing, and order management' },
      { text: 'Inventory and stock movement tracking' },
      { text: 'Multi-company and multi-branch operations' },
    ],
    accentColor: '#2563EB',
    dashboardModule: 'executive',
  },
  {
    id: 'raapnexus-finance',
    slug: 'raapnexus-finance',
    name: 'RaapNexus Finance',
    category: 'Financial Management',
    tagline: 'Precision financial control with real-time visibility.',
    description:
      'Purpose-built financial management covering accounts payable, receivable, general ledger, bank reconciliation, and automated financial reporting.',
    features: [
      { text: 'Real-time general ledger and trial balance' },
      { text: 'Accounts payable and receivable automation' },
      { text: 'Bank reconciliation and cash flow forecasting' },
      { text: 'Multi-currency and multi-branch consolidation' },
      { text: 'Regulatory-ready financial statement generation' },
    ],
    accentColor: '#06B6D4',
    dashboardModule: 'finance',
  },
  {
    id: 'raapnexus-sales',
    slug: 'raapnexus-sales',
    name: 'RaapNexus Sales',
    category: 'Sales & CRM',
    tagline: 'Drive revenue with intelligent sales workflows.',
    description:
      'End-to-end sales management from lead capture to invoice delivery, with AI-powered analytics and branch-level performance intelligence.',
    features: [
      { text: 'Quotation, order, and invoice lifecycle' },
      { text: 'Branch and salesperson performance analytics' },
      { text: 'Customer credit control and payment tracking' },
      { text: 'AI-assisted sales forecasting insights' },
      { text: 'Pricing rules and discount approval workflows' },
    ],
    accentColor: '#7C3AED',
    dashboardModule: 'sales',
  },
]

export const SITE_CONFIG = {
  companyName: 'RaapNexus',
  companyTagline: 'Enterprise ERP & AI Intelligence',
  heroHeadline: 'Your Business.\nOne Conversation Away.',
  heroSubcopy:
    'Connect your business systems to AI. Ask questions, explore live data, and turn insights into action — with your business rules and controls intact.',
  ctaPrimary: 'Explore the Platform',
  ctaSecondary: 'Book a Demo',
  finalHeadline: 'Your Business Has Answers.\nStart Asking.',
  finalSubcopy: 'Discover a more intuitive way to work with your business data.',
  contactEmail: '', // Replace when confirmed
  demoUrl: '#book-demo',
}
