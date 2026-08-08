import { useState, useCallback } from 'react'

const AUTH_KEY = 'scholera-auth'

function loadAuth() {
  try {
    const stored = localStorage.getItem(AUTH_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

/**
 * useAuth — frontend-only demo authentication with localStorage persistence.
 * No real backend. Stores user info locally.
 */
export function useAuth() {
  const [user, setUser] = useState(loadAuth)

  const login = useCallback((email, name) => {
    const userData = {
      email,
      name: name || email.split('@')[0],
      initials: (name || email.split('@')[0]).slice(0, 2).toUpperCase(),
      loginAt: new Date().toISOString(),
    }
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY)
    setUser(null)
  }, [])

  return { user, login, logout, isAuthenticated: !!user }
}
