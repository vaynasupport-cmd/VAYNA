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
      <nav style={{ padding: '24px 32px', position: 'relative', zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1240px', margin: '0 auto' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <VaynaLogo size={32} />
        </Link>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'rgba(240,244,255,0.6)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'color 0.2s' }}>Accueil</Link>
          <Link to="/login" style={{ color: 'rgba(240,244,255,0.6)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'color 0.2s' }}>Se connecter</Link>
          <Link to="/register" style={{ background: 'rgba(0,245,255,0.1)', color: '#00f5ff', textDecoration: 'none', fontSize: '14px', fontWeight: '600', padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(0,245,255,0.2)', transition: 'all 0.2s' }}>
            Créer un compte
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header style={{ padding: '120px 20px 80px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(123,47,190,0.15) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px' }}>
            <span style={{ display: 'block', width: '8px', height: '8px', borderRadius: '50%', background: '#00f5ff', boxShadow: '0 0 10px #00f5ff' }} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(240,244,255,0.7)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Exploration des modules</span>
          </div>

          <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: '800', lineHeight: '1.1', letterSpacing: '-0.02em', margin: '0 0 24px' }}>
            L'arsenal complet du <br />
            <span style={{ background: 'linear-gradient(135deg, #fff 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Trader Professionnel</span>
          </h1>
          
          <p style={{ fontSize: '18px', color: 'rgba(240,244,255,0.5)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Découvrez comment VAYNA transforme vos données brutes en insights exploitables pour maximiser votre rentabilité.
          </p>
        </motion.div>
      </header>

      {/* GRADIENT SEPARATOR */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 32px' }}>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.2), rgba(123,47,190,0.2), transparent)' }} />
      </div>

      {/* STACK CARDS */}
      <section style={{ padding: '80px 0 100px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '80%', height: '80%', background: 'radial-gradient(ellipse, rgba(0,245,255,0.03), transparent 70%)', filter: 'blur(120px)', pointerEvents: 'none' }} />
        <FeaturesStack />
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '32px 32px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <VaynaLogo size={24} />
            <p style={{ fontSize: '13px', color: 'rgba(240,244,255,0.25)', margin: 0 }}>© {new Date().getFullYear()} VAYNA — Tous droits réservés</p>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link to="/" style={{ color: 'rgba(240,244,255,0.35)', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>Accueil</Link>
            <Link to="/faq" style={{ color: 'rgba(240,244,255,0.35)', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>FAQ</Link>
            <Link to="/login" style={{ color: 'rgba(240,244,255,0.35)', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>Connexion</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
