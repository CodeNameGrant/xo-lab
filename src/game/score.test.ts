import { describe, expect, it } from 'vitest'
import { classicRules } from '../variants/classic/rules.ts'
import { misereRules } from '../variants/misere/rules.ts'
import { trioRules } from '../variants/trio/rules.ts'
import type { Player, VariantRules } from './rules.ts'
import { addResult, describeScore, NO_SCORE, type Score } from './score.ts'
import { currentState, playMove, startGame } from './session.ts'

/*
 * Squares are numbered left to right, top to bottom, from 0. Every game
 * below starts with Player 1 (X).
 */

/** The score after one game of `moves`, played through the session from `score`. */
function after<State, Move>(rules: VariantRules<State, Move>, moves: Move[], score: Score = NO_SCORE): Score {
  const game = moves.reduce((g, move) => playMove(rules, g, move), startGame<Move>())
  return addResult(score, rules.outcome(currentState(rules, game)))
}

const TWO: readonly Player[] = ['X', 'O']
const THREE: readonly Player[] = ['X', 'O', 'S']

function score(x: number, o: number, s = 0, draws = 0): Score {
  return { wins: { X: x, O: o, S: s }, draws }
}

describe('score', () => {
  it('starts at nothing for everyone', () => {
    expect(NO_SCORE).toEqual(score(0, 0, 0, 0))
  })

  it('X takes 0, 1, 2 in Classic: one win for Player 1', () => {
    expect(after(classicRules, [0, 3, 1, 4, 2])).toEqual(score(1, 0))
  })

  it('adds to the score it is given', () => {
    expect(after(classicRules, [0, 3, 1, 4, 2], score(2, 5, 0, 1))).toEqual(score(3, 5, 0, 1))
  })

  it('a Classic draw adds one draw and no wins', () => {
    expect(after(classicRules, [0, 1, 2, 4, 3, 5, 7, 6, 8])).toEqual(score(0, 0, 0, 1))
  })

  it('a game abandoned part-way counts for nobody', () => {
    expect(after(classicRules, [0, 3, 1])).toEqual(NO_SCORE)
  })

  it('X completes 0, 1, 2 in Misère: the win goes to Player 2', () => {
    expect(after(misereRules, [0, 3, 1, 4, 2])).toEqual(score(0, 1))
  })

  it('the star wins in Trio: one win for Player 3', () => {
    expect(after(trioRules, [0, 1, 5, 3, 2, 10, 12, 13, 15])).toEqual(score(0, 0, 1))
  })
})

describe('the score in words', () => {
  it('two players, one ahead', () => {
    expect(describeScore(score(3, 1), TWO)).toBe('Player 1 leads 3 games to 1.')
    expect(describeScore(score(0, 1), TWO)).toBe('Player 2 leads 1 game to 0.')
  })

  it('two players, level', () => {
    expect(describeScore(score(3, 3, 0, 2), TWO)).toBe('The score is tied at 3 games each.')
    expect(describeScore(score(1, 1), TWO)).toBe('The score is tied at 1 game each.')
    expect(describeScore(NO_SCORE, TWO)).toBe('The score is tied at 0 games each.')
  })

  it('three players, one ahead', () => {
    expect(describeScore(score(1, 0, 3), THREE)).toBe('Player 3 leads with 3 games.')
    expect(describeScore(score(1, 0, 0), THREE)).toBe('Player 1 leads with 1 game.')
  })

  it('three players, two level at the top', () => {
    expect(describeScore(score(2, 1, 2), THREE)).toBe('Player 1 and Player 3 are tied at 2 games each.')
  })

  it('three players, all level', () => {
    expect(describeScore(score(2, 2, 2), THREE)).toBe('All three players are tied at 2 games each.')
  })

  it("ignores Player 3's count in a two-player variant", () => {
    expect(describeScore(score(1, 1, 5), TWO)).toBe('The score is tied at 1 game each.')
  })
})
