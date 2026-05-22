import { useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useMotionValue,
  useSpring,
} from 'framer-motion'
import {
  Zap, Star, HelpCircle,
  Lock, CheckCircle, ArrowRight,
} from 'lucide-react'
import { VaynaLogo } from '@/components/VaynaLogo'
import { FeaturesStack } from '@/components/FeaturesStack'

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATION PRESETS
   ═══════════════════════════════════════════════════════════════════════ */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] },
  },
}

/* ═══════════════════════════════════════════════════════════════════════
   MAGNETIC BUTTON
   ═══════════════════════════════════════════════════════════════════════ */
function MagneticButton({ children, to }: { children: React.ReactNode; to?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 20 })
  const sy = useSpring(y, { stiffness: 200, damping: 20 })
  const move = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25)
    y.set((e.clientY - (r.top + r.height / 2)) * 0.25)
  }, [x, y])
  const leave = useCallback(() => { x.set(0); y.set(0) }, [x, y])
  const inner = (
    <motion.div ref={ref} style={{ x: sx, y: sy }} onMouseMove={move} onMouseLeave={leave} className="inline-flex cursor-pointer">
      {children}
    </motion.div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

/* ═══════════════════════════════════════════════════════════════════════
   PARTICLE CANVAS (lightweight version)
   ═══════════════════════════════════════════════════════════════════════ */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let width = canvas.width = window.innerWidth
    let height = canvas.height = window.innerHeight * 3
    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string }> = []
    const colors = ['#00f5ff', '#7B2FBE', '#00f5ff80', '#7B2FBE80']
    for (let i = 0; i < 40; i++) {
      particles.push({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, size: Math.random() * 1.5 + 0.5, opacity: Math.random() * 0.4 + 0.1, color: colors[Math.floor(Math.random() * colors.length)] })
    }
    let animId: number
    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = width; if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height; if (p.y > height) p.y = 0
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color; ctx.globalAlpha = p.opacity; ctx.fill()
      }
      ctx.globalAlpha = 1
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0,245,255,${0.06 * (1 - dist / 120)})`; ctx.lineWidth = 0.5; ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(animate)
    }
    animate()
    const handleResize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight * 3 }
    window.addEventListener('resize', handleResize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', handleResize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export function FeaturesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f0f4ff', fontFamily: "'Inter', system-ui, sans-serif", overflowX: 'hidden' }}>
      <ParticleCanvas />

      {/* ═══════════════════════════════════════════════════════════════
           NAV
           ═══════════════════════════════════════════════════════════════ */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <VaynaLogo size={32} showText />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/features" style={{ padding: '8px 16px', background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.25)', borderRadius: '8px', color: '#00f5ff', textDecoration: 'none', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
              <Star size={16} /><span>Fonctionnalités</span>
            </Link>
            <Link to="/faq" style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(0,245,255,0.2)', borderRadius: '8px', color: 'rgba(240,244,255,0.7)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
              <HelpCircle size={16} /><span>FAQ</span>
            </Link>
            <Link to="/login" style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(0,245,255,0.2)', borderRadius: '8px', color: 'rgba(240,244,255,0.7)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s' }}>Se connecter</Link>
            <MagneticButton to="/register">
              <div style={{ padding: '9px 18px', background: 'linear-gradient(135deg, #00f5ff, #007bff)', borderRadius: '8px', color: '#0a0a0f', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 16px rgba(0,245,255,0.3)' }}>
                Commencer gratuitement <ArrowRight size={14} />
              </div>
            </MagneticButton>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
           HERO
           ═══════════════════════════════════════════════════════════════ */}
      <section style={{ paddingTop: '160px', paddingBottom: '80px', position: 'relative', zIndex: 5 }}>
        {/* Hero background glow */}
        <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '70vw', height: '60vh', background: 'radial-gradient(ellipse, rgba(0,245,255,0.07), rgba(123,47,190,0.04), transparent)', filter: 'blur(70px)', pointerEvents: 'none', borderRadius: '50%' }} />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          style={{ maxWidth: '960px', margin: '0 auto', padding: '0 32px', textAlign: 'center', position: 'relative', zIndex: 1 }}
        >
          <motion.div variants={fadeUp} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            background: 'rgba(123,47,190,0.12)',
            border: '1px solid rgba(123,47,190,0.35)',
            borderRadius: '100px',
            color: '#a855f7',
            fontSize: '12px',
            fontWeight: '700',
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            marginBottom: '32px',
          }}>
            <Star size={14} /><span>Fonctionnalités</span>
          </motion.div>

          <motion.h1 variants={fadeUp} style={{
            fontSize: 'clamp(38px, 5.5vw, 64px)',
            fontWeight: '900',
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            margin: '0 0 24px',
          }}>
            Analyse ton trading.<br />
            <span style={{
              background: 'linear-gradient(135deg, #00f5ff, #7B2FBE)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Prends de meilleures décisions.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} style={{
            fontSize: '18px',
            color: 'rgba(240,244,255,0.50)',
            maxWidth: '620px',
            margin: '0 auto 40px',
            lineHeight: 1.8,
          }}>
            Import automatique, analytics avancées, gestion multi-comptes et journal de psychologie — tout ce dont un trader sérieux a besoin pour progresser.
          </motion.p>

          <motion.div variants={fadeUp} style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <MagneticButton to="/register">
              <div style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #00f5ff, #007bff)',
                borderRadius: '14px',
                color: '#0a0a0f',
                fontSize: '16px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 6px 28px rgba(0,245,255,0.35)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Shimmer effect */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  animation: 'feat-shimmer 3s ease-in-out infinite',
                }} />
                <Zap size={20} style={{ position: 'relative', zIndex: 1 }} />
                <span style={{ position: 'relative', zIndex: 1 }}>Commencer gratuitement</span>
              </div>
            </MagneticButton>
          </motion.div>
        </motion.div>


      </section>

      {/* Gradient separator */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 32px' }}>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.2), rgba(123,47,190,0.2), transparent)' }} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
           HORIZONTAL CARDS STACK
           ═══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 0 100px', position: 'relative' }}>
        {/* Background ambient glow for the stack */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '80%', height: '80%', background: 'radial-gradient(ellipse, rgba(0,245,255,0.03), transparent 70%)', filter: 'blur(120px)', pointerEvents: 'none' }} />

        <FeaturesStack />
      </section>�═
           HORIZONTAL CARDS STACK
           ═══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 0 100px', position: 'relative' }}>
        {/* Background ambient glow for the stack */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '80%', height: '80%', background: 'radial-gradient(ellipse, rgba(0,245,255,0.03), transparent 70%)', filter: 'blur(120px)', pointerEvents: 'none' }} />

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
              'Gérez autant de comptes que nécessaire',
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
      </section>

      {/* ═══════════════════════════════════════════════════════════════
           COMPARISON GRID — Why VAYNA
           ═══════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: '-100px' }}
        style={{
          padding: '100px 0',
          position: 'relative',
          borderTop: '1px solid rgba(0,245,255,0.06)',
          background: 'linear-gradient(180deg, rgba(0,245,255,0.02) 0%, rgba(123,47,190,0.02) 100%)',
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          style={{ maxWidth: '900px', margin: '0 auto', padding: '0 32px' }}
        >
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '6px 14px',
              background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)',
              borderRadius: '100px', color: '#00f5ff', fontSize: '11px', fontWeight: '600',
              letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: '24px',
            }}>
              <Lock size={12} /><span>Pourquoi VAYNA</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '800', letterSpacing: '-0.03em', margin: '0 0 16px', color: '#f0f4ff' }}>
              Tout inclus, <span style={{ background: 'linear-gradient(135deg, #00f5ff, #7B2FBE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>zéro compromis.</span>
            </h2>
          </motion.div>

          {/* Feature comparison grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { icon: '🔒', title: '100% Sécurisé', desc: 'Données chiffrées, stockage isolé. Vos trades restent privés.' },
              { icon: '⚡', title: 'Setup en 30s', desc: 'Inscription gratuite, compte MT5 connecté, premier trade tracké.' },
              { icon: '💰', title: 'Gratuit pour toujours', desc: 'Pas de freemium, pas d\'abonnement, pas de frais cachés.' },
              { icon: '📱', title: 'Desktop \u0026 Web', desc: 'App Electron ou navigateur — vos données vous suivent.' },
              { icon: '🎯', title: 'Conçu par des traders', desc: 'Chaque feature reflète un vrai workflow de trading pro.' },
              { icon: '🔄', title: 'Sync temps réel', desc: 'Les trades arrivent instantanément, pas de délai.' },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                style={{
                  padding: '28px 24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.4s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,245,255,0.15)'
                  ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(0,245,255,0.03)'
                  ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)'
                  ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'
                  ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '14px' }}>{item.icon}</div>
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#f0f4ff', margin: '0 0 8px' }}>{item.title}</h4>
                <p style={{ fontSize: '13px', color: 'rgba(240,244,255,0.45)', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════
           CTA FOOTER
           ═══════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: '-100px' }}
        style={{
          padding: '100px 0',
          position: 'relative',
          overflow: 'hidden',
          borderTop: '1px solid rgba(0,245,255,0.06)',
        }}
      >
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '80vw', height: '60vh', transform: 'translate(-50%,-50%)', background: 'radial-gradient(ellipse, rgba(0,245,255,0.08) 0%, rgba(123,47,190,0.04) 40%, transparent 70%)', pointerEvents: 'none', filter: 'blur(40px)' }} />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          style={{ maxWidth: '800px', margin: '0 auto', padding: '0 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '24px', position: 'relative', zIndex: 1 }}
        >
          <motion.div variants={fadeUp} style={{ marginBottom: '12px', opacity: 0.25 }}>
            <VaynaLogo size={64} />
          </motion.div>

          <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: '900', letterSpacing: '-0.03em', margin: 0, maxWidth: '700px', lineHeight: 1.1 }}>
            <span style={{ color: '#f0f4ff' }}>Convaincu ?</span><br />
            <span style={{ background: 'linear-gradient(135deg, #00f5ff, #7B2FBE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Commencez maintenant.</span>
          </motion.h2>
          <motion.p variants={fadeUp} style={{ fontSize: '17px', color: 'rgba(240,244,255,0.45)', maxWidth: '520px', margin: 0, lineHeight: 1.7 }}>
            Gratuit. Sans carte de crédit. En 30 secondes, votre premier trade est tracké.
          </motion.p>
          <motion.div variants={fadeUp} style={{ marginTop: '16px' }}>
            <MagneticButton to="/register">
              <div style={{
                padding: '18px 36px',
                background: 'linear-gradient(135deg, #00f5ff, #007bff)',
                borderRadius: '14px',
                color: '#0a0a0f',
                fontSize: '16px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 8px 32px rgba(0,245,255,0.4), 0 0 60px rgba(0,245,255,0.15)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  animation: 'feat-shimmer 3s ease-in-out infinite',
                }} />
                <Zap size={22} style={{ position: 'relative', zIndex: 1 }} />
                <span style={{ position: 'relative', zIndex: 1 }}>Créer un compte gratuit</span>
              </div>
            </MagneticButton>
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: '24px', marginTop: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { icon: Lock, text: 'Chiffré & Sécurisé' },
              { icon: Zap, text: 'Setup en 30 sec' },
              { icon: CheckCircle, text: '100% Gratuit' },
            ].map((badge) => (
              <div key={badge.text} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(240,244,255,0.3)', fontSize: '12px', fontWeight: '500' }}>
                <badge.icon size={14} style={{ color: 'rgba(0,245,255,0.4)' }} />
                <span>{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════
           FOOTER
           ═══════════════════════════════════════════════════════════════ */}
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
            <Link to="/register" style={{ color: 'rgba(240,244,255,0.35)', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>Inscription</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
