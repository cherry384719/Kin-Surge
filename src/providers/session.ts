import { createContext, useContext } from 'react'

export interface SessionUser {
  id: string
  username: string
  email?: string | null
  display_name: string
  coins: number
  is_guest: boolean
}

export interface SessionContextValue {
  user: SessionUser | null
  loading: boolean
  error: string | null
  login: (input: { identifier: string; password: string }) => Promise<void>
  register: (input: { username: string; password: string; displayName: string; email?: string }) => Promise<void>
  guestLogin: () => Promise<void>
  logout: () => Promise<void>
  syncUser: (next: SessionUser) => void
}

export const SessionContext = createContext<SessionContextValue | null>(null)

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within SessionProvider')
  }
  return context
}
