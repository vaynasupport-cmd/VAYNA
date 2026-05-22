import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'

interface EquityChartProps {
  data?: Array<{ date: string; equity: number; pnl: number }>
  title?: string
  showHeader?: boolean
}

export function EquityChart({ 
  data: propData, 
  title = "Courbe d'Equity",
  showHeader = true 
}: EquityChartProps) {

  // Use only real data
  const data = useMemo(() => {
    if (propData && propData.length > 0) return propData
    return [] // No data
  }, [propData])

  const stats = useMemo(() => {
    if (data.length === 0) return null
    
    const startEquity = data[0].equity
    const endEquity = data[data.length - 1].equity
    const totalReturn = ((endEquity - startEquity) / startEquity) * 100
    
    let maxEquity = startEquity
    let maxDrawdown = 0
    
    for (const point of data) {
      if (point.equity > maxEquity) {
        maxEquity = point.equity
      }
      const drawdown = ((maxEquity - point.equity) / maxEquity) * 100
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    }
    
    return {
      totalReturn,
      maxDrawdown,
      startEquity,
      endEquity,
    }
  }, [data])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const equity = payload[0].value
      const pnl = payload[0].payload.pnl
      
      return (
        <div className="rounded-lg border bg-popover p-3 shadow-lg">
          <p className="text-sm font-medium">{formatDate(label)}</p>
          <p className="text-lg font-bold text-primary">
            {formatCurrency(equity)}
          </p>
          <p className={`text-sm ${pnl >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
            {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Card className="overflow-hidden">
        {showHeader && (
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              {stats && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Rendement:</span>
                    <span className={stats.totalReturn >= 0 ? 'text-trading-green' : 'text-trading-red'}>
                      {stats.totalReturn >= 0 ? '+' : ''}{stats.totalReturn.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Max DD:</span>
                    <span className="text-trading-red">
                      -{stats.maxDrawdown.toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
        )}
        <CardContent>
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <p className="text-center">Aucune donnée disponible. Ajoutez des trades pour voir la courbe d'equity.</p>
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getDate()}/${date.getMonth() + 1}`
                    }}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#equityGradient)"
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
