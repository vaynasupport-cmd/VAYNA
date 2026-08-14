import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import Papa from 'papaparse'

import { useStore } from '@/hooks/useStore'
import { useDatabase } from '@/hooks/useDatabase'
import { useToast } from '@/hooks/useToast'
import type { Trade } from '@/types'

import { TradeFilters } from '@/features/trades/components/TradeFilters'
import { useTradeFilters } from '@/features/trades/hooks/useTradeFilters'
import { TradeList } from '@/features/trades/components/TradeList'
import { TradeFormDialog } from '@/features/trades/components/TradeFormDialog'
import { useTradeForm } from '@/features/trades/hooks/useTradeForm'
import { ScreenshotViewer } from '@/features/trades/components/ScreenshotViewer'
import { TradeDetailsDialog } from '@/features/trades/components/TradeDetailsDialog'

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

export function Trades() {
  const trades = useStore(s => s.trades)
  const accounts = useStore(s => s.accounts)
  const selectedAccountId = useStore(s => s.selectedAccountId)
  const { deleteTrade, deleteAllTrades, selectImage } = useDatabase()
  const { toast } = useToast()

  // Filters
  const tradeFilters = useTradeFilters(trades, selectedAccountId)
  
  // Form
  const tradeForm = useTradeForm()
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  // Dialogs State
  const [viewingTradeDetails, setViewingTradeDetails] = useState<Trade | null>(null)
  const [deletingTrade, setDeletingTrade] = useState<Trade | null>(null)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  
  // Screenshots View State
  const [viewingScreenshots, setViewingScreenshots] = useState<Trade | null>(null)

  const handleExportCSV = () => {
    if (tradeFilters.filteredTrades.length === 0) {
      toast({ title: 'Erreur', description: 'Aucun trade à exporter', variant: 'destructive' })
      return
    }

    const csvContent = Papa.unparse(tradeFilters.filteredTrades)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `trades_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDelete = async () => {
    if (!deletingTrade) return
    try {
      await deleteTrade(deletingTrade.id)
      setDeletingTrade(null)
      toast({ title: 'Succès', description: 'Le trade a été supprimé.' })
    } catch (error) {
      console.error(error)
      toast({ title: 'Erreur', description: 'Impossible de supprimer le trade.', variant: 'destructive' })
    }
  }

  const handleFormImageUpload = async () => {
    const image = await selectImage()
    if (image) {
      tradeForm.setFormScreenshots([...tradeForm.formScreenshots, image])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 pb-20 md:pb-6"
    >
      <TradeFilters 
        filters={tradeFilters} 
        onExportCSV={handleExportCSV}
        onAddTrade={() => tradeForm.setShowAddDialog(true)}
      />

      <TradeList 
        paginatedTrades={tradeFilters.paginatedTrades}
        filteredTrades={tradeFilters.filteredTrades}
        accounts={accounts}
        currentPage={tradeFilters.currentPage}
        totalPages={tradeFilters.totalPages}
        itemsPerPage={tradeFilters.itemsPerPage}
        setCurrentPage={tradeFilters.setCurrentPage}
        onView={setViewingTradeDetails}
        onEdit={tradeForm.openEditDialog}
        onDelete={setDeletingTrade}
        onScreenshots={setViewingScreenshots}
        onDeleteAll={() => setShowDeleteAllDialog(true)}
        onAddTrade={() => tradeForm.setShowAddDialog(true)}
      />

      <TradeFormDialog 
        form={tradeForm}
        accounts={accounts}
        lightboxImage={lightboxImage}
        setLightboxImage={setLightboxImage}
        handleFormImageUpload={handleFormImageUpload}
      />

      <TradeDetailsDialog 
        trade={viewingTradeDetails}
        onClose={() => setViewingTradeDetails(null)}
      />

      <ScreenshotViewer 
        trade={viewingScreenshots}
        onClose={() => setViewingScreenshots(null)}
      />

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
