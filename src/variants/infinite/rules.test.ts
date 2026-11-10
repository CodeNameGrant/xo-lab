import { describe, expect, it } from 'vitest'
import { IllegalMoveError } from '../../game/rules.ts'
import { infiniteRules as rules, type InfiniteMove } from './rules.ts'

/** Plays `moves` from a fresh game where X (Player 1) moves first. */
function play(...moves: InfiniteMove[]) {
  return moves.reduce(rules.applyMove, rules.initialState('X'))
}

/** Board contents as three rows, e.g. "XO.", "...", "..X". */
function board(...moves: InfiniteMove[]) {
  const text = rules.selectors
    .cells(play(...moves))
    .map((cell) => cell ?? '.')
    .join('')
  return [text.slice(0, 3), text.slice(3, 6), text.slice(6, 9)]
}

/**
 * Both players with three marks and no line, X to move:
 *   X X .
 *   O O .
 *   O . X
 * X placed 0, 1, 8 in that order; O placed 3, 4, 6.
 */
const SIX = [0, 3, 1, 4, 8, 6]

describe('Infinite', () => {
  it('starts empty, with the chosen player to move', () => {
    expect(board()).toEqual(['...', '...', '...'])
    expect(rules.currentPlayer(rules.initialState('O'))).toBe('O')
    expect(rules.outcome(rules.initialState('X'))).toEqual({ kind: 'in-progress' })
  })

  it('removes nothing while each player has three marks or fewer', () => {
    expect(board(...SIX)).toEqual(['XX.', 'OO.', 'O.X'])
    expect(rules.outcome(play(...SIX))).toEqual({ kind: 'in-progress' })
  })

  it("removes the mover's own oldest mark when they place a fourth", () => {
    // X places 5: X's oldest, 0, goes. O's marks are untouched.
    expect(board(...SIX, 5)).toEqual(['.X.', 'OOX', 'O.X'])
    // O places 7: O's oldest, 3, goes.
    expect(board(...SIX, 5, 7)).toEqual(['.X.', '.OX', 'OOX'])
    // X places 0: X's oldest is now 1.
    expect(board(...SIX, 5, 7, 0)).toEqual(['X..', '.OX', 'OOX'])
  })

  it('a winning fourth move wins and removes nothing', () => {
    // X: 6, 1, 4, then 7 makes the middle column. X's oldest (6) is not in the line and stays.
    const state = play(6, 0, 1, 3, 4, 2, 7)
    expect(rules.outcome(state)).toEqual({ kind: 'won', winner: 'X', highlight: [1, 4, 7] })
    expect(board(6, 0, 1, 3, 4, 2, 7)).toEqual(['OXO', 'OX.', 'XX.'])
  })

  it('a winning fourth move wins even when the oldest mark is part of the line', () => {
    // X: 0, 1, 8, then 2 makes the top row, which includes X's oldest mark (0).
    const state = play(...SIX, 2)
    expect(rules.outcome(state)).toEqual({ kind: 'won', winner: 'X', highlight: [0, 1, 2] })
    expect(board(...SIX, 2)).toEqual(['XXX', 'OO.', 'O.X'])
  })

  it("a freed square is open to the opponent's very next move", () => {
    // X's 4th mark frees 0; O takes it at once, completing the left column with O's oldest (3) in it.
    const freed = play(...SIX, 5)
    expect(rules.legalMoves(freed)).toContain(0)
    expect(rules.outcome(rules.applyMove(freed, 0))).toEqual({ kind: 'won', winner: 'O', highlight: [0, 3, 6] })
  })

  it('a freed square is open to the player whose mark was removed', () => {
    // O's 4th mark frees 3; X takes it on the next move.
    expect(board(...SIX, 5, 7, 3)).toEqual(['...', 'XOX', 'OOX'])
  })

  it("marks the player to move's oldest mark as disappearing next, once they have three", () => {
    const disappearsNext = (...moves: InfiniteMove[]) => rules.selectors.disappearsNext(play(...moves))
    expect(disappearsNext()).toBeNull()
    expect(disappearsNext(0, 3, 1, 4)).toBeNull() // X to move with two marks
    expect(disappearsNext(0, 3, 1, 4, 8)).toBeNull() // O to move with two marks; X's three don't count
    expect(disappearsNext(...SIX)).toBe(0) // X to move with 0, 1, 8
    expect(disappearsNext(...SIX, 5)).toBe(3) // O to move with 3, 4, 6
    expect(disappearsNext(...SIX, 5, 7)).toBe(1) // X to move with 1, 8, 5
  })

  it('marks nothing as disappearing once the game is over', () => {
    expect(rules.selectors.disappearsNext(play(...SIX, 2))).toBeNull()
  })

  it('accepts no moves after a win', () => {
    const won = play(...SIX, 2)
    expect(rules.legalMoves(won)).toEqual([])
    expect(() => rules.applyMove(won, 5)).toThrow(IllegalMoveError)
  })

  it('rejects a taken square, including the one about to disappear, and squares off the board', () => {
    const state = play(...SIX)
    expect(rules.legalMoves(state)).toEqual([2, 5, 7])
    expect(() => rules.applyMove(state, 0)).toThrow(IllegalMoveError) // X's own, disappearing next
    expect(() => rules.applyMove(state, 3)).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, 9)).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, -1)).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, 1.5)).toThrow(IllegalMoveError)
  })
})
