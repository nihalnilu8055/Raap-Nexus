import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

/** 404 on the current dark design (self-contained: it can render outside the language provider). */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#040a1c] text-slate-200">
      <header className="px-6 pt-6"><Link to="/" aria-label="RaapNexus home" className="inline-block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"><Logo size="md" surface="dark" /></Link></header>
      <main id="main" className="grid flex-1 place-items-center px-4 py-20 text-center">
        <div className="mx-auto max-w-md">
          <p aria-hidden className="bg-gradient-to-br from-blue-400 via-sky-400 to-blue-600 bg-clip-text font-mono text-[clamp(80px,22vw,168px)] font-extrabold leading-none tracking-tighter text-transparent">404</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-white sm:text-4xl">Page not found</h1>
          <p className="mx-auto mt-3 max-w-[46ch] text-slate-400">The page you are looking for does not exist or has moved. Check the address, or head back to somewhere useful.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/" className="inline-flex min-h-[44px] items-center rounded-full bg-gradient-to-br from-blue-600 to-sky-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">Back to home</Link>
            <Link to="/en/help" className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-bold text-white hover:border-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">Help centre</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
