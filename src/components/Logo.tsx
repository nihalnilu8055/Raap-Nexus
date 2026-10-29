import { useState } from 'react'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const [imgError, setImgError] = useState(false)

  // Calibrated dimensions for cropped 4.07:1 aspect ratio logo
  const sizeClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11 md:h-12',
    lg: 'h-12 sm:h-14 md:h-16',
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {!imgError ? (
        <img
          src="/assets/logo.png"
          alt="RaapNexus - Autonomous Enterprise ERP"
          className={`${sizeClasses[size]} w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03] drop-shadow-xs`}
          style={{ imageRendering: 'auto' }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-500 flex items-center justify-center shadow-xs">
            <span className="font-black text-white text-lg tracking-tight">R</span>
          </div>
          <span className="font-black text-2xl tracking-tight text-slate-900 leading-none">
            Raap<span className="text-cyan-600">Nexus</span>
          </span>
        </div>
      )}
    </div>
  )
}
