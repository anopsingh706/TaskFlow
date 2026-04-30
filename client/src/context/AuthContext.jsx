import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { authAPI } from '../api/auth'

const AuthContext = createContext(null)

const TOKEN_KEY = 'taskflow_token'
const USER_KEY  = 'taskflow_user'

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  const [token, setToken]     = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  // ── Persist helpers ──────────────────────────────────────
  const saveSession = useCallback((token, user) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setToken(token)
    setUser(user)
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  // ── Verify token on mount ────────────────────────────────
  useEffect(() => {
    const verify = async () => {
      if (!token) { setLoading(false); return }
      try {
        const { data } = await authAPI.getMe()
        setUser(data.user)
        localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      } catch {
        clearSession()
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, []) // eslint-disable-line

  // ── Listen for 401 events from axios interceptor ─────────
  useEffect(() => {
    const handleLogout = () => {
      clearSession()
      toast.error('Session expired — please log in again')
    }
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [clearSession])

  // ── Auth actions ─────────────────────────────────────────
  const register = async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password })
    saveSession(data.token, data.user)
    toast.success(`Welcome to TaskFlow, ${data.user.name}! 🚀`)
    return data
  }

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    saveSession(data.token, data.user)
    toast.success(`Welcome back, ${data.user.name}!`)
    return data
  }

  const logout = async () => {
    try { await authAPI.logout() } catch { /* ignore */ }
    clearSession()
    toast.success('Logged out successfully')
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      isAuthenticated: !!token && !!user,
      register, login, logout, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
