import { motion } from 'framer-motion'
import { Search, Filter, TrendingUp, Calendar, Plus, Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/DatePicker'
import type { TradeResult } from '@/types'

const results: TradeResult[] = ['TP', 'SL', 'BE', 'GAIN', 'PERTE', 'BE+', 'BE-', 'EN COURS']

interface TradeFiltersProps {
  filters: {
    searchQuery: string
    setSearchQuery: (val: string) => void
    resultFilter: string
    setResultFilter: (val: string) => void
    directionFilter: string
    setDirectionFilter: (val: string) => void
    dateFrom: string
    setDateFrom: (val: string) => void
    dateTo: string
    setDateTo: (val: string) => void
    showDateFilter: boolean
    setShowDateFilter: (val: boolean) => void
  }
  onExportCSV: () => void
  onAddTrade: () => void
}

export function TradeFilters({
  filters: {
    searchQuery, setSearchQuery,
    resultFilter, setResultFilter,
    directionFilter, setDirectionFilter,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    showDateFilter, setShowDateFilter
  },
  onExportCSV,
  onAddTrade
}: TradeFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Trades</h2>
          <p className="text-sm text-muted-foreground">
            Gérez et analysez votre historique de trading
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={onExportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exporter CSV</span>
          </Button>
          <Button onClick={onAddTrade} className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            Nouveau Trade
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-3 md:p-4">
        <div className="flex flex-col gap-3">
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un actif..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
          <div className="flex flex-row flex-nowrap overflow-x-auto pb-1 gap-2 hide-scrollbar w-full">
            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className="w-[140px] md:w-[150px] shrink-0">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Résultat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous résultats</SelectItem>
                {results.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={directionFilter} onValueChange={setDirectionFilter}>
              <SelectTrigger className="w-[140px] md:w-[150px] shrink-0">
                <TrendingUp className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Les deux</SelectItem>
                <SelectItem value="BUY">Long (Buy)</SelectItem>
                <SelectItem value="SELL">Short (Sell)</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showDateFilter || dateFrom || dateTo ? 'default' : 'outline'}
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="gap-2 shrink-0"
            >
              <Calendar className="h-4 w-4" />
              {dateFrom || dateTo ? (
                <span className="text-xs font-semibold">Dates filtrées</span>
              ) : (
                <span>Filtrer par date</span>
              )}
            </Button>
            {(dateFrom || dateTo) && (
              <Button
                variant="outline"
                onClick={() => {
                  setDateFrom('')
                  setDateTo('')
                  setShowDateFilter(false)
                }}
                className="whitespace-nowrap shrink-0"
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </div>

        {/* Date Filter Section (Collapsible) */}
        {showDateFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4"
          >
            <div>
              <label className="mb-2 block text-sm font-medium">Depuis</label>
              <DatePicker
                value={dateFrom}
                onChange={setDateFrom}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Jusqu'au</label>
              <DatePicker
                value={dateTo}
                onChange={setDateTo}
              />
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
    </div>
  )
}
