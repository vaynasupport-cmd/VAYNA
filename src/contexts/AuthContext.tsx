import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, metadata?: {
    first_name?: string
    last_name?: string
    age?: number
    gender?: string
  }) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>
  updateProfile: (data: { full_name?: string, avatar_data?: string }) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // Listen to deep links for native app authentication (Google Login)
    if (Capacitor.isNativePlatform()) {
      App.addListener('appUrlOpen', async (event) => {
        const url = event.url
        if (url.startsWith('com.vayna.app://')) {
          await supabase.auth.getSessionFromUrl({ url })
        }
      })
    }

    return () => {
      subscription.unsubscribe()
      if (Capacitor.isNativePlatform()) {
        App.removeAllListeners()
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (
    email: string,
    password: string,
    metadata?: { first_name?: string; last_name?: string; age?: number; gender?: string }
  ) => {
    const isElectron = navigator.userAgent.toLowerCase().includes('electron')
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const redirectTo = isElectron 
      ? 'tradingjournal://auth/callback'
      : `${baseUrl}/#/dashboard`

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: metadata ? {
          full_name: [metadata.first_name, metadata.last_name].filter(Boolean).join(' '),
          first_name: metadata.first_name,
          last_name: metadata.last_name,
          age: metadata.age,
          gender: metadata.gender,
        } : undefined,
      },
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resetPasswordForEmail = async (email: string) => {
    const isElectron = navigator.userAgent.toLowerCase().includes('electron')
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const redirectTo = isElectron 
      ? 'tradingjournal://auth/reset-password'
      : `${baseUrl}/#/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })
    return { error }
  }

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return { error }
  }

  const updateProfile = async (data: { full_name?: string, avatar_data?: string }) => {
    const { error } = await supabase.auth.updateUser({ data })
    return { error }
  }

  const signInWithGoogle = async () => {
    // Determine the base URL
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    
    // Determine the redirect URL based on platform
    const isNativeApp = Capacitor.isNativePlatform()
    const redirectTo = isNativeApp 
      ? 'com.vayna.app://login-callback' 
      : `${baseUrl}/#/login`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPasswordForEmail,
    updatePassword,
    updateProfile,
    signInWithGoogle,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
