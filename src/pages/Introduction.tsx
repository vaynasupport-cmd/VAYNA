import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, TrendingUp, BarChart3, DollarSign, Activity, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/hooks/useStore';
import { useAuth } from '@/hooks/useAuth';
import { VaynaLogo } from '@/components/VaynaLogo';

/* ═══════════════════════════════════════════════
   ANIMATED COUNTER — count from 0 to target
   ═══════════════════════════════════════════════ */
const AnimatedCounter = ({
  target,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
}: {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) => {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    };
    const timer = setTimeout(() => {
      rafId.current = requestAnimationFrame(animate);
    }, 600);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId.current);
    };
  }, [target, duration]);

  return (
    <span>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
};

/* ═══════════════════════════════════════════════
   FLOATING PARTICLES — subtle ambient dots
   ═══════════════════════════════════════════════ */
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 15 + 20,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.3 + 0.1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-400"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -200, 0],
            x: [0, Math.random() * 60 - 30, 0],
            opacity: [0, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   FLOATING 3D CURVE — subtle ambient animated wave
   ═══════════════════════════════════════════════ */
const Floating3DCurve = () => {
  return (
    <motion.div 
      className="absolute top-[-280px] left-[-20%] w-[140%] h-[350px] pointer-events-none mix-blend-screen z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.65 }}
      transition={{ duration: 2, delay: 1 }}
    >
      <svg viewBox="0 0 1000 350" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ribbonG1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0" />
            <stop offset="25%" stopColor="#22d3ee" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#3b82f6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ribbonG2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
            <stop offset="30%" stopColor="#818cf8" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#22d3ee" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ribbonG3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
          </linearGradient>
          <filter id="glowRibbon" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* First set of main curves */}
        {[...Array(8)].map((_, i) => {
          const delay = i * -2.5;
          const duration = 20 + i * 1.5;
          const yBase = 200;
          const yAmp1 = 130 - i * 9;
          const yAmp2 = 90 + i * 5;
          
          return (
            <motion.path
              key={`set1-${i}`}
              initial={{ d: `M 0 ${yBase} C 300 ${yBase - yAmp1}, 700 ${yBase + yAmp2}, 1000 ${yBase}` }}
              fill="none"
              stroke={i % 2 === 0 ? "url(#ribbonG1)" : "url(#ribbonG2)"}
              strokeWidth={1.8 + (i * 0.2)}
              opacity={0.25 + (i * 0.08)}
              filter="url(#glowRibbon)"
              animate={{
                d: [
                  `M 0 ${yBase} C 300 ${yBase - yAmp1}, 700 ${yBase + yAmp2}, 1000 ${yBase}`,
                  `M 0 ${yBase} C 400 ${yBase + yAmp2}, 600 ${yBase - yAmp1}, 1000 ${yBase}`,
                  `M 0 ${yBase} C 300 ${yBase - yAmp1}, 700 ${yBase + yAmp2}, 1000 ${yBase}`
                ]
              }}
              transition={{
                duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay
              }}
            />
          );
        })}

        {/* Second set of intersection curves */}
        {[...Array(6)].map((_, i) => {
          const delay = i * -3;
          const duration = 23 + i * 2;
          const yBase = 200;
          const yAmp1 = 110 + i * 12;
          const yAmp2 = 70 - i * 6;
          
          return (
            <motion.path
              key={`set2-${i}`}
              initial={{ d: `M 0 ${yBase + 20} C 400 ${yBase + yAmp1}, 600 ${yBase - yAmp2}, 1000 ${yBase - 20}` }}
              fill="none"
              stroke="url(#ribbonG3)"
              strokeWidth={1.5 + (i * 0.25)}
              opacity={0.2 + (i * 0.08)}
              filter="url(#glowRibbon)"
              animate={{
                d: [
                  `M 0 ${yBase + 20} C 400 ${yBase + yAmp1}, 600 ${yBase - yAmp2}, 1000 ${yBase - 20}`,
                  `M 0 ${yBase + 20} C 300 ${yBase - yAmp2}, 700 ${yBase + yAmp1}, 1000 ${yBase - 20}`,
                  `M 0 ${yBase + 20} C 400 ${yBase + yAmp1}, 600 ${yBase - yAmp2}, 1000 ${yBase - 20}`
                ]
              }}
              transition={{
                duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay
              }}
            />
          );
        })}
      </svg>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════
   ANIMATED SCAN LINE on chart
   ═══════════════════════════════════════════════ */
const ScanLine = () => (
  <motion.div
    className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 3 }}
  >
    <motion.div
      className="absolute top-0 left-0 right-0 h-px"
      style={{
        background:
          'linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.4) 50%, transparent 100%)',
      }}
      animate={{ top: ['0%', '100%', '0%'] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    />
  </motion.div>
);

/* ═══════════════════════════════════════════════
   MINI PRICE CHART — SVG animated line
   ═══════════════════════════════════════════════ */
const MiniPriceChart = ({ points }: { points: number[] }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  const width = 500;
  const height = 180;
  const padding = 10;

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [points]);

  if (!points || points.length < 2) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm opacity-50">
        Pas assez de données pour le graphique
      </div>
    );
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const rangeY = max - min || 1;

  const pathData = points
    .map((p, i) => {
      const x = padding + (i / (points.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((p - min) / rangeY) * (height - 2 * padding);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const lastX = padding + ((points.length - 1) / (points.length - 1)) * (width - 2 * padding);
  const areaData = `${pathData} L ${lastX.toFixed(1)} ${height} L ${padding} ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        {/* Glow filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Horizontal grid lines */}
      {[0.25, 0.5, 0.75].map((ratio) => (
        <line
          key={ratio}
          x1={padding}
          y1={padding + ratio * (height - 2 * padding)}
          x2={width - padding}
          y2={padding + ratio * (height - 2 * padding)}
          stroke="rgba(148,163,184,0.08)"
          strokeWidth="1"
        />
      ))}

      {/* Area fill */}
      <motion.path
        d={areaData}
        fill="url(#chartGradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1.2 }}
      />

      {/* Glow line behind main line */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="#22d3ee"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.15"
        filter="url(#glow)"
        initial={{ strokeDasharray: pathLength, strokeDashoffset: pathLength }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 2.5, delay: 0.5, ease: 'easeInOut' }}
      />

      {/* Main line */}
      <motion.path
        ref={pathRef}
        d={pathData}
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ strokeDasharray: pathLength, strokeDashoffset: pathLength }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 2.5, delay: 0.5, ease: 'easeInOut' }}
      />

      {/* Glowing dot at the end */}
      <motion.circle
        cx={lastX}
        cy={
          height -
          padding -
          ((points[points.length - 1] - min) / rangeY) * (height - 2 * padding)
        }
        r="5"
        fill="#22d3ee"
        filter="url(#glow)"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0.7, 1], scale: 1 }}
        transition={{ duration: 0.5, delay: 2.8 }}
      >
        <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
      </motion.circle>

      {/* Pulse rings at the end */}
      <motion.circle
        cx={lastX}
        cy={
          height -
          padding -
          ((points[points.length - 1] - min) / rangeY) * (height - 2 * padding)
        }
        r="12"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="1"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, delay: 3 }}
      >
        <animate attributeName="r" values="8;20;8" dur="3s" repeatCount="indefinite" />
      </motion.circle>
    </svg>
  );
};

/* ═══════════════════════════════════════════════
   STAT CARD — with animated border
   ═══════════════════════════════════════════════ */
const StatCard = ({
  icon: Icon,
  label,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  color,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  color: string;
  delay?: number;
}) => {
  const colorMap: Record<string, { border: string; bg: string; text: string; icon: string; glow: string }> = {
    cyan: {
      border: 'border-cyan-500/20',
      bg: 'bg-cyan-500/5',
      text: 'text-cyan-400',
      icon: 'text-cyan-500',
      glow: 'rgba(34,211,238,0.08)',
    },
    green: {
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-500/5',
      text: 'text-emerald-400',
      icon: 'text-emerald-500',
      glow: 'rgba(16,185,129,0.08)',
    },
    blue: {
      border: 'border-blue-500/20',
      bg: 'bg-blue-500/5',
      text: 'text-blue-400',
      icon: 'text-blue-500',
      glow: 'rgba(59,130,246,0.08)',
    },
  };

  const c = colorMap[color] || colorMap.cyan;

  return (
    <motion.div
      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border ${c.border} ${c.bg} backdrop-blur-sm overflow-hidden group cursor-default`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, type: 'spring', stiffness: 100 }}
      whileHover={{
        scale: 1.03,
        boxShadow: `0 0 25px ${c.glow}`,
        transition: { duration: 0.2 },
      }}
    >
      {/* Subtle shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(105deg, transparent 40%, ${c.glow} 50%, transparent 60%)`,
        }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      />

      <motion.div
        className={`p-2 rounded-lg ${c.bg}`}
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: delay + 2, ease: 'easeInOut' }}
      >
        <Icon className={`w-4 h-4 ${c.icon}`} />
      </motion.div>
      <div>
        <p className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{label}</p>
        <p className={`text-lg font-bold ${c.text} tabular-nums`}>
          <AnimatedCounter
            target={value}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
            duration={2200}
          />
        </p>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════
   ANIMATED TYPING TEXT
   ═══════════════════════════════════════════════ */
const TypingTagline = () => {
  const phrases = [
    { text: 'Analyse tes trades', delay: 0.8 },
    { text: 'Corrige tes erreurs', delay: 1.3 },
    { text: 'Progresse', delay: 1.8, highlight: true },
  ];

  return (
    <div
      className="flex flex-col gap-1.5 mt-2"
      style={{
        borderLeft: '2px solid #3b82f6',
        paddingLeft: '16px'
      }}
    >
      {phrases.map((p, i) => (
        <motion.div
          key={i}
          style={p.highlight ? {
            fontFamily: "'Exo 2', sans-serif",
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#3b82f6',
            letterSpacing: '0.15em',
            textShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
          } : {
            fontFamily: "'Exo 2', sans-serif",
            fontSize: '0.95rem',
            fontWeight: 300,
            color: '#6b8fa8',
            letterSpacing: '0.08em',
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: p.delay, ease: 'easeOut' }}
        >
          {p.text}
        </motion.div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   LIVE TICKER BAR — scrolling text
   ═══════════════════════════════════════════════ */
const LiveTicker = () => {
  const items = [
    'XAUUSD +1.24%', 'EURUSD -0.18%', 'BTC +3.52%', 'NAS100 +0.87%',
    'GBPUSD -0.31%', 'US30 +0.45%', 'ETH +2.14%', 'USDJPY +0.62%',
  ];
  const duplicated = [...items, ...items];

  return (
    <motion.div
      className="absolute bottom-6 left-0 right-0 overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.7 }}
      transition={{ delay: 2.5, duration: 1 }}
    >
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {duplicated.map((item, i) => (
          <span
            key={i}
            className={`text-sm font-mono tracking-wider drop-shadow-sm ${item.includes('+') ? 'text-emerald-400' : 'text-red-400'
              }`}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
const Introduction = () => {
  const navigate = useNavigate();
  const trades = useStore(s => s.trades);
  const { signOut } = useAuth();

  // loadAllData is handled globally by Layout.tsx

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showContent, setShowContent] = useState(false);

  // Delayed content reveal
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Compute real stats from trades ──
  const totalTrades = trades?.length || 0;
  const winTrades = trades?.filter(
    (t: any) => t.result === 'TP' || t.result === 'GAIN' || t.result === "BE+"
  ).length || 0;
  const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;
  const totalPnl = trades?.reduce((sum: number, t: any) => sum + (t.pnlAmount || 0), 0) || 0;

  // ── Build equity curve from real trades ──
  const sortedTrades = [...(trades || [])].sort(
    (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const equityPoints: number[] = sortedTrades.length > 0
    ? (() => {
      let cumulative = 0;
      const pts = [0];
      for (const t of sortedTrades) {
        cumulative += (t as any).pnlAmount || 0;
        pts.push(cumulative);
      }
      return pts;
    })()
    : [0];

  // ── Performance label ──
  const perfLabel = totalPnl >= 0
    ? `▲ +${Math.abs(totalPnl).toFixed(0)}$`
    : `▼ -${Math.abs(totalPnl).toFixed(0)}$`;

  // ── Chart month labels from real trades ──
  const chartLabels = sortedTrades.length > 1
    ? (() => {
      const dates = sortedTrades.map((t: any) => new Date(t.date));
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      const uniqueMonths: string[] = [];
      for (const d of dates) {
        const label = months[d.getMonth()];
        if (!uniqueMonths.includes(label)) uniqueMonths.push(label);
      }
      return uniqueMonths.slice(0, 6);
    })()
    : [];

  const handleStart = () => {
    navigate('/app/dashboard');
  };

  // Enter key shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleStart();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <AnimatePresence>
      <motion.div
        className="relative w-full h-screen overflow-hidden"
        style={{ background: '#0B0F1A' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* ── Subtle grid background ── */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.03 }}
          transition={{ duration: 2 }}
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,163,184,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.4) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* ── Ambient glow orbs ── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
              top: '-10%',
              right: '-5%',
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
              bottom: '-5%',
              left: '-5%',
            }}
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
          <motion.div
            className="absolute w-[300px] h-[300px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 70%)',
              top: '40%',
              left: '40%',
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          />
        </div>

        {/* ── Floating particles ── */}
        <FloatingParticles />

        {/* ── Decorative lines ── */}
        <motion.div
          className="absolute left-0 top-1/4 h-px"
          style={{
            background: 'linear-gradient(90deg, rgba(34,211,238,0.3), transparent)',
            width: '200px',
            transformOrigin: 'left',
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.5 }}
        />
        <motion.div
          className="absolute right-0 bottom-1/3 h-px"
          style={{
            background: 'linear-gradient(270deg, rgba(59,130,246,0.3), transparent)',
            width: '180px',
            transformOrigin: 'right',
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.8 }}
        />

        {/* ══════════════════════════════════════════
            HEADER
            ══════════════════════════════════════════ */}
        <motion.header
          className="relative z-10 flex items-center justify-between px-8 py-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {/* Logo + App name */}
          <div className="flex items-center gap-3">
            <VaynaLogo size={32} showText />
          </div>

          {/* Clock + Sign out */}
          <div className="flex items-center gap-4">
            <motion.div
              className="text-sm font-mono text-slate-400 font-medium tabular-nums tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.9 }}
            >
              {formatTime(currentTime)}
            </motion.div>
            <motion.button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-red-400 border border-slate-800 hover:border-red-900/60 transition-all duration-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 1.2 }}
              title="Se déconnecter"
            >
              <LogOut size={12} />
              Déconnexion
            </motion.button>
          </div>
        </motion.header>

        {/* ══════════════════════════════════════════
            MAIN CONTENT — 2 columns
            ══════════════════════════════════════════ */}
        {showContent && (
          <div className="relative z-10 flex items-center h-[calc(100vh-72px)] px-8 lg:px-16">
            {/* ── LEFT COLUMN (45%) — Identity ── */}
            <div className="w-[45%] flex flex-col justify-center pr-12">
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.2, type: 'spring', stiffness: 60 }}
              >
                <h1 className="leading-none mb-4 relative">
                  {/* Glow behind text */}
                  <motion.div
                    className="absolute inset-0 blur-3xl opacity-30 pointer-events-none"
                    style={{
                      background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.4) 0%, transparent 70%)',
                    }}
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.span
                    className="block text-7xl font-medium tracking-[0.25em] relative"
                    style={{
                      background: 'linear-gradient(135deg, #e0f2fe 0%, #93c5fd 30%, #3b82f6 70%, #1e40af 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontFamily: "'Inter', sans-serif",
                      filter: 'drop-shadow(0 0 40px rgba(59,130,246,0.3))',
                    }}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                  >
                    V<span style={{ fontFamily: 'Georgia, serif', fontWeight: 500 }}>Λ</span>YN<span style={{ fontFamily: 'Georgia, serif', fontWeight: 500 }}>Λ</span>
                    {/* Shimmer sweep */}
                    <motion.span
                      className="absolute inset-0 block"
                      style={{
                        background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.2) 50%, transparent 65%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                      animate={{ backgroundPosition: ['200% center', '-200% center'] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
                    />
                  </motion.span>
                </h1>
                {/* Accent line under title */}
                <motion.div
                  className="flex items-center gap-3 mb-2"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  style={{ transformOrigin: 'left' }}
                >
                  <div className="h-[1px] w-16 bg-gradient-to-r from-blue-400 to-transparent" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-blue-300/50 font-light">Journal de Trading</span>
                  <div className="h-[1px] w-8 bg-gradient-to-r from-slate-600 to-transparent" />
                </motion.div>
              </motion.div>

              {/* Decorative line under title */}
              <motion.div
                className="flex items-center gap-2 mb-6"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <motion.div
                  className="h-px bg-gradient-to-r from-cyan-500 to-transparent"
                  initial={{ width: 0 }}
                  animate={{ width: 60 }}
                  transition={{ duration: 1, delay: 0.8 }}
                />
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
                <motion.div
                  className="h-px bg-gradient-to-r from-cyan-500/50 to-transparent"
                  initial={{ width: 0 }}
                  animate={{ width: 30 }}
                  transition={{ duration: 0.8, delay: 1 }}
                />
              </motion.div>

              {/* Tagline with staggered word animation */}
              <motion.div
                className="mb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <TypingTagline />
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2, type: 'spring', stiffness: 80 }}
              >
                <motion.button
                  onClick={handleStart}
                  className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full font-medium text-white text-sm overflow-hidden border border-[#3b82f6]/20"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(37,99,235,0.2) 100%)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 0 20px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
                  }}
                  whileHover={{
                    scale: 1.04,
                    boxShadow: '0 0 35px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                    borderColor: 'rgba(59,130,246,0.4)',
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* Shimmer sweep */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
                  />
                  <span className="relative z-10 tracking-wide">Accéder à mon dashboard</span>
                  <motion.div
                    className="relative z-10"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </motion.button>

              </motion.div>

              {/* Keyboard shortcut */}
              <motion.p
                className="mt-8 text-xs text-slate-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 2 }}
              >
                Appuyez sur{' '}
                <kbd className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800/50 text-slate-400 text-[10px] font-mono">
                  Entrée
                </kbd>{' '}
                pour continuer
              </motion.p>
            </div>

            {/* ── RIGHT COLUMN (55%) — Data visualization ── */}
            <div className="w-[55%] flex flex-col justify-center pl-4 relative">
              
              {/* ── Floating 3D Curve Above Chart ── */}
              <Floating3DCurve />

              {/* Chart container */}
              <motion.div
                className="relative z-10 rounded-2xl border border-slate-800/60 bg-slate-900/30 backdrop-blur-sm p-6 overflow-hidden"
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.4, type: 'spring', stiffness: 60 }}
                style={{
                  boxShadow:
                    '0 0 1px rgba(148,163,184,0.1), 0 4px 30px rgba(0,0,0,0.3)',
                }}
              >
                {/* Animated border glow */}
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34,211,238,0.05), transparent, rgba(59,130,246,0.05))',
                  }}
                  animate={{
                    background: [
                      'linear-gradient(135deg, rgba(34,211,238,0.08), transparent, rgba(59,130,246,0.03))',
                      'linear-gradient(135deg, rgba(59,130,246,0.03), transparent, rgba(34,211,238,0.08))',
                      'linear-gradient(135deg, rgba(34,211,238,0.08), transparent, rgba(59,130,246,0.03))',
                    ],
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Scan line effect */}
                <ScanLine />

                {/* Chart header */}
                <div className="relative flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-1 h-4 rounded-full bg-cyan-500"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Performance
                    </span>
                  </div>
                  <motion.div
                    className="flex items-center gap-1.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5 }}
                  >
                    <Activity className={`w-3 h-3 ${totalPnl >= 0 ? 'text-emerald-500/70' : 'text-red-400/70'}`} />
                    <span className={`text-[10px] font-mono ${totalPnl >= 0 ? 'text-emerald-500/70' : 'text-red-400/70'}`}>{perfLabel}</span>
                  </motion.div>
                </div>

                {/* Chart */}
                <div className="relative h-44 w-full">
                  <MiniPriceChart points={equityPoints} />
                </div>

                {/* Price labels */}
                <div className="relative flex justify-between mt-2 px-1">
                  {chartLabels.map((m, i) => (
                    <motion.span
                      key={m + i}
                      className="text-[10px] text-slate-600 font-mono"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 + i * 0.1 }}
                    >
                      {m}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <StatCard
                  icon={BarChart3}
                  label="Win Rate"
                  value={winRate}
                  suffix="%"
                  decimals={1}
                  color="cyan"
                  delay={1.4}
                />
                <StatCard
                  icon={TrendingUp}
                  label="Trades"
                  value={totalTrades}
                  decimals={0}
                  color="blue"
                  delay={1.6}
                />
                <StatCard
                  icon={DollarSign}
                  label="P&L Net"
                  value={totalPnl}
                  prefix={totalPnl >= 0 ? '+' : ''}
                  suffix="$"
                  decimals={0}
                  color="green"
                  delay={1.8}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Live ticker bar ── */}
        <LiveTicker />


      </motion.div>
    </AnimatePresence>
  );
};

export { Introduction };
export default Introduction;
