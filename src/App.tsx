import { useEffect, lazy, Suspense } from 'react'
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'
import { Toaster } from '@/components/ui/toaster'

// ─── Lazy-loaded pages (code splitting) ──────────────────────────────────────
// Public pages
const LandingPage = lazy(() => import('@/pages/LandingPage').then(m => ({ default: m.LandingPage })))
const Login = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })))
const Register = lazy(() => import('@/pages/Register').then(m => ({ default: m.Register })))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })))
const ResetPassword = lazy(() => import('@/pages/ResetPassword').then(m => ({ default: m.ResetPassword })))
const FAQPage = lazy(() => import('@/pages/FAQPage').then(m => ({ default: m.FAQPage })))
const FeaturesPage = lazy(() => import('@/pages/FeaturesPage').then(m => ({ default: m.FeaturesPage })))
const ContactPage = lazy(() => import('@/pages/ContactPage').then(m => ({ default: m.ContactPage })))
const DownloadPage = lazy(() => import('@/pages/DownloadPage').then(m => ({ default: m.DownloadPage })))

// App pages
const Introduction = lazy(() => import('@/pages/Introduction').then(m => ({ default: m.Introduction })))
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Accounts = lazy(() => import('@/pages/Accounts').then(m => ({ default: m.Accounts })))
const Trades = lazy(() => import('@/pages/Trades').then(m => ({ default: m.Trades })))
const Statistics = lazy(() => import('@/pages/Statistics').then(m => ({ default: m.Statistics })))
const Journal = lazy(() => import('@/pages/Journal').then(m => ({ default: m.Journal })))
const MT5Sync = lazy(() => import('@/pages/MT5Sync').then(m => ({ default: m.MT5Sync })))
const Settings = lazy(() => import('@/pages/Settings').then(m => ({ default: m.Settings })))
const FAQ = lazy(() => import('@/pages/FAQ').then(m => ({ default: m.FAQ })))

import '@/styles/auth.css'

// ─── Loading fallback ────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <span className="text-xs text-muted-foreground font-medium tracking-wide">Chargement…</span>
      </div>
    </div>
  )
}

import { useDatabase } from '@/hooks/useDatabase'
import { useStore } from '@/hooks/useStore'
import { TitleBar } from '@/components/TitleBar'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/**
 * Handles fetching all Supabase data globally so it's only done once.
 */
function GlobalLoader() {
  const { loadAllData } = useDatabase()
  const refreshTrigger = useStore(s => s.refreshTrigger)
  
  useEffect(() => {
    loadAllData()
  }, [loadAllData, refreshTrigger])
  
  return null
}

/**
 * Inner component that runs the auto-import hook
 */
function AppContent() {
  const isElectron = navigator.userAgent.toLowerCase().includes('electron')

  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {isElectron && <TitleBar />}
      <div className={isElectron ? "pt-10" : ""}>
        <GlobalLoader />
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ─── PUBLIC ROUTES ─────────────────────────── */}
            <Route path="/" element={isElectron ? <Navigate to="/login" replace /> : <LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Pages marketing uniquement sur le web */}
            {!isElectron && (
              <>
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/download" element={<DownloadPage />} />
              </>
            )}

            {/* ─── PROTECTED: Introduction (splash) ──────── */}
            <Route
              path="/intro"
              element={
                <ProtectedRoute>
                  <Introduction />
                </ProtectedRoute>
              }
            />

            {/* ─── PROTECTED: App with Sidebar Layout ────── */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="trades" element={<Trades />} />
              <Route path="statistics" element={<Statistics />} />
              <Route path="journal" element={<Journal />} />
              <Route path="mt5-sync" element={<MT5Sync />} />
              <Route path="settings" element={<Settings />} />
              <Route path="faq" element={<FAQ />} />
            </Route>

            {/* ─── CATCH ALL ─────────────────────────────── */}
            <Route path="*" element={<Navigate to={isElectron ? "/login" : "/"} replace />} />
          </Routes>
        </Suspense>
        <Toaster />
      </div>
    </HashRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
