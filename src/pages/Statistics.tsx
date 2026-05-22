import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Zap,
  Award,
  Calendar
} from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { StatCard } from '@/components/StatCard'
import { AccountSelector } from '@/components/AccountSelector'
import { PeriodSelector } from '@/components/PeriodSelector'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import {
  calculateMonthlyPerformance,
  calculateDayPerformance,
  calculateHourPerformance,
  calculateAssetPerformance,
  calculateDirectionPerformance
} from '@/lib/statsCalculator'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
        <p className="font-medium" style={{ color: data.color }}>
          {data.name} : <span className="font-bold text-foreground">{data.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function Statistics() {
  const trades = useStore(s => s.trades)
  const dashboardStats = useStore(s => s.dashboardStats)
  const advancedStats = useStore(s => s.advancedStats)
  const selectedAccountId = useStore(s => s.selectedAccountId)
  const selectedPeriod = useStore(s => s.selectedPeriod)

  const [monthlyPerformance, setMonthlyPerformance] = useState<any[]>([])
  const [dayPerformance, setDayPerformance] = useState<any[]>([])
  const [hourPerformance, setHourPerformance] = useState<any[]>([])
  const [assetPerformance, setAssetPerformance] = useState<any[]>([])
  const [directionPerformance, setDirectionPerformance] = useState<any[]>([])

  const loadChartData = useCallback(async () => {
    const filters: any = {}
    if (selectedAccountId) filters.accountId = selectedAccountId
    if (selectedPeriod?.startDate) filters.startDate = selectedPeriod.startDate
    if (selectedPeriod?.endDate) filters.endDate = selectedPeriod.endDate

    const monthly = calculateMonthlyPerformance(trades, filters)
    const dayStats = calculateDayPerformance(trades, filters)
    const hourStats = calculateHourPerformance(trades, filters)
    const assetStats = calculateAssetPerformance(trades, filters)
    const dirStats = calculateDirectionPerformance(trades, filters)
    setMonthlyPerformance(monthly)
    setDayPerformance(dayStats)
    setHourPerformance(hourStats)
    setAssetPerformance(assetStats)
    setDirectionPerformance(dirStats)
  }, [selectedAccountId, selectedPeriod, trades])
  // Removed local loadAllData effect since Layout handles global loading.

  useEffect(() => {
    loadChartData()
  }, [loadChartData])

  // Sample data for pie chart
  const resultDistribution = [
    { name: 'Gagnants', value: dashboardStats?.wins || 0, color: '#10B981' },
    { name: 'Perdants', value: dashboardStats?.losses || 0, color: '#EF4444' },
    { name: 'Break-even', value: Math.max(0, (dashboardStats?.totalTrades || 0) - (dashboardStats?.wins || 0) - (dashboardStats?.losses || 0)), color: '#F59E0B' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistiques Avancées</h1>
          <p className="text-muted-foreground mt-1">
            Analyse détaillée de votre performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <PeriodSelector />
          <AccountSelector />
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Win Rate"
          value={dashboardStats?.winRate || 0}
          format="percent"
          subtitle={`${dashboardStats?.wins || 0} victoires / ${dashboardStats?.losses || 0} défaites`}
          icon={<Target className="h-5 w-5" />}
          delay={0}
        />
        <StatCard
          title="Profit Factor"
          value={advancedStats?.profitFactor || 0}
          format="number"
          subtitle={`${formatCurrency(advancedStats?.grossProfit || 0)} / ${formatCurrency(advancedStats?.grossLoss || 0)}`}
          icon={<Activity className="h-5 w-5" />}
          delay={0.1}
        />
        <StatCard
          title="Expectancy"
          value={advancedStats?.expectancy || 0}
          format="currency"
          subtitle="Gain moyen par trade"
          icon={<Zap className="h-5 w-5" />}
          delay={0.2}
        />
        <StatCard
          title="Total Trades"
          value={dashboardStats?.totalTrades || 0}
          subtitle="Trades enregistrés"
          icon={<BarChart3 className="h-5 w-5" />}
          delay={0.3}
        />
      </motion.div>

      {/* Advanced Stats Grid */}
      <motion.div
        variants={itemVariants}
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="drawdown">Drawdown</TabsTrigger>
            <TabsTrigger value="streaks">Séries</TabsTrigger>
            <TabsTrigger value="analyse">Analyse</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Averages */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Moyennes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-trading-green/10 border border-trading-green/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-trading-green/20">
                        <TrendingUp className="h-5 w-5 text-trading-green" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gain moyen</p>
                        <p className="text-xl font-bold text-trading-green">
                          +{formatCurrency(advancedStats?.avgWin || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-trading-red/10 border border-trading-red/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-trading-red/20">
                        <TrendingDown className="h-5 w-5 text-trading-red" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Perte moyenne</p>
                        <p className="text-xl font-bold text-trading-red">
                          {formatCurrency(-(advancedStats?.avgLoss || 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Ratio Gain/Perte</p>
                        <p className="text-xl font-bold text-primary">
                          {advancedStats && advancedStats.avgLoss && advancedStats.avgWin && advancedStats.avgLoss > 0
                            ? (advancedStats.avgWin / advancedStats.avgLoss).toFixed(2)
                            : '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Result Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Distribution des Résultats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={resultDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {resultDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-4">
                    {resultDistribution.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {item.name}: {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Performance Mensuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyPerformance} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis
                        dataKey="month"
                        tickFormatter={(value) => {
                          const [year, month] = value.split('-')
                          return `${month}/${year.slice(2)}`
                        }}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)'
                        }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Bar
                        dataKey="pnl"
                        fill="#3B82F6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Assets */}
            {assetPerformance.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Performance par Actif (Paire)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={assetPerformance.slice(0, 10)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis
                          dataKey="asset"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis
                          tickFormatter={(value) => `$${value > 1000 || value < -1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)'
                          }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Bar
                          dataKey="pnl"
                          radius={[4, 4, 0, 0]}
                        >
                          {assetPerformance.slice(0, 10).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trades" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Trades Gagnants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-trading-green">
                    {dashboardStats?.wins || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {formatPercent(dashboardStats?.winRate || 0)} du total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Trades Perdants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-trading-red">
                    {dashboardStats?.losses || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {formatPercent(100 - (dashboardStats?.winRate || 0))} du total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Profit Brut</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-4xl font-bold",
                    (advancedStats?.grossProfit || 0) >= 0 ? 'text-trading-green' : 'text-trading-red'
                  )}>
                    {formatCurrency(advancedStats?.grossProfit || 0)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Perte brute: {formatCurrency(-(advancedStats?.grossLoss || 0))}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Long vs Short */}
            <div className="grid gap-6 lg:grid-cols-2 mt-6">
              {directionPerformance.map((dir) => (
                <Card key={dir.direction}>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      {dir.direction === 'Long (Achat)' ? <TrendingUp className="h-5 w-5 text-trading-green" /> : <TrendingDown className="h-5 w-5 text-trading-red" />}
                      Performance {dir.direction}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border">
                        <div>
                          <p className="text-sm text-muted-foreground">Profit Net</p>
                          <p className={cn("text-2xl font-bold", dir.pnl >= 0 ? "text-trading-green" : "text-trading-red")}>
                            {formatCurrency(dir.pnl)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Win Rate</p>
                          <p className="text-2xl font-bold">
                            {formatPercent(dir.winRate)}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Trades</p>
                          <p className="text-xl">{dir.trades}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Gagnants</p>
                          <p className="text-xl text-trading-green">{dir.wins}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Perdants</p>
                          <p className="text-xl text-trading-red">{dir.losses}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="drawdown" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Analyse du Drawdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Drawdown Actuel</p>
                    <p className="text-2xl font-bold text-trading-red">
                      {formatCurrency(dashboardStats?.currentDrawdown || 0)}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Drawdown Maximum</p>
                    <p className="text-2xl font-bold text-trading-orange">
                      {formatCurrency(dashboardStats?.maxDrawdown || 0)}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Utilisation</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      (dashboardStats?.drawdownPercent || 0) > 80 ? 'text-trading-red' : 'text-trading-green'
                    )}>
                      {formatPercent(dashboardStats?.drawdownPercent || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="streaks" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Award className="h-5 w-5 text-trading-green" />
                    Série de Victoires
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-trading-green">
                    {advancedStats?.maxConsecutiveWins || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Plus longue série de trades gagnants consécutifs
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-trading-red" />
                    Série de Défaites
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-trading-red">
                    {advancedStats?.maxConsecutiveLosses || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Plus longue série de trades perdants consécutifs
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analyse" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Best Day */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-trading-green" />
                    Meilleur Jour
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dayPerformance.length > 0 && (
                    (() => {
                      const winningDays = dayPerformance.filter(d => d.pnl > 0)
                      if (winningDays.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                            <p>Aucun jour gagnant</p>
                          </div>
                        )
                      }
                      const best = winningDays.reduce((a, b) => a.pnl > b.pnl ? a : b)
                      return (
                        <div>
                          <div className="text-3xl font-bold text-trading-green">{best.day}</div>
                          <div className="text-lg font-semibold mt-2">{formatCurrency(best.pnl)}</div>
                          <p className="text-xs text-muted-foreground mt-1">{best.trades} trades  •  {best.winRate.toFixed(1)}% win rate</p>
                        </div>
                      )
                    })()
                  )}
                </CardContent>
              </Card>

              {/* Worst Day */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-trading-red" />
                    Pire Jour
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dayPerformance.length > 0 && (
                    (() => {
                      const losingDays = dayPerformance.filter(d => d.pnl < 0)
                      if (losingDays.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                            <Award className="h-8 w-8 mb-2 opacity-50 text-trading-green" />
                            <p>Aucun jour perdant</p>
                          </div>
                        )
                      }
                      const worst = losingDays.reduce((a, b) => a.pnl < b.pnl ? a : b)
                      return (
                        <div>
                          <div className="text-3xl font-bold text-trading-red">{worst.day}</div>
                          <div className="text-lg font-semibold mt-2">{formatCurrency(worst.pnl)}</div>
                          <p className="text-xs text-muted-foreground mt-1">{worst.trades} trades  •  {worst.winRate.toFixed(1)}% win rate</p>
                        </div>
                      )
                    })()
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Performance par jour de la semaine */}
            {dayPerformance.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Performance par Jour
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dayPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="pnl" fill="#3b82f6" name="P&L" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Performance par heure */}
            {hourPerformance.length > 0 && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Meilleure Heure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const winningHours = hourPerformance.filter(h => h.pnl > 0)
                      if (winningHours.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-2 text-muted-foreground">
                            <p>Aucune heure gagnante</p>
                          </div>
                        )
                      }
                      const best = winningHours.reduce((a, b) => a.pnl > b.pnl ? a : b)
                      return (
                        <div>
                          <div className="text-3xl font-bold text-trading-green">{best.hour}</div>
                          <div className="text-lg font-semibold mt-2">{formatCurrency(best.pnl)}</div>
                          <p className="text-xs text-muted-foreground mt-1">{best.trades} trades  •  Moyenne: {formatCurrency(best.avgPnl)}</p>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Pire Heure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const losingHours = hourPerformance.filter(h => h.pnl < 0)
                      if (losingHours.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-2 text-muted-foreground">
                            <Award className="h-6 w-6 mb-2 opacity-50 text-trading-green" />
                            <p>Aucune heure perdante</p>
                          </div>
                        )
                      }
                      const worst = losingHours.reduce((a, b) => a.pnl < b.pnl ? a : b)
                      return (
                        <div>
                          <div className="text-3xl font-bold text-trading-red">{worst.hour}</div>
                          <div className="text-lg font-semibold mt-2">{formatCurrency(worst.pnl)}</div>
                          <p className="text-xs text-muted-foreground mt-1">{worst.trades} trades  •  Moyenne: {formatCurrency(worst.avgPnl)}</p>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Performance par heure graphique */}
            {hourPerformance.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Performance par Heure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={hourPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="pnl" fill="#3b82f6" name="P&L" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
