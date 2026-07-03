import { useState, useEffect } from 'react'
import { Minus, Square, X } from 'lucide-react'
import { VaynaLogo } from '@/components/VaynaLogo'

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const api = window.electronAPI?.windowControls

  useEffect(() => {
    if (api) {
      api.isMaximized().then(setIsMaximized)
      api.onMaximizeChange(setIsMaximized)
    }
  }, [api])

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-10 flex select-none titlebar-drag bg-gradient-to-r from-[#0a0a0f] to-[#0d1b2a] shadow-md border-b border-white/10" id="vayna-titlebar">
      <div className="flex-1 flex items-center px-4 gap-3">
        <div className="titlebar-no-drag pt-0.5 opacity-90 hover:opacity-100 transition-opacity flex items-center justify-center">
          <VaynaLogo size={20} showText={false} />
        </div>
        <span className="text-[12px] font-semibold tracking-wider text-white/90">
          VAYNA <span className="font-light mx-1 opacity-40">—</span> <span className="font-normal opacity-60">Journal de Trading</span>
        </span>
      </div>

      <div className="flex titlebar-no-drag">
        <button
          onClick={() => api?.minimize()}
          className="w-[46px] h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Minus className="h-[14px] w-[14px]" />
        </button>
        <button
          onClick={() => api?.maximize()}
          className="w-[46px] h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Square className={`h-[11px] w-[11px] ${isMaximized ? 'scale-90' : ''}`} />
        </button>
        <button
          onClick={() => api?.close()}
          className="w-[46px] h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-[#e81123] transition-colors"
        >
          <X className="h-[15px] w-[15px]" />
        </button>
      </div>
    </div>
  )
}

