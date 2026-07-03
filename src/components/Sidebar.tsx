import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  BarChart3,
  BookOpen,
  Settings,
  ChevronRight,
  LogOut,
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { useAuth } from '@/hooks/useAuth'
import { useStore } from '@/hooks/useStore'
import { VaynaLogo } from '@/components/VaynaLogo'
import { cn } from '@/lib/utils'

type MenuItem = {
  path: string
  icon: any
  label: string
  isSpecial?: boolean
}

const menuItems: MenuItem[] = [
  { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/app/accounts', icon: Wallet, label: 'Comptes' },
  { path: '/app/trades', icon: TrendingUp, label: 'Journal' },
  { path: '/app/statistics', icon: BarChart3, label: 'Statistiques' },
  { path: '/app/journal', icon: BookOpen, label: 'Notes' },
  { path: '/app/mt5-sync', icon: null, label: 'MT5 Sync', isSpecial: true },
]

export function Sidebar() {
  const sidebarCollapsed = useStore(s => s.sidebarCollapsed)
  const setSidebarCollapsed = useStore(s => s.setSidebarCollapsed)
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleConfirmLogout = async () => {
    await signOut()
    navigate('/')
  }

  const isElectron = navigator.userAgent.toLowerCase().includes('electron')

  return (
    <>
      <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "fixed left-0 z-40 border-r border-border/60 bg-card/80 backdrop-blur-xl shadow-[4px_0_24px_rgba(0,0,0,0.2)]",
        isElectron ? "top-10 h-[calc(100vh-40px)]" : "top-0 h-screen"
      )}
    >
      {/* Logo Header */}
      <div className={cn(
        "flex h-16 items-center border-b border-border transition-all",
        sidebarCollapsed ? "justify-center px-2" : "justify-between px-4"
      )}>
        {sidebarCollapsed ? (
          /* Collapsed: logo + small expand arrow */
          <div className="flex items-center gap-1">
            <NavLink to="/app/dashboard" className="group">
              <VaynaLogo size={32} className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            </NavLink>
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-primary/15 hover:text-primary transition-all duration-200 text-muted-foreground"
              title="Ouvrir le menu"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          /* Expanded: logo + text + collapse button */
          <>
            <NavLink
              to="/app/dashboard"
              className="flex items-center gap-3 group min-w-0 overflow-hidden ml-1"
            >
              <VaynaLogo size={32} className="flex-shrink-0" />
              <div className="flex flex-col justify-center min-w-0">
                <div className="relative flex items-center">
                  <span
                    className="font-black text-[20.8px] tracking-[0.22em] select-none leading-none relative z-10 bg-clip-text text-transparent bg-gradient-to-br from-slate-800 via-blue-600 to-blue-700 dark:from-white dark:via-blue-300 dark:to-blue-500"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    V<span style={{ fontFamily: 'Georgia, serif' }}>Λ</span>YN<span style={{ fontFamily: 'Georgia, serif' }}>Λ</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 -ml-1">
                  <div className="flex items-center relative">
                    <div className="h-[1px] w-5 bg-gradient-to-r from-transparent to-cyan-500" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                  </div>
                  <span className="uppercase font-light whitespace-nowrap text-[7px] tracking-[0.25em] text-slate-400 dark:text-cyan-100/50">
                    Journal de Trading
                  </span>
                  <div className="h-[1px] w-6 bg-gradient-to-r from-slate-300 dark:from-slate-600/60 to-transparent" />
                </div>
              </div>
            </NavLink>
            <motion.button
              onClick={() => setSidebarCollapsed(true)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg hover:bg-primary/15 hover:text-primary transition-all duration-200"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </motion.button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-0.5">
        {menuItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group overflow-hidden",
                isActive
                  ? "text-white"
                  : (item.isSpecial ? "text-violet-400 hover:text-violet-300" : "text-muted-foreground hover:text-foreground")
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Active background with glow */}
                {isActive && !item.isSpecial && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.08) 100%)',
                      borderLeft: '2px solid rgba(59,130,246,0.7)',
                      boxShadow: 'inset 0 0 20px rgba(59,130,246,0.05)'
                    }}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}

                {isActive && item.isSpecial && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
                    }}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}

                {/* Hover background (non-active) */}
                {!isActive && (
                  <span className={cn(
                    "absolute inset-0 rounded-xl transition-colors duration-200",
                    item.isSpecial ? "bg-violet-500/0 group-hover:bg-violet-500/10" : "bg-accent/0 group-hover:bg-accent/60"
                  )} />
                )}

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative flex items-center gap-3 w-full"
                >
                  {item.icon ? (
                    <item.icon className={cn(
                      "h-[18px] w-[18px] flex-shrink-0 transition-all duration-200",
                      isActive ? (item.isSpecial ? "text-white drop-shadow-md" : "text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]") : (item.isSpecial ? "text-violet-400 group-hover:text-violet-300" : "group-hover:text-foreground")
                    )} />
                  ) : (
                    <img
                      src="./mt5.jpg"
                      alt="MT5"
                      className="h-[18px] w-[18px] flex-shrink-0 rounded-[4px] object-cover"
                    />
                  )}
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border flex flex-col gap-1 bg-background/50 backdrop-blur-md">

        {/* User Profile Mini-Card */}
        <div className={cn("flex items-center gap-3 mb-2", sidebarCollapsed ? "justify-center" : "px-2 py-2")}>
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
            {user?.user_metadata?.avatar_data ? (
              <img src={user.user_metadata.avatar_data} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-primary">
                {user?.user_metadata?.full_name ? user.user_metadata.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden flex flex-col items-start"
              >
                <span className="text-sm font-semibold text-foreground truncate max-w-[140px]">
                  {user?.user_metadata?.full_name || 'Utilisateur'}
                </span>
                <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                  {user?.email}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 mb-1",
            "text-muted-foreground hover:bg-accent hover:text-foreground",
            sidebarCollapsed && "justify-center"
          )}
        >
          <motion.div
            initial={false}
            animate={{ rotate: theme === 'dark' ? 0 : 180, scale: theme === 'dark' ? 1 : 0.8 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="flex-shrink-0 relative h-5 w-5 flex items-center justify-center"
          >
            {theme === 'dark' ? (
              <Moon className="absolute h-5 w-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
            ) : (
              <Sun className="absolute h-5 w-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            )}
          </motion.div>
          
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden text-left"
              >
                {theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )
          }
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden text-left"
              >
                Paramètres
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>

        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all duration-200 mt-1"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden text-left"
              >
                Déconnexion
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>

    {/* ─── Logout Confirmation Modal ─── */}
    <AnimatePresence>
      {showLogoutModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-sm mx-4 bg-card border border-border rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-center mb-2">Mettre fin à la session ?</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Vous allez être déconnecté de votre espace VAYNA. Vos données sont sauvegardées et vous pourrez vous reconnecter à tout moment.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-accent transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Se déconnecter
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}
