import { describe, expect, it } from 'vitest'
import { IllegalMoveError } from '../../game/rules.ts'
import { pyramidRules as rules, type PyramidMove } from './rules.ts'

/*
 * Squares are numbered top to bottom, left to right:
 *
 *         0
 *      1  2  3
 *   4  5  6  7  8
 *
 * Every game below starts with Player 1 (X).
 */

function play(...moves: PyramidMove[]) {
  return moves.reduce(rules.applyMove, rules.initialState('X'))
}

/** The board as its three rows: 1, 3 and 5 squares. */
function board(...moves: PyramidMove[]) {
  const text = rules.selectors
    .cells(play(...moves))
    .map((cell) => cell ?? '.')
    .join('')
  return [text.slice(0, 1), text.slice(1, 4), text.slice(4, 9)]
}

/** X takes `line` while O plays the first two squares outside it, so O can't make a line first. */
function xTakes(line: readonly number[]): PyramidMove[] {
  const [o1, o2] = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((square) => !line.includes(square))
  return [line[0], o1, line[1], o2, line[2]]
}

/** The seven lines, written out: four across, the centre column, the left edge and the right edge. */
const LINES = [
  [1, 2, 3],
  [4, 5, 6],
  [5, 6, 7],
  [6, 7, 8],
  [0, 2, 6],
  [0, 1, 4],
  [0, 3, 8],
]

describe('Pyramid', () => {
  it('starts with nine empty squares and the chosen player to move', () => {
    expect(board()).toEqual(['.', '...', '.....'])
    expect(rules.legalMoves(rules.initialState('X'))).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
    expect(rules.currentPlayer(rules.initialState('O'))).toBe('O')
  })

  it('places marks and alternates turns', () => {
    expect(board(0, 6)).toEqual(['X', '...', '..O..'])
    expect(rules.currentPlayer(play(0, 6))).toBe('X')
  })

  it.each(LINES.map((line) => [line.join('-'), line] as const))('X wins with the line %s', (_, line) => {
    expect(rules.outcome(play(...xTakes(line)))).toEqual({ kind: 'won', winner: 'X', highlight: line })
  })

  it('O can win too', () => {
    // X: 4, 5, 8   O: 0, 2, 6 (the centre column).
    expect(rules.outcome(play(4, 0, 5, 2, 8, 6))).toEqual({ kind: 'won', winner: 'O', highlight: [0, 2, 6] })
  })

  it('three that don’t lie on one of the seven lines win nothing', () => {
    // 2, 3 and 7 step down the right side, but 3–7 is no line: the right edge runs 0–3–8.
    expect(rules.outcome(play(2, 0, 3, 4, 7))).toEqual({ kind: 'in-progress' })
    // 1, 5 and 6 bend round a corner.
    expect(rules.outcome(play(1, 0, 5, 3, 6))).toEqual({ kind: 'in-progress' })
  })

  it('a full board with no line is a draw', () => {
    const moves = [0, 2, 1, 4, 3, 7, 5, 8, 6]
    expect(board(...moves)).toEqual(['X', 'XOX', 'OXXOO'])
    expect(rules.outcome(play(...moves))).toEqual({ kind: 'draw' })
  })

  it('accepts no moves once the game is over, and rejects taken squares and squares off the board', () => {
    const over = play(...xTakes([1, 2, 3]))
    expect(rules.legalMoves(over)).toEqual([])
    expect(() => rules.applyMove(over, 8)).toThrow(IllegalMoveError)
    const state = play(6)
    expect(() => rules.applyMove(state, 6)).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, 9)).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, -1)).toThrow(IllegalMoveError)
  })
})
