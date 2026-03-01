import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from './features/auth/AuthProvider'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { AuthPage } from './features/auth/AuthPage'
import { AppLayout } from './features/layout/AppLayout'

const DynastyMap = lazy(() => import('./features/scenes/DynastyMap').then(m => ({ default: m.DynastyMap })))
const DynastyPage = lazy(() => import('./features/scenes/DynastyPage').then(m => ({ default: m.DynastyPage })))
const ChallengePage = lazy(() => import('./features/poetry/ChallengePage').then(m => ({ default: m.ChallengePage })))
const FeihuaLingPage = lazy(() => import('./features/poetry/FeihuaLingPage').then(m => ({ default: m.FeihuaLingPage })))

function LoginPage() {
  const navigate = useNavigate()
  return <AuthPage onSuccess={() => navigate('/app/home')} />
}

function ProtectedWithLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="flex items-center justify-center py-20 text-text-muted">加载中…</div>}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/app/home" element={<ProtectedWithLayout><DynastyMap /></ProtectedWithLayout>} />
            <Route path="/app/dynasty/:dynastyId" element={<ProtectedWithLayout><DynastyPage /></ProtectedWithLayout>} />
            <Route path="/app/dynasty/:dynastyId/challenge/:poetId" element={<ProtectedWithLayout><ChallengePage /></ProtectedWithLayout>} />
            <Route path="/app/feihualing" element={<ProtectedWithLayout><FeihuaLingPage /></ProtectedWithLayout>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
