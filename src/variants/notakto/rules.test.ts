import { describe, expect, it } from 'vitest'
import { IllegalMoveError } from '../../game/rules.ts'
import { notaktoRules as rules, type NotaktoMove } from './rules.ts'

/*
 * Three boards, their squares numbered 0–26: board 0 is 0–8, board 1 is
 * 9–17, board 2 is 18–26. On each board:
 *
 *   0 1 2
 *   3 4 5
 *   6 7 8
 *
 * Every game below starts with Player 1 (X). Both players place an X.
 */

function play(...moves: NotaktoMove[]) {
  return moves.reduce(rules.applyMove, rules.initialState('X'))
}

/** One board as three rows of "X" and ".". */
function board(n: number, ...moves: NotaktoMove[]) {
  const text = rules.selectors
    .marks(play(...moves))
    .slice(n * 9, n * 9 + 9)
    .map((mark) => (mark ? 'X' : '.'))
    .join('')
  return [text.slice(0, 3), text.slice(3, 6), text.slice(6, 9)]
}

/** Player 1 kills board 0 along its top row: 0, 1, 2. */
const KILL_0 = [0, 1, 2]
/** Then Player 2 kills board 1 along its top row: 9, 10, 11. */
const KILL_1 = [9, 10, 11]

describe('Notakto', () => {
  it('starts with three empty live boards and every square open', () => {
    const state = rules.initialState('O')
    expect(rules.currentPlayer(state)).toBe('O')
    expect(rules.legalMoves(state)).toHaveLength(27)
    expect([0, 1, 2].map((n) => rules.selectors.killedBy(state, n))).toEqual([null, null, null])
  })

  it('both players place an X, and turns alternate', () => {
    expect(board(0, 4, 0)).toEqual(['X..', '.X.', '...'])
    expect(rules.currentPlayer(play(4, 0))).toBe('X')
  })

  it('completing a line kills that board, and play goes on on the others', () => {
    const state = play(...KILL_0)
    expect(rules.selectors.killedBy(state, 0)).toBe('X')
    expect(rules.selectors.completedLine(state, 0)).toEqual([0, 1, 2])
    expect(rules.outcome(state)).toEqual({ kind: 'in-progress' })
    expect(rules.legalMoves(state)).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26])
  })

  it('a dead board takes no more moves', () => {
    const state = play(...KILL_0)
    expect(() => rules.applyMove(state, 3)).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, 8)).toThrow(IllegalMoveError)
  })

  it('a move that completes two lines kills the board once, and both lines are kept', () => {
    // 0, 1, 4, 6, then 2 completes the top row and the 2–4–6 diagonal.
    const state = play(0, 1, 4, 6, 2)
    expect(board(0, 0, 1, 4, 6, 2)).toEqual(['XXX', '.X.', 'X..'])
    expect(rules.selectors.killedBy(state, 0)).toBe('X')
    expect(rules.selectors.completedLine(state, 0)).toEqual([0, 1, 2, 4, 6])
    expect([1, 2].map((n) => rules.selectors.killedBy(state, n))).toEqual([null, null])
  })

  it('whoever kills the last live board loses, and the other player wins', () => {
    // X kills board 0, O kills board 1, then X kills board 2 along 18, 19, 20.
    const state = play(...KILL_0, ...KILL_1, 18, 19, 20)
    expect([0, 1, 2].map((n) => rules.selectors.killedBy(state, n))).toEqual(['X', 'O', 'X'])
    expect(rules.outcome(state)).toEqual({ kind: 'won', winner: 'O', highlight: [18, 19, 20] })
  })

  it('a player left with only poisoned squares on the last board must move, and loses', () => {
    // On board 2 (squares 18–26): centre, top middle, bottom left, top left, middle right.
    const state = play(...KILL_0, ...KILL_1, 22, 19, 24, 18, 23)
    expect(board(2, ...KILL_0, ...KILL_1, 22, 19, 24, 18, 23)).toEqual(['XX.', '.XX', 'X..'])
    expect(rules.currentPlayer(state)).toBe('O')
    expect(rules.legalMoves(state)).toEqual([20, 21, 25, 26])
    for (const move of rules.legalMoves(state)) {
      expect(rules.outcome(rules.applyMove(state, move))).toMatchObject({ kind: 'won', winner: 'X' })
    }
  })

  it('accepts no moves once the game is over, and rejects squares off the boards', () => {
    const over = play(...KILL_0, ...KILL_1, 18, 19, 20)
    expect(rules.legalMoves(over)).toEqual([])
    expect(() => rules.applyMove(over, 21)).toThrow(IllegalMoveError)
    const state = play(4)
    expect(() => rules.applyMove(state, 4)).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, 27)).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, -1)).toThrow(IllegalMoveError)
  })
})
