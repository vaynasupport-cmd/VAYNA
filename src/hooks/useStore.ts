import { create } from 'zustand'
import type { NotificationPreferences } from '@/lib/notificationPreferences'

// ─── MT5 Sync Status ─────────────────────────────────────────────────────────
export type MT5SyncStatus = 'idle' | 'connected' | 'syncing' | 'error'

interface AppState {
  // Selected account and period (UI Filters)
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
  
  // UI State
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  
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
  
  // UI State
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
}))
