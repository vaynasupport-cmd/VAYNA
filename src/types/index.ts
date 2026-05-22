export interface Account {
  id: string
  name: string
  propFirm: string | null
  initialCapital: number
  currentCapital: number
  maxDrawdownPercent: number
  maxDrawdownAmount: number
  currentDrawdownAmount: number
  targetPercent: number
  targetAmount: number
  profitPercent: number
  profitAmount: number
  status: 'active' | 'lost' | 'validated'
  createdAt: string
  updatedAt: string
}

export interface Trade {
  id: string
  accountId: string
  accountName?: string
  propFirm?: string
  date: string
  createdDateTime?: string
  asset: string
  timeframe: string
  direction: 'BUY' | 'SELL'
  riskPercent: number
  entryPrice?: number
  exitPrice?: number
  stopLoss?: number
  takeProfit?: number
  positionSize?: number
  result: 'TP' | 'SL' | 'BE' | 'GAIN' | 'PERTE' | 'BE+' | 'BE-' | 'EN COURS'
  pnlAmount: number
  pnlPercent: number
  rMultiple?: number
  commission?: number
  swap?: number
  comment?: string
  emotionalTag?: string
  strategy?: string
  setupType?: string
  ticket?: number
  source?: 'manual' | 'mt4_auto' | 'mt5_auto' | 'cloud_sync' | 'mt5_sync'
  createdAt: string
  updatedAt: string
}

export interface Screenshot {
  id: string
  tradeId: string
  imageData: string
  createdAt: string
}

export interface JournalEntry {
  id: string
  date: string
  title?: string
  content: string
  mentalState?: string
  disciplineScore?: number
  focusScore?: number
  confidence?: number
  tradingPlans?: string
  setupsIdentified?: string
  lessonsLearned?: string
  marketCondition?: string
  pnlSummary?: string
  nextActions?: string
  references?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalTrades: number
  totalPnl: number
  winRate: number
  wins: number
  losses: number
  currentDrawdown: number
  maxDrawdown: number
  drawdownPercent: number
}

export interface AdvancedStats {
  avgWin: number
  avgLoss: number
  profitFactor: number
  expectancy: number
  maxConsecutiveWins: number
  maxConsecutiveLosses: number
  grossProfit: number
  grossLoss: number
}

export interface EquityPoint {
  date: string
  equity: number
  pnl: number
}

export interface MonthlyPerformance {
  month: string
  trades: number
  pnl: number
  wins: number
  losses: number
  winRate: number
}

export type TimeFrame = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M'

export type TradeResult = 'TP' | 'SL' | 'BE' | 'GAIN' | 'PERTE' | 'BE+' | 'BE-' | 'EN COURS'

export type EmotionalTag = 'confiant' | 'peur' | 'avidité' | 'impatience' | 'calme' | 'stress' | 'frustration' | 'satisfaction'
