/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  ProfitCalendar — Premium SaaS-grade monthly calendar heatmap
 *  Shows daily P&L with intensity-based coloring, tooltips, micro-interactions
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import type { Trade } from '@/types'

// ─── Types ───────────────────────────────────────────────────────────────────

interface DayData {
  date: string          // "2026-04-15"
  pnl: number
  trades: number
}

interface ProfitCalendarProps {
  trades: Trade[]
  selectedAccountId?: string | null
  className?: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/** Get the weekday index (0=Mon … 6=Sun) for the 1st of the month */
function getFirstDayOffset(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1 // Convert Sun=0 → 6, Mon=1 → 0
}

function isToday(year: number, month: number, day: number): boolean {
  const now = new Date()
  return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day
}

/** Interpolate PnL intensity (0→1) for color opacity */
function getIntensity(pnl: number, maxAbsPnl: number): number {
  if (maxAbsPnl === 0) return 0.35
  return Math.min(0.25 + (Math.abs(pnl) / maxAbsPnl) * 0.65, 0.9)
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ProfitCalendar({ trades, selectedAccountId, className }: ProfitCalendarProps) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [direction, setDirection] = useState(0) // -1 = prev, 1 = next
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  // ─── Aggregate trades into daily data ──────────────────────────────────

  const dailyData = useMemo(() => {
    const filtered = selectedAccountId
      ? trades.filter(t => t.accountId === selectedAccountId)
      : trades

    const map = new Map<string, DayData>()

    for (const trade of filtered) {
      if (!trade.date) continue
      const dateKey = trade.date.substring(0, 10) // "2026-04-15"
      
      if (!map.has(dateKey)) {
        map.set(dateKey, { date: dateKey, pnl: 0, trades: 0 })
      }
      const entry = map.get(dateKey)!
      entry.pnl += trade.pnlAmount
      entry.trades++
    }

    return map
  }, [trades, selectedAccountId])

  // ─── Calendar grid data ────────────────────────────────────────────────

  const calendarGrid = useMemo(() => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth)
    const firstDayOffset = getFirstDayOffset(viewYear, viewMonth)
    const days: Array<{ day: number; data: DayData | null; isToday: boolean }> = []

    // Empty slots before the 1st
    for (let i = 0; i < firstDayOffset; i++) {
      days.push({ day: 0, data: null, isToday: false })
    }

    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({
        day: d,
        data: dailyData.get(dateKey) || null,
        isToday: isToday(viewYear, viewMonth, d),
      })
    }

    return days
  }, [viewYear, viewMonth, dailyData])

  // ─── Max absolute PnL for intensity scaling ────────────────────────────

  const maxAbsPnl = useMemo(() => {
    let max = 0
    for (const d of calendarGrid) {
      if (d.data) {
        max = Math.max(max, Math.abs(d.data.pnl))
      }
    }
    return max || 1
  }, [calendarGrid])

  // ─── Monthly summary stats ────────────────────────────────────────────

  const monthStats = useMemo(() => {
    let totalPnl = 0
    let totalTrades = 0
    let winDays = 0
    let lossDays = 0
    let bestDay = 0
    let worstDay = 0

    for (const d of calendarGrid) {
      if (d.data && d.data.trades > 0) {
        totalPnl += d.data.pnl
        totalTrades += d.data.trades
        if (d.data.pnl > 0) winDays++
        if (d.data.pnl < 0) lossDays++
        bestDay = Math.max(bestDay, d.data.pnl)
        worstDay = Math.min(worstDay, d.data.pnl)
      }
    }

    return { totalPnl, totalTrades, winDays, lossDays, bestDay, worstDay }
  }, [calendarGrid])

  // ─── Navigation ────────────────────────────────────────────────────────

  const goToPrevMonth = useCallback(() => {
    setDirection(-1)
    setSelectedDay(null)
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(y => y - 1)
    } else {
      setViewMonth(m => m - 1)
    }
  }, [viewMonth])

  const goToNextMonth = useCallback(() => {
    setDirection(1)
    setSelectedDay(null)
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(y => y + 1)
    } else {
      setViewMonth(m => m + 1)
    }
  }, [viewMonth])

  const goToToday = useCallback(() => {
    setDirection(0)
    setViewYear(now.getFullYear())
    setViewMonth(now.getMonth())
    setSelectedDay(null)
  }, [])

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth()

  // ─── Slide animation variants ──────────────────────────────────────────

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir >= 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir >= 0 ? -40 : 40,
      opacity: 0,
    }),
  }

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className={cn("w-full", className)}>

      {/* ═══ HEADER ═══ */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarIcon size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight leading-none">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {monthStats.totalTrades} trades • {monthStats.winDays + monthStats.lossDays} jours actifs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {!isCurrentMonth && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={goToToday}
              className="px-3 py-1.5 text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors mr-1"
            >
              Aujourd'hui
            </motion.button>
          )}
          <button
            onClick={goToPrevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-card border border-border/50 hover:bg-accent hover:border-border transition-all duration-200 active:scale-90"
          >
            <ChevronLeft size={16} className="text-muted-foreground" />
          </button>
          <button
            onClick={goToNextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-card border border-border/50 hover:bg-accent hover:border-border transition-all duration-200 active:scale-90"
          >
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* ═══ SUMMARY BAR ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3">
        {[
          {
            label: 'P&L du mois',
            value: monthStats.totalPnl,
            formatted: `${monthStats.totalPnl >= 0 ? '+' : ''}${formatCurrency(monthStats.totalPnl)}`,
            color: monthStats.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400',
            Icon: monthStats.totalPnl >= 0 ? TrendingUp : TrendingDown,
          },
          {
            label: 'Meilleur jour',
            value: monthStats.bestDay,
            formatted: monthStats.bestDay > 0 ? `+${formatCurrency(monthStats.bestDay)}` : '—',
            color: 'text-emerald-400',
            Icon: TrendingUp,
          },
          {
            label: 'Pire jour',
            value: monthStats.worstDay,
            formatted: monthStats.worstDay < 0 ? formatCurrency(monthStats.worstDay) : '—',
            color: 'text-red-400',
            Icon: TrendingDown,
          },
          {
            label: 'Jours W/L',
            value: 0,
            formatted: `${monthStats.winDays}W / ${monthStats.lossDays}L`,
            color: 'text-foreground',
            Icon: BarChart3,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-card/60 border border-border/40"
          >
            <div className={cn("flex h-6 w-6 items-center justify-center rounded-md shrink-0", 
              stat.value >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
            )}>
              <stat.Icon size={12} className={stat.color} />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] text-muted-foreground/70 uppercase tracking-wider font-medium truncate">{stat.label}</p>
              <p className={cn("text-xs font-bold tabular-nums leading-tight", stat.color)}>{stat.formatted}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ WEEKDAY HEADERS ═══ */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="flex items-center justify-center h-6 text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-widest"
          >
            {label}
          </div>
        ))}
      </div>

      {/* ═══ CALENDAR GRID ═══ */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`${viewYear}-${viewMonth}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="grid grid-cols-7 gap-1"
        >
          {calendarGrid.map((cell, idx) => (
            <DayCell
              key={idx}
              day={cell.day}
              data={cell.data}
              isToday={cell.isToday}
              isSelected={cell.day > 0 && cell.day === selectedDay}
              isHovered={cell.day > 0 && cell.day === hoveredDay}
              maxAbsPnl={maxAbsPnl}
              monthName={MONTH_NAMES[viewMonth]}
              year={viewYear}
              onHover={cell.day > 0 ? () => setHoveredDay(cell.day) : undefined}
              onLeave={() => setHoveredDay(null)}
              onClick={cell.day > 0 ? () => setSelectedDay(cell.day === selectedDay ? null : cell.day) : undefined}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* ═══ LEGEND ═══ */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-border/20">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-[4px]" style={{ backgroundColor: 'rgba(34, 197, 94, 0.5)' }} />
          <span className="text-[10px] text-muted-foreground/60 font-medium">Profit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-[4px]" style={{ backgroundColor: 'rgba(239, 68, 68, 0.5)' }} />
          <span className="text-[10px] text-muted-foreground/60 font-medium">Perte</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-[4px] bg-muted/30 border border-border/30" />
          <span className="text-[10px] text-muted-foreground/60 font-medium">Pas de trade</span>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  DayCell — Individual day in the calendar grid
// ═════════════════════════════════════════════════════════════════════════════

interface DayCellProps {
  day: number
  data: DayData | null
  isToday: boolean
  isSelected: boolean
  isHovered: boolean
  maxAbsPnl: number
  monthName: string
  year: number
  onHover?: () => void
  onLeave?: () => void
  onClick?: () => void
}

function DayCell({ day, data, isToday, isSelected, isHovered, maxAbsPnl, monthName, year, onHover, onLeave, onClick }: DayCellProps) {
  // Empty cell (padding before 1st of month)
  if (day === 0) {
    return <div className="h-12" />
  }

  const hasTrades = data && data.trades > 0
  const pnl = data?.pnl || 0
  const isProfit = pnl > 0
  const isLoss = pnl < 0
  const intensity = hasTrades ? getIntensity(pnl, maxAbsPnl) : 0

  // Dynamic background color
  let bgStyle: React.CSSProperties = {}
  if (hasTrades) {
    if (isProfit) {
      bgStyle.backgroundColor = `rgba(34, 197, 94, ${intensity * 0.22})`
    } else if (isLoss) {
      bgStyle.backgroundColor = `rgba(239, 68, 68, ${intensity * 0.22})`
    } else {
      bgStyle.backgroundColor = 'rgba(255, 255, 255, 0.02)'
    }
  }

  return (
    <motion.div
      className={cn(
        "relative h-12 rounded-lg cursor-pointer select-none",
        "flex flex-col items-center justify-center gap-0",
        "border transition-all duration-200",
        // Base states
        !hasTrades && "bg-card/20 border-border/20",
        hasTrades && "border-border/30",
        // Today highlight
        isToday && !isSelected && "ring-1 ring-primary/40 ring-offset-1 ring-offset-background",
        // Selected state
        isSelected && "border-primary/50 shadow-[0_0_16px_rgba(59,130,246,0.15)] ring-1 ring-primary/30",
        // Hover
        isHovered && !isSelected && "border-border/60 shadow-md",
      )}
      style={bgStyle}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Day number */}
      <span className={cn(
        "text-[10px] font-semibold tabular-nums leading-none",
        isToday ? "text-primary" : "text-muted-foreground/60",
        hasTrades && "text-foreground/70"
      )}>
        {day}
      </span>

      {/* PnL Value */}
      {hasTrades && (
        <span className={cn(
          "text-[10px] font-bold tabular-nums leading-none tracking-tight",
          isProfit && "text-emerald-400",
          isLoss && "text-red-400",
          !isProfit && !isLoss && "text-muted-foreground",
        )}>
          {pnl >= 0 ? '+' : ''}{Math.abs(pnl) >= 1000 ? `${(pnl / 1000).toFixed(1)}k` : pnl.toFixed(0)}$
        </span>
      )}

      {/* Trade count */}
      {hasTrades && (
        <span className="text-[7px] text-muted-foreground/40 font-medium leading-none">
          {data!.trades} trade{data!.trades > 1 ? 's' : ''}
        </span>
      )}

      {/* Today dot indicator */}
      {isToday && (
        <motion.div
          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Profit/Loss side accent bar */}
      {hasTrades && (
        <div
          className={cn(
            "absolute left-0 top-2 bottom-2 w-[2px] rounded-full transition-opacity duration-200",
            isProfit && "bg-emerald-400",
            isLoss && "bg-red-400",
            !isProfit && !isLoss && "bg-muted-foreground/20",
          )}
          style={{ opacity: intensity * 0.8 }}
        />
      )}

      {/* ═══ TOOLTIP ═══ */}
      <AnimatePresence>
        {isHovered && hasTrades && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              "absolute z-50 pointer-events-none",
              "bottom-full mb-2 left-1/2 -translate-x-1/2",
              "px-3 py-2.5 rounded-xl",
              "bg-card border border-border shadow-xl shadow-black/20",
              "min-w-[140px] text-center",
            )}
          >
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="w-2 h-2 rotate-45 bg-card border-r border-b border-border" />
            </div>

            <p className="text-[10px] text-muted-foreground/70 font-medium mb-1.5">
              {day} {monthName} {year}
            </p>
            <p className={cn(
              "text-base font-black tabular-nums tracking-tight",
              isProfit ? "text-emerald-400" : isLoss ? "text-red-400" : "text-foreground"
            )}>
              {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-1 font-medium">
              {data!.trades} trade{data!.trades > 1 ? 's' : ''}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
