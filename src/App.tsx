import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthProvider'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { AuthPage } from './features/auth/AuthPage'

function Placeholder({ label }: { label: string }) {
  return <div className="p-8 text-2xl">{label}</div>
}

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
            element={<ProtectedRoute><Placeholder label="Dynasty Map" /></ProtectedRoute>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
