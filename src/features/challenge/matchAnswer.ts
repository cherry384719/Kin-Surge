export type MatchResult = 'correct' | 'close' | 'wrong'

const tradToSimp: Record<string, string> = {
  鄉: '乡', 頭: '头', 舉: '举', 書: '书', 學: '学',
  風: '风', 雲: '云', 龍: '龙', 鳳: '凤', 聲: '声',
  國: '国', 門: '门', 開: '开', 關: '关', 東: '东',
  長: '长', 萬: '万', 無: '无', 來: '来', 飛: '飞',
}

function normalize(value: string) {
  return [...value.trim()].map(char => tradToSimp[char] ?? char).join('')
}

function charSimilarity(left: string, right: string) {
  const leftChars = [...left]
  const rightChars = [...right]
  const maxLength = Math.max(leftChars.length, rightChars.length)
  if (maxLength === 0) {
    return 1
  }

  let matches = 0
  for (let index = 0; index < Math.min(leftChars.length, rightChars.length); index += 1) {
    if (leftChars[index] === rightChars[index]) {
      matches += 1
    }
  }

  return matches / maxLength
}

export function matchAnswer(correct: string, playerInput: string): MatchResult {
  const normalizedCorrect = normalize(correct)
  const normalizedInput = normalize(playerInput)

  if (normalizedCorrect === normalizedInput) {
    return 'correct'
  }

  const similarity = charSimilarity(normalizedCorrect, normalizedInput)
  if (similarity >= 0.85) {
    return 'correct'
  }
  if (similarity >= 0.5) {
    return 'close'
  }
  return 'wrong'
}
