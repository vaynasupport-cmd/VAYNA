import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Edit2, Trash2, Image as ImageIcon, Plus, TrendingUp, TrendingDown, Clock, Minus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MobileTradeCard } from '@/components/MobileTradeCard'
import { cn, formatCurrency, formatDate, getResultColor, getResultBgColor } from '@/lib/utils'
import type { Trade } from '@/types'

interface TradeListProps {
  paginatedTrades: Trade[]
  filteredTrades: Trade[]
  accounts: any[]
  currentPage: number
  totalPages: number
  itemsPerPage: number
  setCurrentPage: (page: number | ((prev: number) => number)) => void
  onView: (trade: Trade) => void
  onEdit: (trade: Trade) => void
  onDelete: (trade: Trade) => void
  onScreenshots: (trade: Trade) => void
  onDeleteAll: () => void
  onAddTrade: () => void
}

export function TradeList({
  paginatedTrades,
  filteredTrades,
  accounts,
  currentPage,
  totalPages,
  itemsPerPage,
  setCurrentPage,
  onView,
  onEdit,
  onDelete,
  onScreenshots,
  onDeleteAll,
  onAddTrade
}: TradeListProps) {
  const getResultIcon = (result: string) => {
    switch (result) {
      case 'TP':
      case 'GAIN':
      case 'BE+':
        return <TrendingUp className="h-4 w-4" />
      case 'SL':
      case 'PERTE':
      case 'BE-':
        return <TrendingDown className="h-4 w-4" />
      case 'EN COURS':
        return <Clock className="h-4 w-4" />
      default:
        return <Minus className="h-4 w-4" />
    }
  }

  return (
    <>
      {/* Trades — Mobile Card View */}
      <div className="md:hidden space-y-3">
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeleteAll}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-7 px-2 text-xs transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Vider l'historique
          </Button>
        </div>
        {paginatedTrades.map((trade, index) => (
          <MobileTradeCard
            key={trade.id}
            trade={trade}
            account={accounts.find(a => a.id === trade.accountId)}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onScreenshots={onScreenshots}
            index={index}
          />
        ))}
        {filteredTrades.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-3">
              <TrendingUp className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium">Aucun trade trouvé</h3>
            <p className="text-sm text-muted-foreground mt-1">Commencez par ajouter votre premier trade</p>
            <Button onClick={onAddTrade} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un trade
            </Button>
          </div>
        )}
        {/* Mobile pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1 py-3">
            <p className="text-xs text-muted-foreground">
              {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredTrades.length)} / {filteredTrades.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs tabular-nums">{currentPage}/{totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Trades Table — Desktop Only */}
      <div className="hidden md:block space-y-2">
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeleteAll}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-7 px-2 text-xs transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Vider l'historique
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-1.5 py-1.5 text-left text-[11px] font-medium text-muted-foreground whitespace-nowrap">Date</th>
                    <th className="px-1.5 py-1.5 text-left text-[11px] font-medium text-muted-foreground whitespace-nowrap">Compte</th>
                    <th className="px-1.5 py-1.5 text-left text-[11px] font-medium text-muted-foreground whitespace-nowrap">Actif</th>
                    <th className="px-1.5 py-1.5 text-left text-[11px] font-medium text-muted-foreground whitespace-nowrap">Direction</th>
                    <th className="px-1.5 py-1.5 text-left text-[11px] font-medium text-muted-foreground whitespace-nowrap">Résultat</th>
                    <th className="px-1.5 py-1.5 text-right text-[11px] font-medium text-muted-foreground whitespace-nowrap">Commission</th>
                    <th className="px-1.5 py-1.5 text-right text-[11px] font-medium text-muted-foreground whitespace-nowrap">Profit</th>
                    <th className="px-1.5 py-1.5 text-right text-[11px] font-medium text-muted-foreground whitespace-nowrap">P&L Net</th>
                    <th className="px-1.5 py-1.5 text-right text-[11px] font-medium text-muted-foreground whitespace-nowrap">R</th>
                    <th className="px-1.5 py-1.5 text-center text-[11px] font-medium text-muted-foreground whitespace-nowrap">Screenshots</th>
                    <th className="px-1.5 py-1.5 text-right text-[11px] font-medium text-muted-foreground whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {paginatedTrades.map((trade) => (
                      <motion.tr
                        key={trade.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-1.5 py-1.5 text-xs whitespace-nowrap">
                          <div>
                            <p>{formatDate(trade.date)}</p>
                            {trade.createdDateTime && (
                              <p className="text-[10px] text-muted-foreground">
                                {new Date(trade.createdDateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-1.5 py-1.5 text-xs">
                          {(() => {
                            const account = accounts.find(a => a.id === trade.accountId);
                            return (
                              <div>
                                <p className="font-medium whitespace-nowrap">{account?.name || 'Inconnu'}</p>
                                {account?.propFirm && <p className="text-[10px] text-muted-foreground whitespace-nowrap">{account.propFirm}</p>}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-1.5 py-1.5 text-xs">
                          <div>
                            <p className="font-medium whitespace-nowrap">{trade.asset}</p>
                            <p className="text-[10px] text-muted-foreground whitespace-nowrap">{trade.timeframe}</p>
                          </div>
                        </td>
                        <td className="px-1.5 py-1.5 text-xs">
                          <Badge
                            variant="outline"
                            className={cn("px-1 py-0 text-[11px]",
                              trade.direction === 'BUY'
                                ? 'bg-trading-green/10 text-trading-green border-trading-green/30'
                                : 'bg-trading-red/10 text-trading-red border-trading-red/30'
                            )}
                          >
                            {trade.direction}
                          </Badge>
                        </td>
                        <td className="px-1.5 py-1.5 text-xs">
                          <Badge
                            variant="outline"
                            className={cn("gap-1 px-1 py-0 text-[11px] whitespace-nowrap", getResultBgColor(trade.result))}
                          >
                            {getResultIcon(trade.result)}
                            {trade.result}
                          </Badge>
                        </td>
                        <td className={cn("px-1.5 py-1.5 text-xs text-right whitespace-nowrap", (trade.commission || 0) < 0 ? 'text-trading-red' : 'text-muted-foreground')}>
                          {trade.commission != null ? formatCurrency(trade.commission) : '-'}
                        </td>
                        <td className={cn("px-1.5 py-1.5 text-xs text-right font-medium whitespace-nowrap", (trade.pnlAmount - (trade.commission || 0) - (trade.swap || 0)) >= 0 ? 'text-trading-green' : 'text-trading-red')}>
                          {formatCurrency(trade.pnlAmount - (trade.commission || 0) - (trade.swap || 0))}
                        </td>
                        <td className={cn(
                          "px-1.5 py-1.5 text-xs text-right font-bold whitespace-nowrap",
                          getResultColor(trade.result)
                        )}>
                          {trade.pnlAmount >= 0 ? '+' : ''}{formatCurrency(trade.pnlAmount)}
                        </td>
                        <td className="px-1.5 py-1.5 text-xs text-right whitespace-nowrap">
                          {trade.rMultiple !== undefined && trade.rMultiple !== null ? (
                            <span className={cn(
                              trade.rMultiple >= 0 ? 'text-trading-green' : 'text-trading-red'
                            )}>
                              {trade.rMultiple > 0 ? '+' : ''}{trade.rMultiple.toFixed(2)}R
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-1.5 py-1.5 text-xs text-center">
                          <button
                            onClick={() => onScreenshots(trade)}
                            className="inline-flex items-center justify-center p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                            title="Voir les screenshots"
                          >
                            <ImageIcon className="h-4 w-4" />
                          </button>
                        </td>
                        <td className="px-1.5 py-1.5 text-xs text-right">
                          <div className="flex justify-end gap-0.5">
                            <button
                              onClick={() => onView(trade)}
                              className="p-1 rounded-md hover:bg-primary/20 hover:text-primary transition-colors"
                              title="Détails"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => onEdit(trade)}
                              className="p-1 rounded-md hover:bg-accent transition-colors"
                              title="Modifier"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => onDelete(trade)}
                              className="p-1 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/10">
                <div className="text-sm text-muted-foreground">
                  Affichage de <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> à <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, filteredTrades.length)}</span> sur <span className="font-medium text-foreground">{filteredTrades.length}</span> trades
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm px-2">
                    Page {currentPage} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {filteredTrades.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Aucun trade trouvé</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Commencez par ajouter votre premier trade
                </p>
                <Button onClick={onAddTrade} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter un trade
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
