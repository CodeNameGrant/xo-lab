import { describe, expect, it } from 'vitest'
import { LINES } from '../../game/lines.ts'
import { IllegalMoveError } from '../../game/rules.ts'
import { classicRules as rules, type ClassicMove } from './rules.ts'

/** Plays `moves` from a fresh game where X (Player 1) moves first. */
function play(...moves: ClassicMove[]) {
  return moves.reduce(rules.applyMove, rules.initialState('X'))
}

/** Board contents as three rows, e.g. "XO.", "...", "..X". */
function board(moves: ClassicMove[]) {
  const cells = rules.selectors.cells(play(...moves))
  const text = cells.map((cell) => cell ?? '.').join('')
  return [text.slice(0, 3), text.slice(3, 6), text.slice(6, 9)]
}

/** X takes `line` while O plays elsewhere. O only gets two marks, so O can't win first. */
function xTakes(line: readonly number[]): ClassicMove[] {
  const [o1, o2] = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((square) => !line.includes(square))
  return [line[0], o1, line[1], o2, line[2]]
}

describe('Classic', () => {
  it('starts empty, with the chosen player to move', () => {
    expect(board([])).toEqual(['...', '...', '...'])
    expect(rules.currentPlayer(rules.initialState('O'))).toBe('O')
    expect(rules.outcome(rules.initialState('X'))).toEqual({ kind: 'in-progress' })
  })

  it('places marks and alternates turns', () => {
    expect(board([4, 0])).toEqual(['O..', '.X.', '...'])
    expect(rules.currentPlayer(play(4, 0))).toBe('X')
  })

  it.each(LINES.map((line) => [line.join('-'), line] as const))('X wins with the line %s', (_, line) => {
    const state = play(...xTakes(line))
    expect(rules.outcome(state)).toEqual({ kind: 'won', winner: 'X', highlight: line })
  })

  it('O can win too', () => {
    // X: 0, 1, 8   O: 3, 4, 5 (middle row)
    expect(rules.outcome(play(0, 3, 1, 4, 8, 5))).toEqual({
      kind: 'won',
      winner: 'O',
      highlight: [3, 4, 5],
    })
  })

  it('is a draw when the board fills with no line', () => {
    // X O X
    // X O O
    // O X X
    const state = play(0, 1, 2, 4, 3, 5, 7, 6, 8)
    expect(rules.outcome(state)).toEqual({ kind: 'draw' })
    expect(rules.legalMoves(state)).toEqual([])
  })

  it('accepts no moves after a win', () => {
    const won = play(0, 3, 1, 4, 2) // X takes the top row
    expect(rules.legalMoves(won)).toEqual([])
    expect(() => rules.applyMove(won, 8)).toThrow(IllegalMoveError)
  })

  it('rejects a taken square and squares off the board', () => {
    const state = play(4)
    expect(() => rules.applyMove(state, 4)).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, 9)).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, -1)).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, 1.5)).toThrow(IllegalMoveError)
  })
})
