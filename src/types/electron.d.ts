// Minimal ElectronAPI — database operations are now handled by Supabase directly.
// File system helpers + MT auto-import listener exposed via contextBridge.
export interface ElectronAPI {
  fs: {
    selectImage: () => Promise<{ data: string; name: string } | null>
    saveCSV: (data: string, defaultName: string) => Promise<boolean>
  }
  onDeepLink: (callback: (url: string) => void) => void
  onNewTrade: (callback: (trade: {
    ticket: number
    symbol: string
    type: 'BUY' | 'SELL'
    lots: number
    open_price: number
    sl?: number
    tp?: number
    open_time: number
  }) => void) => () => void
  onUpdateTrade?: (callback: (data: {
    ticket: number
    gross_profit: number
    commission: number
    swap: number
    exit_price: number
    exit_time: number
  }) => void) => () => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
