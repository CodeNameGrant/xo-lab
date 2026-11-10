/**
 * The shared contract suite: every variant in the registry must pass it.
 * A new variant gets these tests automatically when it is registered.
 *
 * Tests drive games through the public contract and the game session only,
 * comparing states as plain data; they never look inside a variant.
 */
import { describe, expect, it } from 'vitest'
import { variants } from '../variants/registry.ts'
import type { AnyRules } from '../variants/types.ts'
import type { Player } from './rules.ts'
import { currentState, playMove, startGame, type Game } from './session.ts'

const loaded = await Promise.all(variants.map(async (entry) => [entry.id, await entry.loadRules()] as const))

/** A small seeded random number generator, so a failing game can be replayed exactly. */
function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648
    return value / 2147483648
  }
}

/** Plays random legal moves until the game ends or `cap` moves are made. Never throws. */
function randomGame(rules: AnyRules, seed: number, first: Player = 'X', cap = 200): Game<unknown> {
  const random = seededRandom(seed)
  let game = startGame<unknown>(first)
  for (let i = 0; i < cap; i++) {
    const moves = rules.legalMoves(currentState(rules, game))
    if (moves.length === 0) break
    game = playMove(rules, game, moves[Math.floor(random() * moves.length)])
  }
  return game
}

const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

describe.each(loaded)('%s follows the rules contract', (_, rules) => {
  it.each<Player>(['X', 'O'])('a new game is in progress with %s to move', (first) => {
    const state = rules.initialState(first)
    expect(rules.outcome(state)).toEqual({ kind: 'in-progress' })
    expect(rules.currentPlayer(state)).toBe(first)
    expect(rules.legalMoves(state).length).toBeGreaterThan(0)
  })

  it.each(SEEDS)('every listed move can be applied (game %i)', (seed) => {
    const game = randomGame(rules, seed)
    // Check every legal move at every point of the game, not just the one played.
    for (let n = 0; n <= game.moves.length; n++) {
      const state = currentState(rules, { ...game, moves: game.moves.slice(0, n) })
      for (const move of rules.legalMoves(state)) {
        expect(() => rules.applyMove(state, move)).not.toThrow()
      }
    }
  })

  it.each(SEEDS)('replaying the move just made is rejected (game %i)', (seed) => {
    const game = randomGame(rules, seed)
    for (let n = 1; n <= game.moves.length; n++) {
      const state = currentState(rules, { ...game, moves: game.moves.slice(0, n) })
      expect(() => rules.applyMove(state, game.moves[n - 1])).toThrow()
    }
  })

  it.each(SEEDS)('no move is accepted once the game is over (game %i)', (seed) => {
    const game = randomGame(rules, seed)
    const end = currentState(rules, game)
    if (rules.outcome(end).kind === 'in-progress') return // hit the move cap
    expect(rules.legalMoves(end)).toEqual([])
    for (const move of rules.legalMoves(rules.initialState(game.firstPlayer))) {
      expect(() => rules.applyMove(end, move)).toThrow()
    }
  })

  it.each(SEEDS)('applying a move never changes the state it was given (game %i)', (seed) => {
    const game = randomGame(rules, seed)
    let state = rules.initialState(game.firstPlayer)
    for (const move of game.moves) {
      const before = structuredClone(state)
      const next = rules.applyMove(state, move)
      expect(state).toEqual(before)
      state = next
    }
  })

  it.each(SEEDS)('the same moves always give the same result (game %i)', (seed) => {
    const game = randomGame(rules, seed)
    expect(currentState(rules, game)).toEqual(currentState(rules, structuredClone(game)))
  })

  it.each(SEEDS)('random play never errors and states stay plain data (game %i)', (seed) => {
    const game = randomGame(rules, seed)
    const state = currentState(rules, game)
    expect(JSON.parse(JSON.stringify(state))).toEqual(state)
    expect(JSON.parse(JSON.stringify(game.moves))).toEqual(game.moves)
    const outcome = rules.outcome(state)
    if (outcome.kind === 'in-progress') expect(rules.legalMoves(state).length).toBeGreaterThan(0)
  })
})
