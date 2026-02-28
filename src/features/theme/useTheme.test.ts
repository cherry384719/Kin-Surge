import { renderHook, act } from '@testing-library/react'
import { useTheme } from './useTheme'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})

test('defaults to light theme', () => {
  const { result } = renderHook(() => useTheme())
  expect(result.current.isDark).toBe(false)
  expect(document.documentElement.classList.contains('dark')).toBe(false)
})

test('toggles to dark theme', () => {
  const { result } = renderHook(() => useTheme())
  act(() => result.current.toggle())
  expect(result.current.isDark).toBe(true)
  expect(document.documentElement.classList.contains('dark')).toBe(true)
})

test('persists preference to localStorage', () => {
  const { result } = renderHook(() => useTheme())
  act(() => result.current.toggle())
  expect(localStorage.getItem('theme')).toBe('dark')
})

test('reads saved preference on mount', () => {
  localStorage.setItem('theme', 'dark')
  const { result } = renderHook(() => useTheme())
  expect(result.current.isDark).toBe(true)
})
