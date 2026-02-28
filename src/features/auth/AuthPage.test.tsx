import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthPage } from './AuthPage'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}))

test('shows login form by default', () => {
  render(<AuthPage />)
  expect(screen.getByRole('heading', { name: '通天路' })).toBeInTheDocument()
  expect(screen.getByLabelText('邮箱')).toBeInTheDocument()
  expect(screen.getByLabelText('密码')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument()
})

test('switches to register tab', async () => {
  render(<AuthPage />)
  await userEvent.click(screen.getByRole('tab', { name: '注册' }))
  expect(screen.getByLabelText('显示名称')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '注册' })).toBeInTheDocument()
})

test('submits login form', async () => {
  const onSuccess = vi.fn()
  render(<AuthPage onSuccess={onSuccess} />)
  await userEvent.type(screen.getByLabelText('邮箱'), 'test@test.com')
  await userEvent.type(screen.getByLabelText('密码'), 'password123')
  await userEvent.click(screen.getByRole('button', { name: '登录' }))
})

test('submits register form', async () => {
  render(<AuthPage />)
  await userEvent.click(screen.getByRole('tab', { name: '注册' }))
  await userEvent.type(screen.getByLabelText('邮箱'), 'new@test.com')
  await userEvent.type(screen.getByLabelText('密码'), 'password123')
  await userEvent.type(screen.getByLabelText('显示名称'), '诗童')
  await userEvent.click(screen.getByRole('button', { name: '注册' }))
})
