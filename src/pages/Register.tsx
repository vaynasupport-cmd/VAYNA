import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle, ChevronRight, ChevronLeft, User, Mail, Lock, Calendar } from 'lucide-react'
import { VaynaLogo } from '@/components/VaynaLogo'
import { cn } from '@/lib/utils'

type Step = 1 | 2 | 3

export function Register() {
  const [step, setStep] = useState<Step>(1)

  // Step 1 — Identity
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')

  // Step 2 — Account
  const [email, setEmail] = useState('')

  // Step 3 — Password
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [registerSuccess, setRegisterSuccess] = useState(false)

  const { signUp, signInWithGoogle, signOut } = useAuth()
  const navigate = useNavigate()

  const passwordStrength = () => {
    if (password.length === 0) return null
    if (password.length < 6) return 'weak'
    if (password.length < 10) return 'medium'
    return 'strong'
  }

  // Validate each step before proceeding
  const validateStep = (): string | null => {
    if (step === 1) {
      if (!firstName.trim()) return 'Le prénom est requis.'
      if (!lastName.trim()) return 'Le nom est requis.'
      if (age && (Number(age) < 13 || Number(age) > 100)) return 'Âge non valide.'
    }
    if (step === 2) {
      if (!email.trim() || !email.includes('@')) return 'Adresse email invalide.'
    }
    if (step === 3) {
      if (password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.'
      if (password !== confirmPassword) return 'Les mots de passe ne correspondent pas.'
    }
    return null
  }

  const handleNext = () => {
    setError(null)
    const err = validateStep()
    if (err) { setError(err); return }
    setStep((s) => (s + 1) as Step)
  }

  const handleBack = () => {
    setError(null)
    setStep((s) => (s - 1) as Step)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const err = validateStep()
    if (err) { setError(err); return }

    setLoading(true)
    try {
      const { error } = await signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
        age: age ? Number(age) : undefined,
        gender: gender || undefined,
      })

      if (error) {
        if (error.message.includes('already registered')) {
          setError('Cet email est déjà utilisé. Essayez de vous connecter.')
        } else {
          setError(error.message)
        }
        setLoading(false)
      } else {
        await signOut() // Force the user to be unauthenticated so they must log in
        // Redirection after showing success UI
        setRegisterSuccess(true)
        setTimeout(() => {
          navigate('/login', { state: { email, message: 'Compte créé avec succès ! Vous pouvez vous connecter.' } })
        }, 1200)
      }
    } catch (err) {
      setLoading(false)
    }
  }

  const strength = passwordStrength()

  const steps = [
    { label: 'Identité', icon: User },
    { label: 'Email', icon: Mail },
    { label: 'Sécurité', icon: Lock },
  ]

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
          {registerSuccess ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', animation: 'fadeIn 0.5s ease-out' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(0, 245, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0, 245, 255, 0.3)', boxShadow: '0 0 30px rgba(0, 245, 255, 0.2)' }}>
                <CheckCircle size={36} style={{ color: '#00f5ff' }} />
              </div>
              <div>
                <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>Inscription réussie</h2>
                <p style={{ color: 'rgba(240, 244, 255, 0.5)', fontSize: '15px' }}>Redirection vers la connexion...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="auth-card-header">
                <h1 className="auth-title">Créer un compte</h1>
                <p className="auth-subtitle">Commencez à dominer vos performances</p>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-2 mb-6">
                  {steps.map((s, i) => {
                    const n = i + 1
                    const isActive = step === n
                    const isDone = step > n
                return (
                  <div key={s.label} className="flex items-center gap-2">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300",
                      isDone ? "bg-primary text-primary-foreground" :
                      isActive ? "bg-primary/20 text-primary border border-primary" :
                      "bg-muted text-muted-foreground border border-border"
                    )}>
                      {isDone ? <CheckCircle size={14} /> : n}
                    </div>
                    <span className={cn(
                      "text-xs transition-colors hidden sm:block",
                      isActive ? "text-primary font-medium" : "text-muted-foreground"
                    )}>{s.label}</span>
                    {i < steps.length - 1 && (
                      <div className={cn(
                        "w-8 h-px transition-colors",
                        isDone ? "bg-primary" : "bg-border"
                      )} />
                    )}
                  </div>
                )
              })}
            </div>
          
          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext() }} className="auth-form">
              {error && (
                <div className="auth-error">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* ─── STEP 1: Identité ─── */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="auth-field">
                      <label className="auth-label">Prénom *</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={firstName}
                          onChange={e => setFirstName(e.target.value)}
                          className="auth-input pl-9"
                          placeholder="Pierre"
                          required
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="auth-field">
                      <label className="auth-label">Nom *</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={lastName}
                          onChange={e => setLastName(e.target.value)}
                          className="auth-input pl-9"
                          placeholder="Dupont"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="auth-field">
                      <label className="auth-label">Âge</label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="number"
                          value={age}
                          onChange={e => setAge(e.target.value)}
                          className="auth-input pl-9"
                          placeholder="25"
                          min={13}
                          max={100}
                        />
                      </div>
                    </div>
                    <div className="auth-field">
                      <label className="auth-label">Sexe</label>
                      <div className="flex gap-2 mt-1">
                        {['male', 'female'].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setGender(gender === val ? '' : val)}
                            className={cn(
                              "flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200",
                              gender === val
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                            )}
                          >
                            {val === 'male' ? '♂ Masculin' : '♀ Féminin'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── STEP 2: Email ─── */}
              {step === 2 && (
                <div className="auth-field">
                  <label htmlFor="reg-email" className="auth-label">Adresse Email *</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="reg-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="auth-input pl-9"
                      placeholder="vous@exemple.com"
                      required
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Utilisé pour vous connecter et recevoir des notifications.
                  </p>
                </div>
              )}

              {/* ─── STEP 3: Sécurité ─── */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="auth-field">
                    <label htmlFor="reg-password" className="auth-label">Mot de passe *</label>
                    <div className="auth-input-wrapper">
                      <input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="auth-input"
                        placeholder="••••••••"
                        required
                        autoComplete="new-password"
                        autoFocus
                      />
                      <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {strength && (
                      <div className="auth-strength">
                        <div className={`auth-strength-bar auth-strength-${strength}`} />
                        <span className={`auth-strength-label auth-strength-label-${strength}`}>
                          {strength === 'weak' ? 'Faible' : strength === 'medium' ? 'Moyen' : 'Fort'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="auth-field">
                    <label htmlFor="reg-confirm" className="auth-label">Confirmer le mot de passe *</label>
                    <div className="auth-input-wrapper">
                      <input
                        id="reg-confirm"
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="auth-input"
                        placeholder="••••••••"
                        required
                        autoComplete="new-password"
                      />
                      <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className={cn("flex gap-3 mt-2", step > 1 ? "justify-between" : "justify-end")}>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-accent transition-colors"
                  >
                    <ChevronLeft size={16} />
                    Retour
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Suivant
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button type="submit" className="auth-btn-primary flex-1" disabled={loading}>
                    {loading ? (
                      <span className="auth-btn-loading">
                        <span className="auth-spinner" />
                        Création...
                      </span>
                    ) : (
                      <span className="auth-btn-content">
                        <UserPlus size={18} />
                        Créer mon compte
                      </span>
                    )}
                  </button>
                )}
              </div>
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
                localStorage.setItem('isGoogleRegister', 'true')
                const { error } = await signInWithGoogle()
                if (error) throw error
              } catch (err: any) {
                setError(err.message)
                setGoogleLoading(false)
                localStorage.removeItem('isGoogleRegister')
              }
            }}
          >
            {googleLoading ? (
              <>
                <span className="auth-spinner" style={{ borderColor: 'rgba(240,244,255,0.2)', borderTopColor: '#00f5ff', width: '18px', height: '18px' }} />
                <span style={{ color: 'rgba(240,244,255,0.5)' }}>Inscription en cours...</span>
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
                <span className="auth-footer-text">Déjà un compte ?</span>
                <Link to="/login" className="auth-link">Se connecter</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
