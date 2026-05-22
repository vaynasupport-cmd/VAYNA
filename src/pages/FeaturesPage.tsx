import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { VaynaLogo } from '@/components/VaynaLogo'
import { FeaturesStack } from '@/components/FeaturesStack'

export function FeaturesPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-[#030014] text-white overflow-hidden font-sans">
      {/* NAVBAR */}
      <nav className="relative z-50 flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto px-4 sm:px-8 py-6 gap-6 sm:gap-0">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <VaynaLogo size={32} />
        </Link>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 items-center">
          <Link to="/" className="text-sm font-medium transition-colors" style={{ color: 'rgba(240,244,255,0.6)' }}>Accueil</Link>
          <Link to="/login" className="text-sm font-medium transition-colors" style={{ color: 'rgba(240,244,255,0.6)' }}>Se connecter</Link>
          <Link to="/register" className="text-sm font-semibold px-5 py-2.5 rounded-lg border transition-all" style={{ background: 'rgba(0,245,255,0.1)', color: '#00f5ff', borderColor: 'rgba(0,245,255,0.2)' }}>
            Créer un compte
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="px-4 pt-20 pb-16 text-center relative">
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(123,47,190,0.15) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px' }}>
            <span style={{ display: 'block', width: '8px', height: '8px', borderRadius: '50%', background: '#00f5ff', boxShadow: '0 0 10px #00f5ff' }} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(240,244,255,0.7)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Exploration des modules</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6" style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}>
            L'arsenal complet du <br className="hidden sm:block" />
            <span style={{ background: 'linear-gradient(135deg, #fff 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Trader Professionnel</span>
          </h1>
          
          <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-4" style={{ color: 'rgba(240,244,255,0.5)' }}>
            Découvrez comment VAYNA transforme vos données brutes en insights exploitables pour maximiser votre rentabilité.
          </p>
        </motion.div>
      </header>

      {/* GRADIENT SEPARATOR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.2), rgba(123,47,190,0.2), transparent)' }} />
      </div>

      {/* STACK CARDS */}
      <section className="py-12 sm:py-20 relative px-4 sm:px-0">
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '80%', height: '80%', background: 'radial-gradient(ellipse, rgba(0,245,255,0.03), transparent 70%)', filter: 'blur(120px)', pointerEvents: 'none' }} />
        <FeaturesStack />
      </section>

      {/* FOOTER */}
      <footer className="px-4 sm:px-8 py-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between flex-wrap gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <VaynaLogo size={24} />
            <p className="text-xs sm:text-sm m-0" style={{ color: 'rgba(240,244,255,0.25)' }}>© {new Date().getFullYear()} VAYNA — Tous droits réservés</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link to="/" className="text-xs sm:text-sm font-medium no-underline" style={{ color: 'rgba(240,244,255,0.35)' }}>Accueil</Link>
            <Link to="/faq" className="text-xs sm:text-sm font-medium no-underline" style={{ color: 'rgba(240,244,255,0.35)' }}>FAQ</Link>
            <Link to="/login" className="text-xs sm:text-sm font-medium no-underline" style={{ color: 'rgba(240,244,255,0.35)' }}>Connexion</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
