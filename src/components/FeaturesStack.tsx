import { motion } from 'framer-motion'
import {
  Zap, BarChart2, Target, Brain,
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
  url = 'app.vayna.io',
  glowColor = '#00f5ff',
  tiltX = 2,
  tiltY = -5,
  darkOverlay = false,
  style = {},
}: {
  src: string
  alt: string
  url?: string
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
      {/* macOS-style title bar */}
      <div style={{
        padding: '12px 16px',
        background: 'rgba(15,15,28,0.98)',
        borderBottom: `1px solid rgba(255,255,255,0.06)`,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', gap: '7px' }}>
          <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ff5f57', boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.2)' }} />
          <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ffbd2e', boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.2)' }} />
          <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#28ca42', boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.2)' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            padding: '5px 32px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            fontSize: '11px',
            color: 'rgba(240,244,255,0.3)',
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            letterSpacing: '0.02em',
          }}>
            {url}
          </div>
        </div>
      </div>

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
   FLOATING CARD — small overlay screenshot with float animation
   ═══════════════════════════════════════════════════════════════════════ */
function FloatingCard({
  src,
  alt,
  label,
  glowColor = '#00f5ff',
  delay = 0.4,
  floatDuration = 5,
  darkFilter = false,
  containerStyle = {},
}: {
  src: string
  alt: string
  label?: string
  glowColor?: string
  delay?: number
  floatDuration?: number
  darkFilter?: boolean
  containerStyle?: React.CSSProperties
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.85 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }}
      viewport={{ once: true }}
      style={{
        position: 'absolute',
        zIndex: 10,
        ...containerStyle,
      }}
    >
      <div style={{
        borderRadius: '14px',
        overflow: 'hidden',
        border: `1px solid ${glowColor}35`,
        boxShadow: `0 24px 60px rgba(0,0,0,0.65), 0 0 40px ${glowColor}15`,
        background: 'rgba(12,12,22,0.95)',
        backdropFilter: 'blur(16px)',
        animation: `feat-float ${floatDuration}s ease-in-out infinite`,
      }}>
        {/* Optional label header */}
        {label && (
          <div style={{
            padding: '8px 14px',
            background: 'rgba(15,15,28,0.98)',
            borderBottom: `1px solid ${glowColor}15`,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: glowColor, boxShadow: `0 0 6px ${glowColor}` }} />
            <span style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(240,244,255,0.6)', letterSpacing: '0.03em' }}>{label}</span>
          </div>
        )}
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
              filter: darkFilter ? 'brightness(0.88) contrast(1.05) saturate(1.1)' : 'none',
            }}
          />
          {/* Subtle vignette */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 70%, rgba(10,10,20,0.15) 100%)',
            pointerEvents: 'none',
          }} />
        </div>
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
      className="feature-card"
      style={{
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(16px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: reversed ? 'row-reverse' : 'row',
        boxShadow: `0 20px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)`,
        position: 'relative',
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
      <div className="feature-card-text" style={{ flex: 1, padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
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
      <div style={{ flex: 1.2, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, background: 'rgba(10,10,15,0.4)', borderLeft: reversed ? 'none' : '1px solid rgba(255,255,255,0.04)', borderRight: reversed ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
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
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '56px', height: '56px', borderRadius: '16px', background: '#fff',
                border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)', overflow: 'hidden'
            }}>
              <img src="/mt5.jpg" alt="MT5" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </motion.div>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(240,244,255,0.5)' }}>MT5</span>
          </div>

          {/* Data Connection & Packets (Signal Syncing) */}
          <div style={{ flex: 1, height: '60px', position: 'relative', margin: '0 24px', display: 'flex', alignItems: 'center', minWidth: '160px', overflow: 'hidden' }}>
            {/* Background dashed line */}
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)', height: '1px', borderTop: '2px dashed rgba(0,245,255,0.15)' }} />
            
            {/* Signal 1 (Cyan) */}
            <motion.div
              animate={{ left: ['-40%', '120%'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                width: '70px', height: '2px', borderRadius: '4px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(0,245,255,0.8) 70%, #fff 100%)',
                boxShadow: '0 0 12px rgba(0,245,255,0.8), 0 0 24px rgba(0,245,255,0.4)'
              }}
            >
              {/* Tip of the signal */}
              <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: '#fff', boxShadow: '0 0 10px #fff, 0 0 20px #00f5ff' }} />
            </motion.div>

            {/* Signal 2 (Green) */}
            <motion.div
              animate={{ left: ['-40%', '120%'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', delay: 0.8 }}
              style={{
                position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                width: '70px', height: '2px', borderRadius: '4px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.8) 70%, #fff 100%)',
                boxShadow: '0 0 12px rgba(16,185,129,0.8), 0 0 24px rgba(16,185,129,0.4)'
              }}
            >
              {/* Tip of the signal */}
              <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: '#fff', boxShadow: '0 0 10px #fff, 0 0 20px #10b981' }} />
            </motion.div>
          </div>

          {/* VAYNA Cloud Node */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div 
              animate={{ scale: [1, 1.05, 1], boxShadow: ['0 0 0 rgba(0,245,255,0)', '0 0 30px rgba(0,245,255,0.2)', '0 0 0 rgba(0,245,255,0)'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(10,10,20,0.95)',
                border: '1px solid rgba(0,245,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ animation: 'feat-spin 4s linear infinite' }}>
                <VaynaLogo size={32} />
              </div>
            </motion.div>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#00f5ff' }}>VAYNA</span>
          </div>
        </div>

        {/* Sync Status Badge */}
        <div style={{
          padding: '8px 16px', borderRadius: '100px', background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
          </motion.div>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', letterSpacing: '0.05em' }}>CONNEXION ACTIVE</span>
        </div>

        {/* Floating Sync Notifications */}
        <div style={{ position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              padding: '12px 20px', borderRadius: '14px', background: 'rgba(15,15,28,0.98)',
              border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10, whiteSpace: 'nowrap'
            }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0,245,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Zap size={16} style={{ color: '#00f5ff' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#f0f4ff' }}>Nouveau trade détecté</span>
              <span style={{ fontSize: '11px', color: 'rgba(240,244,255,0.4)' }}>EUR/USD • Importé en 0.2s</span>
            </div>
            <div style={{ marginLeft: '12px', fontSize: '14px', fontWeight: '800', color: '#10b981' }}>
              +$342.00
            </div>
          </motion.div>
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
    <div style={{ position: 'relative', padding: '28px 20px' }}>
      {/* Glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '90%', background: 'radial-gradient(ellipse, rgba(123,47,190,0.1), transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      {/* Main dashboard frame */}
      <BrowserFrame
        src="/analytic-1.png"
        alt="Dashboard central avec equity curve et statistiques"
        url="vayna.io/app/dashboard"
        glowColor="#7B2FBE"
        tiltX={2}
        tiltY={5}
      />

      {/* Floating winrate card */}
      <FloatingCard
        src="/analytic-3.png"
        alt="Statistiques"
        label="Performance"
        glowColor="#10b981"
        delay={0.5}
        floatDuration={5}
        containerStyle={{
          bottom: '-12px',
          left: '-14px',
          width: '180px',
        }}
      />

      {/* Floating P&L distribution card */}
      <FloatingCard
        src="/analytic-2.png"
        alt="Distribution"
        label="Distribution"
        glowColor="#7B2FBE"
        delay={0.7}
        floatDuration={6}
        containerStyle={{
          top: '8%',
          right: '-10px',
          width: '200px',
        }}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   SHOWCASE 3 — Analyse de performance
   ═══════════════════════════════════════════════════════════════════════ */
function ShowcaseAnalysis() {
  return (
    <div style={{ position: 'relative', padding: '24px 16px' }}>
      {/* Glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', height: '80%', background: 'radial-gradient(ellipse, rgba(0,245,255,0.08), transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      {/* Main stats dark page */}
      <BrowserFrame
        src="/feat-6.png"
        alt="Analyse de performance"
        url="vayna.io/app/statistics"
        glowColor="#00f5ff"
        tiltX={2}
        tiltY={-4}
      />

      {/* Floating perf par paire */}
      <FloatingCard
        src="/feat-5.png"
        alt="Performance détaillée"
        label="Performance"
        glowColor="#10b981"
        delay={0.5}
        floatDuration={5.5}
        containerStyle={{
          bottom: '-8px',
          right: '-10px',
          width: '200px',
        }}
      />

      {/* Small KPI chip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        viewport={{ once: true }}
        style={{
          position: 'absolute',
          top: '4px',
          left: '-6px',
          padding: '10px 18px',
          borderRadius: '12px',
          background: 'rgba(10,10,20,0.95)',
          border: '1px solid rgba(16,185,129,0.35)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 20px rgba(16,185,129,0.1)',
          backdropFilter: 'blur(16px)',
          zIndex: 20,
          animation: 'feat-float 4.5s ease-in-out infinite',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Activity size={14} style={{ color: '#10b981' }} />
        <div>
          <div style={{ fontSize: '10px', color: 'rgba(240,244,255,0.4)', fontWeight: '500' }}>Profit Factor</div>
          <div style={{ fontSize: '16px', fontWeight: '900', color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>2.47</div>
        </div>
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   SHOWCASE 4 — Multi-comptes
   ═══════════════════════════════════════════════════════════════════════ */
function ShowcaseMultiAccounts() {
  return (
    <div style={{ position: 'relative', padding: '24px 16px' }}>
      {/* Glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', height: '85%', background: 'radial-gradient(ellipse, rgba(123,47,190,0.08), transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      {/* Main comptes page */}
      <BrowserFrame
        src="/feat-7.png"
        alt="Gestion Multi-Comptes"
        url="vayna.io/app/accounts"
        glowColor="#7B2FBE"
        tiltX={2}
        tiltY={4}
      />

      {/* Account count badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        viewport={{ once: true }}
        style={{
          position: 'absolute',
          top: '2px',
          right: '-6px',
          padding: '10px 18px',
          borderRadius: '12px',
          background: 'rgba(10,10,20,0.95)',
          border: '1px solid rgba(123,47,190,0.4)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 20px rgba(123,47,190,0.12)',
          backdropFilter: 'blur(16px)',
          zIndex: 20,
          animation: 'feat-float-reverse 4s ease-in-out infinite',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Target size={14} style={{ color: '#a855f7' }} />
        <div>
          <div style={{ fontSize: '10px', color: 'rgba(240,244,255,0.4)', fontWeight: '500' }}>Comptes actifs</div>
          <div style={{ fontSize: '16px', fontWeight: '900', color: '#a855f7', fontVariantNumeric: 'tabular-nums' }}>3</div>
        </div>
      </motion.div>
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
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'rgba(15,15,28,0.98)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <Brain size={18} style={{ color: '#a855f7' }} />
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#f0f4ff' }}>Psychology Tracker</span>
          <span style={{
            marginLeft: 'auto',
            fontSize: '11px',
            padding: '4px 12px',
            borderRadius: '100px',
            background: 'rgba(123,47,190,0.15)',
            border: '1px solid rgba(123,47,190,0.3)',
            color: '#a855f7',
            fontWeight: '600',
          }}>
            Session du jour
          </span>
        </div>

        {/* Screenshot */}
        <div style={{ padding: '12px', position: 'relative' }}>
          <img
            src="/feat-8.png"
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
      {/* ── Injected keyframes ── */}
      <style>{`
        @keyframes feat-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes feat-float-reverse {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(10px); }
        }
        @keyframes feat-glow-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes feat-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes feat-spin {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }

        .feature-stack {
          display: flex;
          flex-direction: column;
          gap: 60px;
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 32px;
        }

        @media (max-width: 900px) {
          .feature-card {
            flex-direction: column !important;
          }
          .feature-card-text {
            padding: 32px !important;
          }
        }
      `}</style>

      <div className="feature-stack">
        {/* FEATURE 1 — Synchronisation */}
        <BentoCard
          icon={Zap}
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
