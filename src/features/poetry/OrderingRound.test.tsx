// src/features/poetry/OrderingRound.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OrderingRound } from './OrderingRound'
import type { OrderingQuestion } from './challengeTypes'

const questions: OrderingQuestion[] = [
  {
    type: 'ordering',
    shuffledLines: ['低头思故乡', '床前明月光', '举头望明月', '疑是地上霜'],
    correctOrder: ['床前明月光', '疑是地上霜', '举头望明月', '低头思故乡'],
    poemId: 1,
  },
]

test('renders all shuffled lines as buttons', () => {
  render(<OrderingRound questions={questions} onComplete={vi.fn()} />)
  expect(screen.getByText('低头思故乡')).toBeInTheDocument()
  expect(screen.getByText('床前明月光')).toBeInTheDocument()
  expect(screen.getByText('举头望明月')).toBeInTheDocument()
  expect(screen.getByText('疑是地上霜')).toBeInTheDocument()
})

test('tapping lines in correct order shows success', async () => {
  const onComplete = vi.fn()
  render(<OrderingRound questions={questions} onComplete={onComplete} />)
  await userEvent.click(screen.getByRole('button', { name: '床前明月光' }))
  await userEvent.click(screen.getByRole('button', { name: '疑是地上霜' }))
  await userEvent.click(screen.getByRole('button', { name: '举头望明月' }))
  await userEvent.click(screen.getByRole('button', { name: '低头思故乡' }))
  expect(screen.getByText('排列正确！')).toBeInTheDocument()
})

test('calls onComplete after finishing all questions', async () => {
  const onComplete = vi.fn()
  render(<OrderingRound questions={questions} onComplete={onComplete} />)
  await userEvent.click(screen.getByRole('button', { name: '床前明月光' }))
  await userEvent.click(screen.getByRole('button', { name: '疑是地上霜' }))
  await userEvent.click(screen.getByRole('button', { name: '举头望明月' }))
  await userEvent.click(screen.getByRole('button', { name: '低头思故乡' }))
  await userEvent.click(screen.getByRole('button', { name: '查看结果' }))
  expect(onComplete).toHaveBeenCalledWith({ correct: 1, total: 1, mistakes: 0 })
})
