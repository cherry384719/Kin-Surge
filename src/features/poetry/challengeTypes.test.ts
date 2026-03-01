import { describe, it, expect } from 'vitest'
import {
  type ChallengeType,
  type ChallengeQuestion,
  type MultipleChoiceQuestion,
  type OrderingQuestion,
  type FillBlankQuestion,
  type RoundConfig,
  buildRounds,
} from './challengeTypes'

describe('buildRounds', () => {
  const sampleLines = [
    { id: 1, poem_id: 1, line_number: 1, text: '床前明月光' },
    { id: 2, poem_id: 1, line_number: 2, text: '疑是地上霜' },
    { id: 3, poem_id: 1, line_number: 3, text: '举头望明月' },
    { id: 4, poem_id: 1, line_number: 4, text: '低头思故乡' },
    { id: 5, poem_id: 2, line_number: 1, text: '春眠不觉晓' },
    { id: 6, poem_id: 2, line_number: 2, text: '处处闻啼鸟' },
    { id: 7, poem_id: 2, line_number: 3, text: '夜来风雨声' },
    { id: 8, poem_id: 2, line_number: 4, text: '花落知多少' },
  ]

  it('returns 3 rounds: multiple-choice, fill-blank, ordering', () => {
    const rounds = buildRounds(sampleLines)
    expect(rounds).toHaveLength(3)
    expect(rounds[0].type).toBe('multiple-choice')
    expect(rounds[1].type).toBe('fill-blank')
    expect(rounds[2].type).toBe('ordering')
  })

  it('multiple-choice round has questions with 4 options each', () => {
    const rounds = buildRounds(sampleLines)
    const mcRound = rounds[0]
    expect(mcRound.questions.length).toBeGreaterThanOrEqual(2)
    for (const q of mcRound.questions) {
      const mcQ = q as MultipleChoiceQuestion
      expect(mcQ.options).toHaveLength(4)
      expect(mcQ.options).toContain(mcQ.correctAnswer)
    }
  })

  it('fill-blank round has questions with prompt and answer', () => {
    const rounds = buildRounds(sampleLines)
    const fbRound = rounds[1]
    expect(fbRound.questions.length).toBeGreaterThanOrEqual(2)
    for (const q of fbRound.questions) {
      const fbQ = q as FillBlankQuestion
      expect(fbQ.prompt).toBeTruthy()
      expect(fbQ.answer).toBeTruthy()
    }
  })

  it('ordering round has questions with shuffled lines', () => {
    const rounds = buildRounds(sampleLines)
    const ordRound = rounds[2]
    expect(ordRound.questions.length).toBeGreaterThanOrEqual(1)
    for (const q of ordRound.questions) {
      const ordQ = q as OrderingQuestion
      expect(ordQ.shuffledLines).toHaveLength(ordQ.correctOrder.length)
      expect([...ordQ.shuffledLines].sort()).toEqual([...ordQ.correctOrder].sort())
    }
  })

  it('handles fewer than 4 lines gracefully', () => {
    const twoLines = sampleLines.slice(0, 2)
    const rounds = buildRounds(twoLines)
    expect(rounds).toHaveLength(3)
  })
})
