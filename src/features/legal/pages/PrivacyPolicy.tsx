import { VaynaLogo } from '@/components/VaynaLogo'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { PrivacyContent } from '../components/PrivacyContent'

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
            Retour à l'accueil
          </Link>
          <VaynaLogo size={32} showText />
        </div>

          <PrivacyContent />
        </div>
      </div>
    </div>
  )
}
