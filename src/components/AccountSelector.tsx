import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Plus, Wallet } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { useDatabase } from '@/hooks/useDatabase'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency, getStatusColor } from '@/lib/utils'

export function AccountSelector() {
  const accounts = useStore(s => s.accounts)
  const selectedAccountId = useStore(s => s.selectedAccountId)
  const setSelectedAccountId = useStore(s => s.setSelectedAccountId)
  const triggerRefresh = useStore(s => s.triggerRefresh)
  const { createAccount } = useDatabase()
  const [isOpen, setIsOpen] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newAccount, setNewAccount] = useState({
    name: '',
    propFirm: '',
    initialCapital: 50000,
    maxDrawdownPercent: 10,
    targetPercent: 10,
  })

  const selectedAccount = accounts.find(a => a.id === selectedAccountId)

  const handleCreateAccount = async () => {
    if (!newAccount.name) return
    
    await createAccount({
      name: newAccount.name,
      propFirm: newAccount.propFirm || null,
      initialCapital: Number(newAccount.initialCapital),
      maxDrawdownPercent: Number(newAccount.maxDrawdownPercent),
      targetPercent: Number(newAccount.targetPercent),
    })
    
    setShowAddDialog(false)
    setNewAccount({
      name: '',
      propFirm: '',
      initialCapital: 50000,
      maxDrawdownPercent: 10,
      targetPercent: 10,
    })
    triggerRefresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
          isOpen && "border-primary/50 ring-2 ring-primary/20"
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 text-left">
          {selectedAccount ? (
            <>
              <p className="font-medium">{selectedAccount.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(selectedAccount.currentCapital)}
              </p>
            </>
          ) : (
            <>
              <p className="font-medium">Tous les comptes</p>
              <p className="text-xs text-muted-foreground">
                {accounts.length} compte{accounts.length > 1 ? 's' : ''}
              </p>
            </>
          )}
        </div>
        
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 z-40 mt-2 rounded-xl border border-border bg-popover shadow-xl"
            >
              <div className="p-2">
                <button
                  onClick={() => {
                    setSelectedAccountId(null)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    !selectedAccountId 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-accent"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-left">Tous les comptes</span>
                  {!selectedAccountId && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
                
                <div className="my-2 h-px bg-border" />
                
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => {
                      setSelectedAccountId(account.id)
                      setIsOpen(false)
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      selectedAccountId === account.id 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-accent"
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <span className="text-xs font-bold">
                        {account.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{account.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(account.currentCapital)}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getStatusColor(account.status))}
                    >
                      {account.status}
                    </Badge>
                    {selectedAccountId === account.id && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
                
                <div className="my-2 h-px bg-border" />
                
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-primary hover:bg-primary/10 transition-colors">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Plus className="h-4 w-4" />
                      </div>
                      <span className="flex-1 text-left font-medium">Nouveau compte</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Créer un nouveau compte</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Input
                        label="Nom du compte"
                        placeholder="Mon compte de trading"
                        value={newAccount.name}
                        onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                      />
                      <Input
                        label="Prop Firm (optionnel)"
                        placeholder="FTMO, MyForexFunds, etc."
                        value={newAccount.propFirm}
                        onChange={(e) => setNewAccount({ ...newAccount, propFirm: e.target.value })}
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <Input
                          label="Capital initial"
                          type="number"
                          value={newAccount.initialCapital}
                          onChange={(e) => setNewAccount({ ...newAccount, initialCapital: Number(e.target.value) })}
                        />
                        <Input
                          label="Drawdown max (%)"
                          type="number"
                          value={newAccount.maxDrawdownPercent}
                          onChange={(e) => setNewAccount({ ...newAccount, maxDrawdownPercent: Number(e.target.value) })}
                        />
                        <Input
                          label="Objectif (%)"
                          type="number"
                          value={newAccount.targetPercent}
                          onChange={(e) => setNewAccount({ ...newAccount, targetPercent: Number(e.target.value) })}
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleCreateAccount} disabled={!newAccount.name}>
                          Créer le compte
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
