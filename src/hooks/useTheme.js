import { useState, useEffect, useCallback } from 'react'

/**
 * useTheme - manages light/dark theme with localStorage persistence.
 *
 * Reads initial preference from:
 * 1. localStorage 'scholera-theme' key
 * 2. System preference via prefers-color-scheme
 *
 * Sets data-theme attribute on <html> for CSS variable switching.
 */
export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem('scholera-theme')
    if (stored === 'light' || stored === 'dark') return stored

    // Fall back to system preference
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }

    return 'light'
  })

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('scholera-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  return { theme, toggleTheme }
}
