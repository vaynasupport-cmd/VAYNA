interface VaynaLogoProps {
  size?: number
  className?: string
  showText?: boolean
}

export function VaynaLogo({ size = 36, className = '', showText = false }: VaynaLogoProps) {
  const svg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={!showText ? className : ''}
    >
      <defs>
        <linearGradient id="vayna-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <filter id="vayna-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="36" height="36" rx="8" fill="#000000" />

      {/*
        VΛ — V left, Λ right (no crossbar)
        Centered as a group, tight spacing
      */}
      <text
        x="18"
        y="24"
        textAnchor="middle"
        fontFamily="'Inter', 'Arial Black', sans-serif"
        fontWeight="900"
        fontSize="17"
        letterSpacing="1"
        fill="url(#vayna-grad)"
        filter="url(#vayna-glow)"
      >
        VΛ
      </text>
    </svg>
  )

  if (!showText) return svg

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Maintien de l'icône si on veut, mais le logo est surtout le texte */}
      {svg}
      
      <div className="flex flex-col justify-center">
        {/* V Λ Y N Λ */}
        <div className="relative flex items-center">
          <span
            className="font-black tracking-[0.22em] select-none leading-none relative z-10"
            style={{
              fontSize: size * 0.65,
              background: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 40%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: "'Inter', sans-serif",
              filter: 'drop-shadow(0 0 12px rgba(59,130,246,0.5))',
            }}
          >
            V<span style={{ fontFamily: 'Georgia, serif' }}>Λ</span>YN<span style={{ fontFamily: 'Georgia, serif' }}>Λ</span>
          </span>
        </div>

        {/* JOURNAL DE TRADING */}
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center relative">
            <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-cyan-500" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </div>
          <span 
            className="uppercase font-light whitespace-nowrap text-cyan-100/50"
            style={{ fontSize: size * 0.22, letterSpacing: '0.25em' }}
          >
            Journal de Trading
          </span>
          <div className="h-[1px] w-8 bg-gradient-to-r from-slate-600/60 to-transparent" />
        </div>
      </div>
    </div>
  )
}
