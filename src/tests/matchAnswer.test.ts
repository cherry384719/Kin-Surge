import { describe, expect, it } from 'vitest'
import { matchAnswer } from '../features/challenge/matchAnswer'

describe('matchAnswer', () => {
  it('treats normalized traditional and simplified text as correct', () => {
    expect(matchAnswer('举头望明月', '舉頭望明月')).toBe('correct')
  })

  it('returns close for near misses', () => {
    expect(matchAnswer('床前明月光', '床前明月')).toBe('close')
  })
})
