import type { ChallengeQuestion, FillBlankQuestion, MultipleChoiceQuestion, OrderingQuestion, PoemLine } from './types'

function shuffle<T>(items: T[]) {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }
  return next
}

function groupLines(lines: PoemLine[]) {
  return lines.reduce((map, line) => {
    const bucket = map.get(line.poem_id) ?? []
    bucket.push(line)
    map.set(line.poem_id, bucket)
    return map
  }, new Map<number, PoemLine[]>())
}

export function buildChallengeDeck(lines: PoemLine[]): ChallengeQuestion[] {
  const allTexts = lines.map(line => line.text)
  const poemGroups = groupLines(lines)
  const multipleChoice: MultipleChoiceQuestion[] = []
  const fillBlank: FillBlankQuestion[] = []
  const ordering: OrderingQuestion[] = []

  for (const [poemId, poemLines] of poemGroups.entries()) {
    const sorted = [...poemLines].sort((left, right) => left.line_number - right.line_number)
    for (let index = 0; index < sorted.length - 1; index += 2) {
      const prompt = sorted[index].text
      const answer = sorted[index + 1].text
      const distractors = shuffle(allTexts.filter(text => text !== prompt && text !== answer)).slice(0, 3)
      multipleChoice.push({
        id: `mc-${poemId}-${index}`,
        type: 'multiple-choice',
        poemId,
        promptLabel: '选出下一句',
        prompt,
        correctAnswer: answer,
        options: shuffle([answer, ...distractors]),
      })
      fillBlank.push({
        id: `fb-${poemId}-${index}`,
        type: 'fill-blank',
        poemId,
        promptLabel: '补全下一句',
        prompt,
        answer,
      })
    }

    if (sorted.length >= 4) {
      const correctOrder = sorted.slice(0, 4).map(line => line.text)
      ordering.push({
        id: `od-${poemId}`,
        type: 'ordering',
        poemId,
        promptLabel: '排列完整诗句',
        correctOrder,
        shuffledLines: shuffle(correctOrder),
      })
    }
  }

  return [
    ...shuffle(multipleChoice).slice(0, 3),
    ...shuffle(fillBlank).slice(0, 2),
    ...shuffle(ordering).slice(0, 1),
  ]
}
