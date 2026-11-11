import { describe, expect, it } from 'vitest'
import { anyLineOpen, linesOfThree, type Cell } from './lines.ts'

/** Sorts lines so two lists can be compared regardless of order. */
const sorted = (lines: readonly (readonly number[])[]) => lines.map((line) => line.join('-')).sort()

describe('linesOfThree', () => {
  it('finds the eight lines of a 3×3 grid', () => {
    expect(sorted(linesOfThree(3))).toEqual(
      sorted([
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ]),
    )
  })

  it('finds 48 lines on a 5×5 grid: 15 across, 15 down and 18 diagonal', () => {
    const lines = linesOfThree(5)
    expect(lines).toHaveLength(48)
    // A few written out: the top row's three, a column, and the diagonals through the centre.
    expect(sorted(lines)).toEqual(
      expect.arrayContaining(
        sorted([
          [0, 1, 2],
          [1, 2, 3],
          [2, 3, 4],
          [4, 9, 14],
          [6, 12, 18],
          [8, 12, 16],
        ]),
      ),
    )
    expect(sorted(lines)).not.toContain('3-4-5') // a row never wraps onto the next
  })
})

describe('anyLineOpen', () => {
  const lines = linesOfThree(3)
  const grid = (text: string) => [...text].map((c): Cell => (c === '.' ? null : (c as Cell)))

  it('is open while some line holds marks of at most one player', () => {
    expect(anyLineOpen(grid('.........'), lines)).toBe(true)
    expect(anyLineOpen(grid('XO.OX.X..'), lines)).toBe(true)
  })

  it('is closed once every line holds both players’ marks', () => {
    expect(anyLineOpen(grid('XOXXOOOX.'), lines)).toBe(false)
  })
})
