import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  BarChart3,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

type MenuItem = {
  path: string
  icon: any
  label: string
}

const menuItems: MenuItem[] = [
  { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/app/accounts', icon: Wallet, label: 'Comptes' },
  { path: '/app/trades', icon: TrendingUp, label: 'Journal' },
  { path: '/app/statistics', icon: BarChart3, label: 'Stats' },
  { path: '/app/settings', icon: Settings, label: 'Réglages' },
]

export function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
      {/* Frosted glass background */}
      <div className="absolute inset-0 bg-card/70 dark:bg-[hsl(222,47%,9%)]/80 backdrop-blur-2xl border-t border-border/40" />

      {/* Subtle top highlight line */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="relative flex items-center justify-around h-[64px] px-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:scale-90"
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Active pill background */}
                {isActive && (
                  <motion.div
                    layoutId="mobile-tab-bg"
                    className="absolute inset-0 rounded-2xl bg-primary/10 dark:bg-primary/15"
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  />
                )}

                <div className="relative z-10 flex flex-col items-center gap-0.5">
                  <item.icon
                    size={isActive ? 21 : 20}
                    strokeWidth={isActive ? 2.4 : 1.8}
                    className={cn(
                      "transition-all duration-300",
                      isActive && "drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[9px] font-semibold tracking-wide transition-all duration-200",
                      isActive ? "opacity-100 translate-y-0" : "opacity-60 translate-y-0.5"
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
