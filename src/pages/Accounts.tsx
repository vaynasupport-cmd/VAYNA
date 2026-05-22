import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Wallet, AlertTriangle } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { useDatabase } from '@/hooks/useDatabase'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
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
import { cn, formatCurrency, formatPercent, getStatusColor, getStatusBgColor } from '@/lib/utils'
import type { Account } from '@/types'

export function Accounts() {
  const accounts = useStore(s => s.accounts)
  const triggerRefresh = useStore(s => s.triggerRefresh)
  const { createAccount, updateAccount, deleteAccount } = useDatabase()
  const { toast } = useToast()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null)

  const [formData, setFormData] = useState<any>({
    name: '',
    propFirm: '',
    initialCapital: 50000,
    currentCapital: 50000,
    maxDrawdownPercent: 10,
    targetPercent: 10,
    status: 'active',
  })

  const handleCreate = async () => {
    try {
      if (!formData.name.trim()) {
        toast({
          title: 'Erreur',
          description: 'Veuillez entrer un nom pour le compte',
          variant: 'destructive',
        })
        return
      }
      await createAccount(formData)
      setShowAddDialog(false)
      resetForm()
      triggerRefresh()
      toast({
        title: 'Succès',
        description: 'Compte créé avec succès',
      })
    } catch (error) {
      console.error('Error creating account:', error)
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de créer le compte',
        variant: 'destructive',
      })
    }
  }

  const handleUpdate = async () => {
    try {
      if (!editingAccount) return
      await updateAccount(editingAccount.id, formData)
      setEditingAccount(null)
      resetForm()
      triggerRefresh()
      toast({
        title: 'Succès',
        description: 'Compte mis à jour avec succès',
      })
    } catch (error) {
      console.error('Error updating account:', error)
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de mettre à jour le compte',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    try {
      if (!deletingAccount) return
      await deleteAccount(deletingAccount.id)
      setDeletingAccount(null)
      triggerRefresh()
      toast({
        title: 'Succès',
        description: 'Compte supprimé avec succès',
      })
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de supprimer le compte',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      propFirm: '',
      initialCapital: 50000,
      currentCapital: 50000,
      maxDrawdownPercent: 10,
      targetPercent: 10,
      status: 'active',
    })
  }

  const openEditDialog = (account: Account) => {
    setEditingAccount(account)
    setFormData({
      name: account.name,
      propFirm: account.propFirm || '',
      initialCapital: account.initialCapital,
      currentCapital: account.currentCapital,
      maxDrawdownPercent: account.maxDrawdownPercent,
      targetPercent: account.targetPercent,
      status: account.status,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-6 w-6 text-primary opacity-80" />
            <h1 className="text-3xl font-black tracking-tight">Comptes de Trading</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Gérez vos comptes Prop Firms et suivez vos objectifs
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau compte
          </Button>
        </motion.div>
      </motion.div>

      {/* Empty state */}
      {accounts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <Wallet className="h-10 w-10 text-primary/60" />
          </div>
          <h2 className="text-xl font-bold mb-2">Aucun compte pour l'instant</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Créez votre premier compte Prop Firm pour commencer à suivre vos performances.
          </p>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Créer un compte
          </Button>
        </motion.div>
      )}

      {/* Accounts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {accounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
              layout
            >
              <Card className={cn(
                "group relative overflow-hidden transition-all duration-300",
                getStatusBgColor(account.status)
              )}>
                {/* Ambient glow orb */}
                <div
                  className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-[0.07] pointer-events-none transition-opacity duration-300 group-hover:opacity-[0.14]"
                  style={{ background: account.status === 'lost' ? '#ef4444' : account.status === 'validated' ? '#10b981' : '#3b82f6' }}
                />

                <CardHeader className="pb-4 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 8 }}
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-background/60 border border-border/50"
                      >
                        <Wallet className="h-5 w-5 text-primary" />
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-base leading-tight">{account.name}</h3>
                        {account.propFirm && (
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                            {account.propFirm}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={() => openEditDialog(account)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingAccount(account)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 relative">
                  {/* Status Badge with animated dot */}
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn("gap-1.5 text-[10px] uppercase tracking-wider font-semibold", getStatusColor(account.status))}
                    >
                      <motion.span
                        className="inline-block w-1.5 h-1.5 rounded-full"
                        style={{ background: account.status === 'active' ? '#10b981' : account.status === 'lost' ? '#ef4444' : '#3b82f6' }}
                        animate={{ opacity: [1, 0.4, 1], scale: [1, 1.4, 1] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      />
                      {account.status === 'active' && 'Actif'}
                      {account.status === 'lost' && 'Perdu'}
                      {account.status === 'validated' && 'Validé'}
                    </Badge>
                  </div>

                  {/* Capital grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-1">Capital actuel</p>
                      <p className="text-lg font-black number-font">{formatCurrency(account.currentCapital)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-1">Profit / Perte</p>
                      <p className={cn(
                        "text-lg font-black number-font",
                        account.profitAmount >= 0 ? 'text-trading-green' : 'text-trading-red'
                      )}>
                        {account.profitAmount >= 0 ? '+' : ''}{formatCurrency(account.profitAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Target progress */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1.5">
                      <span className="text-muted-foreground font-medium">Objectif</span>
                      <span className="font-semibold tabular-nums">
                        {formatPercent(account.targetAmount > 0 ? (account.profitAmount / account.targetAmount) * 100 : 0)} / {formatPercent(account.targetPercent)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-background/50 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(Math.max(account.targetAmount > 0 ? (account.profitAmount / account.targetAmount) * 100 : 0, 0), 100)}%` }}
                        transition={{ duration: 1.1, delay: 0.3 + index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className={cn(
                          "h-full rounded-full relative overflow-hidden",
                          account.profitAmount >= 0 ? 'bg-trading-green' : 'bg-trading-red'
                        )}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                        />
                      </motion.div>
                    </div>
                  </div>

                  {/* Drawdown */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1.5">
                      <span className="text-muted-foreground font-medium">Drawdown</span>
                      <span className={cn(
                        "font-semibold tabular-nums",
                        account.currentDrawdownAmount >= account.maxDrawdownAmount * 0.8 && 'text-trading-red'
                      )}>
                        {formatCurrency(account.currentDrawdownAmount)} / {formatCurrency(account.maxDrawdownAmount)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-background/50 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((account.currentDrawdownAmount / account.maxDrawdownAmount) * 100, 100)}%` }}
                        transition={{ duration: 1.1, delay: 0.45 + index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className={cn(
                          "h-full rounded-full relative overflow-hidden",
                          account.currentDrawdownAmount >= account.maxDrawdownAmount * 0.8
                            ? 'bg-trading-red'
                            : 'bg-trading-orange'
                        )}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
                        />
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Account Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: accounts.length * 0.1 }}
        >
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex h-full min-h-[320px] w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border bg-card/50 transition-all duration-300 hover:border-primary/50 hover:bg-primary/5"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium text-lg">Ajouter un compte</p>
              <p className="text-sm text-muted-foreground">Créer un nouveau compte de trading</p>
            </div>
          </button>
        </motion.div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={showAddDialog || !!editingAccount}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false)
            setEditingAccount(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? 'Modifier le compte' : 'Nouveau compte'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              label="Nom du compte"
              placeholder="Mon compte de trading"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Prop Firm (optionnel)"
              placeholder="FTMO, MyForexFunds, etc."
              value={formData.propFirm}
              onChange={(e) => setFormData({ ...formData, propFirm: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Capital initial"
                type="number"
                value={formData.initialCapital}
                onChange={(e) => setFormData({
                  ...formData,
                  initialCapital: Number(e.target.value),
                  currentCapital: Number(e.target.value)
                })}
              />
              {editingAccount && (
                <Input
                  label="Capital actuel"
                  type="number"
                  value={formData.currentCapital}
                  onChange={(e) => setFormData({ ...formData, currentCapital: Number(e.target.value) })}
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Drawdown max (%)"
                type="number"
                value={formData.maxDrawdownPercent}
                onChange={(e) => setFormData({ ...formData, maxDrawdownPercent: Number(e.target.value) })}
              />
              <Input
                label="Objectif (%)"
                type="number"
                value={formData.targetPercent}
                onChange={(e) => setFormData({ ...formData, targetPercent: Number(e.target.value) })}
              />
            </div>
            {editingAccount && (
              <div>
                <label className="mb-2 block text-sm font-medium">Statut</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="active">Actif</option>
                  <option value="lost">Perdu</option>
                  <option value="validated">Validé</option>
                </select>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false)
                  setEditingAccount(null)
                  resetForm()
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={editingAccount ? handleUpdate : handleCreate}
                disabled={!formData.name}
              >
                {editingAccount ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingAccount}
        onOpenChange={() => setDeletingAccount(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le compte "{deletingAccount?.name}" ?
              Cette action est irréversible et supprimera également tous les trades associés.
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
    </motion.div>
  )
}
