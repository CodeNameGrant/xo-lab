import { describe, expect, it } from 'vitest'
import { classicRules as rules } from '../variants/classic/rules.ts'
import { canUndo, currentState, newGame, playMove, startGame, undoMove } from './session.ts'

describe('game session', () => {
  it('starts the first game with Player 1 (X)', () => {
    const game = startGame<number>()
    expect(rules.currentPlayer(currentState(rules, game))).toBe('X')
  })

  it('alternates the starting player with each new game', () => {
    const first = startGame<number>()
    const second = newGame(playMove(rules, first, 4))
    const third = newGame(second)
    expect([first, second, third].map((game) => game.firstPlayer)).toEqual(['X', 'O', 'X'])
    expect(second.moves).toEqual([])
    expect(rules.currentPlayer(currentState(rules, second))).toBe('O')
  })

  it('ignores an illegal move', () => {
    const game = playMove(rules, startGame<number>(), 4)
    expect(playMove(rules, game, 4)).toBe(game)
  })

  it('ignores moves once the game is over', () => {
    const won = [0, 3, 1, 4, 2].reduce((game, move) => playMove(rules, game, move), startGame<number>())
    expect(rules.outcome(currentState(rules, won)).kind).toBe('won')
    expect(playMove(rules, won, 8)).toBe(won)
  })

  it('undoes moves one at a time, including the winning move', () => {
    const won = [0, 3, 1, 4, 2].reduce((game, move) => playMove(rules, game, move), startGame<number>())
    const undone = undoMove(won)
    expect(rules.outcome(currentState(rules, undone))).toEqual({ kind: 'in-progress' })
    expect(rules.currentPlayer(currentState(rules, undone))).toBe('X')
    expect(undone.moves).toEqual([0, 3, 1, 4])
  })

  it('has nothing to undo at the start', () => {
    const game = startGame<number>()
    expect(canUndo(game)).toBe(false)
    expect(undoMove(game)).toBe(game)
  })
})
