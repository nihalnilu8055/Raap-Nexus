import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

// Synthetic demo data modeled on authentic ERP calculation schemas
const salesData = [
  { month: 'Apr', revenue: 890000, target: 800000 },
  { month: 'May', revenue: 1020000, target: 950000 },
  { month: 'Jun', revenue: 980000, target: 1000000 },
  { month: 'Jul', revenue: 1150000, target: 1050000 },
  { month: 'Aug', revenue: 1320000, target: 1100000 },
  { month: 'Sep', revenue: 1180000, target: 1200000 },
  { month: 'Oct', revenue: 1420000, target: 1300000 },
]

const branchData = [
  { branch: 'Dubai HQ', sales: 524000, quota: '108%' },
  { branch: 'Abu Dhabi', sales: 387000, quota: '94%' },
  { branch: 'Sharjah', sales: 298000, quota: '102%' },
  { branch: 'Ajman', sales: 211000, quota: '89%' },
]

const categoryData = [
  { name: 'Industrial Raw Materials', value: 38, color: '#2563EB' },
  { name: 'Finished Hardware', value: 28, color: '#0891B2' },
  { name: 'Heavy Electricals', value: 20, color: '#7C3AED' },
  { name: 'Contract Assemblies', value: 14, color: '#059669' },
]

const financeData = [
  { month: 'Apr', income: 2100000, expenses: 1650000 },
  { month: 'May', income: 2300000, expenses: 1720000 },
  { month: 'Jun', income: 2150000, expenses: 1800000 },
  { month: 'Jul', income: 2600000, expenses: 1900000 },
  { month: 'Aug', income: 2800000, expenses: 2050000 },
  { month: 'Sep', income: 2550000, expenses: 1980000 },
  { month: 'Oct', income: 3100000, expenses: 2200000 },
]

const inventoryData = [
  { category: 'Alloy Rods', stock: 1240, reorder: 200 },
  { category: 'Power Couplers', stock: 3820, reorder: 500 },
  { category: 'Sensors Tier-1', stock: 890, reorder: 300 },
  { category: 'Fasteners (Boxes)', stock: 4500, reorder: 1000 },
  { category: 'Circuit Blocks', stock: 2100, reorder: 400 },
]

const kpiModules: Record<string, { label: string; value: string; change: string; positive: boolean }[]> = {
  executive: [
    { label: 'Invoiced Revenue', value: 'AED 1.42M', change: '+23.5% vs target', positive: true },
    { label: 'Active Invoices', value: '184', change: '+12 this week', positive: true },
    { label: 'Uncollected Receivables', value: 'AED 2.14M', change: '78% within 30d', positive: true },
    { label: 'Audit Flags', value: '2 One-Offs', change: 'Under Review', positive: false },
  ],
  sales: [
    { label: 'Sales (MTD)', value: 'AED 1.42M', change: '+18% vs Sep', positive: true },
    { label: 'Orders Shipped', value: '184', change: '+18', positive: true },
    { label: 'Avg Order Value', value: 'AED 7,717', change: '+4.2%', positive: true },
    { label: 'Return Rate', value: '1.4%', change: '-0.3%', positive: true },
  ],
  finance: [
    { label: 'Gross Operating Income', value: 'AED 890K', change: '+15.2%', positive: true },
    { label: 'Trade Receivables', value: 'AED 2.14M', change: 'Current', positive: true },
    { label: 'Approved Payables', value: 'AED 380K', change: '-12%', positive: true },
    { label: 'Liquid Cash Position', value: 'AED 4.72M', change: '+5%', positive: true },
  ],
  inventory: [
    { label: 'Total Tracked SKUs', value: '8,504', change: '+42 active', positive: true },
    { label: 'Stock Valuation', value: 'AED 6.83M', change: '+3.1%', positive: true },
    { label: 'Pending Goods Receipts', value: '14 GRNs', change: 'In Inspection', positive: true },
    { label: 'Reorder Alerts', value: '3 SKUs', change: 'Action Needed', positive: false },
  ],
  reports: [
    { label: 'Trial Balance Verification', value: 'Balanced', change: 'Debit = Credit', positive: true },
    { label: 'Monthly Statements', value: '9 Generated', change: 'Oct 2026 Ready', positive: true },
    { label: 'Audit Provenance', value: '100% Tracked', change: 'Immutable', positive: true },
    { label: 'Data Latency', value: '< 1 sec', change: 'Real-Time Core', positive: true },
  ],
  invoices: [
    { label: 'Invoices Issued (MTD)', value: '184', change: '+18 vs budget', positive: true },
    { label: 'Customer Approved', value: '156', change: 'Cleared', positive: true },
    { label: 'Pending Manager Sign-off', value: '21', change: 'In Queue', positive: true },
    { label: 'Total Billed Amount', value: 'AED 1.42M', change: '5% VAT included', positive: true },
  ],
}

interface DashboardPreviewProps {
  activeModule: string
}

export default function DashboardPreview({ activeModule }: DashboardPreviewProps) {
  const kpis = kpiModules[activeModule] || kpiModules.executive

  return (
    <div className="bg-white min-h-[380px]">
      {/* Dashboard Top Sub-Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200/80 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-md bg-electric-blue flex items-center justify-center text-white text-[10px] font-bold">
            R
          </div>
          <span className="text-xs font-bold text-slate-900">RaapNexus Core Ledger</span>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-semibold text-electric-blue capitalize">
            {activeModule === 'executive' ? 'Executive Summary' : activeModule}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
            FY 2026-Q3
          </span>
          <span className="status-success text-[11px]">Synced</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-5 pb-3">
        {kpis.map((kpi, i) => (
          <AnimatePresence key={`${activeModule}-${i}`} mode="wait">
            <motion.div
              key={`${activeModule}-${kpi.label}`}
              className="dash-card bg-slate-50/70 hover:bg-white transition-colors"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <div className="kpi-label mb-1 text-[10px]">{kpi.label}</div>
              <div className="kpi-value text-lg sm:text-xl">{kpi.value}</div>
              <div className={`text-xs mt-1 font-medium ${kpi.positive ? 'text-emerald-700' : 'text-amber-700'}`}>
                {kpi.change}
              </div>
            </motion.div>
          </AnimatePresence>
        ))}
      </div>

      {/* Charts Area */}
      <div className="px-5 pb-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <ModuleChart module={activeModule} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function ModuleChart({ module }: { module: string }) {
  const commonProps = {
    margin: { top: 5, right: 10, left: -15, bottom: 0 },
  }

  const tooltipStyle = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
    color: '#0F172A',
    fontSize: '12px',
    padding: '8px 12px',
  }

  if (module === 'executive' || module === 'sales') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 dash-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">Revenue vs. Target (AED) — 2026 Trend</span>
            <span className="text-[10px] text-slate-400 font-mono">Ledger Schema V3</span>
          </div>
          <ResponsiveContainer width="100%" height={165}>
            <AreaChart data={salesData} {...commonProps}>
              <defs>
                <linearGradient id="gradRevenueLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`AED ${(v/1000).toFixed(0)}K`, 'Revenue']} />
              <Area type="monotone" dataKey="target" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fill="url(#gradRevenueLight)" dot={false} activeDot={{ r: 4, fill: '#2563EB' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">Branch Performance</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Active</span>
          </div>
          <ResponsiveContainer width="100%" height={165}>
            <BarChart data={branchData} layout="vertical" {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
              <YAxis dataKey="branch" type="category" tick={{ fill: '#334155', fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} width={65} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`AED ${(v/1000).toFixed(0)}K`, 'Invoiced']} />
              <Bar dataKey="sales" fill="#2563EB" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  if (module === 'finance') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 dash-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">Income vs. Operating Costs</span>
            <span className="text-[10px] text-slate-400 font-mono">Consolidated</span>
          </div>
          <ResponsiveContainer width="100%" height={165}>
            <BarChart data={financeData} {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`AED ${(v/1000000).toFixed(2)}M`, '']} />
              <Bar dataKey="income" fill="#0891B2" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-card">
          <span className="text-xs font-bold text-slate-700 block mb-2">Revenue Mix by Category</span>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={110}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={32} outerRadius={50} paddingAngle={2} dataKey="value">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] mt-1 w-full">
              {categoryData.map((c) => (
                <div key={c.name} className="flex items-center gap-1.5 truncate">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-600 truncate">{c.name}</span>
                  <span className="text-slate-900 font-bold ml-auto">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (module === 'inventory') {
    return (
      <div className="dash-card">
        <span className="text-xs font-bold text-slate-700 block mb-3">Warehouse Stock Levels vs. Safety Thresholds</span>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={inventoryData} {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="category" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="stock" fill="#2563EB" radius={[4, 4, 0, 0]} name="Current Stock" />
            <Bar dataKey="reorder" fill="#D97706" radius={[4, 4, 0, 0]} name="Reorder Point" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (module === 'reports') {
    return (
      <div className="dash-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700">Financial Reports & Trial Balance Logs</span>
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Reconciled
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { name: 'Trial Balance', date: 'Oct 29, 2026', status: 'Balanced' },
            { name: 'Monthly P&L', date: 'Oct 29, 2026', status: 'Generated' },
            { name: 'Ageing & Collections', date: 'Oct 28, 2026', status: 'Verified' },
            { name: 'Balance Sheet', date: 'Oct 27, 2026', status: 'Closed' },
            { name: 'Stock Valuation (FIFO)', date: 'Oct 27, 2026', status: 'Audited' },
            { name: 'Cash Flow Projection', date: 'Oct 26, 2026', status: 'Active' },
          ].map((r) => (
            <div key={r.name} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="text-xs font-bold text-slate-900 mb-0.5">{r.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">{r.date}</div>
              <div className="status-success mt-2 text-[10px]">{r.status}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (module === 'invoices') {
    return (
      <div className="dash-card overflow-x-auto">
        <span className="text-xs font-bold text-slate-700 block mb-3">Recent Sales Vouchers & Approval Status</span>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400">
              {['Voucher Ref', 'Customer', 'Date', 'Gross Amount', 'Status', 'Verification'].map((h) => (
                <th key={h} className="text-left py-2 px-2 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { inv: 'INV-2026-0891', customer: 'Al Noor Trading', date: 'Oct 29', amount: 'AED 18,500', status: 'Approved' },
              { inv: 'INV-2026-0892', customer: 'Gulf Star LLC', date: 'Oct 29', amount: 'AED 7,200', status: 'Pending Review' },
              { inv: 'INV-2026-0893', customer: 'Emirates Industrial Group', date: 'Oct 28', amount: 'AED 31,000', status: 'Approved' },
              { inv: 'INV-2026-0894', customer: 'Arabie Corp', date: 'Oct 28', amount: 'AED 4,800', status: 'Pending Review' },
              { inv: 'INV-2026-0895', customer: 'Delta Supplies', date: 'Oct 27', amount: 'AED 12,700', status: 'Approved' },
            ].map((row) => (
              <tr key={row.inv} className="border-b border-slate-100 hover:bg-slate-50/80">
                <td className="py-2.5 px-2 font-mono font-medium text-electric-blue">{row.inv}</td>
                <td className="py-2.5 px-2 font-semibold text-slate-900">{row.customer}</td>
                <td className="py-2.5 px-2 text-slate-500">{row.date}</td>
                <td className="py-2.5 px-2 font-bold text-slate-900">{row.amount}</td>
                <td className="py-2.5 px-2">
                  <span className={row.status === 'Approved' ? 'status-success' : 'status-warning'}>
                    {row.status}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-slate-400 font-mono text-[10px]">
                  LEDGER-TXN-OK
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return null
}
