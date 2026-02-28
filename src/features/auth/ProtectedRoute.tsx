import { Navigate } from 'react-router-dom'
import { useUser } from './AuthProvider'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()

  if (loading) return <div className="min-h-screen flex items-center justify-center">加载中…</div>
  if (!user) return <Navigate to="/" replace />

  return <>{children}</>
}
