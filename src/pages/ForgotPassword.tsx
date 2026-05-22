import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Mail, ArrowLeft, AlertCircle, CheckCircle, ChevronLeft } from 'lucide-react'
import { VaynaLogo } from '@/components/VaynaLogo'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { resetPasswordForEmail } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error } = await resetPasswordForEmail(email)
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
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

      <Link
        to="/"
        className="fixed top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ChevronLeft size={16} />
        Retour à l'accueil
      </Link>

      <div className="auth-container">
        <div className="auth-logo justify-center w-full flex mb-8">
          <Link to="/">
            <VaynaLogo size={36} showText />
          </Link>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <h1 className="auth-title">Mot de passe oublié</h1>
            <p className="auth-subtitle">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {success ? (
            <div className="auth-success-box">
              <CheckCircle size={48} className="auth-success-icon" />
              <h2 className="auth-success-title">Email envoyé !</h2>
              <p className="auth-success-text">
                Vérifiez votre boîte mail et cliquez sur le lien de réinitialisation.
              </p>
              <Link to="/login" className="auth-btn-primary" style={{ display: 'inline-flex', justifyContent: 'center', marginTop: '8px' }}>
                Retour à la connexion
              </Link>
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
                <label htmlFor="forgot-email" className="auth-label">Email</label>
                <div className="auth-input-wrapper">
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="auth-input"
                    placeholder="vous@exemple.com"
                    required
                    autoComplete="email"
                  />
                  <span className="auth-input-icon">
                    <Mail size={16} />
                  </span>
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
                    Envoi...
                  </span>
                ) : (
                  <span className="auth-btn-content">
                    <Mail size={18} />
                    Envoyer le lien
                  </span>
                )}
              </button>
            </form>
          )}

          <div className="auth-footer">
            <Link to="/login" className="auth-link auth-link-back">
              <ArrowLeft size={14} />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
