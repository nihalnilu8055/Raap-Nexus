import { useState } from 'react'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  /** 'tile' (default): the supplied logo on its own navy tile – for light surfaces.
   *  'dark': the same logo with the navy background removed – for dark surfaces. */
  surface?: 'tile' | 'dark' | 'header'
}

/** Height drives the size, the asset's own aspect is never altered (tile/dark: 720×200, header: tightly cropped 1063×244 transparent PNG). */
const WEBP = { header: '/assets/logo-header-480.webp', dark: '/assets/logo-light-432.webp', tile: '/assets/logo-432.webp' } as const
const H = { sm: 36, md: 40, lg: 56 } as const

export default function Logo({ className = '', size = 'md', surface = 'tile' }: LogoProps) {
  const [imgError, setImgError] = useState(false)
  const h = H[size]
  const ratio = surface === 'header' ? 1063 / 244 : 3.6
  const w = Math.round(h * ratio)
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {!imgError ? (
        <picture className="block">
          {/* same artwork, right-sized WebP (alpha kept) for the CSS size it is shown at; the PNG stays as the fallback */}
          <source type="image/webp" srcSet={WEBP[surface]} />
          <img
            src={surface === 'header' ? '/assets/logo-header.png' : surface === 'dark' ? '/assets/logo-light.png' : '/assets/logo.png'}
            alt="RaapNexus" width={w} height={h}
            decoding="async" {...(surface === 'dark' ? { loading: 'lazy' as const } : {})}
            className="block object-contain"
            style={{ height: h, width: w }}
            onError={() => setImgError(true)}
          />
        </picture>
      ) : (
        <span className="font-black text-xl tracking-tight text-slate-900">Raap<span className="text-sky-500">Nexus</span></span>
      )}
    </div>
  )
}
