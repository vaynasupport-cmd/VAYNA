import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Percent, Wallet, Activity,
  BarChart3, Sparkles, ArrowUpRight, ArrowDownRight, Zap, Award, Target
} from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { StatCard } from '@/components/StatCard'
import { AccountSelector } from '@/components/AccountSelector'
import { PeriodSelector } from '@/components/PeriodSelector'
import { ProfitCalendar } from '@/components/ProfitCalendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercent, getStatusColor, getStatusBgColor } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { useMT5Account } from '@/hooks/useMT5Account'
import {
  calculateAssetPerformance,
} from '@/lib/statsCalculator'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.02 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] } }
}

export function Dashboard() {
  const { toggleMT5SyncStatus } = useMT5Account()
  const accounts = useStore(s => s.accounts)
  const selectedAccountId = useStore(s => s.selectedAccountId)
  const dashboardStats = useStore(s => s.dashboardStats)
  const advancedStats = useStore(s => s.advancedStats)
  const equityCurve = useStore(s => s.equityCurve)
  const trades = useStore(s => s.trades)
  const selectedPeriod = useStore(s => s.selectedPeriod)
  const autoImportEnabled = useStore(s => s.autoImportEnabled)
  const setAutoImportEnabled = useStore(s => s.setAutoImportEnabled)

  // Calculate asset performance for the bar chart
  const assetPerformance = useMemo(() => {
    const filters: any = {}
    if (selectedAccountId) filters.accountId = selectedAccountId
    if (selectedPeriod?.startDate) filters.startDate = selectedPeriod.startDate
    if (selectedPeriod?.endDate) filters.endDate = selectedPeriod.endDate
    return calculateAssetPerformance(trades, filters)
  }, [trades, selectedAccountId, selectedPeriod])



  // Get initial capital for equity baseline
  const initialCapital = useMemo(() => {
    if (selectedAccountId) {
      const acct = accounts.find(a => a.id === selectedAccountId)
      return acct?.initialCapital || 0
    }
    return accounts.reduce((s, a) => s + a.initialCapital, 0)
  }, [accounts, selectedAccountId])

  // P&L distribution (per-trade bars)
  const pnlDistribution = useMemo(() => {
    const filtered = selectedAccountId
      ? trades.filter(t => t.accountId === selectedAccountId)
      : trades
    const sorted = [...filtered].sort((a, b) => {
      const tA = a.createdDateTime || a.date
      const tB = b.createdDateTime || b.date
      return tA.localeCompare(tB)
    })
    return sorted.map((t, i) => ({
      index: i + 1,
      pnl: t.pnlAmount,
      asset: t.asset,
      date: t.date,
    }))
  }, [trades, selectedAccountId])

  const avgPnl = useMemo(() => {
    if (pnlDistribution.length === 0) return 0
    return pnlDistribution.reduce((s, d) => s + d.pnl, 0) / pnlDistribution.length
  }, [pnlDistribution])

  // Drawdown curve (% drawdown over time)
  const drawdownCurve = useMemo(() => {
    const filtered = selectedAccountId
      ? trades.filter(t => t.accountId === selectedAccountId)
      : trades
    const sorted = [...filtered].sort((a, b) => {
      const tA = a.createdDateTime || a.date
      const tB = b.createdDateTime || b.date
      return tA.localeCompare(tB)
    })

    let running = initialCapital
    let peak = initialCapital
    const points: Array<{ date: string; drawdown: number; equity: number }> = []

    for (const trade of sorted) {
      running += trade.pnlAmount
      if (running > peak) peak = running
      const dd = peak > 0 ? ((peak - running) / peak) * 100 : 0
      points.push({ date: trade.date, drawdown: -dd, equity: running })
    }
    return points
  }, [trades, selectedAccountId, initialCapital])

  // Max drawdown % for reference line
  const maxDrawdownPct = useMemo(() => {
    if (selectedAccountId) {
      const acct = accounts.find(a => a.id === selectedAccountId)
      if (acct && acct.initialCapital > 0) return -(acct.maxDrawdownAmount / acct.initialCapital) * 100
    }
    return 0
  }, [accounts, selectedAccountId])

  // Session heatmap: Day × Hour
  const heatmapData = useMemo(() => {
    const filtered = selectedAccountId
      ? trades.filter(t => t.accountId === selectedAccountId)
      : trades
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    const map = new Map<string, { total: number; count: number }>()

    for (const t of filtered) {
      if (!t.createdDateTime) continue
      const d = new Date(t.createdDateTime)
      if (isNaN(d.getTime())) continue
      const day = d.getDay()
      const hour = d.getHours()
      const key = `${day}-${hour}`
      if (!map.has(key)) map.set(key, { total: 0, count: 0 })
      const m = map.get(key)!
      m.total += t.pnlAmount
      m.count++
    }

    const cells: Array<{ day: string; dayIdx: number; hour: number; avgPnl: number; count: number }> = []
    for (let day = 1; day <= 5; day++) { // Mon-Fri
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`
        const entry = map.get(key)
        cells.push({
          day: dayNames[day],
          dayIdx: day,
          hour,
          avgPnl: entry ? entry.total / entry.count : 0,
          count: entry?.count || 0,
        })
      }
    }
    return cells
  }, [trades, selectedAccountId])

  // Calcul Performance Mensuelle (Mois calendaires)
  const monthlyPerformance = useMemo(() => {
    const list = selectedAccountId ? trades.filter(t => t.accountId === selectedAccountId) : trades;
    const groups: Record<string, { pnl: number; count: number; wins: number; losses: number }> = {};
    for (const t of list) {
      if (!t.date) continue;
      const d = new Date(t.date);
      if (isNaN(d.getTime())) continue;
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[m]) groups[m] = { pnl: 0, count: 0, wins: 0, losses: 0 };
      groups[m].pnl += t.pnlAmount;
      groups[m].count++;
      if (t.pnlAmount > 0) groups[m].wins++;
      else if (t.pnlAmount < 0) groups[m].losses++;
    }
    return Object.entries(groups).map(([date, data]) => ({ date, ...data })).sort((a, b) => a.date.localeCompare(b.date));
  }, [trades, selectedAccountId]);

  // Calcul Performance Hebdomadaire (Semaines calendaires)
  const weeklyPerformance = useMemo(() => {
    const list = selectedAccountId ? trades.filter(t => t.accountId === selectedAccountId) : trades;
    const groups: Record<string, { pnl: number; count: number; wins: number; losses: number; startDate: string }> = {};

    // Fonction pour récupérer la clé et le lundi de la semaine
    const getWeekInfo = (d: Date) => {
      const date = new Date(d.getTime());
      date.setHours(0, 0, 0, 0);
      // Get Monday of the week
      const dayOfWeek = date.getDay();
      const monday = new Date(date);
      monday.setDate(date.getDate() - ((dayOfWeek + 6) % 7));

      const dateCopy = new Date(d.getTime());
      dateCopy.setHours(0, 0, 0, 0);
      dateCopy.setDate(dateCopy.getDate() + 3 - (dateCopy.getDay() + 6) % 7);
      const week1 = new Date(dateCopy.getFullYear(), 0, 4);
      const weekNumber = 1 + Math.round(((dateCopy.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
      const key = `${dateCopy.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;

      return { key, mondayStr: monday.toISOString().substring(0, 10) };
    };

    for (const t of list) {
      if (!t.date) continue;
      const d = new Date(t.date);
      if (isNaN(d.getTime())) continue;
      const { key, mondayStr } = getWeekInfo(d);
      if (!groups[key]) groups[key] = { pnl: 0, count: 0, wins: 0, losses: 0, startDate: mondayStr };
      groups[key].pnl += t.pnlAmount;
      groups[key].count++;
      if (t.pnlAmount > 0) groups[key].wins++;
      else if (t.pnlAmount < 0) groups[key].losses++;
    }
    return Object.entries(groups).map(([date, data]) => ({ date, ...data })).sort((a, b) => a.date.localeCompare(b.date)).slice(-10);
  }, [trades, selectedAccountId]);

  // Sharpe Ratio (simplified)
  const sharpeRatio = useMemo(() => {
    const filtered = selectedAccountId
      ? trades.filter(t => t.accountId === selectedAccountId)
      : trades
    if (filtered.length < 2) return 0
    const returns = filtered.map(t => t.pnlAmount)
    const mean = returns.reduce((s, r) => s + r, 0) / returns.length
    const variance = returns.reduce((s, r) => s + Math.pow(r - mean, 2), 0) / returns.length
    const stdDev = Math.sqrt(variance)
    return stdDev > 0 ? mean / stdDev : 0
  }, [trades, selectedAccountId])

  // Avg Risk/Reward
  const avgRR = useMemo(() => {
    const filtered = (selectedAccountId
      ? trades.filter(t => t.accountId === selectedAccountId)
      : trades
    ).filter(t => t.rMultiple !== undefined && t.rMultiple !== null)
    if (filtered.length === 0) return 0
    return filtered.reduce((s, t) => s + (t.rMultiple || 0), 0) / filtered.length
  }, [trades, selectedAccountId])

  const selectedAccount = selectedAccountId ? accounts.find(a => a.id === selectedAccountId) : null

  // Drawdown calculations
  let absoluteThreshold = 0
  let drawdownRestant = 0
  let drawdownRestantPercent = 0
  let drawdownUsedAmount = 0
  let drawdownUsedPercentWidth = 0
  let isDangerDrawdown = false

  if (selectedAccount) {
    absoluteThreshold = selectedAccount.initialCapital - selectedAccount.maxDrawdownAmount
    drawdownRestant = Math.max(0, selectedAccount.currentCapital - absoluteThreshold)
    drawdownRestantPercent = (drawdownRestant / selectedAccount.initialCapital) * 100
    drawdownUsedAmount = Math.max(0, selectedAccount.initialCapital - selectedAccount.currentCapital)
    drawdownUsedPercentWidth = Math.min((drawdownUsedAmount / selectedAccount.maxDrawdownAmount) * 100, 100)
    isDangerDrawdown = drawdownRestant <= (selectedAccount.maxDrawdownAmount * 0.2)
  }

  const stats = selectedAccount ? {
    totalTrades: dashboardStats?.totalTrades || 0,
    totalPnl: dashboardStats?.totalPnl || 0,
    winRate: dashboardStats?.winRate || 0,
    currentDrawdown: selectedAccount.currentDrawdownAmount,
    maxDrawdown: selectedAccount.maxDrawdownAmount,
    profitPercent: selectedAccount.profitPercent,
    profitAmount: selectedAccount.profitAmount,
    targetAmount: selectedAccount.targetAmount,
    targetPercent: selectedAccount.targetPercent,
  } : {
    totalTrades: dashboardStats?.totalTrades || 0,
    totalPnl: accounts.reduce((sum, a) => sum + a.profitAmount, 0),
    winRate: dashboardStats?.winRate || 0,
    currentDrawdown: accounts.reduce((sum, a) => sum + a.currentDrawdownAmount, 0),
    maxDrawdown: accounts.reduce((sum, a) => sum + a.maxDrawdownAmount, 0),
    profitPercent: accounts.length > 0
      ? (accounts.reduce((sum, a) => sum + a.profitAmount, 0) / accounts.reduce((sum, a) => sum + a.initialCapital, 0)) * 100 : 0,
    profitAmount: accounts.reduce((sum, a) => sum + a.profitAmount, 0),
    targetAmount: accounts.reduce((sum, a) => sum + a.targetAmount, 0),
    targetPercent: accounts.length > 0
      ? accounts.reduce((sum, a) => sum + a.targetPercent, 0) / accounts.length : 0,
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

      {/* ── Header ── */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
            >
              <Sparkles className="h-5 w-5 text-primary opacity-70" />
            </motion.div>
            <h1 className="text-3xl font-black tracking-tight">Dashboard Central</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            La clé du succès est la constance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={cn(
              "cursor-pointer transition-all h-10 px-3 gap-2 border shadow-sm select-none",
              autoImportEnabled
                ? "bg-trading-green/10 text-trading-green border-trading-green/30 hover:bg-trading-green/20"
                : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted"
            )}
            onClick={() => {
              const newState = !autoImportEnabled
              setAutoImportEnabled(newState)
              toggleMT5SyncStatus(newState)
            }}
            title={autoImportEnabled ? "Désactiver l'auto-import" : "Activer l'auto-import"}
          >
            <div className="relative flex h-2 w-2">
              {autoImportEnabled && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-trading-green opacity-75"></span>
              )}
              <span className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                autoImportEnabled ? "bg-trading-green" : "bg-muted-foreground/50"
              )}></span>
            </div>
            <Activity className="h-4 w-4" />
            <span className="font-semibold text-[11px] tracking-wide whitespace-nowrap">
              {autoImportEnabled ? 'AUTO-IMPORT : ON' : 'AUTO-IMPORT : OFF'}
            </span>
          </Badge>
          <PeriodSelector />
          <AccountSelector />
        </div>
      </motion.div>

      {/* ── Account Status Card ── */}
      {selectedAccount && (
        <motion.div variants={item}>
          <Card className={cn(
            "relative overflow-hidden border-border/60 transition-all duration-300",
            getStatusBgColor(selectedAccount.status)
          )}>
            {/* Ambient glow orb */}
            <motion.div
              className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none"
              style={{ background: selectedAccount.status === 'lost' ? '#ef4444' : selectedAccount.status === 'validated' ? '#10b981' : '#3b82f6' }}
              animate={{ opacity: [0.08, 0.14, 0.08] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />

            <CardContent className="relative p-6">
              {/* Account header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.08, rotate: 5 }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/60 border border-border/50"
                  >
                    <Wallet className="h-6 w-6 text-primary" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold leading-tight">{selectedAccount.name}</h2>
                    {selectedAccount.propFirm && (
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">
                        {selectedAccount.propFirm}
                      </p>
                    )}
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-3 py-1 font-semibold tracking-wider uppercase gap-1.5",
                    getStatusColor(selectedAccount.status)
                  )}
                >
                  {/* Animated dot */}
                  <motion.span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: selectedAccount.status === 'active' ? '#10b981' : selectedAccount.status === 'lost' ? '#ef4444' : '#3b82f6' }}
                    animate={{ opacity: [1, 0.4, 1], scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  {selectedAccount.status === 'active' && 'Actif'}
                  {selectedAccount.status === 'lost' && 'Perdu'}
                  {selectedAccount.status === 'validated' && 'Validé'}
                </Badge>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                {[
                  { label: 'Capital actuel', value: formatCurrency(selectedAccount.currentCapital), cls: '' },
                  {
                    label: 'Profit / Perte',
                    value: (selectedAccount.profitAmount >= 0 ? '+' : '') + formatCurrency(selectedAccount.profitAmount),
                    sub: selectedAccount.profitPercent.toFixed(2) + '%',
                    cls: selectedAccount.profitAmount >= 0 ? 'text-trading-green' : 'text-trading-red',
                    Icon: selectedAccount.profitAmount >= 0 ? ArrowUpRight : ArrowDownRight,
                  },
                  { label: 'Objectif', value: formatCurrency(selectedAccount.targetAmount), cls: '' },
                  {
                    label: 'Marge (Drawdown)',
                    value: formatCurrency(drawdownRestant),
                    sub: `${drawdownRestantPercent.toFixed(2)}%`,
                    cls: isDangerDrawdown ? 'text-trading-red' : 'text-[hsl(38,92%,50%)]',
                  },
                ].map(({ label, value, sub, cls, Icon }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="space-y-1"
                  >
                    <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-medium">
                      {label}
                    </p>
                    <div className="flex items-center gap-1">
                      {Icon && <Icon className={cn("h-4 w-4", cls)} />}
                      <p className={cn("text-2xl font-black tracking-tight number-font", cls)}>
                        {value}
                      </p>
                    </div>
                    {sub && <p className={cn("text-xs font-semibold", cls)}>{sub}</p>}
                  </motion.div>
                ))}
              </div>

              {/* Progress bars */}
              <div className="space-y-3 border-t border-border/30 pt-4">
                {/* Objectif progress */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground font-medium">Progression vers l'objectif</span>
                    <span className="font-semibold tabular-nums">
                      {formatPercent(selectedAccount.targetAmount > 0 ? Math.min((selectedAccount.profitAmount / selectedAccount.targetAmount) * 100, 100) : 0)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-background/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedAccount.targetAmount > 0 ? Math.min(Math.max((selectedAccount.profitAmount / selectedAccount.targetAmount) * 100, 0), 100) : 0}%` }}
                      transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className={cn(
                        "h-full rounded-full relative overflow-hidden",
                        selectedAccount.profitAmount >= 0 ? 'bg-trading-green' : 'bg-trading-red'
                      )}
                    >
                      {/* shimmer */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Drawdown progress */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground font-medium">Drawdown utilisé</span>
                    <span className={cn("font-semibold tabular-nums", isDangerDrawdown && 'text-trading-red')}>
                      {drawdownUsedPercentWidth.toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-background/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${drawdownUsedPercentWidth}%` }}
                      transition={{ duration: 1.2, delay: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className={cn(
                        "h-full rounded-full relative overflow-hidden",
                        isDangerDrawdown ? 'bg-trading-red' : 'bg-trading-orange'
                      )}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }}
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Stats Grid ── */}
      <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Profit Total"
          value={stats.totalPnl}
          format="currency"
          trend={stats.totalPnl >= 0 ? 'up' : 'down'}
          trendValue={formatPercent(stats.profitPercent)}
          icon={<TrendingUp className="h-5 w-5" />}
          delay={0}
          valueClassName={stats.totalPnl >= 0 ? 'text-trading-green' : 'text-trading-red'}
        />
        <StatCard
          title="Win Rate"
          value={stats.winRate}
          format="percent"
          subtitle={`${dashboardStats?.wins || 0} gagnants / ${dashboardStats?.losses || 0} perdants`}
          icon={<Percent className="h-5 w-5" />}
          delay={0.08}
        />
        <StatCard
          title="Drawdown Actuel"
          value={stats.currentDrawdown}
          format="currency"
          subtitle={`Max: ${formatCurrency(stats.maxDrawdown)}`}
          icon={<TrendingDown className="h-5 w-5" />}
          delay={0.16}
          trend="down"
          valueClassName="text-trading-red"
        />
        <StatCard
          title="Nombre de Trades"
          value={stats.totalTrades}
          subtitle="Total des trades enregistrés"
          icon={<Activity className="h-5 w-5" />}
          delay={0.24}
        />
      </motion.div>

      {/* ── 1. EQUITY CURVE + MENSUEL/HEBDO ── */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-3">

        {/* Equity Curve */}
        <Card className="lg:col-span-2 overflow-hidden card-glow-hover flex flex-col">
          <CardHeader className="pb-2 shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Courbe d'Equity
              </CardTitle>
              {equityCurve && equityCurve.length > 0 && (
                <span className="text-sm text-muted-foreground">Rendement: <span className={cn("font-bold", initialCapital > 0 && ((equityCurve[equityCurve.length - 1]?.equity - initialCapital) >= 0) ? "text-trading-green" : "text-trading-red")}>{initialCapital > 0 ? (((equityCurve[equityCurve.length - 1]?.equity - initialCapital) / initialCapital) * 100).toFixed(2) : '0.00'}%</span></span>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {equityCurve && equityCurve.length > 0 ? (
              <div className="flex-1 min-h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equityCurve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(213, 85%, 62%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(213, 85%, 62%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="date" tickFormatter={(v) => { const d = new Date(v); return `${d.getDate()}/${d.getMonth() + 1}` }} stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                    <Tooltip itemStyle={{ color: 'hsl(var(--foreground))' }} labelStyle={{ color: 'hsl(var(--muted-foreground))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} formatter={(value: number) => [formatCurrency(value), 'Equity']} labelFormatter={(l) => new Date(l).toLocaleDateString('fr-FR')} />
                    {initialCapital > 0 && <ReferenceLine y={initialCapital} stroke="hsl(var(--muted-foreground))" strokeDasharray="6 4" strokeOpacity={0.4} />}
                    <Area type="monotone" dataKey="equity" stroke="hsl(213, 85%, 62%)" strokeWidth={2.5} fill="url(#eqGrad)" animationDuration={1500} dot={false} activeDot={{ r: 4, fill: 'hsl(213, 85%, 62%)', strokeWidth: 2, stroke: 'hsl(var(--card))' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[340px] text-muted-foreground gap-2">
                <TrendingUp className="h-8 w-8 opacity-20" />
                <p className="text-sm">Ajoutez des trades pour voir votre courbe</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Perf Mensuelle / Hebdo */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Mensuelle */}
          <Card className="flex-1 overflow-hidden card-glow-hover flex flex-col">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-3.5 w-3.5 text-primary" />
                Perf. Mensuelle
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
              {monthlyPerformance.length > 0 ? (
                <div className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyPerformance} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                      <XAxis dataKey="date" tickFormatter={(v) => { const [y, m] = v.split('-'); const d = new Date(parseInt(y), parseInt(m) - 1); return d.toLocaleDateString('fr-FR', { month: 'short' }) }} stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis tickFormatter={(v) => `${v >= 0 ? '' : '-'}$${Math.abs(v) >= 1000 ? (Math.abs(v) / 1000).toFixed(1) + 'k' : Math.abs(v).toFixed(0)}`} stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: 'hsl(var(--muted) / 0.2)' }}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', fontSize: '12px' }}
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.[0]) return null;
                          const d = payload[0].payload;
                          const [y, m] = (label as string).split('-');
                          const monthName = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                          const wr = d.count > 0 ? ((d.wins / d.count) * 100).toFixed(0) : '0';
                          return (
                            <div className="bg-card border border-border rounded-lg p-2.5 shadow-lg text-xs space-y-1">
                              <p className="font-semibold text-foreground capitalize">{monthName}</p>
                              <p className={d.pnl >= 0 ? 'text-trading-green font-bold' : 'text-trading-red font-bold'}>{d.pnl >= 0 ? '+' : ''}{formatCurrency(d.pnl)}</p>
                              <p className="text-muted-foreground">{d.count} trades • WR {wr}%</p>
                            </div>
                          );
                        }}
                      />
                      <ReferenceLine y={0} stroke="hsl(var(--border))" strokeOpacity={0.8} />
                      <Bar dataKey="pnl" radius={[2, 2, 0, 0]} animationDuration={1000}>
                        {monthlyPerformance.map((entry, i) => (
                          <Cell key={`m-${i}`} fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} fillOpacity={0.9} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[120px] text-muted-foreground gap-1">
                  <BarChart3 className="h-6 w-6 opacity-20" /><p className="text-xs">Aucune donnée</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hebdomadaire */}
          <Card className="flex-1 overflow-hidden card-glow-hover flex flex-col">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-3.5 w-3.5 text-primary" />
                Perf. Hebdo (10 dern. sem.)
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
              {weeklyPerformance.length > 0 ? (
                <div className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyPerformance} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                      <XAxis dataKey="startDate" tickFormatter={(v) => { const d = new Date(v); return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) }} stroke="hsl(var(--muted-foreground))" fontSize={8} tickLine={false} axisLine={false} />
                      <YAxis tickFormatter={(v) => `${v >= 0 ? '' : '-'}$${Math.abs(v) >= 1000 ? (Math.abs(v) / 1000).toFixed(1) + 'k' : Math.abs(v).toFixed(0)}`} stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: 'hsl(var(--muted) / 0.2)' }}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', fontSize: '12px' }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.[0]) return null;
                          const d = payload[0].payload;
                          const start = new Date(d.startDate);
                          const end = new Date(start);
                          end.setDate(end.getDate() + 6);
                          const label = `${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;
                          const wr = d.count > 0 ? ((d.wins / d.count) * 100).toFixed(0) : '0';
                          return (
                            <div className="bg-card border border-border rounded-lg p-2.5 shadow-lg text-xs space-y-1">
                              <p className="font-semibold text-foreground">Sem. du {label}</p>
                              <p className={d.pnl >= 0 ? 'text-trading-green font-bold' : 'text-trading-red font-bold'}>{d.pnl >= 0 ? '+' : ''}{formatCurrency(d.pnl)}</p>
                              <p className="text-muted-foreground">{d.count} trades • WR {wr}%</p>
                            </div>
                          );
                        }}
                      />
                      <ReferenceLine y={0} stroke="hsl(var(--border))" strokeOpacity={0.8} />
                      <Bar dataKey="pnl" radius={[2, 2, 0, 0]} animationDuration={1000}>
                        {weeklyPerformance.map((entry, i) => (
                          <Cell key={`w-${i}`} fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} fillOpacity={0.9} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[120px] text-muted-foreground gap-1">
                  <BarChart3 className="h-6 w-6 opacity-20" /><p className="text-xs">Aucune donnée</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </motion.div>

      {/* ── PROFIT CALENDAR ── */}
      <motion.div variants={item}>
        <Card className="overflow-hidden card-glow-hover">
          <CardContent className="p-5">
            <ProfitCalendar
              trades={trades}
              selectedAccountId={selectedAccountId}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* ── 2. P&L HISTOGRAM + 3. DONUT ── */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden card-glow-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Distribution P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pnlDistribution.length > 0 ? (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pnlDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="index" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(v) => formatCurrency(v)} stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip itemStyle={{ color: 'hsl(var(--foreground))' }} labelStyle={{ color: 'hsl(var(--muted-foreground))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} formatter={(value: number) => [formatCurrency(value), 'P&L']} labelFormatter={(l) => `Trade #${l}`} />
                    <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.3} />
                    {avgPnl !== 0 && <ReferenceLine y={avgPnl} stroke="#F59E0B" strokeDasharray="5 3" strokeWidth={1.5} />}
                    <Bar dataKey="pnl" radius={[3, 3, 0, 0]} animationDuration={1200}>
                      {pnlDistribution.map((entry, i) => (
                        <Cell key={`pnl-${i}`} fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[260px] text-muted-foreground gap-2">
                <BarChart3 className="h-8 w-8 opacity-20" /><p className="text-sm">Pas encore de données</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden card-glow-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Répartition
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(dashboardStats?.totalTrades || 0) > 0 ? (
              <>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[
                        { name: 'Gagnants', value: dashboardStats?.wins || 0 },
                        { name: 'Perdants', value: dashboardStats?.losses || 0 },
                        { name: 'BE', value: Math.max(0, (dashboardStats?.totalTrades || 0) - (dashboardStats?.wins || 0) - (dashboardStats?.losses || 0)) },
                      ].filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={55} outerRadius={78} paddingAngle={4} dataKey="value" strokeWidth={0} animationDuration={1200}>
                        {[{ c: '#10B981' }, { c: '#EF4444' }, { c: '#F59E0B' }].map((e, i) => <Cell key={`dc-${i}`} fill={e.c} />)}
                      </Pie>
                      <Tooltip itemStyle={{ color: 'hsl(var(--foreground))' }} labelStyle={{ color: 'hsl(var(--muted-foreground))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} />
                      <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground" fontSize="28" fontWeight="800">{(dashboardStats?.winRate || 0).toFixed(0)}%</text>
                      <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground" fontSize="11">Win Rate</text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  {[{ l: 'Gains', v: dashboardStats?.wins || 0, cls: 'bg-trading-green' }, { l: 'Pertes', v: dashboardStats?.losses || 0, cls: 'bg-trading-red' }, { l: 'BE', v: Math.max(0, (dashboardStats?.totalTrades || 0) - (dashboardStats?.wins || 0) - (dashboardStats?.losses || 0)), cls: 'bg-trading-orange' }].map(i => (
                    <div key={i.l} className="flex items-center gap-1.5">
                      <span className={cn("w-2 h-2 rounded-full", i.cls)} />
                      <span className="text-xs text-muted-foreground">{i.l}: <span className="font-semibold text-foreground">{i.v}</span></span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[230px] text-muted-foreground gap-2">
                <Target className="h-8 w-8 opacity-20" /><p className="text-sm">Pas encore de données</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── 4. ASSETS + 5. HEATMAP ── */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden card-glow-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Performance par Paire
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assetPerformance.length > 0 ? (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assetPerformance.slice(0, 8)} layout="vertical" margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} horizontal={false} />
                    <XAxis type="number" tickFormatter={(v) => `$${Math.abs(v) > 999 ? (v / 1000).toFixed(1) + 'k' : v}`} stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="asset" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={65} />
                    <Tooltip itemStyle={{ color: 'hsl(var(--foreground))' }} labelStyle={{ color: 'hsl(var(--muted-foreground))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} formatter={(value: number) => [formatCurrency(value), 'P&L']} />
                    <Bar dataKey="pnl" radius={[0, 6, 6, 0]} animationDuration={1200}>
                      {assetPerformance.slice(0, 8).map((entry, i) => <Cell key={`ap-${i}`} fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} fillOpacity={0.85} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground gap-2">
                <BarChart3 className="h-8 w-8 opacity-20" /><p className="text-sm">Pas encore de données</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden card-glow-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Heatmap des Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {heatmapData.some((c: any) => c.count > 0) ? (
              <div className="overflow-x-auto h-[280px] flex flex-col justify-between pb-2">
                <div className="min-w-[480px] flex-1 flex flex-col justify-around">
                  <div className="flex ml-12 mb-2">{Array.from({ length: 24 }, (_, h) => <div key={h} className="flex-1 text-center text-[10px] text-muted-foreground/60 font-medium">{h % 4 === 0 ? `${h}h` : ''}</div>)}</div>
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'].map((day, dayIdx) => (
                    <div key={day} className="flex items-stretch gap-1.5 flex-1 mb-1">
                      <span className="w-10 text-[11px] text-muted-foreground/80 font-medium flex items-center justify-end pr-1 shrink-0">{day}</span>
                      <div className="flex flex-1 gap-1">
                        {Array.from({ length: 24 }, (_, hour) => {
                          const cell = heatmapData.find((c: any) => c.dayIdx === (dayIdx + 1) && c.hour === hour)
                          const avgP = cell?.avgPnl || 0; const count = cell?.count || 0
                          let bg = 'hsl(var(--muted) / 0.3)'
                          if (count > 0) {
                            const maxAbs = Math.max(...heatmapData.filter((c: any) => c.count > 0).map((c: any) => Math.abs(c.avgPnl)), 1)
                            const intensity = Math.min(Math.abs(avgP) / maxAbs, 1)
                            bg = avgP > 0 ? `rgba(16,185,129,${0.15 + intensity * 0.65})` : avgP < 0 ? `rgba(239,68,68,${0.15 + intensity * 0.65})` : 'hsl(var(--muted) / 0.5)'
                          }
                          return <div key={hour} className="flex-1 h-full rounded-[4px] transition-all duration-200 hover:scale-[1.3] hover:shadow-lg hover:z-10 cursor-crosshair relative group border border-background/20" style={{ backgroundColor: bg, minWidth: '12px' }} title={count > 0 ? `${day} ${hour}h: ${formatCurrency(avgP)} moy. (${count} trades)` : `${day} ${hour}h`} />
                        })}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-center mt-4 gap-4 text-[10px] text-muted-foreground/70 font-medium">
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-[3px] bg-trading-red/70" /><span>Perte</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-[3px] bg-muted/40" /><span>Neutre</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-[3px] bg-trading-green/70" /><span>Gain</span></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground gap-2">
                <Sparkles className="h-8 w-8 opacity-20" /><p className="text-sm">Pas assez de données</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── 6. DRAWDOWN ── */}
      <motion.div variants={item}>
        <Card className="overflow-hidden card-glow-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-trading-red" />
              Courbe de Drawdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {drawdownCurve.length > 0 ? (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={drawdownCurve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="date" tickFormatter={(v) => { const d = new Date(v); return `${d.getDate()}/${d.getMonth() + 1}` }} stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(v) => `${v.toFixed(1)}%`} stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 0]} />
                    <Tooltip itemStyle={{ color: 'hsl(var(--foreground))' }} labelStyle={{ color: 'hsl(var(--muted-foreground))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} formatter={(value: number) => [`${value.toFixed(2)}%`, 'Drawdown']} labelFormatter={(l) => new Date(l).toLocaleDateString('fr-FR')} />
                    <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
                    {maxDrawdownPct !== 0 && <ReferenceLine y={maxDrawdownPct} stroke="#EF4444" strokeDasharray="6 4" strokeWidth={1.5} />}
                    <Area type="monotone" dataKey="drawdown" stroke="#EF4444" strokeWidth={2} fill="url(#ddGrad)" animationDuration={1500} dot={false} activeDot={{ r: 3, fill: '#EF4444', strokeWidth: 2, stroke: 'hsl(var(--card))' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[220px] text-muted-foreground gap-2">
                <TrendingDown className="h-8 w-8 opacity-20" /><p className="text-sm">Pas encore de données</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── 7. KEY STATS CARDS ── */}
      <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Profit Factor', value: (advancedStats?.profitFactor || 0).toFixed(2), sub: (advancedStats?.profitFactor || 0) >= 2 ? 'Excellent' : (advancedStats?.profitFactor || 0) >= 1 ? 'Correct' : 'Faible', ok: (advancedStats?.profitFactor || 0) >= 1, icon: <Zap className="h-5 w-5" />, pct: Math.min(((advancedStats?.profitFactor || 0) / 4) * 100, 100) },
          { label: 'Espérance / Trade', value: `${(advancedStats?.expectancy || 0) >= 0 ? '+' : ''}${formatCurrency(advancedStats?.expectancy || 0)}`, sub: 'Gain moyen attendu', ok: (advancedStats?.expectancy || 0) >= 0, icon: <Target className="h-5 w-5" />, pct: null },
          { label: 'R:R Moyen', value: `${avgRR >= 0 ? '+' : ''}${avgRR.toFixed(2)}R`, sub: avgRR >= 1.5 ? 'Très bon' : avgRR >= 1 ? 'Correct' : 'À améliorer', ok: avgRR >= 1, icon: <Award className="h-5 w-5" />, pct: null },
          { label: 'Sharpe Ratio', value: sharpeRatio.toFixed(2), sub: sharpeRatio >= 1 ? 'Bon' : sharpeRatio >= 0.5 ? 'Moyen' : 'Faible', ok: sharpeRatio >= 0.5, icon: <Activity className="h-5 w-5" />, pct: null },
        ].map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}>
            <Card className="card-glow-hover h-full">
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">{c.label}</span>
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", c.ok ? "bg-trading-green/10 text-trading-green" : "bg-trading-red/10 text-trading-red")}>{c.icon}</div>
                </div>
                <p className={cn("text-2xl font-black tabular-nums number-font", c.ok ? "text-trading-green" : "text-trading-red")}>{c.value}</p>
                {c.pct !== null && (
                  <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${c.pct}%` }} transition={{ duration: 1.2, delay: 0.3 }} className={cn("h-full rounded-full", c.ok ? "bg-trading-green" : "bg-trading-red")} />
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">{c.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

    </motion.div>
  )
}
