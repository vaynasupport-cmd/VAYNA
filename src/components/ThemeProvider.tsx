import React, { createContext, useContext, useEffect, useState } from "react"

export type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = "vayna-ui-theme"

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

// Apply theme class immediately on load (before React renders) to avoid FOUC
function applyThemeClass(theme: Theme) {
  const root = window.document.documentElement
  root.classList.remove("light", "dark")

  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
    root.classList.add(systemTheme)
  } else {
    root.classList.add(theme)
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = STORAGE_KEY,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Read from localStorage on first render
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null
      return stored || defaultTheme
    } catch {
      return defaultTheme
    }
  })

  // Apply theme class every time theme changes — no page refresh needed
  useEffect(() => {
    applyThemeClass(theme)
  }, [theme])

  // Also apply on mount immediately in case SSR mismatch
  useEffect(() => {
    applyThemeClass(theme)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(storageKey, newTheme)
    } catch { /* ignore */ }
    setThemeState(newTheme)
    // Apply immediately without waiting for next render cycle
    applyThemeClass(newTheme)
  }

  return (
    <ThemeProviderContext.Provider {...props} value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
