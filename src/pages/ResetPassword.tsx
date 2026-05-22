import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { VaynaLogo } from '@/components/VaynaLogo'

export function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Handle the hash from Supabase redirect (Electron deep link)
    // Supabase puts tokens in the hash: #access_token=...&type=recovery
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      supabase.auth.getSession()
    }

    // Listen for auth state change (PASSWORD_RECOVERY event)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      // Just listen to make sure supabase processes the recovery token
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    setLoading(true)
    try {
      const { error } = await updatePassword(password)
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        setTimeout(() => navigate('/login'), 2500)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-grid" />
        <div className="auth-glow auth-glow-1" />
        <div className="auth-glow auth-glow-2" />
      </div>

      <div className="auth-container">
        <div className="auth-logo justify-center w-full flex mb-8">
          <VaynaLogo size={36} showText />
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <h1 className="auth-title">Nouveau mot de passe</h1>
            <p className="auth-subtitle">Choisissez un nouveau mot de passe sécurisé</p>
          </div>

          {success ? (
            <div className="auth-success-box">
              <CheckCircle size={48} className="auth-success-icon" />
              <h2 className="auth-success-title">Mot de passe mis à jour !</h2>
              <p className="auth-success-text">
                Redirection vers la page de connexion...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="auth-error">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="reset-password" className="auth-label">
                  <Lock size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  Nouveau mot de passe
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="reset-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="auth-input"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
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

              <div className="auth-field">
                <label htmlFor="reset-confirm" className="auth-label">Confirmer le mot de passe</label>
                <div className="auth-input-wrapper">
                  <input
                    id="reset-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="auth-input"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowConfirm(!showConfirm)}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
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
                    Mise à jour...
                  </span>
                ) : (
                  <span className="auth-btn-content">
                    <Lock size={18} />
                    Mettre à jour
                  </span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
