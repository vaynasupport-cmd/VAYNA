import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Eye, EyeOff, LogIn, AlertCircle, ChevronLeft, CheckCircle } from 'lucide-react'
import { VaynaLogo } from '@/components/VaynaLogo'

export function Login() {
  const location = useLocation()
  const successMessage = (location.state as any)?.message as string | undefined
  const [email, setEmail] = useState((location.state as any)?.email || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isGoogleCallback, setIsGoogleCallback] = useState(() => localStorage.getItem('isGoogleLogin') === 'true' || localStorage.getItem('isGoogleRegister') === 'true')
  const [isRegisterCallback] = useState(() => localStorage.getItem('isGoogleRegister') === 'true')
  const { signIn, signInWithGoogle, user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()

  const from = (location.state as any)?.from?.pathname || '/intro'
  // Auto-redirect if user already exists
  useEffect(() => {
    const wasGoogleLogin = localStorage.getItem('isGoogleLogin') === 'true' || localStorage.getItem('isGoogleRegister') === 'true'
    
    if (!authLoading && !user && isGoogleCallback) {
      localStorage.removeItem('isGoogleLogin')
      localStorage.removeItem('isGoogleRegister')
      setIsGoogleCallback(false)
      setError("Erreur lors de l'opération avec Google ou opération annulée.")
    }

    if (user && !authLoading) {
      if (isLoggingIn || loginSuccess || wasGoogleLogin) {
        if (wasGoogleLogin) {
          localStorage.removeItem('isGoogleLogin')
          localStorage.removeItem('isGoogleRegister')
        }
        setIsGoogleCallback(false)
        setLoginSuccess(true)
        const timer = setTimeout(async () => {
          if (isRegisterCallback) {
             await signOut()
             setLoginSuccess(false)
          } else {
             navigate(from, { replace: true })
          }
        }, 1200)
        return () => clearTimeout(timer)
      } else {
        if (!isRegisterCallback) {
          navigate(from, { replace: true })
        }
      }
    }
  }, [user, authLoading, navigate, from, isLoggingIn, loginSuccess, isGoogleCallback, isRegisterCallback, signOut])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setIsLoggingIn(true)
    
    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Email ou mot de passe incorrect.'
        : error.message)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }

  const isElectron = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('electron')

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-grid" />
        <div className="auth-glow auth-glow-1" />
        <div className="auth-glow auth-glow-2" />
      </div>

      {!isElectron && (
        <Link
          to="/"
          className="fixed left-6 md:left-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors z-10 top-6 md:top-8"
        >
          <ChevronLeft size={16} />
          Retour à l'accueil
        </Link>
      )}

      <div className="auth-container">
        {/* Logo */}
        <div className="auth-logo justify-center w-full flex mb-8">
          {isElectron ? (
            <div className="cursor-default">
              <VaynaLogo size={36} showText />
            </div>
          ) : (
            <Link to="/">
              <VaynaLogo size={36} showText />
            </Link>
          )}
        </div>

        <div className="auth-card">
          {loginSuccess || isGoogleCallback ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', animation: 'fadeIn 0.5s ease-out' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(0, 245, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0, 245, 255, 0.3)', boxShadow: '0 0 30px rgba(0, 245, 255, 0.2)' }}>
                {authLoading && !loginSuccess ? (
                  <div style={{ width: '36px', height: '36px', border: '2px solid #00f5ff33', borderTop: '2px solid #00f5ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                ) : (
                  <CheckCircle size={36} style={{ color: '#00f5ff' }} />
                )}
              </div>
              <div>
                <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {authLoading && !loginSuccess ? 'Vérification...' : (isRegisterCallback ? 'Inscription réussie' : 'Connexion réussie')}
                </h2>
                <p style={{ color: 'rgba(240, 244, 255, 0.5)', fontSize: '15px' }}>Préparation de votre espace...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="auth-card-header">
                <h1 className="auth-title">Connexion</h1>
                <p className="auth-subtitle">Accédez à votre journal de trading</p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
            {successMessage && (
              <div style={{ background: 'rgba(0, 245, 255, 0.1)', border: '1px solid rgba(0, 245, 255, 0.3)', color: '#00f5ff', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} />
                {successMessage}
              </div>
            )}
            
            {error && (
                  <div className="auth-error">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="auth-field">
                  <label htmlFor="email" className="auth-label">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="auth-input"
                    placeholder="vous@exemple.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="auth-field">
                  <div className="auth-label-row">
                    <label htmlFor="password" className="auth-label">Mot de passe</label>
                    <Link to="/forgot-password" className="auth-link-small">Mot de passe oublié ?</Link>
                  </div>
                  <div className="auth-input-wrapper">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="auth-input"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="auth-btn-loading">
                      <span className="auth-spinner" />
                      Connexion...
                    </span>
                  ) : (
                    <span className="auth-btn-content">
                      <LogIn size={18} />
                      Se connecter
                    </span>
                  )}
                </button>
              </form>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(0,245,255,0.15), transparent)' }} />
                <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(240,244,255,0.3)' }}>ou continuer avec</span>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(0,245,255,0.15), transparent)' }} />
              </div>

              <button
                type="button"
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#f0f4ff',
                  cursor: googleLoading ? 'wait' : 'pointer',
                  opacity: googleLoading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!googleLoading) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,245,255,0.25)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(0,245,255,0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                }}
                onClick={async () => {
                  try {
                    setGoogleLoading(true)
                    setIsLoggingIn(true)
                    localStorage.setItem('isGoogleLogin', 'true')
                    const { error } = await signInWithGoogle()
                    if (error) throw error
                  } catch (err: any) {
                    setError(err.message)
                    setGoogleLoading(false)
                    setIsLoggingIn(false)
                    localStorage.removeItem('isGoogleLogin')
                  }
                }}
              >
                {googleLoading ? (
                  <>
                    <span className="auth-spinner" style={{ borderColor: 'rgba(240,244,255,0.2)', borderTopColor: '#00f5ff', width: '18px', height: '18px' }} />
                    <span style={{ color: 'rgba(240,244,255,0.5)' }}>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                      <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}>
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    </div>
                    <span>Continuer avec Google</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                  </>
                )}
              </button>

              <div className="auth-footer mt-6">
                <span className="auth-footer-text">Pas encore de compte ?</span>
                <Link to="/register" className="auth-link">Créer un compte</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
