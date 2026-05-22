import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getResultColor(result: string): string {
  switch (result) {
    case 'TP':
    case 'GAIN':
    case 'BE+':
      return 'text-trading-green'
    case 'SL':
    case 'PERTE':
    case 'BE-':
      return 'text-trading-red'
    case 'BE':
      return 'text-trading-orange'
    case 'EN COURS':
      return 'text-trading-blue'
    default:
      return 'text-gray-400'
  }
}

export function getResultBgColor(result: string): string {
  switch (result) {
    case 'TP':
    case 'GAIN':
    case 'BE+':
      return 'bg-trading-green/10 border-trading-green/30'
    case 'SL':
    case 'PERTE':
    case 'BE-':
      return 'bg-trading-red/10 border-trading-red/30'
    case 'BE':
      return 'bg-trading-orange/10 border-trading-orange/30'
    case 'EN COURS':
      return 'bg-trading-blue/10 border-trading-blue/30'
    default:
      return 'bg-gray-500/10 border-gray-500/30'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'text-trading-green'
    case 'lost':
      return 'text-trading-red'
    case 'validated':
      return 'text-trading-blue'
    default:
      return 'text-gray-400'
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-trading-green/10 border-trading-green/30'
    case 'lost':
      return 'bg-trading-red/10 border-trading-red/30'
    case 'validated':
      return 'bg-trading-blue/10 border-trading-blue/30'
    default:
      return 'bg-gray-500/10 border-gray-500/30'
  }
}

export function calculateRMultiple(pnl: number, riskAmount: number): number | null {
  if (riskAmount <= 0) return null
  return pnl / riskAmount
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function getEmotionalTagColor(tag: string): string {
  const colors: Record<string, string> = {
    'confiant': 'bg-trading-blue/20 text-trading-blue border-trading-blue/30',
    'peur': 'bg-trading-red/20 text-trading-red border-trading-red/30',
    'avidité': 'bg-trading-orange/20 text-trading-orange border-trading-orange/30',
    'impatience': 'bg-trading-purple/20 text-trading-purple border-trading-purple/30',
    'calme': 'bg-trading-green/20 text-trading-green border-trading-green/30',
    'stress': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    'frustration': 'bg-rose-500/20 text-rose-500 border-rose-500/30',
    'satisfaction': 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
  }
  return colors[tag] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}
