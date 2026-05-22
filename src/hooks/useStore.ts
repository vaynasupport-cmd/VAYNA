import { create } from 'zustand'
import type { Account, Trade, JournalEntry, DashboardStats, AdvancedStats } from '@/types'
import type { NotificationPreferences } from '@/lib/notificationPreferences'

// ─── MT5 Sync Status ─────────────────────────────────────────────────────────
export type MT5SyncStatus = 'idle' | 'connected' | 'syncing' | 'error'

interface AppState {
  // Selected account and period
  selectedAccountId: string | null
  setSelectedAccountId: (id: string | null) => void
  
  selectedPeriod: { id: string; label: string; startDate?: string; endDate?: string } | null
  setSelectedPeriod: (period: { id: string; label: string; startDate?: string; endDate?: string } | null) => void
  
  // Settings
  autoImportEnabled: boolean
  setAutoImportEnabled: (enabled: boolean) => void

  // MT5 Sync (Python VPS based)
  mt5Sync: {
    mt5AccountId: string | null       // UUID from mt5_accounts table
    platform: 'mt5' | null
    brokerLogin: string | null
    brokerServer: string | null
    status: MT5SyncStatus
    lastSyncAt: string | null
    syncedTradesCount: number
  }
  setMT5Sync: (data: Partial<AppState['mt5Sync']>) => void
  resetMT5Sync: () => void

  notificationPreferences: NotificationPreferences | null
  setNotificationPreferences: (prefs: NotificationPreferences | null) => void
  
  // Data
  accounts: Account[]
  setAccounts: (accounts: Account[]) => void
  addAccount: (account: Account) => void
  updateAccount: (account: Account) => void
  removeAccount: (id: string) => void
  
  trades: Trade[]
  setTrades: (trades: Trade[]) => void
  addTrade: (trade: Trade) => void
  updateTrade: (trade: Trade) => void
  removeTrade: (id: string) => void
  
  journalEntries: JournalEntry[]
  setJournalEntries: (entries: JournalEntry[]) => void
  addJournalEntry: (entry: JournalEntry) => void
  updateJournalEntry: (entry: JournalEntry) => void
  removeJournalEntry: (id: string) => void
  
  // Stats
  dashboardStats: DashboardStats | null
  setDashboardStats: (stats: DashboardStats | null) => void
  
  advancedStats: AdvancedStats | null
  setAdvancedStats: (stats: AdvancedStats | null) => void
  
  // Chart data
  equityCurve: Array<{ date: string; equity: number; pnl: number }>
  setEquityCurve: (data: Array<{ date: string; equity: number; pnl: number }>) => void
  
  monthlyPerformance: Array<{ month: string; trades: number; pnl: number; wins: number; losses: number; winRate: number }>
  setMonthlyPerformance: (data: Array<{ month: string; trades: number; pnl: number; wins: number; losses: number; winRate: number }>) => void
  
  // UI State
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  
  // Refresh trigger
  refreshTrigger: number
  triggerRefresh: () => void
}

export const useStore = create<AppState>((set) => ({
  // Selected account and period
  selectedAccountId: null,
  setSelectedAccountId: (id) => set({ selectedAccountId: id }),
  
  selectedPeriod: null,
  setSelectedPeriod: (period) => set({ selectedPeriod: period }),
  
  // Settings
  autoImportEnabled: true,
  setAutoImportEnabled: (enabled) => set({ autoImportEnabled: enabled }),

  // MT5 Sync (Python VPS based)
  mt5Sync: {
    mt5AccountId: null,
    platform: null,
    brokerLogin: null,
    brokerServer: null,
    status: 'idle',
    lastSyncAt: null,
    syncedTradesCount: 0,
  },
  setMT5Sync: (data) => set((state) => ({
    mt5Sync: { ...state.mt5Sync, ...data },
  })),
  resetMT5Sync: () => set({
    mt5Sync: {
      mt5AccountId: null,
      platform: null,
      brokerLogin: null,
      brokerServer: null,
      status: 'idle',
      lastSyncAt: null,
      syncedTradesCount: 0,
    },
  }),

  notificationPreferences: null,
  setNotificationPreferences: (prefs) => set({ notificationPreferences: prefs }),
  
  // Accounts
  accounts: [],
  setAccounts: (accounts) => set({ accounts }),
  addAccount: (account) => set((state) => ({ 
    accounts: [account, ...state.accounts] 
  })),
  updateAccount: (account) => set((state) => ({
    accounts: state.accounts.map((a) => 
      a.id === account.id ? account : a
    ),
  })),
  removeAccount: (id) => set((state) => ({
    accounts: state.accounts.filter((a) => a.id !== id),
  })),
  
  // Trades
  trades: [],
  setTrades: (trades) => set({ trades }),
  addTrade: (trade) => set((state) => ({ 
    trades: [trade, ...state.trades] 
  })),
  updateTrade: (trade) => set((state) => ({
    trades: state.trades.map((t) => 
      t.id === trade.id ? trade : t
    ),
  })),
  removeTrade: (id) => set((state) => ({
    trades: state.trades.filter((t) => t.id !== id),
  })),
  
  // Journal Entries
  journalEntries: [],
  setJournalEntries: (entries) => set({ journalEntries: entries }),
  addJournalEntry: (entry) => set((state) => ({ 
    journalEntries: [entry, ...state.journalEntries] 
  })),
  updateJournalEntry: (entry) => set((state) => ({
    journalEntries: state.journalEntries.map((e) => 
      e.id === entry.id ? entry : e
    ),
  })),
  removeJournalEntry: (id) => set((state) => ({
    journalEntries: state.journalEntries.filter((e) => e.id !== id),
  })),
  
  // Stats
  dashboardStats: null,
  setDashboardStats: (stats) => set({ dashboardStats: stats }),
  
  advancedStats: null,
  setAdvancedStats: (stats) => set({ advancedStats: stats }),
  
  // Chart data
  equityCurve: [],
  setEquityCurve: (data) => set({ equityCurve: data }),
  
  monthlyPerformance: [],
  setMonthlyPerformance: (data) => set({ monthlyPerformance: data }),
  
  // UI State
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  // Refresh trigger
  refreshTrigger: 0,
  triggerRefresh: () => set((state) => ({ 
    refreshTrigger: state.refreshTrigger + 1 
  })),
}))
