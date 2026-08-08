import { motion } from 'framer-motion'
import {
  BarChart2, Target, Brain,
  CheckCircle, Activity,
} from 'lucide-react'
import { VaynaLogo } from '@/components/VaynaLogo'

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATION PRESETS
   ═══════════════════════════════════════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] },
  },
}

/* ═══════════════════════════════════════════════════════════════════════
   BROWSER FRAME — wraps a screenshot in a macOS-style window
   ═══════════════════════════════════════════════════════════════════════ */
function BrowserFrame({
  src,
  alt,
  glowColor = '#00f5ff',
  tiltX = 0.5,
  tiltY = -1,
  darkOverlay = false,
  style = {},
}: {
  src: string
  alt: string
  glowColor?: string
  tiltX?: number
  tiltY?: number
  darkOverlay?: boolean
  style?: React.CSSProperties
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.25, 0.4, 0.25, 1] }}
      viewport={{ once: true, margin: '-60px' }}
      style={{
        position: 'relative',
        borderRadius: '18px',
        overflow: 'hidden',
        border: `1px solid ${glowColor}22`,
        boxShadow: `
          0 32px 100px rgba(0,0,0,0.55),
          0 0 80px ${glowColor}10,
          inset 0 1px 0 ${glowColor}12
        `,
        background: 'rgba(12,12,22,0.85)',
        transform: `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.6s cubic-bezier(0.25, 0.4, 0.25, 1), box-shadow 0.6s ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = `perspective(1200px) rotateX(${tiltX * 0.3}deg) rotateY(${tiltY * 0.3}deg) scale(1.02)`
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 40px 120px rgba(0,0,0,0.6), 0 0 100px ${glowColor}18, inset 0 1px 0 ${glowColor}20`
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1)`
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 32px 100px rgba(0,0,0,0.55), 0 0 80px ${glowColor}10, inset 0 1px 0 ${glowColor}12`
      }}
    >
      {/* Screenshot with optional dark overlay for light-themed images */}
      <div style={{ position: 'relative' }}>
        <img
          src={src}
          alt={alt}
          draggable={false}
          loading="lazy"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            imageRendering: 'auto',
            filter: darkOverlay ? 'brightness(0.88) contrast(1.08) saturate(1.1)' : 'none',
          }}
        />
        {/* Vignette overlay for depth effect */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: darkOverlay
            ? 'linear-gradient(180deg, rgba(10,10,20,0.15) 0%, transparent 20%, transparent 80%, rgba(10,10,20,0.25) 100%), linear-gradient(90deg, rgba(10,10,20,0.1) 0%, transparent 15%, transparent 85%, rgba(10,10,20,0.1) 100%)'
            : 'linear-gradient(180deg, transparent 85%, rgba(10,10,20,0.12) 100%)',
          pointerEvents: 'none',
        }} />
      </div>
    </motion.div>
  )
}



/* ═══════════════════════════════════════════════════════════════════════
   BENTO CARD — grid item for features
   ═══════════════════════════════════════════════════════════════════════ */
function BentoCard({
  icon: Icon,
  color,
  badge,
  headline,
  description,
  bullets,
  visual,
  reversed = false,
}: {
  icon: React.ElementType
  color: string
  badge: string
  headline: React.ReactNode
  description: string
  bullets?: string[]
  visual: React.ReactNode
  reversed?: boolean
}) {
  return (
    <motion.div
      variants={fadeUp}
      className={`feature-card flex flex-col ${reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} relative overflow-hidden`}
      style={{
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(16px)',
        boxShadow: `0 20px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)`,
        minHeight: '400px',
      }}
    >
      {/* Background glow specific to card */}
      <div style={{
        position: 'absolute', top: '50%', left: reversed ? '25%' : '75%', transform: 'translate(-50%, -50%)',
        width: '50%', height: '80%', background: `radial-gradient(ellipse, ${color}15, transparent 70%)`,
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0
      }} />

      {/* TEXT SECTION */}
      <div className="feature-card-text p-8 lg:p-12 flex-1 flex flex-col justify-center relative z-10">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Icon size={18} style={{ color }} />
          <span style={{ fontSize: '12px', fontWeight: '700', color, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {badge}
          </span>
        </div>
        <h3 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: '800', margin: '0 0 16px', color: '#f0f4ff', lineHeight: 1.15 }}>
          {headline}
        </h3>
        <p style={{ fontSize: '16px', color: 'rgba(240,244,255,0.55)', margin: '0 0 24px', lineHeight: 1.6, maxWidth: '460px' }}>
          {description}
        </p>
        
        {bullets && bullets.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bullets.map((bullet, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={14} style={{ color, flexShrink: 0 }} />
                <span style={{ fontSize: '14px', fontWeight: '500', color: 'rgba(240,244,255,0.7)' }}>{bullet}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VISUAL SECTION */}
      <div className={`flex-[1.2] p-6 flex items-center justify-center relative z-10 bg-[#0a0a0f]/40 border-t border-white/5 lg:border-t-0 ${reversed ? 'lg:border-r lg:border-white/5' : 'lg:border-l lg:border-white/5'}`}>
        {visual}
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   SHOWCASE 1 — Import automatique MT4/MT5 (Processus de Sync)
   ═══════════════════════════════════════════════════════════════════════ */
function ShowcaseAutoImport() {
  return (
    <div style={{ position: 'relative', padding: '20px', minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(ellipse, rgba(0,245,255,0.12), transparent 60%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
        viewport={{ once: true }}
        style={{
          width: '100%',
          maxWidth: '540px',
          padding: '40px 30px',
          borderRadius: '24px',
          background: 'rgba(12,12,22,0.85)',
          border: '1px solid rgba(0,245,255,0.15)',
          boxShadow: '0 32px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(0,245,255,0.1)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '30px',
          position: 'relative',
        }}
      >
        {/* Animated Flow Diagram */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', position: 'relative', zIndex: 2 }}>
          
          {/* MT5 Node */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div 
              style={{
                width: '64px', height: '64px', borderRadius: '16px', background: '#fff',
                border: '1px solid rgba(0,245,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(0,245,255,0.1)', overflow: 'hidden'
            }}>
              <img src="./mt5.jpg" alt="MT5" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </motion.div>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#00f5ff' }}>MT5</span>
          </div>

          {/* Data Connection & Packets (Signal Syncing) */}
          <div style={{ flex: 1, height: '60px', position: 'relative', margin: '0 24px', display: 'flex', alignItems: 'center', minWidth: '160px', overflow: 'hidden' }}>
            
            {/* Signal 1 (Cyan) */}
            <motion.div
              animate={{ left: ['-40%', '120%'] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                width: '70px', height: '2px', borderRadius: '4px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(0,245,255,0.8) 70%, #fff 100%)',
                boxShadow: '0 0 12px rgba(0,245,255,0.8), 0 0 24px rgba(0,245,255,0.4)'
              }}
            >
              <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: '#fff', boxShadow: '0 0 10px #fff, 0 0 20px #00f5ff' }} />
            </motion.div>

            {/* Signal 2 (Cyan) */}
            <motion.div
              animate={{ left: ['-40%', '120%'] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear', delay: 0.6 }}
              style={{
                position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                width: '70px', height: '2px', borderRadius: '4px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(0,245,255,0.8) 70%, #fff 100%)',
                boxShadow: '0 0 12px rgba(0,245,255,0.8), 0 0 24px rgba(0,245,255,0.4)'
              }}
            >
              <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: '#fff', boxShadow: '0 0 10px #fff, 0 0 20px #00f5ff' }} />
            </motion.div>

          </div>

          {/* VAYNA Cloud Node */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div 
              style={{
                width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(10,10,20,0.95)',
                border: '1px solid rgba(0,245,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div>
                <VaynaLogo size={32} />
              </div>
            </motion.div>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#00f5ff' }}>VAYNA</span>
          </div>
        </div>

        {/* Sync Status Badge */}
        <div style={{
          padding: '8px 16px', borderRadius: '100px', background: 'rgba(0,245,255,0.1)',
          border: '1px solid rgba(0,245,255,0.2)', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <motion.div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f5ff', boxShadow: '0 0 10px #00f5ff' }} />
          </motion.div>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#00f5ff', letterSpacing: '0.05em' }}>CONNEXION ACTIVE</span>
        </div>

      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   SHOWCASE 2 — Statistiques avancées (Dashboard)
   ═══════════════════════════════════════════════════════════════════════ */
function ShowcaseStats() {
  return (
    <div style={{ position: 'relative', padding: '12px' }}>
      {/* Glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '90%', background: 'radial-gradient(ellipse, rgba(123,47,190,0.1), transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      {/* Main dashboard frame */}
      <BrowserFrame
        src="./analytic-1.png"
        alt="Dashboard central avec equity curve et statistiques"
        glowColor="#7B2FBE"
        tiltX={0.5}
        tiltY={2}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   SHOWCASE 3 — Analyse de performance
   ═══════════════════════════════════════════════════════════════════════ */
function ShowcaseAnalysis() {
  return (
    <div style={{ position: 'relative', padding: '12px' }}>
      {/* Glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', height: '80%', background: 'radial-gradient(ellipse, rgba(0,245,255,0.08), transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      {/* Main stats dark page */}
      <BrowserFrame
        src="./feat-6.png"
        alt="Analyse de performance"
        glowColor="#00f5ff"
        tiltX={0.5}
        tiltY={-1.5}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   SHOWCASE 4 — Multi-comptes
   ═══════════════════════════════════════════════════════════════════════ */
function ShowcaseMultiAccounts() {
  return (
    <div style={{ position: 'relative', padding: '12px' }}>
      {/* Glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', height: '85%', background: 'radial-gradient(ellipse, rgba(123,47,190,0.08), transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      {/* Main comptes page */}
      <BrowserFrame
        src="./feat-7.png"
        alt="Gestion Multi-Comptes"
        glowColor="#7B2FBE"
        tiltX={0.5}
        tiltY={1.5}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   SHOWCASE 5 — Journal de psychologie
   ═══════════════════════════════════════════════════════════════════════ */
function ShowcasePsychology() {
  return (
    <div style={{ position: 'relative', padding: '24px 16px' }}>
      {/* Glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', height: '80%', background: 'radial-gradient(ellipse, rgba(123,47,190,0.1), transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      {/* Main discipline tracker - special dark card frame */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
        viewport={{ once: true }}
        style={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(123,47,190,0.25)',
          boxShadow: '0 32px 100px rgba(0,0,0,0.5), 0 0 80px rgba(123,47,190,0.08)',
          background: 'rgba(12,12,22,0.9)',
          backdropFilter: 'blur(20px)',
          transform: 'perspective(1200px) rotateX(2deg) rotateY(-4deg)',
          transition: 'all 0.5s cubic-bezier(0.25, 0.4, 0.25, 1)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = 'perspective(1200px) rotateX(0.5deg) rotateY(-1deg) scale(1.02)'
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = 'perspective(1200px) rotateX(2deg) rotateY(-4deg) scale(1)'
        }}
      >


        {/* Screenshot */}
        <div style={{ padding: '12px', position: 'relative' }}>
          <img
            src="./feat-8.png"
            alt="VAYNA Bot IA assistant de trading"
            draggable={false}
            loading="lazy"
            style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '12px', imageRendering: 'auto' }}
          />
        </div>
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export function FeaturesStack() {
  return (
    <>
      {/* ── Removed keyframes ── */}

      <div className="flex flex-col gap-10 sm:gap-[60px] max-w-7xl mx-auto px-4 sm:px-8">
        {/* FEATURE 1 — Synchronisation */}
        <BentoCard
          icon={Activity}
          color="#00f5ff"
          badge="Synchronisation"
          headline={<>Vos trades remontent<br /><span style={{ color: '#00f5ff', textShadow: '0 0 30px rgba(0,245,255,0.3)' }}>en temps réel.</span></>}
          description="Connectez directement votre compte MetaTrader 5 via mot de passe investisseur. Vos trades fermés remontent automatiquement dans VAYNA — sans aucune saisie manuelle."
          bullets={[
            'Import automatique MT5 sécurisé',
            'Zéro saisie manuelle, zéro erreur de données',
            'Synchronisation en moins d\'une seconde',
          ]}
          visual={<ShowcaseAutoImport />}
        />

        {/* FEATURE 2 — Analytics */}
        <BentoCard
          icon={BarChart2}
          color="#7B2FBE"
          badge="Analytics"
          headline={<>Des données de<br /><span style={{ background: 'linear-gradient(135deg, #a855f7, #7B2FBE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>niveau hedge fund.</span></>}
          description="Win rate, drawdown, profit factor, risk/reward — chaque métrique clé est calculée automatiquement et présentée dans un dashboard visuel clair et actionnable."
          bullets={[
            'Equity curve et profit factor en temps réel',
            'Analyse par paire, par session, par stratégie',
          ]}
          visual={<ShowcaseStats />}
          reversed
        />

        {/* FEATURE 3 — Performance */}
        <BentoCard
          icon={Activity}
          color="#00f5ff"
          badge="Performance"
          headline={<>Identifiez vos forces<br /><span style={{ color: '#00f5ff', textShadow: '0 0 30px rgba(0,245,255,0.3)' }}>et vos faiblesses.</span></>}
          description="Visualisez vos performances en profondeur : heatmap d'activité, distribution P&L. Chaque insight est une opportunité d'amélioration."
          bullets={[
            'Heatmap d\'activité pour identifier vos meilleurs créneaux',
            'Insights exploitables pour corriger vos erreurs',
          ]}
          visual={<ShowcaseAnalysis />}
        />

        {/* FEATURE 4 — Multi-comptes */}
        <BentoCard
          icon={Target}
          color="#7B2FBE"
          badge="Multi-Comptes"
          headline={<>Tous vos comptes,<br /><span style={{ background: 'linear-gradient(135deg, #a855f7, #7B2FBE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>un seul cockpit.</span></>}
          description="FTMO, Topstep, Alpha Capital, compte personnel — centralisez tout. Suivez chaque compte séparément ou consultez vos stats globales."
          bullets={[
            'Gériez autant de comptes que nécessaire',
            'Suivi séparé des performances par challenge',
          ]}
          visual={<ShowcaseMultiAccounts />}
          reversed
        />

        {/* FEATURE 5 — Psychologie */}
        <BentoCard
          icon={Brain}
          color="#a855f7"
          badge="Psychologie"
          headline={<>La psychologie est<br /><span style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>votre edge #1.</span></>}
          description="Évaluez votre discipline, votre focus et votre confiance à chaque session. Identifiez les jours où votre mental vous coûte de l'argent — et corrigez le tir."
          bullets={[
            'Notez votre état mental après chaque session',
            'Insights personnalisés basés sur vos tendances',
          ]}
          visual={<ShowcasePsychology />}
        />
      </div>
    </>
  )
}
