import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Upload,
  Download,
  Calendar,
  Clock,
  X,
  Maximize2,
  Eye
} from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { useDatabase } from '@/hooks/useDatabase'
import { useToast } from '@/hooks/useToast'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DatePicker } from '@/components/DatePicker'
import { cn, formatCurrency, formatDate, getResultColor, getResultBgColor } from '@/lib/utils'
import { MobileTradeCard } from '@/components/MobileTradeCard'
import type { Trade, TradeResult } from '@/types'

const results: TradeResult[] = ['TP', 'SL', 'BE', 'GAIN', 'PERTE', 'BE+', 'BE-', 'EN COURS']
const emotionalTags = ['confiant', 'peur', 'avidité', 'impatience', 'calme', 'stress', 'frustration', 'satisfaction']

export function Trades() {
  const trades = useStore(s => s.trades)
  const accounts = useStore(s => s.accounts)
  const selectedAccountId = useStore(s => s.selectedAccountId)
  const triggerRefresh = useStore(s => s.triggerRefresh)
  const { createTrade, updateTrade, deleteTrade, deleteAllTrades, selectImage, saveScreenshot, getScreenshots, deleteScreenshot } = useDatabase()
  const { toast } = useToast()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [resultFilter, setResultFilter] = useState<string>('all')
  const [directionFilter, setDirectionFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  const [viewingTradeDetails, setViewingTradeDetails] = useState<Trade | null>(null)
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)
  const [deletingTrade, setDeletingTrade] = useState<Trade | null>(null)
  const [viewingScreenshots, setViewingScreenshots] = useState<Trade | null>(null)
  const [screenshots, setScreenshots] = useState<any[]>([])
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [deletingScreenshot, setDeletingScreenshot] = useState<number | null>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  // In-form screenshot state
  const [formScreenshots, setFormScreenshots] = useState<any[]>([])
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

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

  // Automatic RR computation
  const calculatedRR = useMemo(() => {
    const entry = Number(formData.entryPrice)
    const sl = Number(formData.stopLoss)
    const tp = Number(formData.takeProfit)
    if (entry && sl && tp && entry !== sl) {
      const risk = Math.abs(entry - sl)
      const reward = Math.abs(tp - entry)
      return (reward / risk).toFixed(2)
    }
    return null
  }, [formData.entryPrice, formData.stopLoss, formData.takeProfit])

  const calculatedRMultiple = useMemo(() => {
    const pnl = Number(formData.pnlAmount)
    const currentAccount = accounts.find(a => a.id === formData.accountId)
    if (currentAccount && pnl !== 0 && formData.riskPercent > 0) {
      // Risk Amount = capital * (risk% / 100)
      const riskAmount = currentAccount.initialCapital * (formData.riskPercent / 100)
      if (riskAmount > 0) {
        return (pnl / riskAmount).toFixed(2)
      }
    }
    return formData.pnlAmount === 0 ? "0.00" : null
  }, [formData.pnlAmount, formData.accountId, formData.riskPercent, accounts])

  const handleExportCSV = () => {
    if (filteredTrades.length === 0) {
      toast({ title: 'Erreur', description: 'Aucun trade à exporter', variant: 'destructive' })
      return
    }

    const csvContent = Papa.unparse(filteredTrades.map(t => ({
      ...t,
      // Remove complex nested objects if we had them, but standard trades are flat enough for Papa
    })))

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `trades_export_${new Date().toISOString().split('T')[0]}.csv`
    link.click()

    toast({ title: 'Succès', description: 'Exportation générée avec succès' })
  }

  // ─── SMART CSV COLUMN MAPPER ─────────────────────────────────────────────────
  // Maps common CSV header names (from any broker/platform) to internal field names.
  // Uses a priority-based approach: first exact match, then normalized fuzzy match.
  const mapCSVRow = (row: Record<string, any>, headers: string[]): Partial<Trade> | null => {
    // Normalize a header: lowercase, remove spaces/underscores/dashes/dots
    const norm = (s: string) => s.toLowerCase().replace(/[\s_\-./()]+/g, '').trim()

    // Build a lookup from normalized header → original header
    const hMap: Record<string, string> = {}
    headers.forEach(h => { hMap[norm(h)] = h })

    // Find the first matching header for a set of patterns
    const find = (...patterns: string[]): string | undefined => {
      for (const p of patterns) {
        const n = norm(p)
        if (hMap[n]) return hMap[n]
      }
      // Partial match fallback
      for (const p of patterns) {
        const n = norm(p)
        for (const [nKey, origKey] of Object.entries(hMap)) {
          if (nKey.includes(n) || n.includes(nKey)) return origKey
        }
      }
      return undefined
    }

    // Get value from row by trying multiple header names
    const get = (...patterns: string[]): string => {
      const key = find(...patterns)
      if (!key) return ''
      const val = row[key]
      return val != null ? String(val).trim() : ''
    }

    // Parse number (handles comma as decimal separator, currency symbols, spaces)
    const toNum = (s: string): number => {
      if (!s) return 0
      const cleaned = s.replace(/[€$£¥,\s]/g, '').replace(',', '.')
      const n = parseFloat(cleaned)
      return isNaN(n) ? 0 : n
    }

    // Parse date (handles multiple formats)
    const parseDate = (s: string): string => {
      if (!s) return new Date().toISOString().split('T')[0]

      // Already ISO format (2024-03-15 or 2024-03-15T10:30:00)
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.split('T')[0].split(' ')[0]

      // DD/MM/YYYY or DD.MM.YYYY
      const euMatch = s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})/)
      if (euMatch) return `${euMatch[3]}-${euMatch[2].padStart(2, '0')}-${euMatch[1].padStart(2, '0')}`

      // MM/DD/YYYY
      const usMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
      if (usMatch) {
        const m = parseInt(usMatch[1]), d = parseInt(usMatch[2])
        // If month > 12, swap (it's DD/MM/YYYY)
        if (m > 12) return `${usMatch[3]}-${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}`
        return `${usMatch[3]}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      }

      // YYYY.MM.DD
      const dotMatch = s.match(/^(\d{4})\.(\d{2})\.(\d{2})/)
      if (dotMatch) return `${dotMatch[1]}-${dotMatch[2]}-${dotMatch[3]}`

      // Try native Date parsing as fallback
      const d = new Date(s)
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]

      return new Date().toISOString().split('T')[0]
    }

    // ── Extract values using fuzzy header matching ──
    const asset = get('asset', 'symbol', 'pair', 'instrument', 'ticker', 'market', 'item', 'paire')
    const dateStr = get('date', 'open time', 'opentime', 'open date', 'opened', 'close time', 'closetime', 'close date', 'closed', 'time', 'datetime', 'entry time', 'exit time')

    // Skip rows without asset or date
    if (!asset && !dateStr) return null

    const dirRaw = get('direction', 'type', 'side', 'action', 'buy/sell', 'buysell', 'order type', 'trade type', 'sens').toUpperCase()
    let direction: 'BUY' | 'SELL' = 'BUY'
    if (dirRaw.includes('SELL') || dirRaw.includes('SHORT') || dirRaw.includes('S') && dirRaw.length <= 4 || dirRaw === 'VENTE') {
      direction = 'SELL'
    }
    if (dirRaw.includes('BUY') || dirRaw.includes('LONG') || dirRaw === 'ACHAT') {
      direction = 'BUY'
    }

    const entryPrice = toNum(get('entry price', 'entryprice', 'entry', 'open price', 'openprice', 'open', 'prix entree', 'price', 'prix'))
    const exitPrice = toNum(get('exit price', 'exitprice', 'exit', 'close price', 'closeprice', 'close', 'prix sortie'))
    const stopLoss = toNum(get('stop loss', 'stoploss', 'sl', 'stop'))
    const takeProfit = toNum(get('take profit', 'takeprofit', 'tp', 'target', 'objectif'))
    const pnl = toNum(get('pnl amount', 'pnlamount', 'pnl', 'profit', 'p&l', 'pl', 'net profit', 'netprofit', 'gain', 'resultat', 'result amount', 'gross profit', 'net', 'earnings'))
    const commission = toNum(get('commission', 'commissions', 'fees', 'fee', 'frais'))
    const riskPct = toNum(get('risk percent', 'riskpercent', 'risk', 'risk %', 'risque'))
    const posSize = toNum(get('position size', 'positionsize', 'volume', 'lots', 'lot', 'size', 'qty', 'quantity', 'taille'))
    const timeframe = get('timeframe', 'tf', 'period', 'periode', 'time frame') || '1h'
    const comment = get('comment', 'comments', 'note', 'notes', 'description', 'commentaire', 'remarque')
    const emotionalTag = get('emotional tag', 'emotionaltag', 'emotion', 'feeling', 'mood', 'mental state', 'etat mental')
    const strategy = get('strategy', 'strategie', 'strat', 'method', 'methode', 'plan')
    const setupType = get('setup type', 'setuptype', 'setup', 'pattern', 'configuration')
    const ticket = toNum(get('ticket', 'order', 'order id', 'orderid', 'id', 'trade id', 'tradeid', '#'))

    // Determine result from explicit column or from P&L
    let resultRaw = get('result', 'outcome', 'status', 'resultat', 'trade result').toUpperCase()
    let result: TradeResult = 'BE'

    if (resultRaw) {
      if (resultRaw.includes('TP') || resultRaw === 'TAKE PROFIT') result = 'TP'
      else if (resultRaw.includes('SL') || resultRaw === 'STOP LOSS') result = 'SL'
      else if (resultRaw.includes('BE+')) result = 'BE+'
      else if (resultRaw.includes('BE-')) result = 'BE-'
      else if (resultRaw.includes('BE') || resultRaw === 'BREAKEVEN') result = 'BE'
      else if (resultRaw.includes('GAIN') || resultRaw === 'WIN' || resultRaw === 'WON') result = 'GAIN'
      else if (resultRaw.includes('PERTE') || resultRaw === 'LOSS' || resultRaw === 'LOST') result = 'PERTE'
      else if (resultRaw.includes('EN COURS') || resultRaw === 'OPEN' || resultRaw === 'PENDING') result = 'EN COURS'
      else result = pnl > 0 ? 'GAIN' : pnl < 0 ? 'PERTE' : 'BE'
    } else {
      // No result column: infer from PNL
      if (pnl > 0) result = 'GAIN'
      else if (pnl < 0) result = 'PERTE'
      else result = 'BE'
    }

    return {
      accountId: selectedAccountId || '',
      date: parseDate(dateStr),
      asset: asset || 'UNKNOWN',
      timeframe,
      direction,
      riskPercent: riskPct || 1,
      entryPrice: entryPrice || undefined,
      exitPrice: exitPrice || undefined,
      stopLoss: stopLoss || undefined,
      takeProfit: takeProfit || undefined,
      positionSize: posSize || undefined,
      result,
      pnlAmount: pnl,
      pnlPercent: 0,
      commission: commission || undefined,
      comment: comment || undefined,
      emotionalTag: emotionalTag || undefined,
      strategy: strategy || undefined,
      setupType: setupType || undefined,
      ticket: ticket || undefined,
    }
  }

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!selectedAccountId) {
      toast({
        title: 'Sélectionnez un compte',
        description: 'Veuillez sélectionner un compte avant d\'importer un fichier CSV.',
        variant: 'destructive',
      })
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // We handle number parsing ourselves for more control
      complete: async (results) => {
        try {
          const headers = results.meta.fields || []
          const parsedTrades: Partial<Trade>[] = []
          let skipped = 0

          for (const row of results.data as Record<string, any>[]) {
            const trade = mapCSVRow(row, headers)
            if (trade) {
              parsedTrades.push(trade)
            } else {
              skipped++
            }
          }

          if (parsedTrades.length === 0) {
            toast({
              title: 'Aucun trade trouvé',
              description: `Le fichier ne contient aucun trade valide. Vérifiez que le CSV contient au minimum les colonnes "symbol/asset" et "date".\n\nColonnes détectées : ${headers.join(', ')}`,
              variant: 'destructive',
            })
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
          }

          // Insert trades one by one (createTrade is already from useDatabase hook)
          let count = 0
          for (let i = 0; i < parsedTrades.length; i += 15) {
            const batch = parsedTrades.slice(i, i + 15)
            for (const trade of batch) {
              await createTrade(trade)
              count++
            }
          }

          toast({
            title: '✅ Import réussi',
            description: `${count} trade${count > 1 ? 's' : ''} importé${count > 1 ? 's' : ''} avec succès${skipped > 0 ? ` (${skipped} lignes ignorées)` : ''}.`,
          })
          triggerRefresh()
        } catch (error: any) {
          console.error('[CSV Import] Error:', error)
          toast({
            title: 'Erreur d\'importation',
            description: error?.message || "Échec de l'importation du fichier CSV.",
            variant: 'destructive',
          })
        }
        if (fileInputRef.current) fileInputRef.current.value = ''
      },
      error: (err) => {
        console.error('[CSV Import] Parse error:', err)
        toast({ title: 'Erreur', description: 'Impossible de lire le fichier CSV. Vérifiez le format du fichier.', variant: 'destructive' })
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    })
  }


  // Reset zoom when changing images
  useEffect(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [currentScreenshotIndex])

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(1, Math.min(5, zoom * delta))
    setZoom(newZoom)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom <= 1) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || zoom <= 1) return
    const container = imageContainerRef.current
    if (!container) return

    const maxPanX = (container.scrollWidth * zoom - container.clientWidth) / 2
    const maxPanY = (container.scrollHeight * zoom - container.clientHeight) / 2

    let newX = e.clientX - dragStart.x
    let newY = e.clientY - dragStart.y

    newX = Math.max(-maxPanX, Math.min(maxPanX, newX))
    newY = Math.max(-maxPanY, Math.min(maxPanY, newY))

    setPan({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedAccountId, searchQuery, resultFilter, directionFilter, dateFrom, dateTo])

  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage)
  const paginatedTrades = filteredTrades.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleCreate = async () => {
    const dateOnly = formData.date.split('T')[0] || formData.date
    const trade = await createTrade({
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
        await saveScreenshot(trade.id, img.data)
      }
    }

    setShowAddDialog(false)
    resetForm()
    triggerRefresh()
  }

  const handleUpdate = async () => {
    if (!editingTrade) return
    const dateOnly = formData.date.split('T')[0] || formData.date
    await updateTrade(editingTrade.id, {
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

    if (formScreenshots.length > 0) {
      for (const img of formScreenshots) {
        if (!img.id) {
          await saveScreenshot(editingTrade.id, img.data)
        }
      }
    }

    setEditingTrade(null)
    resetForm()
    triggerRefresh()
  }

  const handleDelete = async () => {
    if (!deletingTrade) return
    await deleteTrade(deletingTrade.id)
    setDeletingTrade(null)
    triggerRefresh()
  }

  const handleImageUpload = async () => {
    const image = await selectImage()
    if (image && viewingScreenshots) {
      try {
        await saveScreenshot(viewingScreenshots.id, image.data)
        const updatedScreenshots = await getScreenshots(viewingScreenshots.id)
        setScreenshots(updatedScreenshots)
      } catch (err) {
        console.log('Could not update screenshots (table may not exist)')
        setScreenshots([])
      }
    }
  }

  const handleFormImageUpload = async () => {
    const image = await selectImage()
    if (image) {
      setFormScreenshots(prev => [...prev, { data: image.data, name: image.name }])
    }
  }

  const handleFormScreenshotDelete = async (index: number) => {
    const img = formScreenshots[index]
    if (img.id) {
      await deleteScreenshot(img.id)
    }
    setFormScreenshots(prev => prev.filter((_, i) => i !== index))
  }

  const viewScreenshots = async (trade: Trade) => {
    setViewingScreenshots(trade)
    try {
      const tradeScreenshots = await getScreenshots(trade.id)
      setScreenshots(tradeScreenshots)
    } catch (err) {
      console.log('Could not load screenshots (table may not exist)')
      setScreenshots([])
    }
    setCurrentScreenshotIndex(0)
  }

  const handleDeleteScreenshot = async () => {
    if (deletingScreenshot === null || !screenshots[deletingScreenshot]) return

    try {
      await deleteScreenshot(screenshots[deletingScreenshot].id)
      const newScreenshots = screenshots.filter((_, i) => i !== deletingScreenshot)
      setScreenshots(newScreenshots)

      // Adjust index if needed
      if (currentScreenshotIndex >= newScreenshots.length && newScreenshots.length > 0) {
        setCurrentScreenshotIndex(newScreenshots.length - 1)
      }
      setDeletingScreenshot(null)
    } catch (error) {
      console.error('Error deleting screenshot:', error)
    }
  }

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

    // Load existing screenshots for editing preview
    try {
      const existingScreenshots = await getScreenshots(trade.id)
      setFormScreenshots(existingScreenshots.map((s: any) => ({
        id: s.id,
        data: s.image_data,
        name: 'screenshot'
      })))
    } catch (err) {
      console.log('Could not load screenshots (table may not exist)')
      setFormScreenshots([])
    }
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'TP':
      case 'GAIN':
      case 'BE+':
        return <TrendingUp className="h-4 w-4" />
      case 'SL':
      case 'PERTE':
      case 'BE-':
        return <TrendingDown className="h-4 w-4" />
      case 'EN COURS':
        return <Clock className="h-4 w-4" />
      default:
        return <Minus className="h-4 w-4" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Journal de Trading</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Enregistrez et analysez vos trades
          </p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportCSV}
            accept=".csv"
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-1 md:gap-2 h-9 md:h-10 px-2.5 md:px-4">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Importer</span>
          </Button>
          <Button variant="outline" onClick={handleExportCSV} className="gap-1 md:gap-2 h-9 md:h-10 px-2.5 md:px-4">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exporter</span>
          </Button>
          <Button onClick={() => {
            resetForm()
            setShowAddDialog(true)
          }} className="gap-1 md:gap-2 h-9 md:h-10 px-2.5 md:px-4">
            <Plus className="h-4 w-4" />
            <span>Nouveau</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col gap-3">
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un actif..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            <div className="flex flex-row flex-nowrap overflow-x-auto pb-1 gap-2 hide-scrollbar w-full">
              <Select value={resultFilter} onValueChange={setResultFilter}>
                <SelectTrigger className="w-[140px] md:w-[150px] shrink-0">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Résultat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous résultats</SelectItem>
                  {results.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={directionFilter} onValueChange={setDirectionFilter}>
                <SelectTrigger className="w-[140px] md:w-[150px] shrink-0">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Les deux</SelectItem>
                  <SelectItem value="BUY">Long (Buy)</SelectItem>
                  <SelectItem value="SELL">Short (Sell)</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={showDateFilter || dateFrom || dateTo ? 'default' : 'outline'}
                onClick={() => setShowDateFilter(!showDateFilter)}
                className="gap-2 shrink-0"
              >
                <Calendar className="h-4 w-4" />
                {dateFrom || dateTo ? (
                  <span className="text-xs font-semibold">Dates filtrées</span>
                ) : (
                  <span>Filtrer par date</span>
                )}
              </Button>
              {(dateFrom || dateTo) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setDateFrom('')
                    setDateTo('')
                    setShowDateFilter(false)
                  }}
                  className="whitespace-nowrap shrink-0"
                >
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>

          {/* Date Filter Section (Collapsible) */}
          {showDateFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4"
            >
              <div>
                <label className="mb-2 block text-sm font-medium">Depuis</label>
                <DatePicker
                  value={dateFrom}
                  onChange={setDateFrom}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Jusqu'au</label>
                <DatePicker
                  value={dateTo}
                  onChange={setDateTo}
                />
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Trades — Mobile Card View */}
      <div className="md:hidden space-y-3">
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteAllDialog(true)}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-7 px-2 text-xs transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Vider l'historique
          </Button>
        </div>
        {paginatedTrades.map((trade, index) => (
          <MobileTradeCard
            key={trade.id}
            trade={trade}
            account={accounts.find(a => a.id === trade.accountId)}
            onView={setViewingTradeDetails}
            onEdit={openEditDialog}
            onDelete={setDeletingTrade}
            onScreenshots={viewScreenshots}
            index={index}
          />
        ))}
        {filteredTrades.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-3">
              <TrendingUp className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium">Aucun trade trouvé</h3>
            <p className="text-sm text-muted-foreground mt-1">Commencez par ajouter votre premier trade</p>
            <Button onClick={() => setShowAddDialog(true)} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un trade
            </Button>
          </div>
        )}
        {/* Mobile pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1 py-3">
            <p className="text-xs text-muted-foreground">
              {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredTrades.length)} / {filteredTrades.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs tabular-nums">{currentPage}/{totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Trades Table — Desktop Only */}
      <div className="hidden md:block space-y-2">
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteAllDialog(true)}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-7 px-2 text-xs transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Vider l'historique
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-1.5 py-1.5 text-left text-[11px] font-medium text-muted-foreground whitespace-nowrap">Date</th>
                    <th className="px-1.5 py-1.5 text-left text-[11px] font-medium text-muted-foreground whitespace-nowrap">Compte</th>
                    <th className="px-1.5 py-1.5 text-left text-[11px] font-medium text-muted-foreground whitespace-nowrap">Actif</th>
                    <th className="px-1.5 py-1.5 text-left text-[11px] font-medium text-muted-foreground whitespace-nowrap">Direction</th>
                    <th className="px-1.5 py-1.5 text-left text-[11px] font-medium text-muted-foreground whitespace-nowrap">Résultat</th>
                    <th className="px-1.5 py-1.5 text-right text-[11px] font-medium text-muted-foreground whitespace-nowrap">Commission</th>
                    <th className="px-1.5 py-1.5 text-right text-[11px] font-medium text-muted-foreground whitespace-nowrap">Profit</th>
                    <th className="px-1.5 py-1.5 text-right text-[11px] font-medium text-muted-foreground whitespace-nowrap">P&L Net</th>
                    <th className="px-1.5 py-1.5 text-right text-[11px] font-medium text-muted-foreground whitespace-nowrap">R</th>
                    <th className="px-1.5 py-1.5 text-center text-[11px] font-medium text-muted-foreground whitespace-nowrap">Screenshots</th>
                    <th className="px-1.5 py-1.5 text-right text-[11px] font-medium text-muted-foreground whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {paginatedTrades.map((trade) => (
                      <motion.tr
                        key={trade.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-1.5 py-1.5 text-xs whitespace-nowrap">
                          <div>
                            <p>{formatDate(trade.date)}</p>
                            {trade.createdDateTime && (
                              <p className="text-[10px] text-muted-foreground">
                                {new Date(trade.createdDateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-1.5 py-1.5 text-xs">
                          {(() => {
                            const account = accounts.find(a => a.id === trade.accountId);
                            return (
                              <div>
                                <p className="font-medium whitespace-nowrap">{account?.name || 'Inconnu'}</p>
                                {account?.propFirm && <p className="text-[10px] text-muted-foreground whitespace-nowrap">{account.propFirm}</p>}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-1.5 py-1.5 text-xs">
                          <div>
                            <p className="font-medium whitespace-nowrap">{trade.asset}</p>
                            <p className="text-[10px] text-muted-foreground whitespace-nowrap">{trade.timeframe}</p>
                          </div>
                        </td>
                        <td className="px-1.5 py-1.5 text-xs">
                          <Badge
                            variant="outline"
                            className={cn("px-1 py-0 text-[11px]",
                              trade.direction === 'BUY'
                                ? 'bg-trading-green/10 text-trading-green border-trading-green/30'
                                : 'bg-trading-red/10 text-trading-red border-trading-red/30'
                            )}
                          >
                            {trade.direction}
                          </Badge>
                        </td>
                        <td className="px-1.5 py-1.5 text-xs">
                          <Badge
                            variant="outline"
                            className={cn("gap-1 px-1 py-0 text-[11px] whitespace-nowrap", getResultBgColor(trade.result))}
                          >
                            {getResultIcon(trade.result)}
                            {trade.result}
                          </Badge>
                        </td>
                        <td className={cn("px-1.5 py-1.5 text-xs text-right whitespace-nowrap", (trade.commission || 0) < 0 ? 'text-trading-red' : 'text-muted-foreground')}>
                          {trade.commission != null ? formatCurrency(trade.commission) : '-'}
                        </td>
                        <td className={cn("px-1.5 py-1.5 text-xs text-right font-medium whitespace-nowrap", (trade.pnlAmount - (trade.commission || 0) - (trade.swap || 0)) >= 0 ? 'text-trading-green' : 'text-trading-red')}>
                          {formatCurrency(trade.pnlAmount - (trade.commission || 0) - (trade.swap || 0))}
                        </td>
                        <td className={cn(
                          "px-1.5 py-1.5 text-xs text-right font-bold whitespace-nowrap",
                          getResultColor(trade.result)
                        )}>
                          {trade.pnlAmount >= 0 ? '+' : ''}{formatCurrency(trade.pnlAmount)}
                        </td>
                        <td className="px-1.5 py-1.5 text-xs text-right whitespace-nowrap">
                          {trade.rMultiple !== undefined && trade.rMultiple !== null ? (
                            <span className={cn(
                              trade.rMultiple >= 0 ? 'text-trading-green' : 'text-trading-red'
                            )}>
                              {trade.rMultiple > 0 ? '+' : ''}{trade.rMultiple.toFixed(2)}R
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-1.5 py-1.5 text-xs text-center">
                          <button
                            onClick={() => viewScreenshots(trade)}
                            className="inline-flex items-center justify-center p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                            title="Voir les screenshots"
                          >
                            <ImageIcon className="h-4 w-4" />
                          </button>
                        </td>
                        <td className="px-1.5 py-1.5 text-xs text-right">
                          <div className="flex justify-end gap-0.5">
                            <button
                              onClick={() => setViewingTradeDetails(trade)}
                              className="p-1 rounded-md hover:bg-primary/20 hover:text-primary transition-colors"
                              title="Détails"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openEditDialog(trade)}
                              className="p-1 rounded-md hover:bg-accent transition-colors"
                              title="Modifier"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingTrade(trade)}
                              className="p-1 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/10">
                <div className="text-sm text-muted-foreground">
                  Affichage de <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> à <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, filteredTrades.length)}</span> sur <span className="font-medium text-foreground">{filteredTrades.length}</span> trades
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm px-2">
                    Page {currentPage} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {filteredTrades.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Aucun trade trouvé</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Commencez par ajouter votre premier trade
                </p>
                <Button onClick={() => setShowAddDialog(true)} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter un trade
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={showAddDialog || !!editingTrade}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false)
            setEditingTrade(null)
            resetForm()
          }
        }}
      >
        <DialogContent
          className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e) => {
            if (lightboxImage) {
              e.preventDefault();
              setLightboxImage(null);
            }
          }}
          onEscapeKeyDown={(e) => {
            if (lightboxImage) {
              e.preventDefault();
              setLightboxImage(null);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {editingTrade ? 'Modifier le trade' : 'Nouveau trade'}
            </DialogTitle>
            <DialogDescription>
              {editingTrade ? 'Modifiez les détails du trade ci-dessous' : 'Créez une nouvelle entrée de trade'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Compte</label>
                <Select
                  value={formData.accountId}
                  onValueChange={(v) => setFormData({ ...formData, accountId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un compte" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">📅 Date & Heure</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <DatePicker
                      value={formData.date.split('T')[0]}
                      onChange={(newDate) => {
                        const time = formData.date.split('T')[1] || '00:00'
                        setFormData({ ...formData, date: `${newDate}T${time}` })
                      }}
                    />
                  </div>
                  <div className="relative w-28">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-primary pointer-events-none z-10" />
                    <Input
                      type="time"
                      value={formData.date.split('T')[1] || '00:00'}
                      onChange={(e) => {
                        const date = formData.date.split('T')[0] || new Date().toISOString().split('T')[0]
                        setFormData({ ...formData, date: `${date}T${e.target.value}` })
                      }}
                      className="pl-9 text-center font-medium text-sm"
                      title="Heure du trade"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Input
                label="Actif"
                placeholder="EURUSD"
                value={formData.asset}
                onChange={(e) => setFormData({ ...formData, asset: e.target.value.toUpperCase() })}
              />
              <Input
                label="Timeframe"
                placeholder="ex: 15m, 1h, 4h..."
                value={formData.timeframe}
                onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
              />
              <div>
                <label className="mb-2 block text-sm font-medium">Direction</label>
                <Tabs
                  value={formData.direction}
                  onValueChange={(v) => setFormData({ ...formData, direction: v as 'BUY' | 'SELL' })}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="BUY">ACHAT</TabsTrigger>
                    <TabsTrigger value="SELL">VENTE</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Input
                label="Risque (%)"
                type="number"
                step="0.1"
                value={formData.riskPercent}
                onChange={(e) => setFormData({ ...formData, riskPercent: Number(e.target.value) })}
              />
              <Input
                label="Prix d'entrée"
                type="number"
                step="0.00001"
                value={formData.entryPrice}
                onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
              />
              <Input
                label="Prix de sortie"
                type="number"
                step="0.00001"
                value={formData.exitPrice}
                onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Stop Loss"
                type="number"
                step="0.00001"
                value={formData.stopLoss}
                onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
              />
              <Input
                label="Take Profit"
                type="number"
                step="0.00001"
                value={formData.takeProfit}
                onChange={(e) => setFormData({ ...formData, takeProfit: e.target.value })}
              />
            </div>

            {calculatedRR && (
              <div className="flex justify-end mt-[-8px]">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                  RR Prévu : 1 : {calculatedRR}
                </Badge>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Résultat</label>
                <Select
                  value={formData.result}
                  onValueChange={(v) => setFormData({ ...formData, result: v as TradeResult })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {results.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <Input
                  label="P&L Net ($)"
                  type="number"
                  step="0.01"
                  value={formData.pnlAmount}
                  onChange={(e) => setFormData({ ...formData, pnlAmount: Number(e.target.value) })}
                />
                {calculatedRMultiple && Number(calculatedRMultiple) !== 0 && (
                  <div className="absolute right-3 top-9 text-xs font-semibold text-muted-foreground">
                    {Number(calculatedRMultiple) > 0 ? '+' : ''}{calculatedRMultiple}R
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Tag émotionnel</label>
                <Select
                  value={formData.emotionalTag}
                  onValueChange={(v) => setFormData({ ...formData, emotionalTag: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {emotionalTags.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                label="Stratégie"
                placeholder="Breakout, Retest..."
                value={formData.strategy}
                onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Commentaire</label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Analyse du trade, leçons apprises..."
                className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Screenshots Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Screenshots</label>
                <Button type="button" variant="outline" size="sm" onClick={handleFormImageUpload} className="gap-1 text-xs">
                  <Plus className="h-3 w-3" />
                  Ajouter
                </Button>
              </div>
              {formScreenshots.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {formScreenshots.map((img, i) => (
                    <div key={i} className="relative group rounded-lg border border-border overflow-hidden bg-muted">
                      <img
                        src={`data:image/png;base64,${img.data}`}
                        alt={`Screenshot ${i + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      {/* Overlay actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setLightboxImage(img.data)}
                          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                          title="Agrandir"
                        >
                          <Maximize2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleFormScreenshotDelete(i);
                            handleFormImageUpload();
                          }}
                          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                          title="Remplacer"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFormScreenshotDelete(i)}
                          className="p-1.5 rounded-lg bg-red-500/60 hover:bg-red-500/80 text-white transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-6 border border-dashed border-border rounded-lg text-muted-foreground text-sm cursor-pointer hover:border-primary/50 transition-colors" onClick={handleFormImageUpload}>
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Cliquez pour ajouter des screenshots
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false)
                  setEditingTrade(null)
                  resetForm()
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={editingTrade ? handleUpdate : handleCreate}
                disabled={!formData.accountId || !formData.asset}
              >
                {editingTrade ? 'Mettre à jour' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Screenshots Dialog */}
      <Dialog open={!!viewingScreenshots} onOpenChange={() => {
        setViewingScreenshots(null)
        setZoom(1)
        setPan({ x: 0, y: 0 })
      }}>
        <DialogContent className="w-full h-[calc(100vh-80px)] max-w-full sm:max-w-[1200px] lg:max-w-[1400px] flex flex-col p-0 border-0 bg-gradient-to-b from-background to-muted/20">
          <DialogDescription className="sr-only">Visualiser les screenshots du trade</DialogDescription>
          <DialogHeader className="border-b px-6 pt-4 pb-4">
            <DialogTitle className="flex items-center justify-between">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-bold"
              >
                Screenshots - {viewingScreenshots?.asset} ({currentScreenshotIndex + 1}/{screenshots.length})
              </motion.span>
              <div className="flex gap-2">
                {screenshots.length > 0 && (
                  <Button
                    onClick={() => setDeletingScreenshot(currentScreenshotIndex)}
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                )}
                <Button onClick={handleImageUpload} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden px-6 py-4">
            {screenshots.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col gap-4"
              >
                <motion.div
                  ref={imageContainerRef}
                  className="relative flex-1 bg-muted rounded-lg overflow-hidden cursor-grab active:cursor-grabbing shadow-xl"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ userSelect: 'none' }}
                >
                  <div
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      transformOrigin: '0 0',
                      transition: isDragging ? 'none' : 'transform 0.1s',
                      cursor: zoom > 1 ? 'grab' : 'default'
                    }}
                    className="w-full h-full"
                  >
                    <img
                      src={`data:image/png;base64,${screenshots[currentScreenshotIndex]?.image_data}`}
                      alt={`Screenshot ${currentScreenshotIndex + 1}`}
                      className="w-full h-full object-contain pointer-events-none"
                      draggable={false}
                    />
                  </div>

                  {zoom > 1 && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white px-3 py-1 rounded text-xs">
                      {Math.round(zoom * 100)}%
                    </div>
                  )}

                  {screenshots.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentScreenshotIndex(i => Math.max(0, i - 1))}
                        disabled={currentScreenshotIndex === 0}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white disabled:opacity-30"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={() => setCurrentScreenshotIndex(i => Math.min(screenshots.length - 1, i + 1))}
                        disabled={currentScreenshotIndex === screenshots.length - 1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white disabled:opacity-30"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                </motion.div>
                <motion.div
                  className="flex justify-center gap-2 pb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  {screenshots.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentScreenshotIndex(i)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        i === currentScreenshotIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                      )}
                    />
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Aucun screenshot</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Ajoutez des screenshots pour analyser vos trades
                </p>
                <Button onClick={handleImageUpload} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter un screenshot
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Trade Details Dialog */}
      <Dialog open={!!viewingTradeDetails} onOpenChange={(open) => !open && setViewingTradeDetails(null)}>
        <DialogContent className="sm:max-w-[700px] bg-background max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between mt-2">
              <DialogTitle className="text-xl flex items-center gap-2">
                Détails du Trade
              </DialogTitle>
            </div>
            <DialogDescription>
              Vue détaillée et non-modifiable des informations d'exécution.
            </DialogDescription>
          </DialogHeader>

          {viewingTradeDetails && (
            <div className="space-y-6 pt-4">
              {/* Top Meta Info */}
              <div className="flex flex-wrap gap-4 items-center p-4 bg-muted/50 rounded-xl border border-border">
                <div className="flex-1">
                  <p className="text-sm font-semibold">{viewingTradeDetails.asset}</p>
                  <p className="text-xs text-muted-foreground">{viewingTradeDetails.timeframe}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-sm px-3 py-1",
                    viewingTradeDetails.direction === 'BUY'
                      ? 'bg-trading-green/10 text-trading-green border-trading-green/30'
                      : 'bg-trading-red/10 text-trading-red border-trading-red/30'
                  )}
                >
                  {viewingTradeDetails.direction === 'BUY' ? 'Achat (Long)' : 'Vente (Short)'}
                </Badge>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Volume</p>
                  <p className="font-semibold">{viewingTradeDetails.positionSize || '-'} Lots</p>
                </div>
              </div>

              {/* Execution Details grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground whitespace-nowrap">Création (Entry)</p>
                  <p className="text-sm font-medium">
                    {formatDate(viewingTradeDetails.date)}<br />
                    {viewingTradeDetails.createdDateTime && new Date(viewingTradeDetails.createdDateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Prix d'Entrée</p>
                  <p className="text-sm font-medium">{viewingTradeDetails.entryPrice || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Dernière MAJ (Exit)</p>
                  <p className="text-sm font-medium">
                    {viewingTradeDetails.updatedAt ? (
                      <>
                        {formatDate(viewingTradeDetails.updatedAt)}<br />
                        {new Date(viewingTradeDetails.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </>
                    ) : '-'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Prix de Sortie</p>
                  <p className="text-sm font-medium">{viewingTradeDetails.exitPrice || 'En cours...'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pt-4 border-t border-border">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Stop Loss</p>
                  <p className="text-sm font-medium">{viewingTradeDetails.stopLoss || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Take Profit</p>
                  <p className="text-sm font-medium">{viewingTradeDetails.takeProfit || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">R-Multiple</p>
                  <p className="text-sm font-medium">{viewingTradeDetails.rMultiple !== undefined && viewingTradeDetails.rMultiple !== null ? `${viewingTradeDetails.rMultiple.toFixed(2)}R` : '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Profit (Brut)</p>
                  <p className={cn("text-sm font-medium", (viewingTradeDetails.pnlAmount - (viewingTradeDetails.commission || 0) - (viewingTradeDetails.swap || 0)) >= 0 ? 'text-trading-green' : 'text-trading-red')}>
                    {formatCurrency(viewingTradeDetails.pnlAmount - (viewingTradeDetails.commission || 0) - (viewingTradeDetails.swap || 0))}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Commission</p>
                  <p className={cn("text-sm font-medium", (viewingTradeDetails.commission || 0) < 0 ? 'text-trading-red' : '')}>
                    {viewingTradeDetails.commission != null ? formatCurrency(viewingTradeDetails.commission) : '-'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Swap</p>
                  <p className={cn("text-sm font-medium", (viewingTradeDetails.swap || 0) < 0 ? 'text-trading-red' : (viewingTradeDetails.swap || 0) > 0 ? 'text-trading-green' : '')}>
                    {viewingTradeDetails.swap != null ? formatCurrency(viewingTradeDetails.swap) : '-'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-4 border-t border-border">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">P&L Net (Après frais)</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("px-1", getResultBgColor(viewingTradeDetails.result))}>
                      {viewingTradeDetails.result}
                    </Badge>
                    <span className={cn("text-sm font-bold", getResultColor(viewingTradeDetails.result))}>
                      {viewingTradeDetails.pnlAmount >= 0 ? '+' : ''}{formatCurrency(viewingTradeDetails.pnlAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Extra info */}
              <div className="pt-4 border-t border-border grid gap-4 grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Stratégie</p>
                  <Badge variant="secondary">{viewingTradeDetails.strategy || 'Non définie'}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Émotion</p>
                  <Badge variant="secondary">{viewingTradeDetails.emotionalTag || 'Non définie'}</Badge>
                </div>
              </div>

              {viewingTradeDetails.comment && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Commentaire</p>
                  <div className="px-3 py-2 bg-muted rounded-md text-sm whitespace-pre-wrap">
                    {viewingTradeDetails.comment}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setViewingTradeDetails(null)}>Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete All Confirmation */}
      <AlertDialog
        open={showDeleteAllDialog}
        onOpenChange={(isOpen) => setShowDeleteAllDialog(isOpen)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vider l'historique des trades ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la totalité de vos trades ? Cette action est irréversible et supprimera de manière permanente votre historique de transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                try {
                  await deleteAllTrades()
                  setShowDeleteAllDialog(false)
                  toast({ title: 'Succès', description: 'Tout l\'historique a été supprimé' })
                } catch (error) {
                  console.error('Error deleting all trades:', error)
                  toast({ title: 'Erreur', description: 'Impossible de vider l\'historique', variant: 'destructive' })
                }
              }}
            >
              Tout supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Screenshot Confirmation */}
      <AlertDialog
        open={deletingScreenshot !== null}
        onOpenChange={() => setDeletingScreenshot(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le screenshot ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce screenshot ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteScreenshot}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingTrade}
        onOpenChange={() => setDeletingTrade(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce trade sur {deletingTrade?.asset} ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lightbox for full-size screenshot preview */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              onClick={() => setLightboxImage(null)}
            >
              <X className="h-6 w-6" />
            </button>
            <motion.img
              src={`data:image/png;base64,${lightboxImage}`}
              alt="Screenshot preview"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
