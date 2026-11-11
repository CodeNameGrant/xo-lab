import { describe, expect, it } from 'vitest'
import { IllegalMoveError } from '../../game/rules.ts'
import { trioRules as rules, type TrioMove } from './rules.ts'

/*
 * Squares are numbered 0–15, left to right, top to bottom:
 *
 *    0  1  2  3
 *    4  5  6  7
 *    8  9 10 11
 *   12 13 14 15
 *
 * Every game below starts with Player 1 (X), then Player 2 (O), then Player 3 (S, the star).
 */

function play(...moves: TrioMove[]) {
  return moves.reduce(rules.applyMove, rules.initialState('X'))
}

/** The board as four rows, e.g. "XOS.". */
function board(...moves: TrioMove[]) {
  const text = rules.selectors
    .cells(play(...moves))
    .map((cell) => cell ?? '.')
    .join('')
  return [0, 4, 8, 12].map((start) => text.slice(start, start + 4))
}

describe('Trio', () => {
  it('starts with an empty 4×4 board and the chosen player to move', () => {
    expect(board()).toEqual(['....', '....', '....', '....'])
    expect(rules.currentPlayer(rules.initialState('S'))).toBe('S')
    expect(rules.legalMoves(rules.initialState('X'))).toHaveLength(16)
  })

  it('takes turns Player 1, Player 2, Player 3, then Player 1 again', () => {
    expect([[], [0], [0, 1], [0, 1, 2]].map((moves) => rules.currentPlayer(play(...moves)))).toEqual([
      'X',
      'O',
      'S',
      'X',
    ])
    expect(board(0, 1, 2)).toEqual(['XOS.', '....', '....', '....'])
  })

  it('X takes 0, 1 and 2 across and wins', () => {
    const state = play(0, 4, 8, 1, 5, 9, 2)
    expect(rules.outcome(state)).toEqual({ kind: 'won', winner: 'X', highlight: [0, 1, 2] })
    expect(rules.legalMoves(state)).toEqual([])
  })

  it('O takes 3, 7 and 11 down and wins', () => {
    expect(rules.outcome(play(0, 3, 1, 8, 7, 13, 5, 11))).toEqual({ kind: 'won', winner: 'O', highlight: [3, 7, 11] })
  })

  it('the star takes 5, 10 and 15 diagonally and wins', () => {
    const moves = [0, 1, 5, 3, 2, 10, 12, 13, 15]
    expect(board(...moves)).toEqual(['XOOX', '.S..', '..S.', 'XO.S'])
    expect(rules.outcome(play(...moves))).toEqual({ kind: 'won', winner: 'S', highlight: [5, 10, 15] })
  })

  it('is a draw as soon as every line holds two players’ marks, before the board is full', () => {
    const moves = [0, 3, 6, 10, 4, 9, 11, 5, 15, 12, 13]
    expect(board(...moves)).toEqual(['X..O', 'OOS.', '.SXX', 'XO.S'])
    // One line is still open, so play goes on; the star blocks it at 2, with four squares still empty.
    expect(rules.outcome(play(...moves))).toEqual({ kind: 'in-progress' })
    expect(rules.outcome(play(...moves, 2))).toEqual({ kind: 'draw' })
    expect(rules.legalMoves(play(...moves, 2))).toEqual([])
  })

  it('is a draw when the last square fills with no line', () => {
    const moves = [3, 0, 5, 8, 2, 7, 11, 4, 9, 13, 6, 10, 15, 14, 12]
    expect(rules.outcome(play(...moves))).toEqual({ kind: 'in-progress' })
    expect(board(...moves, 1)).toEqual(['OXOX', 'OSOS', 'XSSX', 'SXOX'])
    expect(rules.outcome(play(...moves, 1))).toEqual({ kind: 'draw' })
  })

  it('rejects a taken square and squares off the board', () => {
    const state = play(5)
    expect(() => rules.applyMove(state, 5)).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, 16)).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, -1)).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, 1.5)).toThrow(IllegalMoveError)
  })
})
