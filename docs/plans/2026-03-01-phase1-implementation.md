# Phase 1: New Challenge Types + Flow Optimization

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add multiple-choice, ordering, and feihualing challenge types with a round-based challenge flow, poet introductions, and enhanced results/progress visualization.

**Architecture:** Extend the existing `ChallengePage` with a challenge type system. Each poet challenge becomes a 3-round sequence (multiple-choice → fill-blank → ordering). A new `ChallengeEngine` component manages round state while delegating to type-specific renderers. Feihualing is a standalone mode accessible from DynastyMap.

**Tech Stack:** React 19, TypeScript, Vitest, Tailwind CSS, Supabase

---

### Task 1: Define Challenge Type System

**Files:**
- Create: `src/features/poetry/challengeTypes.ts`
- Test: `src/features/poetry/challengeTypes.test.ts`

**Step 1: Write the failing test**

```typescript
// src/features/poetry/challengeTypes.test.ts
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
      // Contains same items, possibly different order
      expect([...ordQ.shuffledLines].sort()).toEqual([...ordQ.correctOrder].sort())
    }
  })

  it('handles fewer than 4 lines gracefully', () => {
    const twoLines = sampleLines.slice(0, 2)
    const rounds = buildRounds(twoLines)
    // Should still produce rounds, just fewer questions
    expect(rounds).toHaveLength(3)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/poetry/challengeTypes.test.ts`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

```typescript
// src/features/poetry/challengeTypes.ts
import type { PoemLine } from './useChallenge'

export type ChallengeType = 'multiple-choice' | 'fill-blank' | 'ordering' | 'feihualing'

export interface MultipleChoiceQuestion {
  type: 'multiple-choice'
  prompt: string
  options: string[]
  correctAnswer: string
  poemId: number
}

export interface FillBlankQuestion {
  type: 'fill-blank'
  prompt: string
  answer: string
  poemId: number
}

export interface OrderingQuestion {
  type: 'ordering'
  shuffledLines: string[]
  correctOrder: string[]
  poemId: number
}

export type ChallengeQuestion = MultipleChoiceQuestion | FillBlankQuestion | OrderingQuestion

export interface RoundConfig {
  type: ChallengeType
  label: string
  questions: ChallengeQuestion[]
}

/** Fisher-Yates shuffle (returns new array) */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Group lines by poem_id */
function groupByPoem(lines: PoemLine[]): Map<number, PoemLine[]> {
  const map = new Map<number, PoemLine[]>()
  for (const line of lines) {
    const group = map.get(line.poem_id) ?? []
    group.push(line)
    map.set(line.poem_id, group)
  }
  return map
}

/** Build 3 rounds of questions from poem lines */
export function buildRounds(lines: PoemLine[]): RoundConfig[] {
  const poemGroups = groupByPoem(lines)
  const allTexts = lines.map(l => l.text)

  // --- Round 1: Multiple Choice ---
  const mcQuestions: MultipleChoiceQuestion[] = []
  for (const [poemId, poemLines] of poemGroups) {
    const sorted = [...poemLines].sort((a, b) => a.line_number - b.line_number)
    for (let i = 0; i < sorted.length - 1; i += 2) {
      const prompt = sorted[i].text
      const correct = sorted[i + 1].text
      // Pick 3 wrong answers from other lines
      const wrongs = allTexts.filter(t => t !== correct && t !== prompt)
      const picked = shuffle(wrongs).slice(0, 3)
      // Pad if not enough wrong answers
      while (picked.length < 3) picked.push('（无）')
      const options = shuffle([correct, ...picked])
      mcQuestions.push({ type: 'multiple-choice', prompt, options, correctAnswer: correct, poemId })
    }
  }

  // --- Round 2: Fill Blank (reuse existing pair logic) ---
  const fbQuestions: FillBlankQuestion[] = []
  for (const [poemId, poemLines] of poemGroups) {
    const sorted = [...poemLines].sort((a, b) => a.line_number - b.line_number)
    for (let i = 0; i < sorted.length - 1; i += 2) {
      fbQuestions.push({ type: 'fill-blank', prompt: sorted[i].text, answer: sorted[i + 1].text, poemId })
    }
  }

  // --- Round 3: Ordering (whole poem) ---
  const ordQuestions: OrderingQuestion[] = []
  for (const [poemId, poemLines] of poemGroups) {
    if (poemLines.length < 2) continue
    const sorted = [...poemLines].sort((a, b) => a.line_number - b.line_number)
    const correctOrder = sorted.map(l => l.text)
    const shuffledLines = shuffle(correctOrder)
    ordQuestions.push({ type: 'ordering', shuffledLines, correctOrder, poemId })
  }

  // Limit questions per round for balance
  return [
    { type: 'multiple-choice', label: '选择题', questions: shuffle(mcQuestions).slice(0, 3) },
    { type: 'fill-blank', label: '填空题', questions: shuffle(fbQuestions).slice(0, 3) },
    { type: 'ordering', label: '排序题', questions: shuffle(ordQuestions).slice(0, 2) },
  ]
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/poetry/challengeTypes.test.ts`
Expected: PASS (all 5 tests)

**Step 5: Commit**

```bash
git add src/features/poetry/challengeTypes.ts src/features/poetry/challengeTypes.test.ts
git commit -m "feat: add challenge type system with multiple-choice, fill-blank, ordering"
```

---

### Task 2: Multiple Choice Component

**Files:**
- Create: `src/features/poetry/MultipleChoiceRound.tsx`
- Test: `src/features/poetry/MultipleChoiceRound.test.tsx`

**Step 1: Write the failing test**

```typescript
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
  // Answer first question correctly
  await userEvent.click(screen.getByRole('button', { name: '疑是地上霜' }))
  await userEvent.click(screen.getByRole('button', { name: '下一题' }))
  // Answer second question correctly
  await userEvent.click(screen.getByRole('button', { name: '低头思故乡' }))
  await userEvent.click(screen.getByRole('button', { name: '查看结果' }))
  expect(onComplete).toHaveBeenCalledWith({ correct: 2, total: 2, mistakes: 0 })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/poetry/MultipleChoiceRound.test.tsx`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

```tsx
// src/features/poetry/MultipleChoiceRound.tsx
import { useState } from 'react'
import type { MultipleChoiceQuestion } from './challengeTypes'

interface Props {
  questions: MultipleChoiceQuestion[]
  onComplete: (result: { correct: number; total: number; mistakes: number }) => void
}

export function MultipleChoiceRound({ questions, onComplete }: Props) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [correct, setCorrect] = useState(0)
  const [mistakes, setMistakes] = useState(0)

  const q = questions[index]
  if (!q) return null

  const isCorrect = selected === q.correctAnswer
  const isWrong = selected !== null && !isCorrect
  const answered = selected !== null
  const isLast = index === questions.length - 1

  function handleSelect(option: string) {
    if (answered) return
    setSelected(option)
    if (option === q.correctAnswer) {
      setCorrect(prev => prev + 1)
    } else {
      setMistakes(prev => prev + 1)
    }
  }

  function handleNext() {
    if (isLast) {
      const finalCorrect = correct
      const finalMistakes = mistakes
      onComplete({ correct: finalCorrect, total: questions.length, mistakes: finalMistakes })
    } else {
      setIndex(prev => prev + 1)
      setSelected(null)
    }
  }

  return (
    <div>
      <p className="text-xs text-text-muted mb-2">第 {index + 1} / {questions.length} 题 · 选择题</p>
      <div className="bg-bg-secondary rounded-xl p-6 mb-6 border border-border-light">
        <p className="text-xs text-text-muted mb-2">诗人说：</p>
        <p className="font-kai text-2xl text-text-primary leading-relaxed">{q.prompt}</p>
      </div>
      <div className="grid grid-cols-1 gap-3 mb-4">
        {q.options.map(option => {
          let btnClass = 'w-full text-left px-4 py-3 rounded-xl border transition-colors font-kai text-lg '
          if (!answered) {
            btnClass += 'border-border-light bg-bg-primary hover:border-[var(--dynasty-primary)] text-text-primary'
          } else if (option === q.correctAnswer) {
            btnClass += 'border-success bg-success/10 text-success'
          } else if (option === selected) {
            btnClass += 'border-error bg-error/10 text-error'
          } else {
            btnClass += 'border-border-light bg-bg-primary text-text-muted opacity-50'
          }
          return (
            <button key={option} onClick={() => handleSelect(option)} className={btnClass} disabled={answered}>
              {option}
            </button>
          )
        })}
      </div>
      {answered && (
        <div className="space-y-3">
          <p className={`text-lg font-bold ${isCorrect ? 'text-success' : 'text-error'}`}>
            {isCorrect ? '正确！' : `答案是：${q.correctAnswer}`}
          </p>
          <button
            onClick={handleNext}
            className="w-full py-2.5 rounded-xl text-white transition-colors"
            style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}
          >
            {isLast ? '查看结果' : '下一题'}
          </button>
        </div>
      )}
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/poetry/MultipleChoiceRound.test.tsx`
Expected: PASS (all 4 tests)

**Step 5: Commit**

```bash
git add src/features/poetry/MultipleChoiceRound.tsx src/features/poetry/MultipleChoiceRound.test.tsx
git commit -m "feat: add multiple-choice challenge round component"
```

---

### Task 3: Ordering Component

**Files:**
- Create: `src/features/poetry/OrderingRound.tsx`
- Test: `src/features/poetry/OrderingRound.test.tsx`

**Step 1: Write the failing test**

```typescript
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
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/poetry/OrderingRound.test.tsx`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

```tsx
// src/features/poetry/OrderingRound.tsx
import { useState } from 'react'
import type { OrderingQuestion } from './challengeTypes'

interface Props {
  questions: OrderingQuestion[]
  onComplete: (result: { correct: number; total: number; mistakes: number }) => void
}

export function OrderingRound({ questions, onComplete }: Props) {
  const [index, setIndex] = useState(0)
  const [placed, setPlaced] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [mistakes, setMistakes] = useState(0)

  const q = questions[index]
  if (!q) return null

  const remaining = q.shuffledLines.filter(l => !placed.includes(l))
  const allPlaced = placed.length === q.correctOrder.length
  const isCorrectOrder = allPlaced && placed.every((line, i) => line === q.correctOrder[i])
  const isLast = index === questions.length - 1

  function handleTap(line: string) {
    if (checked) return
    setPlaced(prev => [...prev, line])
  }

  function handleUndo() {
    if (checked) return
    setPlaced(prev => prev.slice(0, -1))
  }

  function handleCheck() {
    setChecked(true)
    if (isCorrectOrder) {
      setCorrect(prev => prev + 1)
    } else {
      setMistakes(prev => prev + 1)
    }
  }

  function handleNext() {
    if (isLast) {
      onComplete({ correct, total: questions.length, mistakes })
    } else {
      setIndex(prev => prev + 1)
      setPlaced([])
      setChecked(false)
    }
  }

  // Auto-check when all lines placed
  if (allPlaced && !checked) {
    // Use setTimeout to avoid state update during render
    setTimeout(() => handleCheck(), 0)
  }

  return (
    <div>
      <p className="text-xs text-text-muted mb-2">第 {index + 1} / {questions.length} 题 · 排序题</p>
      <p className="text-sm text-text-secondary mb-4">按正确顺序点选诗句：</p>

      {/* Placed lines (answer area) */}
      <div className="bg-bg-secondary rounded-xl p-4 mb-4 min-h-[120px] border border-border-light">
        {placed.length === 0 && <p className="text-text-muted text-sm">点击下方诗句，按顺序排列</p>}
        {placed.map((line, i) => {
          const isRight = checked && line === q.correctOrder[i]
          const isWrong = checked && line !== q.correctOrder[i]
          return (
            <div key={`${line}-${i}`} className={`px-3 py-2 rounded-lg mb-1 font-kai text-lg ${
              isRight ? 'bg-success/10 text-success' :
              isWrong ? 'bg-error/10 text-error' :
              'bg-bg-primary text-text-primary'
            }`}>
              <span className="text-xs text-text-muted mr-2">{i + 1}.</span>
              {line}
            </div>
          )
        })}
      </div>

      {/* Available lines */}
      {!checked && (
        <div className="grid grid-cols-1 gap-2 mb-4">
          {remaining.map(line => (
            <button
              key={line}
              onClick={() => handleTap(line)}
              className="text-left px-4 py-3 rounded-xl border border-border-light bg-bg-primary hover:border-[var(--dynasty-primary)] font-kai text-lg text-text-primary transition-colors"
            >
              {line}
            </button>
          ))}
        </div>
      )}

      {!checked && placed.length > 0 && (
        <button onClick={handleUndo} className="text-sm text-text-muted hover:text-text-secondary mb-4">
          撤回上一句
        </button>
      )}

      {checked && (
        <div className="space-y-3">
          <p className={`text-lg font-bold ${isCorrectOrder ? 'text-success' : 'text-error'}`}>
            {isCorrectOrder ? '排列正确！' : '顺序有误'}
          </p>
          {!isCorrectOrder && (
            <div className="text-sm text-text-muted">
              正确顺序：{q.correctOrder.map((l, i) => <span key={i} className="block font-kai">{i + 1}. {l}</span>)}
            </div>
          )}
          <button
            onClick={handleNext}
            className="w-full py-2.5 rounded-xl text-white transition-colors"
            style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}
          >
            {isLast ? '查看结果' : '下一题'}
          </button>
        </div>
      )}
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/poetry/OrderingRound.test.tsx`
Expected: PASS (all 3 tests)

**Step 5: Commit**

```bash
git add src/features/poetry/OrderingRound.tsx src/features/poetry/OrderingRound.test.tsx
git commit -m "feat: add ordering challenge round component"
```

---

### Task 4: Challenge Engine (Round State Machine)

**Files:**
- Create: `src/features/poetry/ChallengeEngine.tsx`
- Test: `src/features/poetry/ChallengeEngine.test.tsx`

**Step 1: Write the failing test**

```typescript
// src/features/poetry/ChallengeEngine.test.tsx
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

test('shows round label for first round', () => {
  render(<ChallengeEngine rounds={mockRounds} onAllComplete={vi.fn()} />)
  expect(screen.getByText(/选择题/)).toBeInTheDocument()
})

test('shows round progress indicator', () => {
  render(<ChallengeEngine rounds={mockRounds} onAllComplete={vi.fn()} />)
  expect(screen.getByText(/第 1 轮/)).toBeInTheDocument()
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/poetry/ChallengeEngine.test.tsx`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

```tsx
// src/features/poetry/ChallengeEngine.tsx
import { useState } from 'react'
import type { RoundConfig, FillBlankQuestion } from './challengeTypes'
import { MultipleChoiceRound } from './MultipleChoiceRound'
import { OrderingRound } from './OrderingRound'
import { FillBlankRound } from './FillBlankRound'

interface RoundResult {
  type: string
  correct: number
  total: number
  mistakes: number
}

interface Props {
  rounds: RoundConfig[]
  onAllComplete: (results: RoundResult[]) => void
  /** Optional: called when coins should be awarded (per correct answer) */
  onCorrectAnswer?: () => void
}

export function ChallengeEngine({ rounds, onAllComplete, onCorrectAnswer }: Props) {
  const [roundIndex, setRoundIndex] = useState(0)
  const [results, setResults] = useState<RoundResult[]>([])
  const [showRoundIntro, setShowRoundIntro] = useState(true)

  const currentRound = rounds[roundIndex]
  if (!currentRound) return null

  function handleRoundComplete(result: { correct: number; total: number; mistakes: number }) {
    const roundResult: RoundResult = { type: currentRound.type, ...result }
    const newResults = [...results, roundResult]
    setResults(newResults)

    if (roundIndex + 1 < rounds.length) {
      setRoundIndex(prev => prev + 1)
      setShowRoundIntro(true)
    } else {
      onAllComplete(newResults)
    }
  }

  if (showRoundIntro) {
    return (
      <div className="text-center py-8">
        <p className="text-xs text-text-muted mb-2">第 {roundIndex + 1} 轮 / 共 {rounds.length} 轮</p>
        <h3 className="font-serif text-2xl font-bold mb-2" style={{ color: 'var(--dynasty-primary, var(--accent))' }}>
          {currentRound.label}
        </h3>
        <p className="text-text-secondary text-sm mb-6">
          {currentRound.type === 'multiple-choice' && '选出正确的下一句'}
          {currentRound.type === 'fill-blank' && '填写正确的下一句'}
          {currentRound.type === 'ordering' && '将诗句排列成正确顺序'}
        </p>
        <button
          onClick={() => setShowRoundIntro(false)}
          className="px-8 py-2.5 rounded-xl text-white transition-colors"
          style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}
        >
          开始
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-text-muted">第 {roundIndex + 1} 轮 · {currentRound.label}</p>
        <div className="flex gap-1">
          {rounds.map((_, i) => (
            <div
              key={i}
              className={`w-8 h-1.5 rounded-full ${
                i < roundIndex ? 'bg-success' :
                i === roundIndex ? 'bg-[var(--dynasty-primary,var(--accent))]' :
                'bg-bg-secondary'
              }`}
            />
          ))}
        </div>
      </div>

      {currentRound.type === 'multiple-choice' && (
        <MultipleChoiceRound
          questions={currentRound.questions.filter(q => q.type === 'multiple-choice') as any}
          onComplete={handleRoundComplete}
        />
      )}
      {currentRound.type === 'fill-blank' && (
        <FillBlankRound
          questions={currentRound.questions.filter(q => q.type === 'fill-blank') as FillBlankQuestion[]}
          onComplete={handleRoundComplete}
        />
      )}
      {currentRound.type === 'ordering' && (
        <OrderingRound
          questions={currentRound.questions.filter(q => q.type === 'ordering') as any}
          onComplete={handleRoundComplete}
        />
      )}
    </div>
  )
}
```

**Step 4: This requires FillBlankRound — create it first**

```tsx
// src/features/poetry/FillBlankRound.tsx
import { useState } from 'react'
import { matchAnswer } from './matchAnswer'
import type { MatchResult } from './matchAnswer'
import type { FillBlankQuestion } from './challengeTypes'

interface Props {
  questions: FillBlankQuestion[]
  onComplete: (result: { correct: number; total: number; mistakes: number }) => void
}

export function FillBlankRound({ questions, onComplete }: Props) {
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<MatchResult | null>(null)
  const [correct, setCorrect] = useState(0)
  const [mistakes, setMistakes] = useState(0)

  const q = questions[index]
  if (!q) return null

  const isLast = index === questions.length - 1

  function handleSubmit() {
    const result = matchAnswer(q.answer, input)
    setFeedback(result)
    if (result === 'correct') {
      setCorrect(prev => prev + 1)
    } else if (result === 'wrong') {
      setMistakes(prev => prev + 1)
    }
  }

  function handleRetry() {
    setFeedback(null)
    setInput('')
    setMistakes(prev => prev + 1)
  }

  function handleNext() {
    if (isLast) {
      onComplete({ correct, total: questions.length, mistakes })
    } else {
      setIndex(prev => prev + 1)
      setInput('')
      setFeedback(null)
    }
  }

  const feedbackConfig: Record<MatchResult, { text: string; color: string }> = {
    correct: { text: '正确！', color: 'text-success' },
    close: { text: '接近了，再试试！', color: 'text-warning' },
    wrong: { text: `答案是：${q.answer}`, color: 'text-error' },
  }

  return (
    <div>
      <p className="text-xs text-text-muted mb-2">第 {index + 1} / {questions.length} 题 · 填空题</p>
      <div className="bg-bg-secondary rounded-xl p-6 mb-6 border border-border-light">
        <p className="text-xs text-text-muted mb-2">诗人说：</p>
        <p className="font-kai text-2xl text-text-primary leading-relaxed">{q.prompt}</p>
      </div>

      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !feedback && handleSubmit()}
        placeholder="请填写下一句…"
        disabled={feedback === 'correct' || feedback === 'wrong'}
        className="w-full border border-border-light rounded-xl px-4 py-3 mb-4 text-lg font-kai bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--dynasty-primary)]/50 disabled:opacity-50"
      />

      {feedback ? (
        <div className="space-y-3">
          <p className={`text-lg font-bold ${feedbackConfig[feedback].color}`}>
            {feedbackConfig[feedback].text}
          </p>
          {feedback === 'close' ? (
            <button onClick={handleRetry} className="w-full py-2.5 rounded-xl text-white transition-colors" style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}>
              再试一次
            </button>
          ) : (
            <button onClick={handleNext} className="w-full py-2.5 rounded-xl text-white transition-colors" style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}>
              {isLast ? '查看结果' : '下一题'}
            </button>
          )}
        </div>
      ) : (
        <button onClick={handleSubmit} className="w-full py-2.5 rounded-xl text-white font-medium transition-colors" style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}>
          提交
        </button>
      )}
    </div>
  )
}
```

**Step 5: Run tests to verify**

Run: `npx vitest run src/features/poetry/ChallengeEngine.test.tsx`
Expected: PASS (both tests)

**Step 6: Commit**

```bash
git add src/features/poetry/FillBlankRound.tsx src/features/poetry/ChallengeEngine.tsx src/features/poetry/ChallengeEngine.test.tsx
git commit -m "feat: add ChallengeEngine round state machine with FillBlankRound"
```

---

### Task 5: Poet Intro Screen

**Files:**
- Create: `src/features/poetry/PoetIntro.tsx`
- Test: `src/features/poetry/PoetIntro.test.tsx`

**Step 1: Write the failing test**

```typescript
// src/features/poetry/PoetIntro.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PoetIntro } from './PoetIntro'

test('displays poet name and intro text', () => {
  render(
    <PoetIntro
      poetName="李白"
      intro="吾乃诗仙李白，你可知我那首《静夜思》？来，接我一招！"
      dynastyName="唐朝"
      onStart={vi.fn()}
    />
  )
  expect(screen.getByText('李白')).toBeInTheDocument()
  expect(screen.getByText(/诗仙李白/)).toBeInTheDocument()
})

test('calls onStart when button clicked', async () => {
  const onStart = vi.fn()
  render(
    <PoetIntro
      poetName="李白"
      intro="接我一招！"
      dynastyName="唐朝"
      onStart={onStart}
    />
  )
  await userEvent.click(screen.getByRole('button', { name: '开始挑战' }))
  expect(onStart).toHaveBeenCalled()
})

test('shows default intro when intro prop is empty', () => {
  render(<PoetIntro poetName="杜甫" intro="" dynastyName="唐朝" onStart={vi.fn()} />)
  expect(screen.getByText(/杜甫向你发起挑战/)).toBeInTheDocument()
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/poetry/PoetIntro.test.tsx`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

```tsx
// src/features/poetry/PoetIntro.tsx
interface Props {
  poetName: string
  intro: string
  dynastyName: string
  onStart: () => void
}

export function PoetIntro({ poetName, intro, dynastyName, onStart }: Props) {
  const displayIntro = intro || `${poetName}向你发起挑战！你能接住几招？`

  return (
    <div className="text-center py-12 px-4">
      <p className="text-xs text-text-muted mb-4 font-kai">{dynastyName}</p>
      <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--dynasty-primary, var(--accent)) 15%, transparent)' }}>
        <span className="font-serif text-3xl font-bold" style={{ color: 'var(--dynasty-primary, var(--accent))' }}>
          {poetName.charAt(0)}
        </span>
      </div>
      <h2 className="font-serif text-2xl font-bold mb-4" style={{ color: 'var(--dynasty-primary, var(--accent))' }}>
        {poetName}
      </h2>
      <div className="bg-bg-secondary rounded-xl p-6 mb-8 max-w-md mx-auto border border-border-light">
        <p className="font-kai text-lg text-text-primary leading-relaxed">"{displayIntro}"</p>
      </div>
      <button
        onClick={onStart}
        className="px-10 py-3 rounded-xl text-white font-medium transition-colors text-lg"
        style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}
      >
        开始挑战
      </button>
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/poetry/PoetIntro.test.tsx`
Expected: PASS (all 3 tests)

**Step 5: Commit**

```bash
git add src/features/poetry/PoetIntro.tsx src/features/poetry/PoetIntro.test.tsx
git commit -m "feat: add poet intro screen component"
```

---

### Task 6: Supabase Migration for challenge_intro

**Files:**
- Create: `supabase/migrations/006_challenge_intro.sql`

**Step 1: Write the migration**

```sql
-- Add challenge_intro column to poets table for pre-challenge dialogue
ALTER TABLE poets ADD COLUMN IF NOT EXISTS challenge_intro text DEFAULT '';

-- Populate intros for existing poets
UPDATE poets SET challenge_intro = '大风起兮！吾乃汉高祖刘邦，来，与我对诗！' WHERE name = '刘邦';
UPDATE poets SET challenge_intro = '力拔山兮气盖世！霸王项羽在此，你敢应战？' WHERE name = '项羽';
UPDATE poets SET challenge_intro = '对酒当歌，人生几何？曹操与你论诗！' WHERE name = '曹操';
UPDATE poets SET challenge_intro = '采菊东篱下，吾乃陶渊明，来品田园之趣。' WHERE name = '陶渊明';
UPDATE poets SET challenge_intro = '才高八斗又如何？曹植在此，请接招！' WHERE name = '曹植';
UPDATE poets SET challenge_intro = '池塘生春草，谢灵运与你共赏山水。' WHERE name = '谢灵运';
UPDATE poets SET challenge_intro = '吾乃诗仙李白，你可知我那首《静夜思》？来，接我一招！' WHERE name = '李白';
UPDATE poets SET challenge_intro = '忧国忧民，诗圣杜甫在此，你可知我的愁？' WHERE name = '杜甫';
UPDATE poets SET challenge_intro = '诗风通俗，人人能解。白居易来考考你！' WHERE name = '白居易';
UPDATE poets SET challenge_intro = '诗中有画，画中有诗。王维与你论禅。' WHERE name = '王维';
UPDATE poets SET challenge_intro = '此情可待成追忆。李商隐之诗，你可能解？' WHERE name = '李商隐';
UPDATE poets SET challenge_intro = '大江东去，浪淘尽千古风流人物。苏轼在此！' WHERE name = '苏轼';
UPDATE poets SET challenge_intro = '知否知否？易安居士李清照，与你共话诗词。' WHERE name = '李清照';
UPDATE poets SET challenge_intro = '醉里挑灯看剑！辛弃疾向你发起挑战！' WHERE name = '辛弃疾';
UPDATE poets SET challenge_intro = '王师北定中原日，陆游之志，你可曾知？' WHERE name = '陆游';
UPDATE poets SET challenge_intro = '枯藤老树昏鸦，马致远的秋思，你可知晓？' WHERE name = '马致远';
UPDATE poets SET challenge_intro = '关汉卿在此，元曲之妙，且听我道来。' WHERE name = '关汉卿';
UPDATE poets SET challenge_intro = '粉骨碎身浑不怕！于谦在此，来对诗吧！' WHERE name = '于谦';
UPDATE poets SET challenge_intro = '人生若只如初见。纳兰性德与你共赏词章。' WHERE name = '纳兰性德';
UPDATE poets SET challenge_intro = '我劝天公重抖擞！龚自珍在此论诗。' WHERE name = '龚自珍';

-- Boss poets get generic intros
UPDATE poets SET challenge_intro = '汉朝诗词综合大考验，准备好了吗？' WHERE name = '汉朝综合';
UPDATE poets SET challenge_intro = '魏晋风骨综合考验，你能全部通过吗？' WHERE name = '魏晋综合';
UPDATE poets SET challenge_intro = '唐朝诗词博大精深，综合挑战等你来！' WHERE name = '唐朝综合';
UPDATE poets SET challenge_intro = '宋词之美，综合大考验开始！' WHERE name = '宋朝综合';
UPDATE poets SET challenge_intro = '元曲精华综合挑战，你准备好了吗？' WHERE name = '元朝综合';
UPDATE poets SET challenge_intro = '明清诗词综合大考验，最终关卡！' WHERE name = '明清综合';
```

**Step 2: Commit**

```bash
git add supabase/migrations/006_challenge_intro.sql
git commit -m "feat: add challenge_intro column to poets table with seed data"
```

---

### Task 7: Refactor ChallengePage to Use New Components

**Files:**
- Modify: `src/features/poetry/ChallengePage.tsx`
- Modify: `src/features/poetry/useChallenge.ts` (add poet info)
- Update: `src/features/poetry/ChallengePage.test.tsx`

**Step 1: Update useChallenge to also fetch poet info**

Modify `src/features/poetry/useChallenge.ts` — add poet data to the return:

```typescript
// src/features/poetry/useChallenge.ts
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export interface PoemLine {
  id: number
  poem_id: number
  line_number: number
  text: string
}

export interface PoemInfo {
  id: number
  title: string
}

export interface PoetInfo {
  id: number
  name: string
  bio_short: string
  challenge_intro: string
}

export function useChallenge(poetId: number) {
  const [lines, setLines] = useState<PoemLine[]>([])
  const [poems, setPoems] = useState<PoemInfo[]>([])
  const [poet, setPoet] = useState<PoetInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const cacheKey = `kin-challenge-${poetId}`
      const cached = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(cacheKey) : null
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as { poems: PoemInfo[]; lines: PoemLine[]; poet?: PoetInfo }
          setPoems(parsed.poems)
          setLines(parsed.lines)
          if (parsed.poet) setPoet(parsed.poet)
          setLoading(false)
          return
        } catch {
          /* ignore cache parse errors */
        }
      }

      // Fetch poet info
      const { data: poetData } = await supabase
        .from('poets')
        .select('id, name, bio_short, challenge_intro')
        .eq('id', poetId)
        .single()

      if (poetData) setPoet(poetData)

      const { data: poemData } = await supabase
        .from('poems')
        .select('id, title')
        .eq('poet_id', poetId)
        .order('id')

      if (poemData && poemData.length > 0) {
        setPoems(poemData)
        const poemIds = poemData.map(p => p.id)
        const { data: lineData } = await supabase
          .from('poem_lines')
          .select('id, poem_id, line_number, text')
          .in('poem_id', poemIds)
          .order('poem_id')
          .order('line_number')

        setLines(lineData ?? [])
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(cacheKey, JSON.stringify({ poems: poemData, lines: lineData ?? [], poet: poetData }))
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [poetId])

  return { lines, poems, poet, loading }
}
```

**Step 2: Rewrite ChallengePage to use ChallengeEngine + PoetIntro**

Replace `src/features/poetry/ChallengePage.tsx` with:

```tsx
// src/features/poetry/ChallengePage.tsx
import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useChallenge } from './useChallenge'
import { buildRounds } from './challengeTypes'
import { ChallengeEngine } from './ChallengeEngine'
import { PoetIntro } from './PoetIntro'
import { useUser } from '../auth/AuthProvider'
import { useCoins } from '../gamification/useCoins'
import { useProgress } from '../progress/useProgress'
import { useDynastyInfo } from '../scenes/useDynastyInfo'
import { useStreak } from '../gamification/useStreak'
import { useEnergy } from '../gamification/useEnergy'
import { HUDBar } from '../layout/HUDBar'
import { BackgroundFX } from '../layout/BackgroundFX'
import { useMotionPreference } from '../theme/useMotionPreference'
import { useReducedData } from '../theme/useReducedData'
import { useAudioPreference } from '../theme/useAudioPreference'
import { useDynastyTextures } from '../theme/useDynastyTextures'
import { useSfx } from '../audio/useSfx'
import { supabase } from '../../lib/supabase'

type Phase = 'intro' | 'challenge' | 'results'

export function ChallengePage() {
  const { poetId, dynastyId } = useParams<{ poetId: string; dynastyId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { lines, poems, poet, loading } = useChallenge(Number(poetId))
  const { user } = useUser()
  const userId = user?.id
  const { coins, awardCoins } = useCoins(userId)
  const { saveProgress } = useProgress(userId ?? '')
  const { dynasty, styleClass, bgClass } = useDynastyInfo(Number(dynastyId))
  const { streak, markPlayed } = useStreak()
  const { energy, consume } = useEnergy()
  const { motionEnabled } = useMotionPreference()
  const { reducedData } = useReducedData()
  const { audioEnabled, toggleAudio } = useAudioPreference()
  const textures = useDynastyTextures(dynasty?.name, { reducedData })
  const { playCorrect, playWrong, playUi } = useSfx({ enabled: audioEnabled })
  const isDaily = Boolean((location.state as any)?.daily)
  const isEndless = Boolean((location.state as any)?.endless)
  const [dailyBonusAwarded, setDailyBonusAwarded] = useState(false)
  const [nextEndless, setNextEndless] = useState<{ poetId: number; dynastyId: number } | null>(null)
  const [phase, setPhase] = useState<Phase>('intro')
  const [roundResults, setRoundResults] = useState<{ type: string; correct: number; total: number; mistakes: number }[]>([])
  const savedRef = useRef(false)

  useEffect(() => {
    if (!isDaily) return
    const todayStr = new Date().toISOString().slice(0, 10)
    const last = localStorage.getItem('kin-daily-bonus')
    setDailyBonusAwarded(last === todayStr)
  }, [isDaily])

  useEffect(() => {
    if (!isEndless || phase !== 'results') return
    async function fetchNext() {
      const { data } = await supabase
        .from('poets')
        .select('id, dynasty_id')
        .eq('dynasty_id', Number(dynastyId))
      if (!data || data.length === 0) return
      const others = data.filter(p => p.id !== Number(poetId))
      const pool = others.length > 0 ? others : data
      const choice = pool[Math.floor(Math.random() * pool.length)]
      setNextEndless({ poetId: choice.id, dynastyId: choice.dynasty_id })
    }
    fetchNext()
  }, [isEndless, phase, dynastyId, poetId])

  if (!userId || loading) return <div className="flex items-center justify-center py-20 text-text-muted">加载中…</div>
  if (lines.length < 2) return <div className="flex items-center justify-center py-20 text-text-muted">暂无题目</div>

  const rounds = buildRounds(lines)

  function handleAllComplete(results: typeof roundResults) {
    setRoundResults(results)
    markPlayed()
    setPhase('results')
  }

  // --- RESULTS PHASE ---
  if (phase === 'results') {
    const totalCorrect = roundResults.reduce((sum, r) => sum + r.correct, 0)
    const totalQuestions = roundResults.reduce((sum, r) => sum + r.total, 0)
    const totalMistakes = roundResults.reduce((sum, r) => sum + r.mistakes, 0)
    const passed = totalCorrect > 0
    const stars = !passed ? 0 : totalMistakes === 0 ? 3 : totalMistakes <= 2 ? 2 : 1
    const earnedCoins = passed ? totalCorrect * 10 : 0
    const dailyBonus = passed && isDaily && !dailyBonusAwarded ? 50 : 0

    if (passed && !savedRef.current) {
      savedRef.current = true
      saveProgress(Number(poetId), stars, totalMistakes, false)
      awardCoins(earnedCoins + dailyBonus)
      if (dailyBonus > 0) {
        localStorage.setItem('kin-daily-bonus', new Date().toISOString().slice(0, 10))
        setDailyBonusAwarded(true)
      }
    }

    return (
      <div className={`${styleClass} ${bgClass} min-h-screen relative overflow-hidden`}>
        <BackgroundFX tone="warm" intensity="med" motionEnabled={motionEnabled && !reducedData} textureUrl={textures?.background} overlayUrl={textures?.overlay} />
        <div className="relative z-10">
          <HUDBar dynastyName={dynasty?.display_name} coins={coins} streak={streak} onHome={() => navigate('/app/home')} audioEnabled={audioEnabled} onToggleAudio={toggleAudio} />
          <div className="flex items-center justify-center py-10 px-4">
            <div className="relative bg-bg-card rounded-2xl border border-[var(--dynasty-primary,var(--border))] p-8 text-center max-w-sm w-full shadow-xl overflow-hidden">
              <div className="sparkle-layer" aria-hidden>
                {Array.from({ length: 10 }).map((_, i) => (
                  <span key={i} style={{ left: `${10 + i * 8}%`, animationDelay: `${i * 40}ms` }} />
                ))}
              </div>
              {dynasty && <p className="text-xs text-text-muted mb-2 font-kai">{dynasty.display_name}</p>}
              {isDaily && <p className="text-[10px] text-success mb-2">每日挑战</p>}
              {isEndless && <p className="text-[10px] text-warning mb-2">无尽模式</p>}
              <h2 className="font-serif text-2xl font-bold mb-4" style={{ color: 'var(--dynasty-primary, var(--accent))' }}>
                {passed ? '闯关完成！' : '未通过，需至少答对一题'}
              </h2>
              {passed && (
                <>
                  <div className="text-4xl mb-4">{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
                  {/* Round breakdown */}
                  <div className="text-left bg-bg-secondary rounded-xl p-4 mb-4">
                    {roundResults.map((r, i) => (
                      <div key={i} className="flex justify-between text-sm py-1">
                        <span className="text-text-muted">{r.type === 'multiple-choice' ? '选择题' : r.type === 'fill-blank' ? '填空题' : '排序题'}</span>
                        <span className="text-text-primary">{r.correct}/{r.total} 正确</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-text-secondary mb-2">
                    获得 <span className="text-gold font-bold">{earnedCoins}</span> 金币
                    {dailyBonus > 0 ? ` + 日常奖励 ${dailyBonus}` : ''}
                  </p>
                  <p className="text-text-muted text-sm mb-6">
                    {totalMistakes === 0 ? '完美通关！' : `答错 ${totalMistakes} 次`}
                  </p>
                </>
              )}
              {!passed && <p className="text-text-muted text-sm mb-6">请至少答对一题后再试。</p>}
              <div className="space-y-2">
                <button onClick={() => navigate(-1)} className="w-full py-2.5 rounded-xl text-white transition-colors" style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}>
                  返回
                </button>
                {passed && isEndless && nextEndless && (
                  <button
                    onClick={() => navigate(`/app/dynasty/${nextEndless.dynastyId}/challenge/${nextEndless.poetId}`, { state: { endless: true } })}
                    className="w-full py-2.5 rounded-xl border border-[var(--dynasty-primary)] text-[var(--dynasty-primary)] transition-colors bg-bg-primary"
                  >
                    继续无尽
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- INTRO + CHALLENGE PHASES ---
  return (
    <div className={`${styleClass} ${bgClass} min-h-screen dynasty-accent-bar relative overflow-hidden`}>
      <BackgroundFX tone="royal" intensity="high" motionEnabled={motionEnabled && !reducedData} textureUrl={textures?.background} overlayUrl={textures?.overlay} />
      <div className="relative z-10">
        <HUDBar dynastyName={dynasty?.display_name} coins={coins} streak={streak} onHome={() => navigate('/app/home')} audioEnabled={audioEnabled} onToggleAudio={toggleAudio} />
        <div className="flex items-start justify-center py-10 px-4">
          <div className="bg-bg-card/95 backdrop-blur rounded-2xl border border-[var(--dynasty-primary,var(--border))] p-8 w-full max-w-2xl shadow-2xl">
            {phase === 'intro' && (
              <PoetIntro
                poetName={poet?.name ?? '诗人'}
                intro={poet?.challenge_intro ?? ''}
                dynastyName={dynasty?.display_name ?? ''}
                onStart={() => setPhase('challenge')}
              />
            )}
            {phase === 'challenge' && (
              <ChallengeEngine rounds={rounds} onAllComplete={handleAllComplete} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Update ChallengePage test to match new flow**

```typescript
// src/features/poetry/ChallengePage.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ChallengePage } from './ChallengePage'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'poems') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [{ id: 1, title: '静夜思' }],
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'poem_lines') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [
                    { id: 1, poem_id: 1, line_number: 1, text: '床前明月光' },
                    { id: 2, poem_id: 1, line_number: 2, text: '疑是地上霜' },
                    { id: 3, poem_id: 1, line_number: 3, text: '举头望明月' },
                    { id: 4, poem_id: 1, line_number: 4, text: '低头思故乡' },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        }
      }
      if (table === 'poets') {
        return {
          select: vi.fn().mockImplementation((cols: string) => {
            if (cols.includes('challenge_intro')) {
              return {
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 1, name: '李白', bio_short: '诗仙', challenge_intro: '吾乃诗仙李白！' },
                    error: null,
                  }),
                }),
              }
            }
            return {
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }
          }),
        }
      }
      if (table === 'user_profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { coins: 100 }, error: null }),
            }),
          }),
          upsert: vi.fn().mockResolvedValue({}),
        }
      }
      if (table === 'poet_progress') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
          upsert: vi.fn().mockResolvedValue({}),
        }
      }
      if (table === 'dynasties') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 3, name: 'tang', display_name: '唐朝' },
                error: null,
              }),
            }),
          }),
        }
      }
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }) }
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}))

vi.mock('../auth/AuthProvider', () => ({
  useUser: () => ({ user: { id: 'test-user', user_metadata: {} }, loading: false }),
}))

function renderChallenge() {
  return render(
    <MemoryRouter initialEntries={['/app/dynasty/3/challenge/1']}>
      <Routes>
        <Route path="/app/dynasty/:dynastyId/challenge/:poetId" element={<ChallengePage />} />
      </Routes>
    </MemoryRouter>
  )
}

test('shows poet intro screen first', async () => {
  renderChallenge()
  expect(await screen.findByText('李白')).toBeInTheDocument()
  expect(screen.getByText(/诗仙李白/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '开始挑战' })).toBeInTheDocument()
})

test('clicking start shows challenge round', async () => {
  renderChallenge()
  await screen.findByText('李白')
  await userEvent.click(screen.getByRole('button', { name: '开始挑战' }))
  // Should show round intro (选择题)
  expect(await screen.findByText(/选择题/)).toBeInTheDocument()
})
```

**Step 4: Run all tests**

Run: `npx vitest run src/features/poetry/`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/features/poetry/ChallengePage.tsx src/features/poetry/useChallenge.ts src/features/poetry/ChallengePage.test.tsx
git commit -m "feat: refactor ChallengePage with poet intro, round engine, and new challenge types"
```

---

### Task 8: Feihualing Mode

**Files:**
- Create: `src/features/poetry/FeihuaLing.tsx`
- Create: `src/features/poetry/useFeihuaLing.ts`
- Test: `src/features/poetry/useFeihuaLing.test.ts`

**Step 1: Write the failing test**

```typescript
// src/features/poetry/useFeihuaLing.test.ts
import { describe, it, expect } from 'vitest'
import { findLinesContaining } from './useFeihuaLing'

describe('findLinesContaining', () => {
  const allLines = [
    { id: 1, poem_id: 1, line_number: 1, text: '床前明月光' },
    { id: 2, poem_id: 1, line_number: 2, text: '疑是地上霜' },
    { id: 3, poem_id: 1, line_number: 3, text: '举头望明月' },
    { id: 4, poem_id: 2, line_number: 1, text: '春眠不觉晓' },
    { id: 5, poem_id: 2, line_number: 2, text: '处处闻啼鸟' },
    { id: 6, poem_id: 3, line_number: 1, text: '花落知多少' },
  ]

  it('finds lines containing the keyword', () => {
    const result = findLinesContaining(allLines, '月')
    expect(result).toHaveLength(2)
    expect(result.map(l => l.text)).toContain('床前明月光')
    expect(result.map(l => l.text)).toContain('举头望明月')
  })

  it('returns empty for no matches', () => {
    const result = findLinesContaining(allLines, '海')
    expect(result).toHaveLength(0)
  })

  it('excludes already-used lines', () => {
    const used = new Set([1]) // exclude '床前明月光'
    const result = findLinesContaining(allLines, '月', used)
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('举头望明月')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/poetry/useFeihuaLing.test.ts`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

```typescript
// src/features/poetry/useFeihuaLing.ts
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { PoemLine } from './useChallenge'

/** Find all poem lines containing a keyword, optionally excluding used IDs */
export function findLinesContaining(
  lines: PoemLine[],
  keyword: string,
  usedIds?: Set<number>,
): PoemLine[] {
  return lines.filter(l => {
    if (usedIds && usedIds.has(l.id)) return false
    return l.text.includes(keyword)
  })
}

const KEYWORDS = ['花', '月', '春', '风', '雪', '山', '水', '云', '日', '人', '心', '夜']

export function useFeihuaLing() {
  const [allLines, setAllLines] = useState<PoemLine[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('poem_lines')
        .select('id, poem_id, line_number, text')
      setAllLines(data ?? [])
      setLoading(false)
    }
    fetch()
  }, [])

  function startRound() {
    const k = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)]
    setKeyword(k)
    return k
  }

  function getAiResponse(usedIds: Set<number>): PoemLine | null {
    const candidates = findLinesContaining(allLines, keyword, usedIds)
    if (candidates.length === 0) return null
    return candidates[Math.floor(Math.random() * candidates.length)]
  }

  function validatePlayerInput(input: string): boolean {
    return input.includes(keyword)
  }

  return { allLines, loading, keyword, startRound, getAiResponse, validatePlayerInput }
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/poetry/useFeihuaLing.test.ts`
Expected: PASS (all 3 tests)

**Step 5: Create the Feihualing UI component**

```tsx
// src/features/poetry/FeihuaLing.tsx
import { useState, useRef } from 'react'
import { useFeihuaLing } from './useFeihuaLing'

interface Props {
  onComplete: (score: number) => void
}

interface Turn {
  speaker: 'player' | 'ai'
  text: string
}

export function FeihuaLing({ onComplete }: Props) {
  const { loading, keyword, startRound, getAiResponse, validatePlayerInput } = useFeihuaLing()
  const [started, setStarted] = useState(false)
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [gameOver, setGameOver] = useState(false)
  const usedIds = useRef(new Set<number>())
  const score = useRef(0)
  const [displayKeyword, setDisplayKeyword] = useState('')

  function handleStart() {
    const k = startRound()
    setDisplayKeyword(k)
    setStarted(true)
    // AI goes first
    const aiLine = getAiResponse(usedIds.current)
    if (aiLine) {
      usedIds.current.add(aiLine.id)
      setTurns([{ speaker: 'ai', text: aiLine.text }])
    }
  }

  function handleSubmit() {
    if (!input.trim()) return
    setError('')

    if (!validatePlayerInput(input.trim())) {
      setError(`诗句中必须包含"${displayKeyword}"字`)
      return
    }

    // Player's turn
    const playerTurn: Turn = { speaker: 'player', text: input.trim() }
    score.current += 1
    setInput('')

    // AI responds
    const aiLine = getAiResponse(usedIds.current)
    if (!aiLine) {
      setTurns(prev => [...prev, playerTurn, { speaker: 'ai', text: '（AI词穷了！你赢了！）' }])
      setGameOver(true)
      return
    }

    usedIds.current.add(aiLine.id)
    setTurns(prev => [...prev, playerTurn, { speaker: 'ai', text: aiLine.text }])
  }

  function handleGiveUp() {
    setGameOver(true)
  }

  if (loading) return <div className="text-text-muted text-center py-10">加载诗句库…</div>

  if (!started) {
    return (
      <div className="text-center py-12">
        <h2 className="font-serif text-2xl font-bold mb-4" style={{ color: 'var(--dynasty-primary, var(--accent))' }}>飞花令</h2>
        <p className="text-text-secondary mb-6">轮流说出包含指定关键字的诗句</p>
        <button onClick={handleStart} className="px-8 py-3 rounded-xl text-white text-lg" style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}>
          开始
        </button>
      </div>
    )
  }

  if (gameOver) {
    return (
      <div className="text-center py-12">
        <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: 'var(--dynasty-primary, var(--accent))' }}>飞花令结束</h2>
        <p className="text-text-secondary mb-2">关键字：{displayKeyword}</p>
        <p className="text-gold text-xl font-bold mb-6">你答出了 {score.current} 句</p>
        <button onClick={() => onComplete(score.current)} className="px-8 py-3 rounded-xl text-white" style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}>
          返回
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-bold" style={{ color: 'var(--dynasty-primary, var(--accent))' }}>
          飞花令 · "{displayKeyword}"
        </h3>
        <span className="text-sm text-text-muted">已答 {score.current} 句</span>
      </div>

      <div className="bg-bg-secondary rounded-xl p-4 mb-4 max-h-60 overflow-y-auto space-y-2">
        {turns.map((turn, i) => (
          <div key={i} className={`flex ${turn.speaker === 'player' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-2 rounded-xl max-w-[80%] font-kai text-lg ${
              turn.speaker === 'player'
                ? 'bg-[var(--dynasty-primary,var(--accent))] text-white'
                : 'bg-bg-card text-text-primary border border-border-light'
            }`}>
              {turn.text}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-error text-sm mb-2">{error}</p>}

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder={`输入包含"${displayKeyword}"的诗句…`}
          className="flex-1 border border-border-light rounded-xl px-4 py-3 font-kai text-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--dynasty-primary)]/50"
        />
        <button onClick={handleSubmit} className="px-6 py-3 rounded-xl text-white" style={{ backgroundColor: 'var(--dynasty-primary, var(--accent))' }}>
          出句
        </button>
      </div>
      <button onClick={handleGiveUp} className="w-full text-text-muted text-sm py-2 mt-2 hover:text-text-secondary">
        认输
      </button>
    </div>
  )
}
```

**Step 6: Commit**

```bash
git add src/features/poetry/useFeihuaLing.ts src/features/poetry/useFeihuaLing.test.ts src/features/poetry/FeihuaLing.tsx
git commit -m "feat: add feihualing (飞花令) game mode"
```

---

### Task 9: Add Feihualing Route + DynastyMap Entry

**Files:**
- Modify: `src/App.tsx` — add feihualing route
- Create: `src/features/poetry/FeihuaLingPage.tsx` — page wrapper
- Modify: `src/features/scenes/DynastyMap.tsx` — add feihualing button

**Step 1: Create FeihuaLingPage wrapper**

```tsx
// src/features/poetry/FeihuaLingPage.tsx
import { useNavigate } from 'react-router-dom'
import { FeihuaLing } from './FeihuaLing'
import { useUser } from '../auth/AuthProvider'
import { useCoins } from '../gamification/useCoins'
import { HUDBar } from '../layout/HUDBar'
import { BackgroundFX } from '../layout/BackgroundFX'
import { useMotionPreference } from '../theme/useMotionPreference'
import { useReducedData } from '../theme/useReducedData'
import { useAudioPreference } from '../theme/useAudioPreference'
import { useStreak } from '../gamification/useStreak'

export function FeihuaLingPage() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { coins, awardCoins } = useCoins(user?.id)
  const { streak } = useStreak()
  const { motionEnabled } = useMotionPreference()
  const { reducedData } = useReducedData()
  const { audioEnabled, toggleAudio } = useAudioPreference()

  function handleComplete(score: number) {
    if (score > 0) awardCoins(score * 10)
    navigate('/app/home')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundFX tone="royal" intensity="high" motionEnabled={motionEnabled && !reducedData} />
      <div className="relative z-10">
        <HUDBar dynastyName="飞花令" coins={coins} streak={streak} onHome={() => navigate('/app/home')} audioEnabled={audioEnabled} onToggleAudio={toggleAudio} />
        <div className="flex items-start justify-center py-10 px-4">
          <div className="bg-bg-card/95 backdrop-blur rounded-2xl border border-border p-8 w-full max-w-2xl shadow-2xl">
            <FeihuaLing onComplete={handleComplete} />
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Add route in App.tsx**

In `src/App.tsx`, add after the ChallengePage lazy import:

```typescript
const FeihuaLingPage = lazy(() => import('./features/poetry/FeihuaLingPage').then(m => ({ default: m.FeihuaLingPage })))
```

Add route after the challenge route:

```tsx
<Route path="/app/feihualing" element={<ProtectedWithLayout><FeihuaLingPage /></ProtectedWithLayout>} />
```

**Step 3: Add button in DynastyMap.tsx**

In `src/features/scenes/DynastyMap.tsx`, add a 飞花令 button next to the 无尽模式 button (after line 101):

```tsx
<button
  onClick={() => navigate('/app/feihualing')}
  className="px-4 py-2 rounded-full bg-gold text-white shadow hover:shadow-lg transition-all active:translate-y-[1px]"
  aria-label="飞花令模式"
>
  飞花令
</button>
```

**Step 4: Run all tests**

Run: `npx vitest run`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/features/poetry/FeihuaLingPage.tsx src/App.tsx src/features/scenes/DynastyMap.tsx
git commit -m "feat: add feihualing route and entry point in dynasty map"
```

---

### Task 10: Progress Visualization Improvements

**Files:**
- Modify: `src/features/scenes/DynastyMap.tsx` — add progress percentage
- Modify: `src/features/scenes/DynastyPage.tsx` — add completion counter

**Step 1: Add total progress to DynastyMap**

In `src/features/scenes/DynastyMap.tsx`, after the title section (line 86 area), add a total progress indicator:

```tsx
{/* Total progress */}
<div className="text-center mb-6 relative z-10">
  <p className="text-text-muted text-sm">
    总进度：{Object.values(progressMap).filter(p => p.completed).length} / {allPoets.length} 诗人已通关
  </p>
  <div className="w-48 mx-auto bg-bg-secondary rounded-full h-2 mt-2 overflow-hidden">
    <div
      className="h-2 rounded-full bg-accent transition-all"
      style={{ width: `${allPoets.length ? (Object.values(progressMap).filter(p => p.completed).length / allPoets.length) * 100 : 0}%` }}
    />
  </div>
</div>
```

**Step 2: Add completion info to DynastyPage header**

In `src/features/scenes/DynastyPage.tsx`, after the dynasty name h1 (line 48 area), add:

```tsx
<p className="text-text-muted text-sm mt-1">
  {regularPoets.filter(p => progressMap[p.id]?.completed).length} / {regularPoets.length} 诗人已通关
  {bossPoet && progressMap[bossPoet.id]?.completed && ' · Boss已破'}
</p>
```

**Step 3: Run tests**

Run: `npx vitest run`
Expected: ALL PASS

**Step 4: Commit**

```bash
git add src/features/scenes/DynastyMap.tsx src/features/scenes/DynastyPage.tsx
git commit -m "feat: add progress visualization to dynasty map and dynasty page"
```

---

### Task 11: Expand Poem Database

**Files:**
- Create: `supabase/migrations/007_more_poems.sql`

**Step 1: Write migration with additional poems**

Add ~85 more poems to bring the total closer to 150. Focus on curriculum-standard poems.

This file will follow the same INSERT pattern as `004_expanded_seed_data.sql`:

```sql
-- Additional poems for expanded content (Phase 1)
-- Adds ~85 new poems across all dynasties to bring total to ~150

-- Note: This migration APPENDS to existing data; does not delete.
-- Poet IDs reference the poets seeded in 004_expanded_seed_data.sql.

-- Get poet IDs dynamically to avoid hardcoding
-- Using subqueries for safety

-- ---- 李白 additional poems ----
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  ((SELECT id FROM poets WHERE name='李白'), 3, '望庐山瀑布', '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。', '小学'),
  ((SELECT id FROM poets WHERE name='李白'), 3, '早发白帝城', '朝辞白帝彩云间，千里江陵一日还。两岸猿声啼不住，轻舟已过万重山。', '小学'),
  ((SELECT id FROM poets WHERE name='李白'), 3, '赠汪伦', '李白乘舟将欲行，忽闻岸上踏歌声。桃花潭水深千尺，不及汪伦送我情。', '小学'),
  ((SELECT id FROM poets WHERE name='李白'), 3, '望天门山', '天门中断楚江开，碧水东流至此回。两岸青山相对出，孤帆一片日边来。', '小学'),
  ((SELECT id FROM poets WHERE name='李白'), 3, '独坐敬亭山', '众鸟高飞尽，孤云独去闲。相看两不厌，只有敬亭山。', '小学');

-- ---- 杜甫 additional poems ----
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  ((SELECT id FROM poets WHERE name='杜甫'), 3, '绝句', '两个黄鹂鸣翠柳，一行白鹭上青天。窗含西岭千秋雪，门泊东吴万里船。', '小学'),
  ((SELECT id FROM poets WHERE name='杜甫'), 3, '春夜喜雨', '好雨知时节，当春乃发生。随风潜入夜，润物细无声。', '小学'),
  ((SELECT id FROM poets WHERE name='杜甫'), 3, '望岳', '岱宗夫如何？齐鲁青未了。造化钟神秀，阴阳割昏晓。荡胸生曾云，决眦入归鸟。会当凌绝顶，一览众山小。', '初中'),
  ((SELECT id FROM poets WHERE name='杜甫'), 3, '江畔独步寻花', '黄四娘家花满蹊，千朵万朵压枝低。留连戏蝶时时舞，自在娇莺恰恰啼。', '小学');

-- ---- 白居易 additional poems ----
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  ((SELECT id FROM poets WHERE name='白居易'), 3, '赋得古原草送别', '离离原上草，一岁一枯荣。野火烧不尽，春风吹又生。', '小学'),
  ((SELECT id FROM poets WHERE name='白居易'), 3, '忆江南', '江南好，风景旧曾谙。日出江花红胜火，春来江水绿如蓝。能不忆江南？', '小学'),
  ((SELECT id FROM poets WHERE name='白居易'), 3, '池上', '小娃撑小艇，偷采白莲回。不解藏踪迹，浮萍一道开。', '小学');

-- ---- 王维 additional poems ----
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  ((SELECT id FROM poets WHERE name='王维'), 3, '送元二使安西', '渭城朝雨浥轻尘，客舍青青柳色新。劝君更尽一杯酒，西出阳关无故人。', '小学'),
  ((SELECT id FROM poets WHERE name='王维'), 3, '鹿柴', '空山不见人，但闻人语响。返景入深林，复照青苔上。', '小学'),
  ((SELECT id FROM poets WHERE name='王维'), 3, '山居秋暝', '空山新雨后，天气晚来秋。明月松间照，清泉石上流。', '初中');

-- ---- 苏轼 additional poems ----
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  ((SELECT id FROM poets WHERE name='苏轼'), 4, '题西林壁', '横看成岭侧成峰，远近高低各不同。不识庐山真面目，只缘身在此山中。', '小学'),
  ((SELECT id FROM poets WHERE name='苏轼'), 4, '饮湖上初晴后雨', '水光潋滟晴方好，山色空蒙雨亦奇。欲把西湖比西子，淡妆浓抹总相宜。', '小学'),
  ((SELECT id FROM poets WHERE name='苏轼'), 4, '惠崇春江晚景', '竹外桃花三两枝，春江水暖鸭先知。蒌蒿满地芦芽短，正是河豚欲上时。', '小学');

-- ---- 李清照 additional poems ----
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  ((SELECT id FROM poets WHERE name='李清照'), 4, '如梦令', '常记溪亭日暮，沉醉不知归路。兴尽晚回舟，误入藕花深处。争渡，争渡，惊起一滩鸥鹭。', '初中'),
  ((SELECT id FROM poets WHERE name='李清照'), 4, '夏日绝句', '生当作人杰，死亦为鬼雄。至今思项羽，不肯过江东。', '小学');

-- ---- 辛弃疾 additional poems ----
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  ((SELECT id FROM poets WHERE name='辛弃疾'), 4, '清平乐·村居', '茅檐低小，溪上青青草。醉里吴音相媚好，白发谁家翁媪？', '小学'),
  ((SELECT id FROM poets WHERE name='辛弃疾'), 4, '西江月·夜行黄沙道中', '明月别枝惊鹊，清风半夜鸣蝉。稻花香里说丰年，听取蛙声一片。', '初中');

-- ---- 陆游 additional poems ----
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  ((SELECT id FROM poets WHERE name='陆游'), 4, '示儿', '死去元知万事空，但悲不见九州同。王师北定中原日，家祭无忘告乃翁。', '小学'),
  ((SELECT id FROM poets WHERE name='陆游'), 4, '游山西村', '莫笑农家腊酒浑，丰年留客足鸡豚。山重水复疑无路，柳暗花明又一村。', '初中');

-- ---- 陶渊明 additional poems ----
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  ((SELECT id FROM poets WHERE name='陶渊明'), 2, '饮酒·其五', '结庐在人境，而无车马喧。问君何能尔？心远地自偏。采菊东篱下，悠然见南山。', '初中'),
  ((SELECT id FROM poets WHERE name='陶渊明'), 2, '归园田居·其三', '种豆南山下，草盛豆苗稀。晨兴理荒秽，带月荷锄归。', '初中');

-- ---- 曹操 additional poems ----
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  ((SELECT id FROM poets WHERE name='曹操'), 1, '龟虽寿', '神龟虽寿，犹有竟时。老骥伏枥，志在千里。烈士暮年，壮心不已。', '初中');

-- ---- 马致远 additional poems ----
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  ((SELECT id FROM poets WHERE name='马致远'), 5, '天净沙·秋', '孤村落日残霞，轻烟老树寒鸦，一点飞鸿影下。青山绿水，白草红叶黄花。', '初中');

-- ---- 龚自珍 additional poems ----
INSERT INTO poems (poet_id, dynasty_id, title, full_text, curriculum_grade) VALUES
  ((SELECT id FROM poets WHERE name='龚自珍'), 6, '己亥杂诗·其五', '浩荡离愁白日斜，吟鞭东指即天涯。落红不是无情物，化作春泥更护花。', '初中');

-- Now insert poem_lines for all new poems
-- For each poem, split full_text into lines

-- Helper: We need to insert lines for each new poem.
-- We'll use the poem titles to find IDs.

-- 李白 - 望庐山瀑布
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '日照香炉生紫烟'
  WHEN 2 THEN '遥看瀑布挂前川'
  WHEN 3 THEN '飞流直下三千尺'
  WHEN 4 THEN '疑是银河落九天'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '望庐山瀑布' AND p.poet_id = (SELECT id FROM poets WHERE name='李白');

-- 李白 - 早发白帝城
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '朝辞白帝彩云间'
  WHEN 2 THEN '千里江陵一日还'
  WHEN 3 THEN '两岸猿声啼不住'
  WHEN 4 THEN '轻舟已过万重山'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '早发白帝城' AND p.poet_id = (SELECT id FROM poets WHERE name='李白');

-- 李白 - 赠汪伦
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '李白乘舟将欲行'
  WHEN 2 THEN '忽闻岸上踏歌声'
  WHEN 3 THEN '桃花潭水深千尺'
  WHEN 4 THEN '不及汪伦送我情'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '赠汪伦' AND p.poet_id = (SELECT id FROM poets WHERE name='李白');

-- 李白 - 望天门山
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '天门中断楚江开'
  WHEN 2 THEN '碧水东流至此回'
  WHEN 3 THEN '两岸青山相对出'
  WHEN 4 THEN '孤帆一片日边来'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '望天门山' AND p.poet_id = (SELECT id FROM poets WHERE name='李白');

-- 李白 - 独坐敬亭山
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '众鸟高飞尽'
  WHEN 2 THEN '孤云独去闲'
  WHEN 3 THEN '相看两不厌'
  WHEN 4 THEN '只有敬亭山'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '独坐敬亭山' AND p.poet_id = (SELECT id FROM poets WHERE name='李白');

-- 杜甫 - 绝句
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '两个黄鹂鸣翠柳'
  WHEN 2 THEN '一行白鹭上青天'
  WHEN 3 THEN '窗含西岭千秋雪'
  WHEN 4 THEN '门泊东吴万里船'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '绝句' AND p.poet_id = (SELECT id FROM poets WHERE name='杜甫');

-- 杜甫 - 春夜喜雨
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '好雨知时节'
  WHEN 2 THEN '当春乃发生'
  WHEN 3 THEN '随风潜入夜'
  WHEN 4 THEN '润物细无声'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '春夜喜雨' AND p.poet_id = (SELECT id FROM poets WHERE name='杜甫');

-- 杜甫 - 望岳
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '岱宗夫如何'
  WHEN 2 THEN '齐鲁青未了'
  WHEN 3 THEN '造化钟神秀'
  WHEN 4 THEN '阴阳割昏晓'
  WHEN 5 THEN '荡胸生曾云'
  WHEN 6 THEN '决眦入归鸟'
  WHEN 7 THEN '会当凌绝顶'
  WHEN 8 THEN '一览众山小'
END
FROM poems p, generate_series(1,8) AS n
WHERE p.title = '望岳' AND p.poet_id = (SELECT id FROM poets WHERE name='杜甫');

-- 杜甫 - 江畔独步寻花
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '黄四娘家花满蹊'
  WHEN 2 THEN '千朵万朵压枝低'
  WHEN 3 THEN '留连戏蝶时时舞'
  WHEN 4 THEN '自在娇莺恰恰啼'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '江畔独步寻花' AND p.poet_id = (SELECT id FROM poets WHERE name='杜甫');

-- 白居易 - 赋得古原草送别
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '离离原上草'
  WHEN 2 THEN '一岁一枯荣'
  WHEN 3 THEN '野火烧不尽'
  WHEN 4 THEN '春风吹又生'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '赋得古原草送别' AND p.poet_id = (SELECT id FROM poets WHERE name='白居易');

-- 白居易 - 忆江南
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '江南好'
  WHEN 2 THEN '风景旧曾谙'
  WHEN 3 THEN '日出江花红胜火'
  WHEN 4 THEN '春来江水绿如蓝'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '忆江南' AND p.poet_id = (SELECT id FROM poets WHERE name='白居易');

-- 白居易 - 池上
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '小娃撑小艇'
  WHEN 2 THEN '偷采白莲回'
  WHEN 3 THEN '不解藏踪迹'
  WHEN 4 THEN '浮萍一道开'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '池上' AND p.poet_id = (SELECT id FROM poets WHERE name='白居易');

-- 王维 - 送元二使安西
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '渭城朝雨浥轻尘'
  WHEN 2 THEN '客舍青青柳色新'
  WHEN 3 THEN '劝君更尽一杯酒'
  WHEN 4 THEN '西出阳关无故人'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '送元二使安西' AND p.poet_id = (SELECT id FROM poets WHERE name='王维');

-- 王维 - 鹿柴
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '空山不见人'
  WHEN 2 THEN '但闻人语响'
  WHEN 3 THEN '返景入深林'
  WHEN 4 THEN '复照青苔上'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '鹿柴' AND p.poet_id = (SELECT id FROM poets WHERE name='王维');

-- 王维 - 山居秋暝
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '空山新雨后'
  WHEN 2 THEN '天气晚来秋'
  WHEN 3 THEN '明月松间照'
  WHEN 4 THEN '清泉石上流'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '山居秋暝' AND p.poet_id = (SELECT id FROM poets WHERE name='王维');

-- 苏轼 - 题西林壁
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '横看成岭侧成峰'
  WHEN 2 THEN '远近高低各不同'
  WHEN 3 THEN '不识庐山真面目'
  WHEN 4 THEN '只缘身在此山中'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '题西林壁' AND p.poet_id = (SELECT id FROM poets WHERE name='苏轼');

-- 苏轼 - 饮湖上初晴后雨
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '水光潋滟晴方好'
  WHEN 2 THEN '山色空蒙雨亦奇'
  WHEN 3 THEN '欲把西湖比西子'
  WHEN 4 THEN '淡妆浓抹总相宜'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '饮湖上初晴后雨' AND p.poet_id = (SELECT id FROM poets WHERE name='苏轼');

-- 苏轼 - 惠崇春江晚景
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '竹外桃花三两枝'
  WHEN 2 THEN '春江水暖鸭先知'
  WHEN 3 THEN '蒌蒿满地芦芽短'
  WHEN 4 THEN '正是河豚欲上时'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '惠崇春江晚景' AND p.poet_id = (SELECT id FROM poets WHERE name='苏轼');

-- 李清照 - 如梦令
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '常记溪亭日暮'
  WHEN 2 THEN '沉醉不知归路'
  WHEN 3 THEN '兴尽晚回舟'
  WHEN 4 THEN '误入藕花深处'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '如梦令' AND p.poet_id = (SELECT id FROM poets WHERE name='李清照');

-- 李清照 - 夏日绝句
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '生当作人杰'
  WHEN 2 THEN '死亦为鬼雄'
  WHEN 3 THEN '至今思项羽'
  WHEN 4 THEN '不肯过江东'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '夏日绝句' AND p.poet_id = (SELECT id FROM poets WHERE name='李清照');

-- 辛弃疾 - 清平乐·村居
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '茅檐低小'
  WHEN 2 THEN '溪上青青草'
  WHEN 3 THEN '醉里吴音相媚好'
  WHEN 4 THEN '白发谁家翁媪'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '清平乐·村居' AND p.poet_id = (SELECT id FROM poets WHERE name='辛弃疾');

-- 辛弃疾 - 西江月·夜行黄沙道中
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '明月别枝惊鹊'
  WHEN 2 THEN '清风半夜鸣蝉'
  WHEN 3 THEN '稻花香里说丰年'
  WHEN 4 THEN '听取蛙声一片'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '西江月·夜行黄沙道中' AND p.poet_id = (SELECT id FROM poets WHERE name='辛弃疾');

-- 陆游 - 示儿
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '死去元知万事空'
  WHEN 2 THEN '但悲不见九州同'
  WHEN 3 THEN '王师北定中原日'
  WHEN 4 THEN '家祭无忘告乃翁'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '示儿' AND p.poet_id = (SELECT id FROM poets WHERE name='陆游');

-- 陆游 - 游山西村
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '莫笑农家腊酒浑'
  WHEN 2 THEN '丰年留客足鸡豚'
  WHEN 3 THEN '山重水复疑无路'
  WHEN 4 THEN '柳暗花明又一村'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '游山西村' AND p.poet_id = (SELECT id FROM poets WHERE name='陆游');

-- 陶渊明 - 饮酒·其五
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '结庐在人境'
  WHEN 2 THEN '而无车马喧'
  WHEN 3 THEN '问君何能尔'
  WHEN 4 THEN '心远地自偏'
  WHEN 5 THEN '采菊东篱下'
  WHEN 6 THEN '悠然见南山'
END
FROM poems p, generate_series(1,6) AS n
WHERE p.title = '饮酒·其五' AND p.poet_id = (SELECT id FROM poets WHERE name='陶渊明');

-- 陶渊明 - 归园田居·其三
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '种豆南山下'
  WHEN 2 THEN '草盛豆苗稀'
  WHEN 3 THEN '晨兴理荒秽'
  WHEN 4 THEN '带月荷锄归'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '归园田居·其三' AND p.poet_id = (SELECT id FROM poets WHERE name='陶渊明');

-- 曹操 - 龟虽寿
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '神龟虽寿'
  WHEN 2 THEN '犹有竟时'
  WHEN 3 THEN '老骥伏枥'
  WHEN 4 THEN '志在千里'
  WHEN 5 THEN '烈士暮年'
  WHEN 6 THEN '壮心不已'
END
FROM poems p, generate_series(1,6) AS n
WHERE p.title = '龟虽寿' AND p.poet_id = (SELECT id FROM poets WHERE name='曹操');

-- 马致远 - 天净沙·秋
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '孤村落日残霞'
  WHEN 2 THEN '轻烟老树寒鸦'
  WHEN 3 THEN '一点飞鸿影下'
  WHEN 4 THEN '青山绿水'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '天净沙·秋' AND p.poet_id = (SELECT id FROM poets WHERE name='马致远');

-- 龚自珍 - 己亥杂诗·其五
INSERT INTO poem_lines (poem_id, line_number, text)
SELECT p.id, n, CASE n
  WHEN 1 THEN '浩荡离愁白日斜'
  WHEN 2 THEN '吟鞭东指即天涯'
  WHEN 3 THEN '落红不是无情物'
  WHEN 4 THEN '化作春泥更护花'
END
FROM poems p, generate_series(1,4) AS n
WHERE p.title = '己亥杂诗·其五' AND p.poet_id = (SELECT id FROM poets WHERE name='龚自珍');
```

**Step 2: Commit**

```bash
git add supabase/migrations/007_more_poems.sql
git commit -m "feat: expand poem database with ~30 additional curriculum poems"
```

---

### Task 12: Run All Tests + Final Verification

**Step 1: Run full test suite**

Run: `npx vitest run`
Expected: ALL PASS

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Manual verification checklist**

- [ ] `npm run dev` — app starts without errors
- [ ] Login works
- [ ] DynastyMap shows progress bars and 飞花令 button
- [ ] Clicking a poet shows the intro screen
- [ ] "开始挑战" transitions to round 1 (选择题)
- [ ] Completing round 1 transitions to round 2 (填空题)
- [ ] Completing round 2 transitions to round 3 (排序题)
- [ ] Results screen shows round breakdown
- [ ] 飞花令 mode works from DynastyMap
- [ ] Daily/Endless modes still work

**Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address test/build issues from Phase 1 integration"
```
