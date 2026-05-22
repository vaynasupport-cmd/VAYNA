import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Calendar, CalendarDays, SlidersHorizontal } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { cn } from '@/lib/utils'
import { 
  startOfDay, endOfDay, 
  startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, 
  startOfYear, endOfYear,
  subDays, subWeeks, subMonths
} from 'date-fns'

const PERIODS = [
  { id: 'all', label: 'Tout le temps' },
  { id: 'today', label: "Aujourd'hui" },
  { id: 'yesterday', label: 'Hier' },
  { id: 'thisWeek', label: 'Cette semaine' },
  { id: 'lastWeek', label: 'Semaine dernière' },
  { id: 'thisMonth', label: 'Ce mois' },
  { id: 'lastMonth', label: 'Mois dernier' },
  { id: 'thisYear', label: 'Cette année' },
  { id: 'custom', label: 'Plage personnalisée' },
]

export function PeriodSelector() {
  const selectedPeriod = useStore(s => s.selectedPeriod)
  const setSelectedPeriod = useStore(s => s.setSelectedPeriod)
  const [isOpen, setIsOpen] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const handleSelect = (periodId: string) => {
    if (periodId === 'custom') {
      setShowCustom(true)
      return
    }

    setShowCustom(false)
    const period = PERIODS.find(p => p.id === periodId)
    if (!period) return

    const now = new Date()
    let startDate: string | undefined
    let endDate: string | undefined

    switch (periodId) {
      case 'today':
        startDate = startOfDay(now).toISOString()
        endDate = endOfDay(now).toISOString()
        break
      case 'yesterday':
        const yesterday = subDays(now, 1)
        startDate = startOfDay(yesterday).toISOString()
        endDate = endOfDay(yesterday).toISOString()
        break
      case 'thisWeek':
        startDate = startOfWeek(now, { weekStartsOn: 1 }).toISOString()
        endDate = endOfWeek(now, { weekStartsOn: 1 }).toISOString()
        break
      case 'lastWeek':
        const lastWk = subWeeks(now, 1)
        startDate = startOfWeek(lastWk, { weekStartsOn: 1 }).toISOString()
        endDate = endOfWeek(lastWk, { weekStartsOn: 1 }).toISOString()
        break
      case 'thisMonth':
        startDate = startOfMonth(now).toISOString()
        endDate = endOfMonth(now).toISOString()
        break
      case 'lastMonth':
        const lastMo = subMonths(now, 1)
        startDate = startOfMonth(lastMo).toISOString()
        endDate = endOfMonth(lastMo).toISOString()
        break
      case 'thisYear':
        startDate = startOfYear(now).toISOString()
        endDate = endOfYear(now).toISOString()
        break
      case 'all':
      default:
        startDate = undefined
        endDate = undefined
        break
    }

    if (periodId === 'all') {
      setSelectedPeriod(null)
    } else {
      setSelectedPeriod({
        id: period.id,
        label: period.label,
        startDate,
        endDate
      })
    }
    
    setIsOpen(false)
  }

  const handleApplyCustom = () => {
    if (!customFrom && !customTo) return

    const startDate = customFrom
      ? startOfDay(new Date(customFrom)).toISOString()
      : undefined
    const endDate = customTo
      ? endOfDay(new Date(customTo)).toISOString()
      : undefined

    const label = customFrom && customTo
      ? `${customFrom} → ${customTo}`
      : customFrom
        ? `Depuis ${customFrom}`
        : `Jusqu'au ${customTo}`

    setSelectedPeriod({
      id: 'custom',
      label,
      startDate,
      endDate,
    })

    setIsOpen(false)
    setShowCustom(false)
  }

  const currentLabel = selectedPeriod?.label || 'Tout le temps'
  const isCustomActive = selectedPeriod?.id === 'custom'

  return (
    <div className="relative z-20">
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) setShowCustom(isCustomActive)
        }}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 transition-all duration-200 hover:border-orange-500/50 hover:shadow-md hover:shadow-orange-500/5 w-[200px]",
          isOpen && "border-orange-500/50 ring-2 ring-orange-500/20"
        )}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-orange-500/10">
          <CalendarDays className="h-3.5 w-3.5 text-orange-500" />
        </div>
        
        <div className="flex-1 text-left min-w-0">
          <p className="font-medium truncate text-xs leading-tight">{currentLabel}</p>
          <p className="text-[10px] text-muted-foreground leading-tight">Période</p>
        </div>
        
        <ChevronDown className={cn(
          "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
          isOpen && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30"
              onClick={() => { setIsOpen(false); setShowCustom(false) }}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 z-40 mt-2 rounded-xl border border-border bg-popover shadow-xl"
              style={{ minWidth: '240px' }}
            >
              <div className="p-2 flex flex-col gap-1">
                {PERIODS.map((period) => {
                  const isSelected = period.id === 'custom'
                    ? isCustomActive
                    : (selectedPeriod?.id === period.id) || (!selectedPeriod && period.id === 'all')
                  return (
                    <button
                      key={period.id}
                      onClick={() => handleSelect(period.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        isSelected || (showCustom && period.id === 'custom')
                          ? "bg-orange-500/10 text-orange-500" 
                          : "hover:bg-accent text-foreground"
                      )}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {period.id === 'custom'
                          ? <SlidersHorizontal className="h-4 w-4" />
                          : <Calendar className="h-4 w-4" />
                        }
                      </div>
                      <span className="flex-1 text-left font-medium">{period.label}</span>
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-orange-500" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Custom date range panel */}
              <AnimatePresence>
                {showCustom && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border px-3 pb-3 pt-3 flex flex-col gap-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Plage de dates
                      </p>
                      <div className="flex flex-col gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Depuis</label>
                          <input
                            type="date"
                            value={customFrom}
                            onChange={e => setCustomFrom(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Jusqu'au</label>
                          <input
                            type="date"
                            value={customTo}
                            min={customFrom || undefined}
                            onChange={e => setCustomTo(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleApplyCustom}
                        disabled={!customFrom && !customTo}
                        className="w-full rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Appliquer
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
