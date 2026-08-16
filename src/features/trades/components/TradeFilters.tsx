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

      {/* Search & Filters Command Bar */}
      <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-1.5 flex flex-col lg:flex-row gap-2 relative z-10 group">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/70 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Rechercher un actif, une devise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-transparent border-0 shadow-none focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/70 text-base sm:text-sm"
          />
        </div>
        
        {/* Divider */}
        <div className="hidden lg:block w-px bg-border/50 my-2" />
        
        {/* Filters */}
        <div className="flex flex-row overflow-x-auto hide-scrollbar gap-2 px-1 pb-1 lg:pb-0 items-center">
          <Select value={resultFilter} onValueChange={setResultFilter}>
            <SelectTrigger className="h-11 bg-secondary/40 border-0 hover:bg-secondary/60 focus:ring-1 focus:ring-primary/30 transition-colors rounded-xl px-4 min-w-[150px] shadow-none">
              <Filter className="h-3.5 w-3.5 mr-2 text-primary" />
              <span className="font-medium text-sm"><SelectValue placeholder="Résultat" /></span>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 shadow-lg">
              <SelectItem value="all" className="rounded-lg">Tous résultats</SelectItem>
              {results.map(r => (
                <SelectItem key={r} value={r} className="rounded-lg">{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={directionFilter} onValueChange={setDirectionFilter}>
            <SelectTrigger className="h-11 bg-secondary/40 border-0 hover:bg-secondary/60 focus:ring-1 focus:ring-primary/30 transition-colors rounded-xl px-4 min-w-[130px] shadow-none">
              <TrendingUp className="h-3.5 w-3.5 mr-2 text-primary" />
              <span className="font-medium text-sm"><SelectValue placeholder="Direction" /></span>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 shadow-lg">
              <SelectItem value="all" className="rounded-lg">Les deux</SelectItem>
              <SelectItem value="BUY" className="rounded-lg text-trading-green focus:text-trading-green font-medium">Long (Buy)</SelectItem>
              <SelectItem value="SELL" className="rounded-lg text-trading-red focus:text-trading-red font-medium">Short (Sell)</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showDateFilter || dateFrom || dateTo ? 'default' : 'secondary'}
            onClick={() => setShowDateFilter(!showDateFilter)}
            className={`h-11 rounded-xl gap-2 shrink-0 px-4 transition-all shadow-none ${
              !(showDateFilter || dateFrom || dateTo) && 'bg-secondary/40 hover:bg-secondary/60 border-0 font-medium'
            }`}
          >
            <Calendar className="h-4 w-4" />
            {dateFrom || dateTo ? (
              <span className="font-semibold">Dates actives</span>
            ) : (
              <span>Dates</span>
            )}
          </Button>
          
          {(dateFrom || dateTo) && (
            <Button
              variant="ghost"
              onClick={() => {
                setDateFrom('')
                setDateTo('')
                setShowDateFilter(false)
              }}
              className="h-11 rounded-xl px-4 shrink-0 text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors font-medium"
            >
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

        {/* Date Filter Section (Collapsible) */}
        {showDateFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-4 flex flex-wrap gap-4 shadow-sm relative z-20"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">Depuis</label>
              <DatePicker
                value={dateFrom}
                onChange={setDateFrom}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">Jusqu'au</label>
              <DatePicker
                value={dateTo}
                onChange={setDateTo}
              />
            </div>
          </motion.div>
        )}
    </div>
  )
}
