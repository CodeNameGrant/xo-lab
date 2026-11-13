import { describe, expect, it } from 'vitest'
import { IllegalMoveError } from '../../game/rules.ts'
import { wildRules as rules, type WildMove } from './rules.ts'

/*
 * Squares are numbered 0–15, left to right, top to bottom:
 *
 *    0  1  2  3
 *    4  5  6  7
 *    8  9 10 11
 *   12 13 14 15
 *
 * Every game below starts with Player 1. Either player may place an X or an O.
 */

const x = (square: number): WildMove => ({ square, mark: 'X' })
const o = (square: number): WildMove => ({ square, mark: 'O' })

function play(...moves: WildMove[]) {
  return moves.reduce(rules.applyMove, rules.initialState('X'))
}

/** The board as four rows, e.g. "XO..". */
function board(...moves: WildMove[]) {
  const text = rules.selectors
    .cells(play(...moves))
    .map((cell) => cell ?? '.')
    .join('')
  return [0, 4, 8, 12].map((start) => text.slice(start, start + 4))
}

describe('Wild', () => {
  it('starts with an empty 4×4 board, offers both marks on every square, and alternates turns', () => {
    expect(board()).toEqual(['....', '....', '....', '....'])
    expect(rules.legalMoves(rules.initialState('X'))).toHaveLength(32)
    expect(rules.currentPlayer(rules.initialState('O'))).toBe('O')
    expect(rules.currentPlayer(play(o(5)))).toBe('O')
  })

  it('either player may place either mark', () => {
    expect(board(o(5), o(0), x(15), x(3))).toEqual(['O..X', '.O..', '....', '...X'])
  })

  it('Player 1 completes XXX that Player 2 helped build, and wins', () => {
    // Player 1 places X on 0, Player 2 places X on 1, Player 1 completes 0, 1, 2.
    expect(rules.outcome(play(x(0), x(1), x(2)))).toEqual({ kind: 'won', winner: 'X', highlight: [0, 1, 2] })
  })

  it('Player 2 completes OOO that Player 1 helped build, and wins', () => {
    // Player 1 places O on 5, Player 2 places O on 9, Player 1 places X on 15, Player 2 completes 5, 9, 13.
    expect(rules.outcome(play(o(5), o(9), x(15), o(13)))).toEqual({ kind: 'won', winner: 'O', highlight: [5, 9, 13] })
  })

  it('three in a row is enough: the fourth square of the row doesn’t matter', () => {
    expect(rules.outcome(play(o(3), x(1), x(2), x(0)))).toEqual({ kind: 'won', winner: 'O', highlight: [0, 1, 2] })
  })

  it('a line of mixed marks wins nothing', () => {
    expect(rules.outcome(play(x(0), o(1), x(2)))).toEqual({ kind: 'in-progress' })
  })

  it('a full board with no three matching marks in a row is a draw', () => {
    const marks = 'XXOOOOXXXXOOOOXX'
    const moves = [...marks].map((mark, square) => ({ square, mark }) as WildMove)
    expect(board(...moves)).toEqual(['XXOO', 'OOXX', 'XXOO', 'OOXX'])
    expect(rules.outcome(play(...moves))).toEqual({ kind: 'draw' })
  })

  it('rejects a taken square, a square off the board and a mark that isn’t X or O', () => {
    const state = play(x(5))
    expect(() => rules.applyMove(state, o(5))).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, x(16))).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, x(-1))).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, { square: 0, mark: 'S' } as unknown as WildMove)).toThrow(IllegalMoveError)
  })

  it('accepts no moves once the game is over', () => {
    const over = play(x(0), x(1), x(2))
    expect(rules.legalMoves(over)).toEqual([])
    expect(() => rules.applyMove(over, o(5))).toThrow(IllegalMoveError)
  })
})
