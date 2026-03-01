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
      const wrongs = allTexts.filter(t => t !== correct && t !== prompt)
      const picked = shuffle(wrongs).slice(0, 3)
      while (picked.length < 3) picked.push('（无）')
      const options = shuffle([correct, ...picked])
      mcQuestions.push({ type: 'multiple-choice', prompt, options, correctAnswer: correct, poemId })
    }
  }

  // --- Round 2: Fill Blank ---
  const fbQuestions: FillBlankQuestion[] = []
  for (const [poemId, poemLines] of poemGroups) {
    const sorted = [...poemLines].sort((a, b) => a.line_number - b.line_number)
    for (let i = 0; i < sorted.length - 1; i += 2) {
      fbQuestions.push({ type: 'fill-blank', prompt: sorted[i].text, answer: sorted[i + 1].text, poemId })
    }
  }

  // --- Round 3: Ordering ---
  const ordQuestions: OrderingQuestion[] = []
  for (const [poemId, poemLines] of poemGroups) {
    if (poemLines.length < 2) continue
    const sorted = [...poemLines].sort((a, b) => a.line_number - b.line_number)
    const correctOrder = sorted.map(l => l.text)
    const shuffledLines = shuffle(correctOrder)
    ordQuestions.push({ type: 'ordering', shuffledLines, correctOrder, poemId })
  }

  return [
    { type: 'multiple-choice', label: '选择题', questions: shuffle(mcQuestions).slice(0, 3) },
    { type: 'fill-blank', label: '填空题', questions: shuffle(fbQuestions).slice(0, 3) },
    { type: 'ordering', label: '排序题', questions: shuffle(ordQuestions).slice(0, 2) },
  ]
}
