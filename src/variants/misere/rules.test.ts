import { describe, expect, it } from 'vitest'
import { IllegalMoveError } from '../../game/rules.ts'
import { misereRules as rules, type MisereMove } from './rules.ts'

/*
 * Squares are numbered 0–8, left to right, top to bottom:
 *
 *   0 1 2
 *   3 4 5
 *   6 7 8
 *
 * Every game below starts with Player 1 (X).
 */

function play(...moves: MisereMove[]) {
  return moves.reduce(rules.applyMove, rules.initialState('X'))
}

/** The board as three rows, e.g. "XO.". */
function board(...moves: MisereMove[]) {
  const text = rules.selectors
    .cells(play(...moves))
    .map((cell) => cell ?? '.')
    .join('')
  return [text.slice(0, 3), text.slice(3, 6), text.slice(6, 9)]
}

describe('Misère', () => {
  it('starts empty, with the chosen player to move, and alternates turns', () => {
    expect(board()).toEqual(['...', '...', '...'])
    expect(rules.currentPlayer(rules.initialState('O'))).toBe('O')
    expect(board(4, 0)).toEqual(['O..', '.X.', '...'])
    expect(rules.currentPlayer(play(4, 0))).toBe('X')
  })

  it('X completes 0, 1, 2 and loses: O wins, and the completed line is X’s', () => {
    const state = play(0, 3, 1, 4, 2)
    expect(rules.outcome(state)).toEqual({ kind: 'won', winner: 'O', highlight: [0, 1, 2] })
  })

  it('O completes 3, 4, 5 and loses: X wins', () => {
    expect(rules.outcome(play(0, 3, 1, 4, 8, 5))).toEqual({ kind: 'won', winner: 'X', highlight: [3, 4, 5] })
  })

  it('a move that completes two lines at once still loses, and both lines are highlighted', () => {
    // X: 0, 1, 4, 6, then 2 completes the top row and the 2–4–6 diagonal.
    const moves = [0, 3, 1, 5, 4, 7, 6, 8, 2]
    expect(board(...moves)).toEqual(['XXX', 'OXO', 'XOO'])
    expect(rules.outcome(play(...moves))).toEqual({ kind: 'won', winner: 'O', highlight: [0, 1, 2, 4, 6] })
  })

  it('a player must move even when the only empty square completes their line', () => {
    const forced = play(0, 1, 2, 3, 4, 5, 7, 6)
    expect(board(0, 1, 2, 3, 4, 5, 7, 6)).toEqual(['XOX', 'OXO', 'OX.'])
    expect(rules.legalMoves(forced)).toEqual([8])
    expect(rules.outcome(rules.applyMove(forced, 8))).toEqual({ kind: 'won', winner: 'O', highlight: [0, 4, 8] })
  })

  it('a full board with no completed line is a draw', () => {
    const moves = [1, 0, 3, 2, 4, 5, 6, 7, 8]
    expect(board(...moves)).toEqual(['OXO', 'XXO', 'XOX'])
    expect(rules.outcome(play(...moves))).toEqual({ kind: 'draw' })
  })

  it('accepts no moves once the game is over, and rejects taken squares and squares off the board', () => {
    const over = play(0, 3, 1, 4, 2)
    expect(rules.legalMoves(over)).toEqual([])
    expect(() => rules.applyMove(over, 8)).toThrow(IllegalMoveError)
    const state = play(4)
    expect(() => rules.applyMove(state, 4)).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, 9)).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, -1)).toThrow(IllegalMoveError)
  })
})
