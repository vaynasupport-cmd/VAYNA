import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon?: React.ReactNode
  delay?: number
  className?: string
  valueClassName?: string
  format?: 'currency' | 'percent' | 'number'
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  delay = 0,
  className,
  valueClassName,
  format = 'number',
}: StatCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val
    switch (format) {
      case 'currency': return formatCurrency(val)
      case 'percent':  return formatPercent(val)
      default:         return val.toLocaleString()
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':   return <TrendingUp  className="h-3.5 w-3.5 text-trading-green" />
      case 'down': return <TrendingDown className="h-3.5 w-3.5 text-trading-red" />
      default:     return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':   return 'text-trading-green'
      case 'down': return 'text-trading-red'
      default:     return 'text-muted-foreground'
    }
  }

  const iconBg = trend === 'up'
    ? 'bg-trading-green/10 text-trading-green'
    : trend === 'down'
    ? 'bg-trading-red/10 text-trading-red'
    : 'bg-primary/10 text-primary'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group"
    >
      <Card className={cn(
        "relative overflow-hidden border border-border/60 transition-all duration-300",
        "hover:border-[rgba(59,130,246,0.3)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.15),0_0_0_1px_rgba(59,130,246,0.1)]",
        className
      )}>
        {/* Blue halo glow behind card on hover */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
             style={{ boxShadow: '0 0 40px rgba(59,130,246,0.12), inset 0 0 20px rgba(59,130,246,0.04)' }} />

        {/* Subtle shimmer on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
             style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.03) 0%, transparent 60%)' }} />

        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5 flex-1 min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                {title}
              </p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <motion.h3
                  className={cn("text-2xl font-bold tracking-tight", valueClassName)}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: delay + 0.1 }}
                >
                  {formatValue(value)}
                </motion.h3>
                {trend && trendValue && (
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full",
                    trend === 'up'   ? 'bg-trading-green/10 text-trading-green' :
                    trend === 'down' ? 'bg-trading-red/10 text-trading-red' :
                                      'bg-muted text-muted-foreground',
                    getTrendColor()
                  )}>
                    {getTrendIcon()}
                    <span>{trendValue}</span>
                  </div>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
            {icon && (
              <div className={cn(
                "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                "group-hover:scale-110 group-hover:shadow-lg",
                iconBg
              )}>
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
