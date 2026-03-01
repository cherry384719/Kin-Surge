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
    const used = new Set([1])
    const result = findLinesContaining(allLines, '月', used)
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('举头望明月')
  })
})
