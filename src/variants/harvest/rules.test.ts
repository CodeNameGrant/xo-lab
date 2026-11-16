import { describe, expect, it } from 'vitest'
import { IllegalMoveError } from '../../game/rules.ts'
import { harvestRules as rules, type HarvestMove } from './rules.ts'

/*
 * Squares are numbered 0–24, left to right, top to bottom:
 *
 *    0  1  2  3  4
 *    5  6  7  8  9
 *   10 11 12 13 14
 *   15 16 17 18 19
 *   20 21 22 23 24
 *
 * Every game below starts with Player 1 (X).
 */

function play(...moves: HarvestMove[]) {
  return moves.reduce(rules.applyMove, rules.initialState('X'))
}

/**
 * The moves that fill a board drawn as five rows of "X", "O" and ".": X's squares and O's
 * squares in reading order, taken in turn, X first.
 */
function fill(...rows: string[]): HarvestMove[] {
  const cells = rows.join('')
  const xs = [...cells].flatMap((cell, square) => (cell === 'X' ? [square] : []))
  const os = [...cells].flatMap((cell, square) => (cell === 'O' ? [square] : []))
  return xs.flatMap((square, i) => (i < os.length ? [square, os[i]] : [square]))
}

describe('Harvest', () => {
  it('starts with an empty 5×5 board and no lines', () => {
    const state = rules.initialState('O')
    expect(rules.currentPlayer(state)).toBe('O')
    expect(rules.legalMoves(state)).toHaveLength(25)
    expect(rules.selectors.lineCounts(state)).toEqual({ X: 0, O: 0 })
  })

  it('a line of three scores, and the game goes on', () => {
    const state = play(0, 5, 1, 6, 2)
    expect(rules.outcome(state)).toEqual({ kind: 'in-progress' })
    expect(rules.selectors.lineCounts(state)).toEqual({ X: 1, O: 0 })
    expect(rules.selectors.lineSquares(state)).toEqual([0, 1, 2])
  })

  it('lines that share marks all count: a run of four scores 2, a run of five scores 3', () => {
    // X takes 0–3 and then 4 along the top row; O plays 24, 18, 10 and 6, which make no line.
    expect(rules.selectors.lineCounts(play(0, 24, 1, 18, 2, 10, 3))).toEqual({ X: 2, O: 0 })
    expect(rules.selectors.lineCounts(play(0, 24, 1, 18, 2, 10, 3, 6, 4))).toEqual({ X: 3, O: 0 })
  })

  /*
   * 12 marks each, square 24 left empty.
   *   X: the top row (3 lines), the middle row (3) and 13–18–23 down column 4 (1): 7 lines.
   *   O: the second row (3), 15–16–17 (1) and 20–21–22 (1): 5 lines.
   */
  const X_WINS = fill('XXXXX', 'OOOOO', 'XXXXX', 'OOOXO', 'OOOX.')

  it('ends after the 24th move, with one square empty, and the most lines wins', () => {
    const before = play(...X_WINS.slice(0, 23))
    expect(rules.outcome(before)).toEqual({ kind: 'in-progress' })
    const end = play(...X_WINS)
    expect(rules.selectors.lineCounts(end)).toEqual({ X: 7, O: 5 })
    expect(rules.outcome(end)).toEqual({
      kind: 'won',
      winner: 'X',
      highlight: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23],
    })
    expect(rules.legalMoves(end)).toEqual([])
    expect(rules.selectors.cells(end)[24]).toBeNull()
  })

  it('equal line counts are a draw', () => {
    // Rows of X and O in turn: X has the first and third rows (3 lines each), O the second and fourth.
    const end = play(...fill('XXXXX', 'OOOOO', 'XXXXX', 'OOOOO', 'XXOO.'))
    expect(rules.selectors.lineCounts(end)).toEqual({ X: 6, O: 6 })
    expect(rules.outcome(end)).toEqual({ kind: 'draw' })
  })

  it('accepts no moves once the game is over, and rejects taken squares and squares off the board', () => {
    const end = play(...X_WINS)
    expect(() => rules.applyMove(end, 24)).toThrow(IllegalMoveError)
    const state = play(12)
    expect(() => rules.applyMove(state, 12)).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, 25)).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, -1)).toThrow(IllegalMoveError)
  })
})
