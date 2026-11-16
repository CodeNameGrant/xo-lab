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
import { chooseMove, type AiSettings } from './ai.ts'
import { seededRandom } from './random.ts'
import { nextPlayer, playersOf, type Player } from './rules.ts'
import { currentState, playMove, startGame, type Game } from './session.ts'

const loaded = await Promise.all(
  variants.map(
    async (entry) =>
      [entry.id, await entry.loadRules(), playersOf(entry.info.players), entry.info.extraTurns === true] as const,
  ),
)

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

describe.each(loaded)('%s follows the rules contract', (_, rules, players, extraTurns) => {
  it.each(players)('a new game is in progress with %s to move', (first) => {
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

  it.each(SEEDS)('each move passes the turn to the next player (game %i)', (seed) => {
    const game = randomGame(rules, seed)
    let state = rules.initialState(game.firstPlayer)
    for (const move of game.moves) {
      const next = rules.applyMove(state, move)
      const mover = rules.currentPlayer(state)
      // A variant with extra turns (SOS) may also keep the turn with the player who just moved.
      const allowed = extraTurns ? [nextPlayer(mover, players.length), mover] : [nextPlayer(mover, players.length)]
      expect(allowed).toContain(rules.currentPlayer(next))
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

  /*
   * The AI (D-47) plays every variant through this contract alone, so it is checked here for all
   * of them, with small searches to keep the suite quick. A careful search and a slip (a random
   * move) both have to come back with a legal move, and the same seed with the same move.
   */
  const SEARCHES: readonly AiSettings[] = [
    { budget: 300, slip: 0, careful: true },
    { budget: 300, slip: 0, careful: false },
    { budget: 300, slip: 1, careful: false },
  ]

  it.each(SEEDS)('the AI always chooses a legal move, the same one for the same seed (game %i)', (seed) => {
    const game = randomGame(rules, seed)
    for (let n = 0; n < game.moves.length; n += 3) {
      const state = currentState(rules, { ...game, moves: game.moves.slice(0, n) })
      for (const settings of SEARCHES) {
        const move = chooseMove(rules, state, settings, seededRandom(seed + n))
        expect(rules.legalMoves(state)).toContainEqual(move)
        expect(chooseMove(rules, state, settings, seededRandom(seed + n))).toEqual(move)
      }
    }
  })
})
