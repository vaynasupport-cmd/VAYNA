import type { Trade, DashboardStats, AdvancedStats, EquityPoint, MonthlyPerformance } from '@/types'

export interface AssetPerformance {
  asset: string
  trades: number
  pnl: number
  wins: number
  losses: number
  winRate: number
}

export interface DirectionPerformance {
  direction: string
  trades: number
  pnl: number
  wins: number
  losses: number
  winRate: number
}

export interface DayPerformance {
  day: string
  dayOfWeek: number
  trades: number
  pnl: number
  wins: number
  losses: number
  winRate: number
  avgPnl: number
}

export interface HourPerformance {
  hour: string
  hourNum: number
  trades: number
  pnl: number
  wins: number
  losses: number
  winRate: number
  avgPnl: number
}

interface Filters {
  accountId?: string
  startDate?: string
  endDate?: string
}

function filterTrades(trades: Trade[], filters?: Filters): Trade[] {
  if (!filters) return trades
  return trades.filter(trade => {
    if (filters.accountId && trade.accountId !== filters.accountId) return false
    if (filters.startDate && trade.date < filters.startDate) return false
    if (filters.endDate && trade.date > filters.endDate) return false
    return true
  })
}

export function calculateDashboardStats(allTrades: Trade[], filters?: Filters): DashboardStats {
  const trades = filterTrades(allTrades, filters)
  
  const wins = trades.filter(t => t.pnlAmount > 0).length
  const losses = trades.filter(t => t.pnlAmount < 0).length
  const totalPnl = trades.reduce((sum, t) => sum + t.pnlAmount, 0)
  const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0

  // Drawdown calculation requires strict chronological order
  const sortedTrades = [...trades].sort((a, b) => {
    const tA = a.createdDateTime || a.date
    const tB = b.createdDateTime || b.date
    return tA.localeCompare(tB)
  })

  let peak = 0
  let maxDrawdown = 0
  let runningPnl = 0
  for (const trade of sortedTrades) {
    runningPnl += trade.pnlAmount
    if (runningPnl > peak) peak = runningPnl
    const dd = peak - runningPnl
    if (dd > maxDrawdown) maxDrawdown = dd
  }
  const currentDrawdown = peak - runningPnl
  const drawdownPercent = peak > 0 ? (maxDrawdown / peak) * 100 : 0

  return {
    totalTrades: trades.length,
    totalPnl,
    winRate,
    wins,
    losses,
    currentDrawdown,
    maxDrawdown,
    drawdownPercent,
  }
}

export function calculateAdvancedStats(allTrades: Trade[], filters?: Filters): AdvancedStats {
  const trades = filterTrades(allTrades, filters)
  
  const winTrades = trades.filter(t => t.pnlAmount > 0)
  const lossTrades = trades.filter(t => t.pnlAmount < 0)
  
  const grossProfit = winTrades.reduce((sum, t) => sum + t.pnlAmount, 0)
  const grossLoss = Math.abs(lossTrades.reduce((sum, t) => sum + t.pnlAmount, 0))
  
  const avgWin = winTrades.length > 0 ? grossProfit / winTrades.length : 0
  const avgLoss = lossTrades.length > 0 ? grossLoss / lossTrades.length : 0
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0
  
  const winRate = trades.length > 0 ? winTrades.length / trades.length : 0
  const expectancy = avgWin * winRate - avgLoss * (1 - winRate)

  let maxConsecutiveWins = 0
  let maxConsecutiveLosses = 0
  let currentWins = 0
  let currentLosses = 0
  for (const trade of trades) {
    if (trade.pnlAmount > 0) {
      currentWins++
      currentLosses = 0
      maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWins)
    } else if (trade.pnlAmount < 0) {
      currentLosses++
      currentWins = 0
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLosses)
    } else {
      currentWins = 0
      currentLosses = 0
    }
  }

  return {
    avgWin,
    avgLoss,
    profitFactor,
    expectancy,
    maxConsecutiveWins,
    maxConsecutiveLosses,
    grossProfit,
    grossLoss,
  }
}

export function calculateEquityCurve(allTrades: Trade[], initialCapital: number = 0, filters?: Filters): EquityPoint[] {
  const trades = filterTrades(allTrades, filters)
  const sorted = [...trades].sort((a, b) => {
    const tA = a.createdDateTime || a.date
    const tB = b.createdDateTime || b.date
    return tA.localeCompare(tB)
  })
  
  let runningPnl = initialCapital
  const points: EquityPoint[] = []
  
  if (sorted.length > 0 && initialCapital > 0) {
    // Add a baseline point right before the first trade's date
    const firstTradeDate = new Date(sorted[0].date)
    firstTradeDate.setDate(firstTradeDate.getDate() - 1)
    points.push({
      date: firstTradeDate.toISOString().split('T')[0],
      equity: initialCapital,
      pnl: 0,
    })
  }
  
  for (const trade of sorted) {
    runningPnl += trade.pnlAmount
    points.push({
      date: trade.date,
      equity: runningPnl,
      pnl: trade.pnlAmount,
    })
  }
  
  return points
}

export function calculateMonthlyPerformance(allTrades: Trade[], filters?: Filters): MonthlyPerformance[] {
  const trades = filterTrades(allTrades, filters)
  const monthMap = new Map<string, { trades: number; pnl: number; wins: number; losses: number }>()
  
  for (const trade of trades) {
    const month = trade.date.substring(0, 7) // YYYY-MM
    if (!monthMap.has(month)) {
      monthMap.set(month, { trades: 0, pnl: 0, wins: 0, losses: 0 })
    }
    const m = monthMap.get(month)!
    m.trades++
    m.pnl += trade.pnlAmount
    if (trade.pnlAmount > 0) m.wins++
    else if (trade.pnlAmount < 0) m.losses++
  }
  
  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      trades: data.trades,
      pnl: data.pnl,
      wins: data.wins,
      losses: data.losses,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
    }))
}

export function calculateDayPerformance(allTrades: Trade[], filters?: Filters): DayPerformance[] {
  const trades = filterTrades(allTrades, filters)
  const dayMap = new Map<number, { trades: number; pnl: number; wins: number; losses: number }>()

  for (const trade of trades) {
    if (!trade.date) continue
    const parts = trade.date.split('-')
    if (parts.length !== 3) continue
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
    const dayOfWeek = dateObj.getDay()

    if (!dayMap.has(dayOfWeek)) {
      dayMap.set(dayOfWeek, { trades: 0, pnl: 0, wins: 0, losses: 0 })
    }
    const m = dayMap.get(dayOfWeek)!
    m.trades++
    m.pnl += trade.pnlAmount
    if (trade.pnlAmount > 0) m.wins++
    else if (trade.pnlAmount < 0) m.losses++
  }

  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

  return Array.from(dayMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([dayOfWeek, data]) => ({
      day: dayNames[dayOfWeek],
      dayOfWeek,
      trades: data.trades,
      pnl: data.pnl,
      wins: data.wins,
      losses: data.losses,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
      avgPnl: data.trades > 0 ? data.pnl / data.trades : 0,
    }))
}

export function calculateHourPerformance(allTrades: Trade[], filters?: Filters): HourPerformance[] {
  const trades = filterTrades(allTrades, filters)
  const hourMap = new Map<number, { trades: number; pnl: number; wins: number; losses: number }>()

  for (const trade of trades) {
    if (!trade.createdDateTime) continue
    const dateObj = new Date(trade.createdDateTime)
    if (isNaN(dateObj.getTime())) continue
    const hourNum = dateObj.getHours()

    if (!hourMap.has(hourNum)) {
      hourMap.set(hourNum, { trades: 0, pnl: 0, wins: 0, losses: 0 })
    }
    const m = hourMap.get(hourNum)!
    m.trades++
    m.pnl += trade.pnlAmount
    if (trade.pnlAmount > 0) m.wins++
    else if (trade.pnlAmount < 0) m.losses++
  }

  return Array.from(hourMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([hourNum, data]) => ({
      hour: `${String(hourNum).padStart(2, '0')}:00`,
      hourNum,
      trades: data.trades,
      pnl: data.pnl,
      wins: data.wins,
      losses: data.losses,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
      avgPnl: data.trades > 0 ? data.pnl / data.trades : 0,
    }))
}

export function calculateAssetPerformance(allTrades: Trade[], filters?: Filters): AssetPerformance[] {
  const trades = filterTrades(allTrades, filters)
  const assetMap = new Map<string, { trades: number; pnl: number; wins: number; losses: number }>()

  for (const trade of trades) {
    if (!trade.asset) continue
    const asset = trade.asset.toUpperCase()

    if (!assetMap.has(asset)) {
      assetMap.set(asset, { trades: 0, pnl: 0, wins: 0, losses: 0 })
    }
    const m = assetMap.get(asset)!
    m.trades++
    m.pnl += trade.pnlAmount
    if (trade.pnlAmount > 0) m.wins++
    else if (trade.pnlAmount < 0) m.losses++
  }

  return Array.from(assetMap.entries())
    .sort((a, b) => b[1].pnl - a[1].pnl) // sort by pnl desc
    .map(([asset, data]) => ({
      asset,
      trades: data.trades,
      pnl: data.pnl,
      wins: data.wins,
      losses: data.losses,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
    }))
}

export function calculateDirectionPerformance(allTrades: Trade[], filters?: Filters): DirectionPerformance[] {
  const trades = filterTrades(allTrades, filters)
  const dirMap = new Map<string, { trades: number; pnl: number; wins: number; losses: number }>()

  // initialize both to ensure they always show up
  dirMap.set('BUY', { trades: 0, pnl: 0, wins: 0, losses: 0 })
  dirMap.set('SELL', { trades: 0, pnl: 0, wins: 0, losses: 0 })

  for (const trade of trades) {
    if (!trade.direction) continue
    const direction = trade.direction.toUpperCase()
    
    if (dirMap.has(direction)) {
      const m = dirMap.get(direction)!
      m.trades++
      m.pnl += trade.pnlAmount
      if (trade.pnlAmount > 0) m.wins++
      else if (trade.pnlAmount < 0) m.losses++
    }
  }

  return Array.from(dirMap.entries())
    .map(([direction, data]) => ({
      direction: direction === 'BUY' ? 'Long (Achat)' : 'Short (Vente)',
      trades: data.trades,
      pnl: data.pnl,
      wins: data.wins,
      losses: data.losses,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
    }))
}
