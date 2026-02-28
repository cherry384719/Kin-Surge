import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthPage } from './AuthPage'

// Mock supabase so tests don't hit the network
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}))

describe('AuthPage', () => {
  it('renders email and password inputs', () => {
    render(<AuthPage />)
    expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument()
  })

  it('has a login button', () => {
    render(<AuthPage />)
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument()
  })

  it('calls signInWithPassword with entered credentials', async () => {
    const { supabase } = await import('../../lib/supabase')
    render(<AuthPage />)
    await userEvent.type(screen.getByLabelText(/邮箱/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/密码/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /登录/i }))
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })
})
