// src/features/poetry/MultipleChoiceRound.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultipleChoiceRound } from './MultipleChoiceRound'
import type { MultipleChoiceQuestion } from './challengeTypes'

const questions: MultipleChoiceQuestion[] = [
  {
    type: 'multiple-choice',
    prompt: '床前明月光',
    options: ['疑是地上霜', '处处闻啼鸟', '春眠不觉晓', '低头思故乡'],
    correctAnswer: '疑是地上霜',
    poemId: 1,
  },
  {
    type: 'multiple-choice',
    prompt: '举头望明月',
    options: ['低头思故乡', '花落知多少', '疑是地上霜', '处处闻啼鸟'],
    correctAnswer: '低头思故乡',
    poemId: 1,
  },
]

test('renders prompt and 4 options', () => {
  const onComplete = vi.fn()
  render(<MultipleChoiceRound questions={questions} onComplete={onComplete} />)
  expect(screen.getByText('床前明月光')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '疑是地上霜' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '处处闻啼鸟' })).toBeInTheDocument()
})

test('correct answer shows success and advances', async () => {
  const onComplete = vi.fn()
  render(<MultipleChoiceRound questions={questions} onComplete={onComplete} />)
  await userEvent.click(screen.getByRole('button', { name: '疑是地上霜' }))
  expect(screen.getByText('正确！')).toBeInTheDocument()
})

test('wrong answer shows the correct answer', async () => {
  const onComplete = vi.fn()
  render(<MultipleChoiceRound questions={questions} onComplete={onComplete} />)
  await userEvent.click(screen.getByRole('button', { name: '处处闻啼鸟' }))
  expect(screen.getByText(/疑是地上霜/)).toBeInTheDocument()
})

test('calls onComplete with score after all questions', async () => {
  const onComplete = vi.fn()
  render(<MultipleChoiceRound questions={questions} onComplete={onComplete} />)
  await userEvent.click(screen.getByRole('button', { name: '疑是地上霜' }))
  await userEvent.click(screen.getByRole('button', { name: '下一题' }))
  await userEvent.click(screen.getByRole('button', { name: '低头思故乡' }))
  await userEvent.click(screen.getByRole('button', { name: '查看结果' }))
  expect(onComplete).toHaveBeenCalledWith({ correct: 2, total: 2, mistakes: 0 })
})
