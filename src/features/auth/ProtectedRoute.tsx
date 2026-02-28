import { Navigate } from 'react-router-dom'
import { useUser } from './AuthProvider'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary">
        <p className="font-serif text-2xl text-accent mb-2">通天路</p>
        <p className="text-text-muted text-sm animate-pulse">加载中…</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />
  return <>{children}</>
}
