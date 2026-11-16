import { describe, expect, it } from 'vitest'
import { IllegalMoveError } from '../../game/rules.ts'
import { marchRules as rules, type MarchMove } from './rules.ts'

/*
 * Squares are numbered 0–15, left to right, top to bottom:
 *
 *    0  1  2  3
 *    4  5  6  7
 *    8  9 10 11
 *   12 13 14 15
 *
 * Every game below starts with Player 1 (X), from the starting position:
 *
 *   X O X O
 *   . . . .
 *   . . . .
 *   O X O X
 */

/** Move the piece on `from` to `to`. */
const m = (from: number, to: number): MarchMove => ({ from, to })

function play(...moves: MarchMove[]) {
  return moves.reduce(rules.applyMove, rules.initialState('X'))
}

/** The board as four rows, e.g. "XOXO". */
function board(...moves: MarchMove[]) {
  const text = rules.selectors
    .cells(play(...moves))
    .map((cell) => cell ?? '.')
    .join('')
  return [0, 4, 8, 12].map((start) => text.slice(start, start + 4))
}

describe('March', () => {
  it('starts with four pieces each, facing each other', () => {
    expect(board()).toEqual(['XOXO', '....', '....', 'OXOX'])
    expect(rules.outcome(rules.initialState('X'))).toEqual({ kind: 'in-progress' })
    expect(rules.currentPlayer(rules.initialState('O'))).toBe('O')
  })

  it('offers each player only one-step moves into empty squares', () => {
    // X's pieces on 0 and 2 can only go down; those on 13 and 15 only up.
    expect(rules.legalMoves(rules.initialState('X'))).toEqual([m(0, 4), m(2, 6), m(13, 9), m(15, 11)])
    expect(rules.legalMoves(rules.initialState('O'))).toEqual([m(1, 5), m(3, 7), m(12, 8), m(14, 10)])
  })

  it('moves a piece and passes the turn', () => {
    expect(board(m(0, 4))).toEqual(['.OXO', 'X...', '....', 'OXOX'])
    expect(rules.currentPlayer(play(m(0, 4)))).toBe('O')
    // Pieces can move sideways and back up too.
    expect(board(m(0, 4), m(12, 8), m(4, 5), m(8, 12), m(5, 4), m(12, 8), m(4, 0))).toEqual([
      'XOXO',
      '....',
      'O...',
      '.XOX',
    ])
  })

  it('rejects moving onto a piece, diagonally, two squares, the opponent’s piece, from an empty square or off the board', () => {
    const start = rules.initialState('X')
    expect(() => rules.applyMove(start, m(0, 1))).toThrow(IllegalMoveError) // onto O
    expect(() => rules.applyMove(start, m(0, 5))).toThrow(IllegalMoveError) // diagonal
    expect(() => rules.applyMove(start, m(0, 8))).toThrow(IllegalMoveError) // two squares
    expect(() => rules.applyMove(start, m(1, 5))).toThrow(IllegalMoveError) // O's piece
    expect(() => rules.applyMove(start, m(4, 8))).toThrow(IllegalMoveError) // empty square
    expect(() => rules.applyMove(start, m(3, 4))).toThrow(IllegalMoveError) // wraps round a row end
    expect(() => rules.applyMove(start, m(15, 16))).toThrow(IllegalMoveError) // off the board
  })

  it('X marches three across, 4–5–6, and wins', () => {
    const state = play(m(0, 4), m(12, 8), m(2, 6), m(8, 12), m(13, 9), m(12, 8), m(9, 5))
    expect(board(m(0, 4), m(12, 8), m(2, 6), m(8, 12), m(13, 9), m(12, 8), m(9, 5))).toEqual([
      '.O.O',
      'XXX.',
      'O...',
      '..OX',
    ])
    expect(rules.outcome(state)).toEqual({ kind: 'won', winner: 'X', highlight: [4, 5, 6] })
  })

  it('O marches three down, 3–7–11, and wins', () => {
    const moves = [m(0, 4), m(14, 10), m(4, 0), m(10, 11), m(0, 4), m(1, 5), m(4, 0), m(5, 6), m(0, 4), m(6, 7)]
    expect(rules.outcome(play(...moves))).toEqual({ kind: 'won', winner: 'O', highlight: [3, 7, 11] })
  })

  it('X marches three diagonally, 5–10–15, and wins', () => {
    const moves = [m(0, 4), m(12, 8), m(4, 5), m(8, 12), m(13, 9), m(12, 8), m(9, 10)]
    expect(rules.outcome(play(...moves))).toEqual({ kind: 'won', winner: 'X', highlight: [5, 10, 15] })
  })

  it('a player boxed in with no move ends the game in a draw', () => {
    // The shortest such game: X's four pieces end up packed into the bottom-right corner, hemmed in by O.
    const moves = [
      ...[m(0, 4), m(1, 5), m(2, 6), m(3, 7), m(4, 8), m(14, 10), m(13, 14), m(10, 9)],
      ...[m(6, 10), m(9, 13), m(8, 9), m(5, 6), m(10, 11), m(12, 8), m(9, 10), m(8, 9)],
    ]
    expect(board(...moves)).toEqual(['....', '..OO', '.OXX', '.OXX'])
    expect(rules.currentPlayer(play(...moves))).toBe('X')
    expect(rules.outcome(play(...moves))).toEqual({ kind: 'draw' })
    expect(rules.legalMoves(play(...moves))).toEqual([])
  })

  it('accepts no moves once the game is over', () => {
    const over = play(m(0, 4), m(12, 8), m(2, 6), m(8, 12), m(13, 9), m(12, 8), m(9, 5))
    expect(rules.legalMoves(over)).toEqual([])
    expect(() => rules.applyMove(over, m(1, 2))).toThrow(IllegalMoveError)
  })
})
