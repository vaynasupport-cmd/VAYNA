import { useState, useMemo } from 'react'
import { useGlobalStats } from '@/hooks/useGlobalStats'
import { useCreateTradeMutation, useUpdateTradeMutation, useUploadScreenshotMutation, useDeleteScreenshotMutation } from '@/hooks/queries/useTrades'
import { getScreenshots } from '@/api/trades'
import { useStore } from '@/hooks/useStore'
import { useToast } from '@/hooks/useToast'
import type { Trade, TradeResult } from '@/types'

export function useTradeForm() {
  const { toast } = useToast()
  const { accounts } = useGlobalStats()
  const selectedAccountId = useStore(s => s.selectedAccountId)

  const createTradeMutation = useCreateTradeMutation()
  const updateTradeMutation = useUpdateTradeMutation()
  const uploadScreenshotMutation = useUploadScreenshotMutation()
  const deleteScreenshotMutation = useDeleteScreenshotMutation()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)
  
  const [formScreenshots, setFormScreenshots] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    accountId: '',
    date: new Date().toISOString().slice(0, 16),
    asset: '',
    timeframe: '1h',
    direction: 'BUY' as 'BUY' | 'SELL',
    riskPercent: 1,
    entryPrice: '',
    exitPrice: '',
    stopLoss: '',
    takeProfit: '',
    result: 'GAIN' as TradeResult,
    pnlAmount: 0,
    comment: '',
    emotionalTag: '',
    strategy: '',
    setupType: '',
  })

  const resetForm = () => {
    setFormData({
      accountId: selectedAccountId || (accounts[0]?.id || ''),
      date: new Date().toISOString().slice(0, 16),
      asset: '',
      timeframe: '1h',
      direction: 'BUY',
      riskPercent: 1,
      entryPrice: '',
      exitPrice: '',
      stopLoss: '',
      takeProfit: '',
      result: 'GAIN',
      pnlAmount: 0,
      comment: '',
      emotionalTag: '',
      strategy: '',
      setupType: '',
    })
    setFormScreenshots([])
  }

  const openEditDialog = async (trade: Trade) => {
    setEditingTrade(trade)
    setFormData({
      accountId: trade.accountId,
      date: trade.createdDateTime || trade.date + 'T00:00',
      asset: trade.asset,
      timeframe: trade.timeframe,
      direction: trade.direction,
      riskPercent: trade.riskPercent,
      entryPrice: trade.entryPrice?.toString() || '',
      exitPrice: trade.exitPrice?.toString() || '',
      stopLoss: trade.stopLoss?.toString() || '',
      takeProfit: trade.takeProfit?.toString() || '',
      result: trade.result,
      pnlAmount: trade.pnlAmount,
      comment: trade.comment || '',
      emotionalTag: trade.emotionalTag || '',
      strategy: trade.strategy || '',
      setupType: trade.setupType || '',
    })

    try {
      const existingScreenshots = await getScreenshots(trade.id)
      setFormScreenshots(existingScreenshots.map((s: any) => ({
        id: s.id,
        data: s.image_data,
        name: 'screenshot'
      })))
    } catch (err) {
      console.log('Could not load screenshots')
      setFormScreenshots([])
    }
  }

  const calculatedRMultiple = useMemo(() => {
    const pnl = Number(formData.pnlAmount)
    const currentAccount = accounts.find(a => a.id === formData.accountId)
    if (currentAccount && pnl !== 0 && formData.riskPercent > 0) {
      const riskAmount = currentAccount.initialCapital * (formData.riskPercent / 100)
      if (riskAmount > 0) {
        return (pnl / riskAmount).toFixed(2)
      }
    }
    return formData.pnlAmount === 0 ? "0.00" : null
  }, [formData.pnlAmount, formData.accountId, formData.riskPercent, accounts])

  const handleCreate = async () => {
    try {
      const dateOnly = formData.date.split('T')[0] || formData.date
      const trade = await createTradeMutation.mutateAsync({
        ...formData,
        date: dateOnly,
        createdDateTime: formData.date,
        entryPrice: formData.entryPrice ? Number(formData.entryPrice) : undefined,
        exitPrice: formData.exitPrice ? Number(formData.exitPrice) : undefined,
        stopLoss: formData.stopLoss ? Number(formData.stopLoss) : undefined,
        takeProfit: formData.takeProfit ? Number(formData.takeProfit) : undefined,
        pnlAmount: Number(formData.pnlAmount),
        rMultiple: calculatedRMultiple ? Number(calculatedRMultiple) : undefined
      })

      if (trade && formScreenshots.length > 0) {
        for (const img of formScreenshots) {
          await uploadScreenshotMutation.mutateAsync({ tradeId: trade.id, imageData: img.data })
        }
      }

      setShowAddDialog(false)
      resetForm()
      toast({ title: 'Succès', description: 'Le trade a été enregistré.' })
    } catch (error: any) {
      console.error(error)
      toast({ title: 'Erreur', description: error.message || 'Impossible d\'enregistrer le trade.', variant: 'destructive' })
    }
  }

  const handleUpdate = async () => {
    if (!editingTrade) return
    try {
      const dateOnly = formData.date.split('T')[0] || formData.date
      await updateTradeMutation.mutateAsync({ id: editingTrade.id, data: {
        ...formData,
        date: dateOnly,
        createdDateTime: formData.date,
        entryPrice: formData.entryPrice ? Number(formData.entryPrice) : undefined,
        exitPrice: formData.exitPrice ? Number(formData.exitPrice) : undefined,
        stopLoss: formData.stopLoss ? Number(formData.stopLoss) : undefined,
        takeProfit: formData.takeProfit ? Number(formData.takeProfit) : undefined,
        pnlAmount: Number(formData.pnlAmount),
        rMultiple: calculatedRMultiple ? Number(calculatedRMultiple) : undefined
      }})

      if (formScreenshots.length > 0) {
        for (const img of formScreenshots) {
          if (!img.id) {
            await uploadScreenshotMutation.mutateAsync({ tradeId: editingTrade.id, imageData: img.data })
          }
        }
      }

      setEditingTrade(null)
      resetForm()
      toast({ title: 'Succès', description: 'Le trade a été mis à jour.' })
    } catch (error: any) {
      console.error(error)
      toast({ title: 'Erreur', description: error.message || 'Impossible de mettre à jour le trade.', variant: 'destructive' })
    }
  }

  const handleFormScreenshotDelete = async (index: number) => {
    const img = formScreenshots[index]
    if (img.id) {
      await deleteScreenshotMutation.mutateAsync({ id: img.id, tradeId: editingTrade?.id || '' })
    }
    setFormScreenshots(prev => prev.filter((_, i) => i !== index))
  }

  return {
    showAddDialog, setShowAddDialog,
    editingTrade, setEditingTrade,
    formData, setFormData,
    formScreenshots, setFormScreenshots,
    resetForm,
    openEditDialog,
    handleCreate,
    handleUpdate,
    handleFormScreenshotDelete,
    calculatedRMultiple
  }
}
