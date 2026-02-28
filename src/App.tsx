import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthProvider'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { AuthPage } from './features/auth/AuthPage'
import { DynastyMap } from './features/scenes/DynastyMap'
import { DynastyPage } from './features/scenes/DynastyPage'
import { ChallengePage } from './features/poetry/ChallengePage'

function LoginPage() {
  const navigate = useNavigate()
  return <AuthPage onSuccess={() => navigate('/app/home')} />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/app/home"
            element={<ProtectedRoute><DynastyMap /></ProtectedRoute>}
          />
          <Route
            path="/app/dynasty/:dynastyId"
            element={<ProtectedRoute><DynastyPage /></ProtectedRoute>}
          />
          <Route
            path="/app/challenge/:poetId"
            element={<ProtectedRoute><ChallengePage /></ProtectedRoute>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
