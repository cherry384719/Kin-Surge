import { describe, it, expect } from 'vitest'
import { matchAnswer } from './matchAnswer'

describe('matchAnswer', () => {
  it('returns correct for an exact match', () => {
    const result = matchAnswer('低头思故乡', '低头思故乡')
    expect(result).toBe('correct')
  })

  it('returns correct for a near match (one character off)', () => {
    // "低头思故乡" vs "低头思故鄉" (traditional vs simplified)
    const result = matchAnswer('低头思故乡', '低头思故鄉')
    expect(result).toBe('correct')
  })

  it('returns close for a partially correct answer', () => {
    const result = matchAnswer('低头思故乡', '低头望故乡')
    expect(result).toBe('close')
  })

  it('returns wrong for an unrelated answer', () => {
    const result = matchAnswer('低头思故乡', '春眠不觉晓')
    expect(result).toBe('wrong')
  })

  it('is tolerant of leading/trailing whitespace', () => {
    const result = matchAnswer('低头思故乡', '  低头思故乡  ')
    expect(result).toBe('correct')
  })
})
