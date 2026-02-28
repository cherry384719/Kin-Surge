import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthPage } from './features/auth/AuthPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
