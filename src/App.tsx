import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SessionProvider } from './providers/SessionProvider'
import { useSession } from './providers/session'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { DynastyPage } from './pages/DynastyPage'
import { ChallengePage } from './pages/ChallengePage'
import './App.css'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession()

  if (loading) {
    return <div className="screen-shell flex items-center justify-center"><div className="paper-panel px-8 py-6 text-center text-sm font-semibold text-slate-500">正在铺开诗词长卷…</div></div>
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function HomeGate() {
  const { user, loading } = useSession()

  if (loading) {
    return <div className="screen-shell flex items-center justify-center"><div className="paper-panel px-8 py-6 text-center text-sm font-semibold text-slate-500">正在校验会话…</div></div>
  }

  return user ? <Navigate to="/play" replace /> : <AuthPage />
}

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeGate />} />
          <Route path="/play" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dynasties/:dynastyId" element={<ProtectedRoute><DynastyPage /></ProtectedRoute>} />
          <Route path="/challenge/:poetId" element={<ProtectedRoute><ChallengePage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  )
}
