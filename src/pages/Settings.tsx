import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Shield, Camera, Save, Loader2, KeyRound, Mail, AlertCircle, Sun, Moon, Palette, Bell, Link2, CheckCircle2, Database, Trash2, Sparkles,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/hooks/useStore'
import { useToast } from '@/hooks/useToast'
import { useTheme } from '@/components/ThemeProvider'
import { resizeImageToBase64 } from '@/lib/imageUtils'
import { upsertNotificationPreferences, type NotificationPreferences } from '@/lib/notificationPreferences'
import { seedDemoData, clearDemoData, hasDemoData as checkHasDemoData } from '@/lib/demoData'
import { cn } from '@/lib/utils'

export function Settings() {
  const { user, updateProfile, updatePassword, signIn } = useAuth()
  const notificationPreferences = useStore(s => s.notificationPreferences)
  const setNotificationPreferences = useStore(s => s.setNotificationPreferences)
  const triggerRefresh = useStore(s => s.triggerRefresh)
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance' | 'notifications' | 'integrations'>('profile')
  const [loading, setLoading] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoDataExists, setDemoDataExists] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Notification preferences state (local mirror of store for fast UI)
  const [localNotifPrefs, setLocalNotifPrefs] = useState<NotificationPreferences>({
    reminder_journal: true,
    reminder_journal_time: '20:00',
    performance_alerts: true,
    discipline_reminder: false,
    system_notifications: true,
  })

  // Profile state
  const [fullName, setFullName] = useState('')
  const [avatarData, setAvatarData] = useState<string | null>(null)

  // Security state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (user?.user_metadata) {
      setFullName(user.user_metadata.full_name || '')
      setAvatarData(user.user_metadata.avatar_data || null)
    }
    if (notificationPreferences) {
      setLocalNotifPrefs(notificationPreferences)
    }
  }, [user, notificationPreferences])

  // Check if demo data already exists
  useEffect(() => {
    if (user?.id) {
      checkHasDemoData(user.id).then(setDemoDataExists)
    }
  }, [user])

  const handleSeedDemo = async () => {
    if (!user?.id) return
    setDemoLoading(true)
    const result = await seedDemoData(user.id)
    if (result.success) {
      setDemoDataExists(true)
      triggerRefresh()
      toast({
        title: '🎬 Données démo injectées',
        description: '3 comptes, 461 trades et 12 entrées journal ont été créés. Prenez vos screenshots !',
      })
    } else {
      toast({
        title: 'Erreur',
        description: result.error || 'Impossible d\'injecter les données démo.',
        variant: 'destructive',
      })
    }
    setDemoLoading(false)
  }

  const handleClearDemo = async () => {
    if (!user?.id) return
    setDemoLoading(true)
    const result = await clearDemoData(user.id)
    if (result.success) {
      setDemoDataExists(false)
      triggerRefresh()
      toast({
        title: '🧹 Données démo supprimées',
        description: 'Toutes les données démo ont été nettoyées. Votre compte est propre.',
      })
    } else {
      toast({
        title: 'Erreur',
        description: result.error || 'Impossible de supprimer les données démo.',
        variant: 'destructive',
      })
    }
    setDemoLoading(false)
  }

  const handleNotifChange = useCallback(async (
    key: keyof NotificationPreferences,
    value: boolean | string
  ) => {
    if (!user?.id) return
    const updated = { ...localNotifPrefs, [key]: value } as NotificationPreferences
    setLocalNotifPrefs(updated)
    setNotificationPreferences(updated)
    setNotifLoading(true)
    const { error } = await upsertNotificationPreferences(user.id, updated)
    setNotifLoading(false)
    if (error) {
      toast({ title: 'Erreur de sauvegarde', description: error.message, variant: 'destructive' })
    }
  }, [localNotifPrefs, user, toast, setNotificationPreferences])

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Format invalide',
        description: 'Veuillez sélectionner une image JPEG ou PNG.',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)
      const base64 = await resizeImageToBase64(file, 200, 200, 0.7)
      setAvatarData(base64)
      toast({
        title: "Image chargée",
        description: "N'oubliez pas d'enregistrer vos paramètres.",
      })
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de lire l\'image.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await updateProfile({
      full_name: fullName,
      avatar_data: avatarData || undefined,
    })

    setLoading(false)

    if (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Profil mis à jour',
        description: 'Vos modifications ont été enregistrées avec succès.',
      })
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword) {
      toast({
        title: 'Mot de passe actuel requis',
        description: 'Veuillez saisir votre mot de passe actuel pour continuer.',
        variant: 'destructive'
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Mot de passe trop court',
        description: 'Le nouveau mot de passe doit contenir au moins 6 caractères.',
        variant: 'destructive'
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Mots de passe différents',
        description: 'Les deux nouveaux mots de passe ne correspondent pas.',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    // Step 1: Verify current password by re-authenticating
    const { error: authError } = await signIn(user?.email || '', currentPassword)
    if (authError) {
      setLoading(false)
      toast({
        title: 'Mot de passe actuel incorrect',
        description: 'Le mot de passe actuel saisi est invalide.',
        variant: 'destructive',
      })
      return
    }

    // Step 2: Update the password
    const { error } = await updatePassword(newPassword)
    setLoading(false)

    if (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Mot de passe mis à jour ✅',
        description: 'Votre mot de passe a été modifié avec succès.',
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-2">
          Gérez votre profil et les paramètres de sécurité de votre compte.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 max-w-5xl">
        {/* SIDEBAR TABS */}
        <div className="w-full md:w-64 flex flex-col gap-2 flex-shrink-0">
          <motion.button
            onClick={() => setActiveTab('profile')}
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left relative",
              activeTab === 'profile'
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50"
                : "hover:bg-accent text-muted-foreground"
            )}
          >
            {activeTab === 'profile' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary rounded-xl"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ zIndex: -1 }}
              />
            )}
            <User size={18} />
            Mon Profil
          </motion.button>

          <motion.button
            onClick={() => setActiveTab('security')}
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left relative",
              activeTab === 'security'
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50"
                : "hover:bg-accent text-muted-foreground"
            )}
          >
            {activeTab === 'security' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary rounded-xl"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ zIndex: -1 }}
              />
            )}
            <Shield size={18} />
            Sécurité
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('appearance')}
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left relative",
              activeTab === 'appearance'
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50"
                : "hover:bg-accent text-muted-foreground"
            )}
          >
            {activeTab === 'appearance' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary rounded-xl"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ zIndex: -1 }}
              />
            )}
            <Palette size={18} />
            Apparence
          </motion.button>

          <motion.button
            onClick={() => setActiveTab('notifications')}
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left relative",
              activeTab === 'notifications'
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50"
                : "hover:bg-accent text-muted-foreground"
            )}
          >
            {activeTab === 'notifications' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary rounded-xl"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ zIndex: -1 }}
              />
            )}
            <Bell size={18} />
            Notifications
          </motion.button>

          <motion.button
            onClick={() => setActiveTab('integrations')}
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left relative",
              activeTab === 'integrations'
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50"
                : "hover:bg-accent text-muted-foreground"
            )}
          >
            {activeTab === 'integrations' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary rounded-xl"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ zIndex: -1 }}
              />
            )}
            <Link2 size={18} />
            Intégrations
          </motion.button>

        </div>

        {/* CONTENT AREA */}
        <motion.div
          className="flex-1 bg-card/30 border border-border rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-xl"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold">Informations Personnelles</h2>
                  <p className="text-sm text-muted-foreground">Mettez à jour votre photo et vos détails publics.</p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-8">
                  {/* Avatar Picker */}
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full border-4 border-background bg-accent flex items-center justify-center overflow-hidden relative shadow-lg">
                        {avatarData ? (
                          <img src={avatarData} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User size={40} className="text-muted-foreground opacity-50" />
                        )}
                        <div
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera className="text-white" size={24} />
                        </div>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarSelect}
                        accept="image/jpeg, image/png, image/webp"
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">Photo de profil</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Format recommandé: carré, taille max ~5Mo.
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-foreground transition-colors font-medium border border-border"
                      >
                        Changer la photo
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Nom complet</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                          placeholder="Ex: John Doe"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 opacity-75">
                      <label className="text-sm font-medium text-foreground">Adresse Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full pl-10 pr-4 py-2.5 bg-accent/50 border border-input rounded-xl focus:outline-none cursor-not-allowed text-muted-foreground"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <AlertCircle size={12} />
                        L'adresse email ne peut pas être modifiée pour le moment.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                    Enregistrer le profil
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-xl"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold">Sécurité du compte</h2>
                  <p className="text-sm text-muted-foreground">Sécurisez votre accès en modifiant votre mot de passe.</p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div className="space-y-4">

                    {/* Current password */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Mot de passe actuel</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                          placeholder="Votre mot de passe actuel"
                          autoComplete="current-password"
                        />
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 py-1">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">Nouveau mot de passe</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Nouveau mot de passe</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                          placeholder="••••••••"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Confirmer le nouveau mot de passe</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                          placeholder="••••••••"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                    Mettre à jour la sécurité
                  </button>
                </form>
              </motion.div>
            )}
            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-xl"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold">Apparence</h2>
                  <p className="text-sm text-muted-foreground">Personnalisez l'affichage de l'application.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-border bg-card/50">
                    <h3 className="text-sm font-semibold mb-1">Thème de l'interface</h3>
                    <p className="text-xs text-muted-foreground mb-4">Choisissez entre le mode sombre et le mode clair.</p>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setTheme('dark')}
                        className={cn(
                          "flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                          theme === 'dark'
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="w-full h-16 rounded-lg bg-slate-900 border border-slate-700 flex items-end p-2 gap-1">
                          <div className="h-6 w-3 bg-blue-500 rounded-sm opacity-80" />
                          <div className="h-10 w-3 bg-blue-400 rounded-sm opacity-80" />
                          <div className="h-4 w-3 bg-blue-600 rounded-sm opacity-80" />
                          <div className="h-8 w-3 bg-blue-500 rounded-sm opacity-80" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Moon size={14} />
                          <span className="text-sm font-medium">Mode Sombre</span>
                        </div>
                        {theme === 'dark' && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </button>

                      <button
                        onClick={() => setTheme('light')}
                        className={cn(
                          "flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                          theme === 'light'
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="w-full h-16 rounded-lg bg-slate-100 border border-slate-300 flex items-end p-2 gap-1">
                          <div className="h-6 w-3 bg-blue-400 rounded-sm opacity-80" />
                          <div className="h-10 w-3 bg-blue-500 rounded-sm opacity-80" />
                          <div className="h-4 w-3 bg-blue-300 rounded-sm opacity-80" />
                          <div className="h-8 w-3 bg-blue-400 rounded-sm opacity-80" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Sun size={14} />
                          <span className="text-sm font-medium">Mode Clair</span>
                        </div>
                        {theme === 'light' && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Notifications</h2>
                    <p className="text-sm text-muted-foreground">Sélectionnez les alertes que vous souhaitez recevoir.</p>
                  </div>
                  {notifLoading && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
                </div>

                <div className="space-y-3">

                  {/* --- Rappel journal --- */}
                  <div className="p-4 rounded-xl border border-border bg-card/40 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-none mb-1">Rappel journal de trading</p>
                        <p className="text-xs text-muted-foreground">Recevoir un rappel si aucun trade n'a été enregistré aujourd'hui</p>
                      </div>
                      {/* Toggle */}
                      <button
                        type="button"
                        onClick={() => handleNotifChange('reminder_journal', !localNotifPrefs.reminder_journal)}
                        className={cn(
                          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
                          localNotifPrefs.reminder_journal ? 'bg-primary' : 'bg-muted'
                        )}
                        role="switch"
                        aria-checked={localNotifPrefs.reminder_journal}
                      >
                        <span
                          className={cn(
                            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
                            localNotifPrefs.reminder_journal ? 'translate-x-5' : 'translate-x-0'
                          )}
                        />
                      </button>
                    </div>

                    {/* Heure du rappel (affichée seulement si actif) */}
                    <AnimatePresence>
                      {localNotifPrefs.reminder_journal && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                            <span className="text-xs text-muted-foreground">Heure du rappel :</span>
                            <input
                              type="time"
                              value={localNotifPrefs.reminder_journal_time}
                              onChange={(e) => handleNotifChange('reminder_journal_time', e.target.value)}
                              className="h-8 px-3 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* --- Alertes de performance --- */}
                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card/40">
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-none mb-1">Alertes de performance</p>
                      <p className="text-xs text-muted-foreground">Notification en cas de gain ou perte significative</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNotifChange('performance_alerts', !localNotifPrefs.performance_alerts)}
                      className={cn(
                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
                        localNotifPrefs.performance_alerts ? 'bg-primary' : 'bg-muted'
                      )}
                      role="switch"
                      aria-checked={localNotifPrefs.performance_alerts}
                    >
                      <span className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
                        localNotifPrefs.performance_alerts ? 'translate-x-5' : 'translate-x-0'
                      )} />
                    </button>
                  </div>

                  {/* --- Rappel discipline --- */}
                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card/40">
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-none mb-1">Rappel de discipline</p>
                      <p className="text-xs text-muted-foreground">Rappel si aucune activité de trading depuis plusieurs jours</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNotifChange('discipline_reminder', !localNotifPrefs.discipline_reminder)}
                      className={cn(
                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
                        localNotifPrefs.discipline_reminder ? 'bg-primary' : 'bg-muted'
                      )}
                      role="switch"
                      aria-checked={localNotifPrefs.discipline_reminder}
                    >
                      <span className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
                        localNotifPrefs.discipline_reminder ? 'translate-x-5' : 'translate-x-0'
                      )} />
                    </button>
                  </div>

                  {/* --- Notifications système --- */}
                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card/40">
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-none mb-1">Notifications système</p>
                      <p className="text-xs text-muted-foreground">Informations importantes sur l'application et les mises à jour</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNotifChange('system_notifications', !localNotifPrefs.system_notifications)}
                      className={cn(
                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
                        localNotifPrefs.system_notifications ? 'bg-primary' : 'bg-muted'
                      )}
                      role="switch"
                      aria-checked={localNotifPrefs.system_notifications}
                    >
                      <span className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
                        localNotifPrefs.system_notifications ? 'translate-x-5' : 'translate-x-0'
                      )} />
                    </button>
                  </div>

                </div>
              </motion.div>
            )}

            {activeTab === 'integrations' && (
              <motion.div
                key="integrations"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Connexions & Intégrations</h2>
                    <p className="text-sm text-muted-foreground">Gérez vos intégrations de plateformes externes.</p>
                  </div>
                </div>

                <div className="space-y-5">

                  {/* ═══ DEMO DATA SECTION ═══ */}
                  <div className="p-5 rounded-xl border border-border bg-gradient-to-br from-amber-500/5 to-purple-500/5 relative overflow-hidden">
                    {/* Decorative glow */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

                    <h3 className="text-base font-semibold mb-1 flex items-center gap-2 relative">
                      <Database size={18} className="text-amber-500" />
                      Données de Démonstration
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4 relative">
                      Injectez des données réalistes pour prendre des captures d'écran de l'application. Supprimez-les quand vous avez fini.
                    </p>

                    <div className="flex items-center gap-3 relative">
                      {!demoDataExists ? (
                        <button
                          onClick={handleSeedDemo}
                          disabled={demoLoading}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {demoLoading ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                          Injecter les données démo
                        </button>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 className="h-4 w-4" />
                            Données démo actives
                          </div>
                          <button
                            onClick={handleClearDemo}
                            disabled={demoLoading}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {demoLoading ? (
                              <Loader2 className="animate-spin h-4 w-4" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Supprimer les données démo
                          </button>
                        </>
                      )}
                    </div>

                    <p className="text-[10px] text-muted-foreground/60 mt-3 relative">
                      ⚡ 3 comptes (FTMO 250 trades • The5ers 83 trades • Perso 128 trades) • 12 entrées journal • ~180 jours
                    </p>
                  </div>


                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}


