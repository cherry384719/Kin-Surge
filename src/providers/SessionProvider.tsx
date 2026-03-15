import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../lib/api'
import { SessionContext, type SessionContextValue, type SessionUser } from './session'

interface AuthPayload {
  user: SessionUser
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiRequest<AuthPayload>('/auth/me')
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(input: { identifier: string; password: string }) {
    setError(null)
    const data = await apiRequest<AuthPayload>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    }).catch((requestError: Error) => {
      setError(requestError.message)
      throw requestError
    })
    setUser(data.user)
  }

  async function register(input: { username: string; password: string; displayName: string; email?: string }) {
    setError(null)
    const data = await apiRequest<AuthPayload>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: input.username,
        password: input.password,
        display_name: input.displayName,
        email: input.email,
      }),
    }).catch((requestError: Error) => {
      setError(requestError.message)
      throw requestError
    })
    setUser(data.user)
  }

  async function guestLogin() {
    setError(null)
    const data = await apiRequest<AuthPayload>('/auth/guest', { method: 'POST' }).catch((requestError: Error) => {
      setError(requestError.message)
      throw requestError
    })
    setUser(data.user)
  }

  async function logout() {
    await apiRequest('/auth/logout', { method: 'POST' })
    setUser(null)
  }

  const value = useMemo<SessionContextValue>(() => ({
    user,
    loading,
    error,
    login,
    register,
    guestLogin,
    logout,
    syncUser: setUser,
  }), [user, loading, error])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
