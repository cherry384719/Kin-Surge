import { describe, expect, it } from 'vitest'
import { buildChallengeDeck } from '../features/challenge/buildChallengeDeck'

describe('buildChallengeDeck', () => {
  it('builds a mixed deck from poem lines', () => {
    const deck = buildChallengeDeck([
      { id: 1, poem_id: 1, line_number: 1, text: '床前明月光' },
      { id: 2, poem_id: 1, line_number: 2, text: '疑是地上霜' },
      { id: 3, poem_id: 1, line_number: 3, text: '举头望明月' },
      { id: 4, poem_id: 1, line_number: 4, text: '低头思故乡' },
      { id: 5, poem_id: 2, line_number: 1, text: '白日依山尽' },
      { id: 6, poem_id: 2, line_number: 2, text: '黄河入海流' },
      { id: 7, poem_id: 2, line_number: 3, text: '欲穷千里目' },
      { id: 8, poem_id: 2, line_number: 4, text: '更上一层楼' },
    ])

    expect(deck.length).toBeGreaterThanOrEqual(4)
    expect(deck.some(question => question.type === 'multiple-choice')).toBe(true)
    expect(deck.some(question => question.type === 'fill-blank')).toBe(true)
    expect(deck.some(question => question.type === 'ordering')).toBe(true)
  })
})
