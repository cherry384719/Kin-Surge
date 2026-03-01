import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChallengeEngine } from './ChallengeEngine'
import type { RoundConfig } from './challengeTypes'

const mockRounds: RoundConfig[] = [
  {
    type: 'multiple-choice',
    label: '选择题',
    questions: [{
      type: 'multiple-choice',
      prompt: '床前明月光',
      options: ['疑是地上霜', '处处闻啼鸟', '春眠不觉晓', '低头思故乡'],
      correctAnswer: '疑是地上霜',
      poemId: 1,
    }],
  },
  {
    type: 'fill-blank',
    label: '填空题',
    questions: [{
      type: 'fill-blank',
      prompt: '举头望明月',
      answer: '低头思故乡',
      poemId: 1,
    }],
  },
  {
    type: 'ordering',
    label: '排序题',
    questions: [{
      type: 'ordering',
      shuffledLines: ['低头思故乡', '床前明月光'],
      correctOrder: ['床前明月光', '低头思故乡'],
      poemId: 1,
    }],
  },
]

test('shows round intro for first round', () => {
  render(<ChallengeEngine rounds={mockRounds} onAllComplete={vi.fn()} />)
  expect(screen.getByText(/选择题/)).toBeInTheDocument()
  expect(screen.getByText(/第 1 轮/)).toBeInTheDocument()
})

test('clicking start shows the round content', async () => {
  render(<ChallengeEngine rounds={mockRounds} onAllComplete={vi.fn()} />)
  await userEvent.click(screen.getByRole('button', { name: '开始' }))
  // Should now show the multiple choice question
  expect(screen.getByText('床前明月光')).toBeInTheDocument()
})
