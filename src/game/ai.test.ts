/**
 * The AI's scenarios (D-47), written as move sequences in the variants it
 * plays. That every variant gets a legal move back is in the contract suite.
 */
import { describe, expect, it } from 'vitest'
import { findVariant } from '../variants/registry.ts'
import type { AnyRules } from '../variants/types.ts'
import { chooseMove, type AiLevel } from './ai.ts'
import { seededRandom } from './random.ts'
import type { Outcome, Player } from './rules.ts'
import { currentState, startGame } from './session.ts'

async function rulesOf(id: string): Promise<AnyRules> {
  return findVariant(id)!.loadRules()
}

/** The state after `moves`, Player 1 (X) moving first. */
function after(rules: AnyRules, moves: readonly unknown[]) {
  return currentState(rules, { firstPlayer: 'X', moves })
}

/** A whole game with each player's AI at its level, from `first`'s first move. */
function playOut(rules: AnyRules, levels: Record<'X' | 'O', AiLevel>, first: Player, seed: number): Outcome {
  const random = seededRandom(seed)
  let state = currentState(rules, startGame(first))
  while (rules.outcome(state).kind === 'in-progress') {
    const player = rules.currentPlayer(state) as 'X' | 'O'
    state = rules.applyMove(state, chooseMove(rules, state, levels[player], random))
  }
  return rules.outcome(state)
}

describe('the AI in Classic', async () => {
  const classic = await rulesOf('classic')

  it('Hard takes a win one move away: O has 3 and 4, and takes 5', () => {
    // X 0, O 3, X 1, O 4, X 8: X threatens 2, but O wins first.
    const state = after(classic, [0, 3, 1, 4, 8])
    expect(chooseMove(classic, state, 'hard', seededRandom(1))).toBe(5)
  })

  it('Hard blocks a win one move away: X has 0 and 1, so O takes 2', () => {
    const state = after(classic, [0, 4, 1])
    expect(chooseMove(classic, state, 'hard', seededRandom(1))).toBe(2)
  })

  it('Medium blocks too: X has 0 and 4, so O takes 8', () => {
    const state = after(classic, [0, 1, 4])
    expect(chooseMove(classic, state, 'medium', seededRandom(1))).toBe(8)
  })

  it.each([1, 2, 3])('Hard against Hard is a draw, whoever starts (game %i)', (seed) => {
    expect(playOut(classic, { X: 'hard', O: 'hard' }, 'X', seed)).toEqual({ kind: 'draw' })
    expect(playOut(classic, { X: 'hard', O: 'hard' }, 'O', seed)).toEqual({ kind: 'draw' })
  })

  it('Easy can be beaten: Hard wins some of ten games against it, and never loses', () => {
    const results = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((seed) =>
      playOut(classic, { X: 'hard', O: 'easy' }, seed % 2 ? 'X' : 'O', seed),
    )
    expect(results.some((r) => r.kind === 'won' && r.winner === 'X')).toBe(true)
    expect(results.some((r) => r.kind === 'won' && r.winner === 'O')).toBe(false)
  })
})

describe('the AI in Misère', async () => {
  const misere = await rulesOf('misere')

  it("Hard doesn't complete a line when it needn't: O has 3 and 4, and avoids 5", () => {
    const state = after(misere, [0, 3, 8, 4, 1])
    expect(chooseMove(misere, state, 'hard', seededRandom(1))).not.toBe(5)
  })
})

describe('the AI in games that can go on forever', () => {
  it.each(['infinite', 'shift'])('a Hard search in %s always comes back with a legal move', async (id) => {
    const rules = await rulesOf(id)
    const random = seededRandom(7)
    // Twenty random moves in, then ask.
    let state = currentState(rules, startGame('X'))
    for (let i = 0; i < 20 && rules.outcome(state).kind === 'in-progress'; i++) {
      const moves = rules.legalMoves(state)
      state = rules.applyMove(state, moves[Math.floor(random() * moves.length)])
    }
    if (rules.outcome(state).kind !== 'in-progress') return
    expect(rules.legalMoves(state)).toContainEqual(chooseMove(rules, state, 'hard', seededRandom(7)))
  })
})
