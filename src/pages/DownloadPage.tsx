import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, Monitor, Smartphone, ArrowLeft } from 'lucide-react'
import { VaynaLogo } from '@/components/VaynaLogo'

export function DownloadPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top, #0f172a 0%, #020617 100%)', color: '#f0f4ff', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── NAV ── */}
      <nav className="fixed left-0 right-0 z-[100] bg-[#0a0a0f]/85 backdrop-blur-xl border-b border-cyan-500/10 top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Retour</span>
          </Link>
          <VaynaLogo size={28} showText />
          <div className="w-[60px]" /> {/* Spacer for centering */}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="px-4 sm:px-8 pt-32 pb-16 flex flex-col items-center max-w-5xl mx-auto gap-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight m-0 leading-tight flex flex-wrap items-center justify-center gap-3 md:gap-5">
            Télécharger 
            <span style={{ fontWeight: '900', letterSpacing: '0.15em', background: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 40%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: "'Inter', sans-serif", filter: 'drop-shadow(0 0 16px rgba(59,130,246,0.5))', paddingTop: '4px' }}>
              V<span style={{ fontFamily: 'Georgia, serif' }}>Λ</span>YN<span style={{ fontFamily: 'Georgia, serif' }}>Λ</span>
            </span>
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto mt-4">
            Choisissez la version adaptée à votre appareil et prenez le contrôle de votre trading dès aujourd'hui.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Windows App */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-3xl blur-xl transition-all group-hover:blur-2xl group-hover:bg-cyan-500/30" />
            <div className="relative h-full bg-[#0a0a0f]/80 backdrop-blur-sm border border-cyan-500/20 p-8 rounded-3xl flex flex-col items-center text-center gap-6 hover:border-cyan-500/40 transition-colors">
              <div className="h-20 w-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                <Monitor className="w-10 h-10 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Application Windows</h3>
                <p className="text-white/60 text-sm">
                  L'expérience complète sur ordinateur. Inclus l'import automatique ultra-rapide depuis MT5 via le module local.
                </p>
              </div>
              <div className="mt-auto pt-6 w-full">
                <a
                  href="https://github.com/vaynasupport-cmd/VAYNA/releases/download/v1.0.0/Vayna.Setup.1.0.0.exe"
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-[#0a0a0f] transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #00f5ff, #007bff)' }}
                  download
                >
                  <Download size={20} />
                  Télécharger (.exe)
                </a>
              </div>
            </div>
          </motion.div>

          {/* Android App */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/20 to-pink-600/20 rounded-3xl blur-xl transition-all group-hover:blur-2xl group-hover:bg-purple-500/30" />
            <div className="relative h-full bg-[#0a0a0f]/80 backdrop-blur-sm border border-purple-500/20 p-8 rounded-3xl flex flex-col items-center text-center gap-6 hover:border-purple-500/40 transition-colors">
              <div className="h-20 w-20 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Smartphone className="w-10 h-10 text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Application Android</h3>
                <p className="text-white/60 text-sm">
                  Votre journal de trading partout avec vous. Application native ultra-fluide pour suivre vos performances en temps réel.
                </p>
              </div>
              <div className="mt-auto pt-6 w-full">
                <a
                  href="/downloads/VAYNA-Android.apk"
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.02] border border-purple-500/50"
                  style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))' }}
                  download
                >
                  <Download size={20} />
                  Télécharger l'APK
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
