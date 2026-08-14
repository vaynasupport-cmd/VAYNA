import { useState, useMemo } from 'react'
import type { Trade } from '@/types'

export function useTradeFilters(trades: Trade[], selectedAccountId: string | null) {
  const [searchQuery, setSearchQuery] = useState('')
  const [resultFilter, setResultFilter] = useState<string>('all')
  const [directionFilter, setDirectionFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  const filteredTrades = useMemo(() => {
    let filtered = selectedAccountId
      ? trades.filter(t => t.accountId === selectedAccountId)
      : trades

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.comment?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (resultFilter !== 'all') {
      filtered = filtered.filter(t => t.result === resultFilter)
    }

    if (directionFilter !== 'all') {
      filtered = filtered.filter(t => t.direction === directionFilter)
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom).getTime()
      filtered = filtered.filter(t => new Date(t.date).getTime() >= fromDate)
    }

    if (dateTo) {
      const toDate = new Date(dateTo).getTime()
      filtered = filtered.filter(t => new Date(t.date).getTime() <= toDate)
    }

    return filtered
  }, [trades, selectedAccountId, searchQuery, resultFilter, directionFilter, dateFrom, dateTo])

  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage)
  
  const paginatedTrades = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredTrades.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredTrades, currentPage, itemsPerPage])

  return {
    searchQuery, setSearchQuery,
    resultFilter, setResultFilter,
    directionFilter, setDirectionFilter,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    showDateFilter, setShowDateFilter,
    filteredTrades,
    paginatedTrades,
    currentPage, setCurrentPage,
    totalPages,
    itemsPerPage
  }
}
