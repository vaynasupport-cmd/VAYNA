import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency, formatDate, getResultColor, getResultBgColor } from '@/lib/utils'
import type { Trade } from '@/types'

interface TradeDetailsDialogProps {
  trade: Trade | null
  onClose: () => void
}

export function TradeDetailsDialog({ trade, onClose }: TradeDetailsDialogProps) {
  if (!trade) return null

  return (
    <Dialog open={!!trade} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] bg-background max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mt-2">
            <DialogTitle className="text-xl flex items-center gap-2">
              Détails du Trade
            </DialogTitle>
          </div>
          <DialogDescription>
            Vue détaillée et non-modifiable des informations d'exécution.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Top Meta Info */}
          <div className="flex flex-wrap gap-4 items-center p-4 bg-muted/50 rounded-xl border border-border">
            <div className="flex-1">
              <p className="text-sm font-semibold">{trade.asset}</p>
              <p className="text-xs text-muted-foreground">{trade.timeframe}</p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-sm px-3 py-1",
                trade.direction === 'BUY'
                  ? 'bg-trading-green/10 text-trading-green border-trading-green/30'
                  : 'bg-trading-red/10 text-trading-red border-trading-red/30'
              )}
            >
              {trade.direction === 'BUY' ? 'Achat (Long)' : 'Vente (Short)'}
            </Badge>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Volume</p>
              <p className="font-semibold">{trade.positionSize || '-'} Lots</p>
            </div>
          </div>

          {/* Execution Details grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground whitespace-nowrap">Création (Entry)</p>
              <p className="text-sm font-medium">
                {formatDate(trade.date)}<br />
                {trade.createdDateTime && new Date(trade.createdDateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Prix d'Entrée</p>
              <p className="text-sm font-medium">{trade.entryPrice || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Dernière MAJ (Exit)</p>
              <p className="text-sm font-medium">
                {trade.updatedAt ? (
                  <>
                    {formatDate(trade.updatedAt)}<br />
                    {new Date(trade.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </>
                ) : '-'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Prix de Sortie</p>
              <p className="text-sm font-medium">{trade.exitPrice || 'En cours...'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pt-4 border-t border-border">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Stop Loss</p>
              <p className="text-sm font-medium">{trade.stopLoss || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Take Profit</p>
              <p className="text-sm font-medium">{trade.takeProfit || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">R-Multiple</p>
              <p className="text-sm font-medium">{trade.rMultiple !== undefined && trade.rMultiple !== null ? `${trade.rMultiple.toFixed(2)}R` : '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Profit (Brut)</p>
              <p className={cn("text-sm font-medium", (trade.pnlAmount - (trade.commission || 0) - (trade.swap || 0)) >= 0 ? 'text-trading-green' : 'text-trading-red')}>
                {formatCurrency(trade.pnlAmount - (trade.commission || 0) - (trade.swap || 0))}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Commission</p>
              <p className={cn("text-sm font-medium", (trade.commission || 0) < 0 ? 'text-trading-red' : '')}>
                {trade.commission != null ? formatCurrency(trade.commission) : '-'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Swap</p>
              <p className={cn("text-sm font-medium", (trade.swap || 0) < 0 ? 'text-trading-red' : (trade.swap || 0) > 0 ? 'text-trading-green' : '')}>
                {trade.swap != null ? formatCurrency(trade.swap) : '-'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4 border-t border-border">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">P&L Net (Après frais)</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("px-1", getResultBgColor(trade.result))}>
                  {trade.result}
                </Badge>
                <span className={cn("text-sm font-bold", getResultColor(trade.result))}>
                  {trade.pnlAmount >= 0 ? '+' : ''}{formatCurrency(trade.pnlAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Extra info */}
          <div className="pt-4 border-t border-border grid gap-4 grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Stratégie</p>
              <Badge variant="secondary">{trade.strategy || 'Non définie'}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Émotion</p>
              <Badge variant="secondary">{trade.emotionalTag || 'Non définie'}</Badge>
            </div>
          </div>

          {trade.comment && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Commentaire</p>
              <div className="px-3 py-2 bg-muted rounded-md text-sm whitespace-pre-wrap">
                {trade.comment}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
