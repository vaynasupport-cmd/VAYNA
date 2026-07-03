import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Eye, Edit2, Trash2, Image as ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency, formatDate, getResultColor, getResultBgColor } from '@/lib/utils'
import type { Trade, Account } from '@/types'

interface MobileTradeCardProps {
  trade: Trade
  account?: Account
  onView: (trade: Trade) => void
  onEdit: (trade: Trade) => void
  onDelete: (trade: Trade) => void
  onScreenshots: (trade: Trade) => void
  index: number
}

export function MobileTradeCard({ trade, account, onView, onEdit, onDelete, onScreenshots, index }: MobileTradeCardProps) {
  const netPnl = trade.pnlAmount - (trade.commission || 0) - (trade.swap || 0)
  const isPositive = netPnl >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="bg-card rounded-xl border border-border/50 overflow-hidden active:scale-[0.98] transition-transform duration-150"
    >
      {/* Top color accent bar */}
      <div className={cn(
        "h-0.5",
        isPositive ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-red-500 to-rose-400"
      )} />

      <div className="p-3.5">
        {/* Row 1: Asset + Direction + Result */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold",
              trade.direction === 'BUY'
                ? "bg-emerald-500/15 text-emerald-500"
                : "bg-red-500/15 text-red-500"
            )}>
              {trade.direction === 'BUY' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">{trade.asset}</p>
              <p className="text-[10px] text-muted-foreground">
                {trade.timeframe} · {account?.name || 'Inconnu'}
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn("text-[10px] px-2 py-0.5 font-semibold", getResultBgColor(trade.result))}
          >
            {trade.result}
          </Badge>
        </div>

        {/* Row 2: P&L + Date */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-medium mb-0.5">P&L Net</p>
            <p className={cn(
              "text-lg font-black number-font tracking-tight leading-none",
              isPositive ? "text-emerald-500" : "text-red-500"
            )}>
              {isPositive ? '+' : ''}{formatCurrency(netPnl)}
            </p>
            {trade.rMultiple !== undefined && trade.rMultiple !== null && (
              <p className={cn(
                "text-xs font-semibold mt-0.5",
                trade.rMultiple >= 0 ? "text-emerald-500/80" : "text-red-500/80"
              )}>
                {trade.rMultiple > 0 ? '+' : ''}{trade.rMultiple.toFixed(2)}R
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">
              {formatDate(trade.date)}
            </p>
            {trade.createdDateTime && (
              <p className="text-[10px] text-muted-foreground/60">
                {new Date(trade.createdDateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Actions */}
        <div className="flex items-center justify-end gap-1 mt-2.5 pt-2.5 border-t border-border/30">
          <button
            onClick={() => onScreenshots(trade)}
            className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors"
            title="Screenshots"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onView(trade)}
            className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors"
            title="Détails"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onEdit(trade)}
            className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            title="Modifier"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(trade)}
            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
