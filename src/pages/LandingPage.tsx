import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  motion,
  useMotionValue,
  useSpring,
} from 'framer-motion'
import {
  Zap, ArrowRight, ChevronDown, Activity,
  Star, Lock, CheckCircle, HelpCircle,
  LogIn, ChevronLeft, ChevronRight, MessageSquare, Download
} from 'lucide-react'
import { VaynaLogo } from '@/components/VaynaLogo'
import { useAuth } from '@/hooks/useAuth'
import { FeaturesStack } from '@/components/FeaturesStack'

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATION PRESETS
   ═══════════════════════════════════════════════════════════════════════ */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
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
function MagneticButton({ children, to, onClick }: { children: React.ReactNode; to?: string; onClick?: () => void }) {
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
    <motion.div ref={ref} style={{ x: sx, y: sy }} onMouseMove={move} onMouseLeave={leave} onClick={onClick} className="inline-flex cursor-pointer">
      {children}
    </motion.div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

/* ═══════════════════════════════════════════════════════════════════════
   PARTICLE CANVAS — original animated background
   ═══════════════════════════════════════════════════════════════════════ */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let width = canvas.width = window.innerWidth
    let height = canvas.height = window.innerHeight
    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string }> = []
    const colors = ['#00f5ff', '#7B2FBE', '#00f5ff80', '#7B2FBE80']
    for (let i = 0; i < 60; i++) {
      particles.push({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, size: Math.random() * 2 + 0.5, opacity: Math.random() * 0.6 + 0.2, color: colors[Math.floor(Math.random() * colors.length)] })
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
          if (dist < 100) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0,245,255,${0.08 * (1 - dist / 100)})`; ctx.lineWidth = 0.5; ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(animate)
    }
    animate()
    const handleResize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight }
    window.addEventListener('resize', handleResize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', handleResize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
}

/* ═══════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════ */
const stats = [
  { value: '∞', label: 'Trades trackés' },
  { value: '100%', label: 'Données privées' },
  { value: '0€', label: 'Frais cachés' },
  { value: '24/7', label: 'Disponibilité' },
]

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export function LandingPage() {
  const [activeIndex, setActiveIndex] = useState(1)
  const [carouselHovered, setCarouselHovered] = useState(false)
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && !loading) {
      if (localStorage.getItem('isGoogleLogin') === 'true') {
        navigate('/login', { replace: true })
      } else {
        localStorage.removeItem('justSignedUpGoogle')
        localStorage.removeItem('loginWithGoogle')
        navigate('/intro', { replace: true })
      }
    }
  }, [user, loading, navigate])

  const showcaseImages = [
    { id: 'stats', src: './showcase-1.png', alt: 'Statistiques' },
    { id: 'dashboard', src: './showcase-2.png', alt: 'Dashboard' },
    { id: 'journal', src: './showcase-3.png', alt: 'Journal' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top, #0f172a 0%, #020617 100%)', color: '#f0f4ff', fontFamily: "'Inter', system-ui, sans-serif", overflowX: 'hidden' }}>
      <ParticleCanvas />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#0a0a0f]/85 backdrop-blur-xl border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <VaynaLogo size={28} showText />
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">

            <Link to="/contact" className="hidden sm:flex px-3 py-2 bg-transparent border border-cyan-500/20 rounded-lg text-white/70 no-underline text-xs sm:text-sm font-medium items-center gap-2 transition-all hover:bg-cyan-500/10">
              <MessageSquare size={16} /><span>Support</span>
            </Link>
            <Link to="/faq" className="hidden sm:flex px-3 py-2 bg-transparent border border-cyan-500/20 rounded-lg text-white/70 no-underline text-xs sm:text-sm font-medium items-center gap-2 transition-all hover:bg-cyan-500/10">
              <HelpCircle size={16} /><span>FAQ</span>
            </Link>
            <Link to="/login" className="px-3 py-2 bg-transparent border border-cyan-500/20 rounded-lg text-white/70 no-underline text-xs sm:text-sm font-medium transition-all hover:bg-cyan-500/10">Se connecter</Link>
            <MagneticButton to="/register">
              <div className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-[#0a0a0f] text-xs sm:text-sm font-bold flex items-center gap-2 shadow-[0_4px_16px_rgba(0,245,255,0.3)]" style={{ background: 'linear-gradient(135deg, #00f5ff, #007bff)' }}>
                Commencer <span className="hidden sm:inline">gratuitement</span> <ArrowRight size={14} />
              </div>
            </MagneticButton>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="min-h-screen px-4 sm:px-8 pt-32 pb-16 lg:py-20 flex flex-col lg:flex-row items-center max-w-7xl mx-auto gap-12 lg:gap-16">
        {/* LEFT — Text */}
        <motion.div initial="hidden" animate="visible" variants={stagger} className="flex-1 flex flex-col gap-6 lg:gap-8 w-full text-center lg:text-left items-center lg:items-start">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs sm:text-sm font-semibold tracking-wide">
            <Activity size={12} /><span>Journal de Trading Professionnel</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight text-white m-0">
            Dominez vos trades.<br />
            <span style={{ background: 'linear-gradient(135deg, #00f5ff, #7B2FBE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Automatisez votre tracking.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-base sm:text-lg leading-relaxed text-white/55 max-w-xl mx-auto lg:mx-0 m-0">
            Import automatique depuis MT4/MT5. Tracking avancé, analytics, et journal psychologique — prenez le contrôle avec des données ultra-précises.
          </motion.p>

          <motion.div variants={fadeUp} className="flex items-center justify-center lg:justify-start gap-4 flex-wrap w-full">
            <MagneticButton to="/register">
              <div className="px-5 py-3 sm:px-7 sm:py-4 rounded-xl text-[#0a0a0f] text-sm sm:text-base font-bold inline-flex items-center gap-2 sm:gap-3 cursor-pointer" style={{ background: 'linear-gradient(135deg, #00f5ff, #007bff)', boxShadow: '0 6px 24px rgba(0,245,255,0.35)' }}>
                <Zap size={20} /> Créer un compte gratuit
              </div>
            </MagneticButton>
            <MagneticButton to="/login">
              <div className="px-5 py-3 sm:px-7 sm:py-4 bg-transparent border border-cyan-500/25 rounded-xl text-white/75 text-sm sm:text-base font-semibold inline-flex items-center gap-2 sm:gap-3">
                <LogIn size={20} /> Se connecter
              </div>
            </MagneticButton>
            <a href="https://github.com/vaynasupport-cmd/VAYNA/releases/download/v1.0.0/Vayna.Setup.1.0.0.exe" className="no-underline w-full sm:w-auto" download>
              <div 
                className="px-5 py-3 sm:px-7 sm:py-4 bg-white/5 border border-white/10 rounded-xl text-white/90 text-sm sm:text-base font-semibold flex justify-center items-center gap-2 sm:gap-3 transition-all cursor-pointer hover:bg-white/10 hover:border-cyan-500/30"
              >
                <Download size={20} color="#00f5ff" /> Télécharger pour Windows
              </div>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} className="flex gap-6 sm:gap-8 flex-wrap justify-center lg:justify-start w-full mt-4">
            {stats.map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="flex flex-col gap-1 items-center lg:items-start">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ background: 'linear-gradient(135deg, #00f5ff, #7B2FBE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</span>
                <span className="text-xs sm:text-sm text-white/40 font-medium">{s.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll cue */}
          <motion.div variants={fadeUp} style={{ color: 'rgba(0,245,255,0.4)' }}>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
              <ChevronDown size={20} />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* RIGHT — VAYNA Logo + Chart */}
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          className="flex-1 w-full max-w-md mx-auto lg:max-w-[440px] flex flex-col items-center gap-8 lg:gap-10">

          {/* Big VΛYNΛ Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 'clamp(40px, 6vw, 70px)', fontWeight: '900', letterSpacing: '0.22em', background: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 40%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: "'Inter', sans-serif", filter: 'drop-shadow(0 0 16px rgba(59,130,246,0.5))' }}>
              V<span style={{ fontFamily: 'Georgia, serif' }}>Λ</span>YN<span style={{ fontFamily: 'Georgia, serif' }}>Λ</span>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
              <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to right, transparent, #06b6d4)' }} />
              <span style={{ textTransform: 'uppercase', fontWeight: '300', whiteSpace: 'nowrap', color: 'rgba(207,250,254,0.5)', fontSize: 'clamp(10px, 1.5vw, 14px)', letterSpacing: '0.3em' }}>Journal de Trading</span>
              <div style={{ height: '1px', width: '64px', background: 'linear-gradient(to right, rgba(71,85,105,0.6), transparent)' }} />
            </div>
          </div>

          {/* Equity Curve Chart Card */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,245,255,0.15)', borderRadius: '20px', padding: '24px', boxShadow: '0 0 60px rgba(0,245,255,0.08), 0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(240,244,255,0.6)' }}>Equity Curve</span>
              <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', background: 'rgba(0,245,255,0.12)', color: '#00f5ff', border: '1px solid rgba(0,245,255,0.25)' }}>+18.4%</span>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <svg viewBox="0 0 300 120" style={{ width: '100%', height: 'auto' }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#00f5ff" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00f5ff" />
                    <stop offset="100%" stopColor="#7B2FBE" />
                  </linearGradient>
                </defs>
                {[30, 60, 90].map(yy => (<line key={yy} x1="0" y1={yy} x2="300" y2={yy} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />))}
                <motion.path d="M0,90 L30,80 L60,85 L90,65 L120,55 L150,60 L180,40 L210,30 L240,20 L270,15 L300,8 L300,120 L0,120 Z" fill="url(#chartGrad)"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: 1.2 }} />
                <motion.path d="M0,90 L30,80 L60,85 L90,65 L120,55 L150,60 L180,40 L210,30 L240,20 L270,15 L300,8" fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2, delay: 1, ease: 'easeOut' }} />
                {[[30, 80], [90, 65], [150, 60], [210, 30], [270, 15]].map(([cx, cy], i) => (
                  <motion.circle key={i} cx={cx} cy={cy} r="3" fill="#00f5ff" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.5 + i * 0.15, type: 'spring', stiffness: 300 }} />
                ))}
                <motion.circle cx="300" cy="8" r="6" fill="none" stroke="#00f5ff" strokeWidth="1"
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }} transition={{ delay: 2.5, duration: 2, repeat: Infinity }} />
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {[{ l: 'Win Rate', v: '68.4%' }, { l: 'Profit Factor', v: '2.31' }, { l: 'Expectancy', v: '+$124' }].map((m, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(240,244,255,0.35)', fontWeight: '500' }}>{m.l}</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#00f5ff' }}>{m.v}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── SHOWCASE CAROUSEL ── */}
      <motion.section
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
        viewport={{ once: true, margin: '-80px' }}
        style={{ padding: '0 24px', position: 'relative', zIndex: 10, marginTop: '-50px' }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
          {/* Glow behind */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '70%', height: '70%', transform: 'translate(-50%,-50%)', background: carouselHovered ? 'radial-gradient(circle, rgba(0,245,255,0.22), rgba(123,47,190,0.22))' : 'radial-gradient(circle, rgba(0,245,255,0.15), rgba(123,47,190,0.15))', filter: 'blur(140px)', zIndex: 0, borderRadius: '50%', pointerEvents: 'none', transition: 'background 0.6s ease' }} />
          <div
            style={{ position: 'relative', width: '100%', height: 'clamp(180px, 40vw, 520px)', display: 'flex', justifyContent: 'center', alignItems: 'center', perspective: '2000px', cursor: 'default' }}
            onMouseEnter={() => setCarouselHovered(true)}
            onMouseLeave={() => setCarouselHovered(false)}
          >
            {showcaseImages.map((img, i) => {
              const isActive = i === activeIndex
              const isLeft = i === (activeIndex - 1 + 3) % 3

              // Dynamic transforms based on hover state
              let tx: string, sc: string, ry: string, op: number, bl: string
              if (isActive) {
                tx = '0'; sc = carouselHovered ? '1.06' : '1'; ry = '0deg'; op = 1; bl = '0px'
              } else if (isLeft) {
                tx = carouselHovered ? '-58%' : '-48%'
                sc = carouselHovered ? '0.78' : '0.82'
                ry = carouselHovered ? '22deg' : '18deg'
                op = carouselHovered ? 0.6 : 0.45
                bl = carouselHovered ? '2px' : '3px'
              } else {
                tx = carouselHovered ? '58%' : '48%'
                sc = carouselHovered ? '0.78' : '0.82'
                ry = carouselHovered ? '-22deg' : '-18deg'
                op = carouselHovered ? 0.6 : 0.45
                bl = carouselHovered ? '2px' : '3px'
              }

              return (
                <div
                  key={img.id}
                  onClick={() => !isActive && setActiveIndex(i)}
                  style={{
                    position: 'absolute',
                    borderRadius: '16px',
                    border: isActive
                      ? `1px solid rgba(0,245,255,${carouselHovered ? '0.4' : '0.3'})`
                      : '1px solid rgba(0,245,255,0.12)',
                    background: '#0a0a0f',
                    cursor: isActive ? 'default' : 'pointer',
                    width: isActive ? '65%' : '50%',
                    opacity: op,
                    zIndex: isActive ? 3 : 1,
                    filter: isActive ? 'none' : `blur(${bl})`,
                    transform: `translateX(${tx}) scale(${sc}) rotateY(${ry}) translateZ(0)`,
                    transition: 'all 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    boxShadow: isActive
                      ? carouselHovered
                        ? '0 0 140px rgba(0,245,255,0.2), 0 35px 70px rgba(0,0,0,0.6)'
                        : '0 0 100px rgba(0,245,255,0.12), 0 30px 60px rgba(0,0,0,0.6)'
                      : '0 20px 40px rgba(0,0,0,0.4)',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    draggable={false}
                    style={{ width: '100%', height: 'auto', display: 'block', transition: 'transform 0.5s ease' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500'%3E%3Crect fill='%231a1a24' width='100%25' height='100%25'/%3E%3Ctext x='50%25' y='50%25' font-family='arial' font-size='20' fill='%2300f5ff' text-anchor='middle'%3E${img.alt}%3C/text%3E%3C/svg%3E` }}
                  />
                </div>
              )
            })}
          </div>
          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
            <button onClick={() => setActiveIndex((activeIndex - 1 + 3) % 3)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(0,245,255,0.2)', background: 'rgba(0,245,255,0.05)', color: '#00f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronLeft size={18} /></button>
            {showcaseImages.map((_, i) => (
              <button key={i} onClick={() => setActiveIndex(i)} style={{ width: i === activeIndex ? '20px' : '8px', height: '8px', borderRadius: '100px', background: i === activeIndex ? '#00f5ff' : 'rgba(0,245,255,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', boxShadow: i === activeIndex ? '0 0 10px rgba(0,245,255,0.5)' : 'none' }} />
            ))}
            <button onClick={() => setActiveIndex((activeIndex + 1) % 3)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(0,245,255,0.2)', background: 'rgba(0,245,255,0.05)', color: '#00f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronRight size={18} /></button>
          </div>
        </div>
      </motion.section>

      {/* ── CENTRALIZED FEATURES SECTION ── */}
      <section style={{ padding: '80px 0 100px', position: 'relative' }}>
        {/* Background ambient glow for the stack */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '80%', height: '80%', background: 'radial-gradient(ellipse, rgba(0,245,255,0.03), transparent 70%)', filter: 'blur(120px)', pointerEvents: 'none' }} />
        
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '6px 14px', background: 'rgba(123,47,190,0.12)', border: '1px solid rgba(123,47,190,0.3)', borderRadius: '100px', color: '#a855f7', fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '24px' }}>
            <Star size={12} /><span>Fonctionnalités</span>
          </div>
          <h2 style={{ fontSize: 'clamp(30px, 4.5vw, 48px)', fontWeight: '800', letterSpacing: '-0.03em', margin: '0 0 16px', color: '#f0f4ff' }}>
            Tout ce dont un trader sérieux <br />
            <span style={{ background: 'linear-gradient(135deg, #00f5ff, #7B2FBE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>a besoin.</span>
          </h2>
          <p style={{ fontSize: '17px', color: 'rgba(240,244,255,0.45)', maxWidth: '560px', lineHeight: 1.7, margin: '0 auto' }}>
            De l'analyse technique à la psychologie de trading, VAYNA couvre chaque aspect de votre performance.
          </p>
        </div>

        <FeaturesStack />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
           CTA FOOTER — Dramatic glow, VAYNA branding, big CTA
           ═══════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true, margin: '-100px' }}
        style={{ padding: '80px 0 80px', position: 'relative', overflow: 'hidden' }}
      >
        {/* Large background mesh glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '80vw', height: '60vh', transform: 'translate(-50%,-50%)', background: 'radial-gradient(ellipse, rgba(0,245,255,0.08) 0%, rgba(123,47,190,0.04) 40%, transparent 70%)', pointerEvents: 'none', filter: 'blur(40px)' }} />

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}
          style={{ maxWidth: '800px', margin: '0 auto', padding: '0 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '24px', position: 'relative', zIndex: 1 }}>

          {/* VAYNA Logo */}
          <motion.div variants={fadeUp} style={{ marginBottom: '12px', opacity: 0.25 }}>
            <VaynaLogo size={64} />
          </motion.div>

          <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: '900', letterSpacing: '-0.03em', margin: 0, maxWidth: '700px', lineHeight: 1.1 }}>
            <span style={{ color: '#f0f4ff' }}>Prêt à tracker</span><br />
            <span style={{ background: 'linear-gradient(135deg, #00f5ff, #7B2FBE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>votre performance ?</span>
          </motion.h2>
          <motion.p variants={fadeUp} style={{ fontSize: '17px', color: 'rgba(240,244,255,0.45)', maxWidth: '480px', margin: 0, lineHeight: 1.7 }}>
            Rejoignez les traders qui ont décidé de se prendre en main. Gratuit pour toujours. Aucune carte de crédit requise.
          </motion.p>
          <motion.div variants={fadeUp} style={{ marginTop: '16px' }}>
            <MagneticButton to="/register">
              <div style={{ padding: '18px 36px', background: 'linear-gradient(135deg, #00f5ff, #007bff)', borderRadius: '14px', color: '#0a0a0f', fontSize: '16px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '12px', boxShadow: '0 8px 32px rgba(0,245,255,0.4), 0 0 60px rgba(0,245,255,0.15)', cursor: 'pointer', transition: 'all 0.3s' }}>
                <Zap size={22} /> Commencer maintenant — c'est gratuit
              </div>
            </MagneticButton>
          </motion.div>

          {/* Small trust badges */}
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
           FOOTER — Richer with logo + links
           ═══════════════════════════════════════════════════════════════ */}
      <footer style={{ padding: '32px 32px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <VaynaLogo size={24} />
            <p style={{ fontSize: '13px', color: 'rgba(240,244,255,0.25)', margin: 0 }}>© {new Date().getFullYear()} VAYNA — Tous droits réservés</p>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link to="/faq" style={{ color: 'rgba(240,244,255,0.35)', textDecoration: 'none', fontSize: '13px', fontWeight: '500', transition: 'color 0.2s' }}>FAQ</Link>
            <Link to="/login" style={{ color: 'rgba(240,244,255,0.35)', textDecoration: 'none', fontSize: '13px', fontWeight: '500', transition: 'color 0.2s' }}>Connexion</Link>
            <Link to="/register" style={{ color: 'rgba(240,244,255,0.35)', textDecoration: 'none', fontSize: '13px', fontWeight: '500', transition: 'color 0.2s' }}>Inscription</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
