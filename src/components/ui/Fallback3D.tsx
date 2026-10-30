/** Lightweight SVG composition shown when WebGL is unavailable or still loading. */
export default function Fallback3D({ className = '' }: { className?: string }) {
  const nodes = [[78, 28], [18, 34], [70, 76], [26, 74], [50, 8], [52, 92]]
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="fb-core" cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#bfe8ff" />
          <stop offset="0.5" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1d3fa8" />
        </radialGradient>
      </defs>
      {[16, 26, 36].map((r, i) => <ellipse key={r} cx="50" cy="50" rx={r} ry={r * 0.45} fill="none" stroke="#5ec8ff" strokeOpacity=".35" strokeWidth=".25" transform={`rotate(${i * 40 - 30} 50 50)`} />)}
      {nodes.map(([x, y], i) => <g key={i}><line x1="50" y1="50" x2={x} y2={y} stroke="#6db5ff" strokeOpacity=".35" strokeWidth=".25" /><circle cx={x} cy={y} r="1.8" fill="#dbe9ff" /></g>)}
      <circle cx="50" cy="50" r="9" fill="url(#fb-core)" />
    </svg>
  )
}
