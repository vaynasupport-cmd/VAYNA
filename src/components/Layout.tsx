import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { AIAssistant } from './AIAssistant'
import { useStore } from '@/hooks/useStore'
import { useNotificationEngine } from '@/hooks/useNotificationEngine'

export function Layout() {
  const sidebarCollapsed = useStore(s => s.sidebarCollapsed)
  const location = useLocation()

  useNotificationEngine()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <motion.main
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="min-h-screen"
      >
        {/* Subtle full-page background texture */}
        <div className="fixed inset-0 pointer-events-none -z-10 bg-grid opacity-60" />

        <div className="p-6 lg:p-8 min-h-screen">
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
      <AIAssistant />
    </div>
  )
}
