import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})

test('renders sun icon in dark mode', () => {
  localStorage.setItem('theme', 'dark')
  render(<ThemeToggle />)
  expect(screen.getByRole('button', { name: '切换亮色模式' })).toBeInTheDocument()
})

test('renders moon icon in light mode', () => {
  render(<ThemeToggle />)
  expect(screen.getByRole('button', { name: '切换暗色模式' })).toBeInTheDocument()
})

test('toggles theme on click', async () => {
  render(<ThemeToggle />)
  const btn = screen.getByRole('button', { name: '切换暗色模式' })
  await userEvent.click(btn)
  expect(document.documentElement.classList.contains('dark')).toBe(true)
})
