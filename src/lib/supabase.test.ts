import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('supabase module', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key')
  })

  it('exports a supabase client object', async () => {
    const { supabase } = await import('./supabase')
    expect(supabase).toBeDefined()
    expect(typeof supabase.from).toBe('function')
  })
})
