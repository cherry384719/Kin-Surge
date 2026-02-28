import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthProvider'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { AuthPage } from './features/auth/AuthPage'
import { AppLayout } from './features/layout/AppLayout'
import { DynastyMap } from './features/scenes/DynastyMap'
import { DynastyPage } from './features/scenes/DynastyPage'
import { ChallengePage } from './features/poetry/ChallengePage'

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
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/app/home" element={<ProtectedWithLayout><DynastyMap /></ProtectedWithLayout>} />
          <Route path="/app/dynasty/:dynastyId" element={<ProtectedWithLayout><DynastyPage /></ProtectedWithLayout>} />
          <Route path="/app/dynasty/:dynastyId/challenge/:poetId" element={<ProtectedWithLayout><ChallengePage /></ProtectedWithLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
