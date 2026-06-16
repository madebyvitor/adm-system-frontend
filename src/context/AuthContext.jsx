import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api, { AUTH_LOGOUT_EVENT, TOKEN_KEY, USER_KEY } from '../services/api'

const AUTH_ENDPOINT = '/auth/login'

const AuthContext = createContext(null)

function readStoredUser() {
  const stored = localStorage.getItem(USER_KEY)

  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

function readStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    readStoredToken() ? readStoredUser() : null,
  )
  const [token, setToken] = useState(readStoredToken)

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const signIn = useCallback(async (email, password) => {
    const { data } = await api.post(AUTH_ENDPOINT, { email, password })

    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
  }, [])

  const signOut = useCallback(() => {
    clearSession()
  }, [clearSession])

  useEffect(() => {
    const handleLogout = () => {
      setToken(null)
      setUser(null)
    }

    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogout)

    return () => {
      window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogout)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(token),
      signIn,
      signOut,
    }),
    [user, token, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
