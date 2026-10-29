import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, CheckCircle2, Layers } from 'lucide-react'
import { PRODUCTS, Product } from '../data/products'

export default function ProductPortfolio() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="products" ref={ref} className="py-24 bg-white relative overflow-hidden border-b border-slate-200/80">
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label mb-4">
            <Layers size={13} />
            Enterprise Software Portfolio
          </div>
          <h2 className="section-heading text-3xl sm:text-4xl lg:text-5xl mb-4">
            Specialized solutions.{' '}
            <span className="gradient-text-blue">Unified intelligence.</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Explore our modular ERP and enterprise software suites engineered to scale with complex business structures.
          </p>
        </motion.div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PRODUCTS.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductCard({ product, index, isInView }: { product: Product; index: number; isInView: boolean }) {
  return (
    <motion.div
      className="glass-card-hover flex flex-col justify-between rounded-2xl overflow-hidden border border-slate-200/90 bg-white relative group shadow-card"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      whileHover={{ y: -6 }}
    >
      {/* Top Accent line */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: product.accentColor }}
      />

      <div className="p-7 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {product.category}
          </span>
          {product.badge && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-electric-blue px-2 py-0.5 rounded-full border border-blue-200">
              {product.badge}
            </span>
          )}
        </div>

        <h3 className="text-2xl font-black text-slate-900 mb-2">{product.name}</h3>
        <p className="text-electric-blue font-semibold text-xs mb-4">{product.tagline}</p>
        <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
          {product.description}
        </p>

        {/* Feature List */}
        <div className="space-y-2.5 mb-8 border-t border-slate-100 pt-6">
          {product.features.map((f, fi) => (
            <div key={fi} className="flex items-start gap-2.5 text-xs text-slate-700">
              <CheckCircle2
                size={15}
                className="mt-0.5 flex-shrink-0"
                style={{ color: product.accentColor }}
              />
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Link
            to={`/products/${product.slug}`}
            className="flex-1 btn-secondary text-xs py-2.5 justify-center flex items-center gap-1.5 font-bold uppercase tracking-wider"
          >
            Details <ArrowRight size={13} />
          </Link>
          <Link
            to="/demo"
            className="btn-primary text-xs py-2.5 px-4 font-bold uppercase tracking-wider whitespace-nowrap"
          >
            Live Demo
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
