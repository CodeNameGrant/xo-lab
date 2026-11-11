import { describe, expect, it } from 'vitest'
import { IllegalMoveError } from '../../game/rules.ts'
import { shiftRules as rules, type ShiftMove } from './rules.ts'

/*
 * The field's tiles are numbered 0–24, left to right, top to bottom:
 *
 *    0  1  2  3  4
 *    5  6  7  8  9
 *   10 11 12 13 14
 *   15 16 17 18 19
 *   20 21 22 23 24
 *
 * Window positions are numbered 0–8 by where the window's top-left tile is:
 * 0 covers tiles 0–2 of rows 1–3, 4 is the centre (tiles 6–8, 11–13, 16–18),
 * 8 is the bottom-right corner.
 */

/** Place a mark on a tile. */
const p = (tile: number): ShiftMove => ({ kind: 'place', tile })
/** Move the window to a position. */
const w = (to: number): ShiftMove => ({ kind: 'window', to })

/** Plays `moves` from a fresh game where X (Player 1) moves first. */
function play(...moves: ShiftMove[]) {
  return moves.reduce(rules.applyMove, rules.initialState('X'))
}

/** The field as five rows, e.g. "X....". */
function field(...moves: ShiftMove[]) {
  const text = rules.selectors
    .tiles(play(...moves))
    .map((cell) => cell ?? '.')
    .join('')
  return [0, 5, 10, 15, 20].map((start) => text.slice(start, start + 5))
}

describe('Shift', () => {
  it('starts with an empty field and the window in the centre', () => {
    const state = rules.initialState('O')
    expect(field()).toEqual(['.....', '.....', '.....', '.....', '.....'])
    expect(rules.selectors.window(state)).toEqual({ row: 1, column: 1 })
    expect(rules.currentPlayer(state)).toBe('O')
    expect(rules.outcome(state)).toEqual({ kind: 'in-progress' })
  })

  it('offers the nine tiles inside the window and the eight window moves from the centre', () => {
    expect(rules.legalMoves(rules.initialState('X'))).toEqual([
      p(6),
      p(7),
      p(8),
      p(11),
      p(12),
      p(13),
      p(16),
      p(17),
      p(18),
      w(0),
      w(1),
      w(2),
      w(3),
      w(5),
      w(6),
      w(7),
      w(8),
    ])
  })

  it('X takes 6, 7 and 8 inside the window and wins', () => {
    const state = play(p(6), p(11), p(7), p(12), p(8))
    expect(rules.outcome(state)).toEqual({ kind: 'won', winner: 'X', highlight: [6, 7, 8] })
    expect(rules.legalMoves(state)).toEqual([])
    expect(() => rules.applyMove(state, p(13))).toThrow(IllegalMoveError)
  })

  it('the window may move on the very first turn, and that uses the turn', () => {
    const state = play(w(0))
    expect(rules.selectors.window(state)).toEqual({ row: 0, column: 0 })
    expect(rules.currentPlayer(state)).toBe('O')
  })

  /*
   * X builds 5, 6, 7 across two window positions. With the window in the
   * centre, tile 5 is outside it, so the line doesn't count yet:
   *
   *   . . . . .
   *   X X X . .
   *   . . . . .
   *   O . O O .
   *   . . . . .
   */
  const LINE_OUTSIDE = [p(6), p(18), w(3), p(15), p(5), w(4), p(7), p(17)]

  it("marks outside the window don't count", () => {
    expect(field(...LINE_OUTSIDE)).toEqual(['.....', 'XXX..', '.....', 'O.OO.', '.....'])
    expect(rules.selectors.window(play(...LINE_OUTSIDE))).toEqual({ row: 1, column: 1 })
    expect(rules.outcome(play(...LINE_OUTSIDE))).toEqual({ kind: 'in-progress' })
  })

  it('moving the window over a line made earlier wins', () => {
    expect(rules.outcome(play(...LINE_OUTSIDE, w(3)))).toEqual({ kind: 'won', winner: 'X', highlight: [5, 6, 7] })
  })

  it('a window move that makes a line for both players is a draw', () => {
    // X has 5, 6, 7 and O has 15, 16, 17; with the window in the centre neither row is fully inside.
    const both = [w(3), p(15), p(5), w(4), p(6), p(16), p(7), p(17)]
    expect(field(...both)).toEqual(['.....', 'XXX..', '.....', 'OOO..', '.....'])
    expect(rules.outcome(play(...both))).toEqual({ kind: 'in-progress' })
    expect(rules.outcome(play(...both, w(3)))).toEqual({ kind: 'draw' })
  })

  it('rejects a mark outside the window, on a taken tile, or off the field', () => {
    const state = play(p(12))
    expect(() => rules.applyMove(state, p(0))).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, p(24))).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, p(12))).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, p(25))).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, p(-1))).toThrow(IllegalMoveError)
  })

  it('rejects a window move of more than one step, to where it already is, or off the field', () => {
    const corner = play(w(0))
    expect(() => rules.applyMove(corner, w(2))).toThrow(IllegalMoveError) // two steps right
    expect(() => rules.applyMove(corner, w(8))).toThrow(IllegalMoveError) // two steps diagonally
    expect(() => rules.applyMove(corner, w(0))).toThrow(IllegalMoveError) // not a move
    expect(() => rules.applyMove(corner, w(9))).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(corner, w(-1))).toThrow(IllegalMoveError)
    expect(rules.legalMoves(corner).filter((move) => move.kind === 'window')).toEqual([w(1), w(3), w(4)])
  })

  it('is a draw once every line on the field holds both players’ marks', () => {
    // Fills the field so that no line of three is one player's alone, moving the window round it.
    const blocked = [
      ...[p(7), p(6), p(11), p(8), p(13), p(12), p(16), p(17), p(18)],
      ...[w(1), p(2), p(1), w(0), p(10), p(0), w(1), w(2), p(3), p(4), p(14), p(9)],
      ...[w(4), w(3), p(15), p(5), w(4), w(6), p(21), p(20), w(7), p(22), p(23), w(8), p(19)],
    ]
    expect(field(...blocked)).toEqual(['XOXOX', 'XOXOX', 'OXOXO', 'OXOXO', 'XOXO.'])
    // One line, 14–19–24, is still open for O, so the game goes on; X fills 24 and nobody can win.
    expect(rules.outcome(play(...blocked))).toEqual({ kind: 'in-progress' })
    expect(rules.outcome(play(...blocked, p(24)))).toEqual({ kind: 'draw' })
  })
})
