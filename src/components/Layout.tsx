import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { MobileBottomNav } from './MobileBottomNav'
import { MobileHeader } from './MobileHeader'
import { AIAssistant } from './AIAssistant'
import { useStore } from '@/hooks/useStore'
import { useNotificationEngine } from '@/hooks/useNotificationEngine'
import { cn } from '@/lib/utils'

export function Layout() {
  const sidebarCollapsed = useStore(s => s.sidebarCollapsed)
  const location = useLocation()
  
  const isElectron = navigator.userAgent.toLowerCase().includes('electron')

  useNotificationEngine()

  return (
    <div className={cn("bg-background", isElectron ? "min-h-[calc(100vh-40px)]" : "min-h-screen")}>
      <MobileHeader />
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <motion.main
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "w-full md:w-auto max-md:!ml-0", 
          isElectron ? "min-h-[calc(100vh-40px)]" : "min-h-screen",
          "pb-20 pt-16 md:pb-0 md:pt-0" // Add padding on mobile for the bottom nav and top header
        )}
      >
        {/* Subtle full-page background texture */}
        <div className="fixed inset-0 pointer-events-none -z-10 bg-grid opacity-60" />

        <div className={cn("p-4 md:p-6 lg:p-8", isElectron ? "min-h-[calc(100vh-40px)]" : "min-h-screen")}>
          {/*
           * No AnimatePresence — it caused pages to freeze after visiting Settings.
           * Each page handles its own entrance animation via motion.div inside.
           * The key forces React to unmount/remount on route change for a clean render.
           */}
          <div key={location.pathname}>
            <Outlet />
          </div>
        </div>
      </motion.main>
      
      {/* AI Chatbot Widget globally available in the app */}
      <div className="hidden md:block">
        <AIAssistant />
      </div>

      <MobileBottomNav />
    </div>
  )
}
