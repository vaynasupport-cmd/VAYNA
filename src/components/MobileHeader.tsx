import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, Moon, LogOut } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { useAuth } from '@/hooks/useAuth'
import { VaynaLogo } from '@/components/VaynaLogo'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function MobileHeader() {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const isDark = theme === 'dark'
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  // Get user initials for avatar
  const initials = user?.email
    ? user.email.charAt(0).toUpperCase()
    : '?'

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)]">
      {/* Frosted glass background */}
      <div className="absolute inset-0 bg-card/70 dark:bg-[hsl(222,47%,9%)]/80 backdrop-blur-2xl border-b border-border/40" />

      {/* Subtle bottom highlight */}
      <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="relative flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <VaynaLogo size={22} />
          <span
            className="font-black text-[15px] tracking-[0.2em] select-none leading-none bg-clip-text text-transparent bg-gradient-to-br from-slate-800 via-blue-600 to-blue-700 dark:from-white dark:via-blue-300 dark:to-blue-500"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            V<span style={{ fontFamily: 'Georgia, serif' }}>Λ</span>YN<span style={{ fontFamily: 'Georgia, serif' }}>Λ</span>
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={cn(
              "relative h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300",
              "bg-muted/50 hover:bg-muted border border-border/50",
              "active:scale-90"
            )}
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  exit={{ rotate: 90, scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  exit={{ rotate: -90, scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="h-3.5 w-3.5 text-blue-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* User avatar / menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300",
                "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm",
                "active:scale-90",
                showMenu && "ring-2 ring-primary/40"
              )}
            >
              {initials}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {showMenu && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-10 z-50 w-48 rounded-xl bg-card border border-border/60 shadow-xl overflow-hidden"
                  >
                    <div className="px-3 py-2.5 border-b border-border/40">
                      <p className="text-xs font-medium truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Déconnexion
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
