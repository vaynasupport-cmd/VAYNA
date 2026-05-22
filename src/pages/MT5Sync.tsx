import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, Wifi, WifiOff, RefreshCw, Server, User, Lock, Eye, EyeOff, Shield, Info, Clock, Zap } from 'lucide-react'
import { useMT5Account } from '@/hooks/useMT5Account'
import { useStore } from '@/hooks/useStore'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

export function MT5Sync() {
  const { mt5Sync, connectMT5, disconnectMT5, refreshSyncCount } = useMT5Account()
  const accounts = useStore(s => s.accounts)
  const autoImportEnabled = useStore(s => s.autoImportEnabled)
  const { toast } = useToast()

  // Wizard state
  const [step, setStep] = useState<'form' | 'connected'>(() => {
    if (mt5Sync.mt5AccountId && mt5Sync.status !== 'idle') return 'connected'
    return 'form'
  })

  // Form state
  const [brokerServer, setBrokerServer] = useState('')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedVaynaAccount, setSelectedVaynaAccount] = useState<string>('')
  const [connecting, setConnecting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Update step when sync state changes
  useEffect(() => {
    if (mt5Sync.mt5AccountId) {
      setStep('connected')
    }
  }, [mt5Sync.mt5AccountId])

  // Refresh sync count periodically
  useEffect(() => {
    if (step !== 'connected') return
    refreshSyncCount()
    const interval = setInterval(refreshSyncCount, 15_000)
    return () => clearInterval(interval)
  }, [step, refreshSyncCount])

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!brokerServer.trim() || !login.trim() || !password.trim()) {
      toast({ title: 'Champs requis', description: 'Veuillez remplir tous les champs.', variant: 'destructive' })
      return
    }
    if (!selectedVaynaAccount) {
      toast({ title: 'Compte requis', description: 'Sélectionnez un compte VAYNA de destination.', variant: 'destructive' })
      return
    }

    setConnecting(true)
    try {
      await connectMT5({
        login: login.trim(),
        investorPassword: password.trim(),
        brokerServer: brokerServer.trim(),
        vaynaAccountId: selectedVaynaAccount,
      })
      setStep('connected')
    } catch {
      // Error handled in hook
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-blue-500 flex items-center gap-4">
          <img src="./mt5-logo.jpg" alt="MT5 Logo" className="w-10 h-10 rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.3)] object-cover" />
          Synchronisation MT5
        </h1>
        <p className="text-muted-foreground mt-2">
          Connectez votre compte MetaTrader 5 pour importer automatiquement tous vos trades en temps réel.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl">
        {/* Main Content Area */}
        <motion.div
          className="flex-1 bg-card/30 border border-border rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden h-fit"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <AnimatePresence mode="wait">
            {step === 'form' ? (
              <motion.div
                key="mt5sync-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-xl mx-auto"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    Connecter votre compte MT5
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Entrez vos identifiants MetaTrader 5. Nous utilisons uniquement le <strong>mot de passe investisseur</strong> (lecture seule).
                  </p>
                </div>

                <form onSubmit={handleConnect} className="space-y-5">
                  {/* Broker Server */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Serveur du Broker</label>
                    <div className="relative">
                      <Server className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        value={brokerServer}
                        onChange={(e) => setBrokerServer(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-colors"
                        placeholder="Ex: FTMO-Demo, ICMarkets-Live05"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">Trouvez-le dans MetaTrader → Fichier → Se connecter au compte de trading</p>
                  </div>

                  {/* Login */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Numéro de compte (Login)</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-colors"
                        placeholder="Ex: 51234567"
                      />
                    </div>
                  </div>

                  {/* Investor Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      Mot de passe Investisseur
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-medium">LECTURE SEULE</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-2.5 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-colors"
                        placeholder="Mot de passe investisseur"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Shield size={11} />
                      Ce mot de passe donne un accès en lecture seule. Aucun trade ne peut être exécuté par VAYNA.
                    </p>
                  </div>

                  {/* VAYNA Account destination */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Compte VAYNA de destination</label>
                    <select
                      value={selectedVaynaAccount}
                      onChange={(e) => setSelectedVaynaAccount(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-colors text-sm"
                    >
                      <option value="">— Sélectionner un compte —</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} {acc.propFirm ? `(${acc.propFirm})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={connecting || !brokerServer || !login || !password || !selectedVaynaAccount}
                    className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 transition-all duration-200 shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                  >
                    {connecting ? (
                      <>
                        <RefreshCw className="animate-spin h-5 w-5" />
                        Enregistrement en cours…
                      </>
                    ) : (
                      <>
                        <Cloud size={18} />
                        Connecter et lancer la synchronisation
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="mt5sync-connected"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-xl mx-auto"
              >
                <div className="mb-6 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-3">
                      <img src="./mt5-logo.jpg" alt="MT5 Logo" className="w-6 h-6 rounded shadow-sm object-cover" />
                      MT5 Sync
                      {autoImportEnabled ? (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 uppercase tracking-wider">Actif</span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 uppercase tracking-wider">Suspendu</span>
                      )}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {autoImportEnabled
                        ? 'Votre compte MT5 est connecté. Les trades sont importés automatiquement.'
                        : "L'auto-import est désactivé depuis le Dashboard. La synchronisation est en pause."}
                    </p>
                  </div>
                </div>

                {/* Status card */}
                <div className={cn("p-5 rounded-2xl border mb-6 space-y-4",
                  autoImportEnabled
                    ? "border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent"
                    : "border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center",
                      autoImportEnabled ? "bg-emerald-500/10" : "bg-amber-500/10"
                    )}>
                      {autoImportEnabled ? <Wifi size={24} className="text-emerald-500" /> : <WifiOff size={24} className="text-amber-500" />}
                    </div>
                    <div className="flex-1">
                      <div className={cn("text-base font-semibold flex items-center gap-2",
                        autoImportEnabled ? "text-emerald-500" : "text-amber-500"
                      )}>
                        {!autoImportEnabled
                          ? 'Synchronisation Suspendue'
                          : mt5Sync.status === 'connected' ? 'Serveur Synchronisé' : 'En attente du serveur...'}
                        {autoImportEnabled && mt5Sync.status === 'connected' && (
                          <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-2 h-2 rounded-full bg-emerald-500"
                          />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Compte <strong className="text-foreground">{mt5Sync.brokerLogin}</strong> sur <strong className="text-foreground">{mt5Sync.brokerServer}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1 font-medium">Trades importés</p>
                      <p className="text-2xl font-bold tabular-nums text-foreground">{mt5Sync.syncedTradesCount || 0}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1 font-medium">Dernière synchronisation</p>
                      <p className="text-sm font-bold tabular-nums text-foreground mt-2">
                        {mt5Sync.lastSyncAt
                          ? new Date(mt5Sync.lastSyncAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                          : 'En attente...'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      setIsRefreshing(true)
                      await refreshSyncCount()
                      setTimeout(() => setIsRefreshing(false), 800)
                    }}
                    disabled={isRefreshing}
                    className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 transition-all duration-200 shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                    {isRefreshing ? 'Rafraîchissement en cours...' : 'Forcer le rafraîchissement'}
                  </button>

                  <button
                    onClick={async () => {
                      if (confirm('Voulez-vous déconnecter votre compte MT5 ? Les trades déjà importés ne seront pas supprimés.')) {
                        await disconnectMT5()
                        setStep('form')
                      }
                    }}
                    className="w-full py-3 rounded-xl text-sm font-medium border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <WifiOff size={18} />
                    Déconnecter le compte MT5
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Info / FAQ Sidebar */}
        <div className="w-full lg:w-[380px] flex flex-col gap-4">
          <div className="bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-violet-400 mb-4">
              <Info size={20} />
              Comment ça marche ?
            </h3>

            <div className="space-y-6">
              <div className="flex gap-3">
                <div className="mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold">1</div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Lecture seule sécurisée</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Nous utilisons votre mot de passe investisseur. VAYNA ne peut lire que l'historique et <strong>ne peut pas exécuter de trades</strong>.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold">2</div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground flex items-center gap-1.5">
                    Synchronisation en direct
                    <Zap size={14} className="text-amber-400" />
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Dès qu'une position est clôturée dans MetaTrader, elle apparaît dans votre journal VAYNA en quelques secondes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card/50 border border-border rounded-2xl p-6">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground mb-4">
              <Clock size={16} />
              Temps de synchronisation
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Le serveur VAYNA surveille votre compte MT5 24h/24 et 7j/7. Lorsqu'un trade est fermé, il faut environ <strong>5 à 15 secondes</strong> pour qu'il soit importé et apparaisse automatiquement sur votre Dashboard.
              Vous n'avez même pas besoin de rafraîchir la page !
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
