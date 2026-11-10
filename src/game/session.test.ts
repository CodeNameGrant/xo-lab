import { describe, expect, it } from 'vitest'
import { classicRules as rules } from '../variants/classic/rules.ts'
import { currentState, newGame, playMove, startGame } from './session.ts'

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
})
