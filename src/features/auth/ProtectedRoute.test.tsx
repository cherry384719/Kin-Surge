import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AuthContext } from './AuthProvider'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}))

function renderWithAuth(user: any, component: React.ReactNode) {
  return render(
    <AuthContext.Provider value={{ user, loading: false }}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={component} />
          <Route path="/" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('ProtectedRoute', () => {
  it('renders children when user is logged in', () => {
    renderWithAuth({ id: 'abc' }, <ProtectedRoute><div>Secret</div></ProtectedRoute>)
    expect(screen.getByText('Secret')).toBeInTheDocument()
  })

  it('redirects to / when user is null', () => {
    renderWithAuth(null, <ProtectedRoute><div>Secret</div></ProtectedRoute>)
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Secret')).not.toBeInTheDocument()
  })
})
