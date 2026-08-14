import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getTrades, 
  createTrade, 
  createTrades,
  updateTrade, 
  deleteTrade,
  deleteAllTrades,
  getScreenshots,
  saveScreenshot,
  deleteScreenshot
} from '@/api/trades'
import { useAuth } from '@features/auth/useAuth'

const TRADES_QUERY_KEY = ['trades']

export function useTradesQuery() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: TRADES_QUERY_KEY,
    queryFn: getTrades,
    enabled: !!user,
  })
}

export function useCreateTradeMutation() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (data: Parameters<typeof createTrade>[1]) => {
      if (!user) throw new Error('User not authenticated')
      return createTrade(user.id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRADES_QUERY_KEY })
    },
  })
}

export function useCreateTradesMutation() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (tradesData: Parameters<typeof createTrades>[1]) => {
      if (!user) throw new Error('User not authenticated')
      return createTrades(user.id, tradesData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRADES_QUERY_KEY })
    },
  })
}

export function useUpdateTradeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateTrade>[1] }) => 
      updateTrade(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRADES_QUERY_KEY })
    },
  })
}

export function useDeleteTradeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRADES_QUERY_KEY })
    },
  })
}

export function useDeleteAllTradesMutation() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: () => {
      if (!user) throw new Error('User not authenticated')
      return deleteAllTrades(user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRADES_QUERY_KEY })
    },
  })
}

// ─── SCREENSHOTS ────────────────────────────────────────────────────────────
export function useScreenshotsQuery(tradeId: string) {
  return useQuery({
    queryKey: ['screenshots', tradeId],
    queryFn: () => getScreenshots(tradeId),
    enabled: !!tradeId,
  })
}

export function useUploadScreenshotMutation() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ tradeId, imageData }: { tradeId: string; imageData: string }) => {
      if (!user) throw new Error('User not authenticated')
      return saveScreenshot(user.id, tradeId, imageData)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['screenshots', variables.tradeId] })
    },
  })
}

export function useDeleteScreenshotMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, tradeId }: { id: string; tradeId: string }) => 
      deleteScreenshot(id).then(() => tradeId), // Pass tradeId to onSuccess
    onSuccess: (tradeId) => {
      queryClient.invalidateQueries({ queryKey: ['screenshots', tradeId] })
    },
  })
}
