import { describe, expect, it } from 'vitest'
import { IllegalMoveError } from '../../game/rules.ts'
import { numericalRules as rules, type NumericalMove } from './rules.ts'

/*
 * Squares are numbered 0–8, left to right, top to bottom:
 *
 *   0 1 2
 *   3 4 5
 *   6 7 8
 *
 * Unless a test says otherwise, Player 1 (X) starts, so plays the odd numbers.
 */

/** Place `number` on `square`. */
const p = (number: number, square: number): NumericalMove => ({ square, number })

function play(...moves: NumericalMove[]) {
  return moves.reduce(rules.applyMove, rules.initialState('X'))
}

/** The board as three rows, e.g. "1.6". */
function board(...moves: NumericalMove[]) {
  const text = rules.selectors
    .cells(play(...moves))
    .map((cell) => cell ?? '.')
    .join('')
  return [text.slice(0, 3), text.slice(3, 6), text.slice(6, 9)]
}

describe('Numerical', () => {
  it('gives the starter the odd numbers and the other player the even ones', () => {
    const state = rules.initialState('X')
    expect(rules.selectors.numbersLeft(state, 'X')).toEqual([1, 3, 5, 7, 9])
    expect(rules.selectors.numbersLeft(state, 'O')).toEqual([2, 4, 6, 8])
    expect(rules.legalMoves(state)).toHaveLength(45) // 9 squares × 5 numbers
  })

  it('swaps odd and even when Player 2 starts', () => {
    const state = rules.initialState('O')
    expect(rules.currentPlayer(state)).toBe('O')
    expect(rules.selectors.numbersLeft(state, 'O')).toEqual([1, 3, 5, 7, 9])
    expect(rules.selectors.numbersLeft(state, 'X')).toEqual([2, 4, 6, 8])
    expect(rules.selectors.owner(state, 7)).toBe('O')
    expect(rules.selectors.owner(state, 4)).toBe('X')
  })

  it('uses each number once and passes the turn', () => {
    const state = play(p(5, 4), p(4, 0))
    expect(board(p(5, 4), p(4, 0))).toEqual(['4..', '.5.', '...'])
    expect(rules.selectors.numbersLeft(state, 'X')).toEqual([1, 3, 7, 9])
    expect(rules.selectors.numbersLeft(state, 'O')).toEqual([2, 6, 8])
    expect(rules.currentPlayer(state)).toBe('X')
  })

  it('Player 1 completes 6 + 8 + 1 = 15 with two of Player 2’s numbers, and wins', () => {
    // Along the way the 0–4–8 diagonal fills with 6 + 3 + 9 = 18, which wins nothing.
    const moves = [p(3, 4), p(6, 0), p(9, 8), p(8, 1), p(1, 2)]
    expect(board(...moves)).toEqual(['681', '.3.', '..9'])
    expect(rules.outcome(play(...moves.slice(0, 3)))).toEqual({ kind: 'in-progress' })
    expect(rules.outcome(play(...moves))).toEqual({ kind: 'won', winner: 'X', highlight: [0, 1, 2] })
  })

  it('Player 2 completes 7 + 6 + 2 = 15 with one of Player 1’s numbers, and wins', () => {
    const moves = [p(7, 0), p(6, 3), p(1, 4), p(2, 6)]
    expect(rules.outcome(play(...moves))).toEqual({ kind: 'won', winner: 'O', highlight: [0, 3, 6] })
  })

  it('a full board with no line of 15 is a draw', () => {
    const moves = [p(1, 0), p(2, 1), p(3, 2), p(4, 3), p(5, 4), p(6, 6), p(7, 5), p(8, 8), p(9, 7)]
    expect(board(...moves)).toEqual(['123', '457', '698'])
    expect(rules.outcome(play(...moves))).toEqual({ kind: 'draw' })
  })

  it('rejects the other player’s numbers, a number already used, taken squares and anything off the board', () => {
    const state = play(p(5, 4), p(4, 0))
    expect(() => rules.applyMove(state, p(2, 1))).toThrow(IllegalMoveError) // an even number, for X
    expect(() => rules.applyMove(state, p(5, 1))).toThrow(IllegalMoveError) // 5 is already down
    expect(() => rules.applyMove(state, p(3, 4))).toThrow(IllegalMoveError) // square 4 is taken
    expect(() => rules.applyMove(state, p(3, 9))).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, p(11, 1))).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, p(0, 1))).toThrow(IllegalMoveError)
  })

  it('accepts no moves once the game is over', () => {
    const over = play(p(7, 0), p(6, 3), p(1, 4), p(2, 6))
    expect(rules.legalMoves(over)).toEqual([])
    expect(() => rules.applyMove(over, p(3, 8))).toThrow(IllegalMoveError)
  })
})
