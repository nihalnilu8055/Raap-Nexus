import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-32 px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="text-8xl font-black gradient-text-blue mb-4 font-mono">
            404
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            The page or product view you requested could not be located.
          </p>
          <Link to="/" className="btn-primary py-2.5 px-6 text-xs uppercase tracking-wider font-bold">
            <Home size={15} /> Return to Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
