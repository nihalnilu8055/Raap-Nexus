import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Play } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import DashboardPreview from '../components/dashboard/DashboardPreview'
import { PRODUCTS } from '../data/products'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const product = PRODUCTS.find((p) => p.slug === slug) || PRODUCTS[0]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb / Back Link */}
          <Link
            to="/#products"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 mb-8 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Products
          </Link>

          {/* Product Header */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <span
                className="inline-block text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full mb-4"
                style={{
                  backgroundColor: `${product.accentColor}15`,
                  color: product.accentColor,
                  border: `1px solid ${product.accentColor}30`,
                }}
              >
                {product.category}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-4">
                {product.name}
              </h1>
              <p className="text-xl text-electric-blue font-semibold mb-6">
                {product.tagline}
              </p>
              <p className="text-slate-600 text-base leading-relaxed mb-8">
                {product.description}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/demo"
                  className="btn-primary py-3 px-6 text-xs uppercase tracking-wider font-bold shadow-blue-glow flex items-center gap-2"
                >
                  <Play size={14} className="fill-white" /> Open Live ERP Demo
                </Link>
                <a
                  href="/erp/dashboard.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary py-3 px-6 text-xs uppercase tracking-wider font-bold"
                >
                  Standalone View
                </a>
              </div>
            </div>

            {/* Dashboard module preview */}
            <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-elevation bg-white">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 border-b border-slate-200">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="text-xs text-slate-500 font-mono text-center flex-1">
                  {product.name} — Live Demonstration Module
                </div>
              </div>
              <DashboardPreview activeModule={product.dashboardModule} />
            </div>
          </div>

          {/* Core Feature Deep-Dive */}
          <div className="glass-card rounded-2xl p-8 sm:p-12 mb-16 border border-slate-200/90 bg-white">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">
              Key Capabilities & Enterprise Workflows
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.features.map((f, i) => (
                <div
                  key={i}
                  className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      backgroundColor: `${product.accentColor}15`,
                      color: product.accentColor,
                    }}
                  >
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                      {f.text}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Governed by strict role-based controls and integrated directly into the unified general ledger.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
