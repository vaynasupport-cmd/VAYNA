interface VaynaLogoProps {
  size?: number
  className?: string
  showText?: boolean
}

export function VaynaLogo({ size = 36, className = '', showText = false }: VaynaLogoProps) {
  const svg = (
    <div 
      className={`flex items-center justify-center bg-black rounded-lg ${!showText ? className : ''}`}
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      <span
        className="font-black select-none tracking-widest relative z-10"
        style={{
          fontSize: size * 0.45,
          background: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 40%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: "'Inter', sans-serif",
          filter: 'drop-shadow(0 0 2px rgba(59,130,246,0.5))',
        }}
      >
        V<span style={{ fontFamily: 'Georgia, serif' }}>Λ</span>
      </span>
    </div>
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
