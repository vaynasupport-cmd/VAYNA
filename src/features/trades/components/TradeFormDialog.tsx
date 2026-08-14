import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/DatePicker'
import { Clock, Plus, Image as ImageIcon, Maximize2, Edit2, Trash2 } from 'lucide-react'
import type { TradeResult } from '@/types'

const results: TradeResult[] = ['TP', 'SL', 'BE', 'GAIN', 'PERTE', 'BE+', 'BE-', 'EN COURS']
const emotionalTags = ['confiant', 'peur', 'avidité', 'impatience', 'calme', 'stress', 'frustration', 'satisfaction']

interface TradeFormDialogProps {
  form: any // Return type of useTradeForm
  accounts: any[]
  lightboxImage: string | null
  setLightboxImage: (img: string | null) => void
  handleFormImageUpload: () => void
}

export function TradeFormDialog({
  form,
  accounts,
  lightboxImage,
  setLightboxImage,
  handleFormImageUpload
}: TradeFormDialogProps) {
  const {
    showAddDialog, setShowAddDialog,
    editingTrade, setEditingTrade,
    formData, setFormData,
    formScreenshots,
    resetForm,
    handleCreate,
    handleUpdate,
    handleFormScreenshotDelete,
    calculatedRMultiple
  } = form

  return (
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
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto pb-32 md:pb-6"
        onInteractOutside={(e) => {
          if (lightboxImage) {
            e.preventDefault()
            setLightboxImage(null)
          }
        }}
        onEscapeKeyDown={(e) => {
          if (lightboxImage) {
            e.preventDefault()
            setLightboxImage(null)
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
                {formScreenshots.map((img: any, i: number) => (
                  <div key={i} className="relative group rounded-lg border border-border overflow-hidden bg-muted">
                    <img
                      src={`data:image/png;base64,${img.data}`}
                      alt={`Screenshot ${i + 1}`}
                      className="w-full h-24 object-cover"
                    />
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
                          handleFormScreenshotDelete(i)
                          handleFormImageUpload()
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
  )
}
