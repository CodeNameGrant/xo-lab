import { describe, expect, it } from 'vitest'
import { IllegalMoveError } from '../../game/rules.ts'
import { sosRules as rules, type SosMove } from './rules.ts'

/*
 * Squares are numbered 0–35, left to right, top to bottom, six to a row:
 *
 *    0  1  2  3  4  5
 *    6  7  8  9 10 11
 *   12 13 14 15 16 17
 *   …
 *
 * Every game below starts with Player 1 (X). A player who makes an SOS moves again.
 */

const s = (square: number): SosMove => ({ square, letter: 'S' })
const o = (square: number): SosMove => ({ square, letter: 'O' })

function play(...moves: SosMove[]) {
  return moves.reduce(rules.applyMove, rules.initialState('X'))
}

/** Every square but `except`, in order, each given an S. */
function allSExcept(except: number): SosMove[] {
  return Array.from({ length: 36 }, (_, square) => square)
    .filter((square) => square !== except)
    .map(s)
}

describe('SOS', () => {
  it('starts with an empty 6×6 board, both letters on every square, and no SOSs', () => {
    const state = rules.initialState('O')
    expect(rules.currentPlayer(state)).toBe('O')
    expect(rules.legalMoves(state)).toHaveLength(72)
    expect(rules.selectors.counts(state)).toEqual({ X: 0, O: 0 })
  })

  it('a move that spells no SOS passes the turn', () => {
    expect(rules.currentPlayer(play(s(0)))).toBe('O')
    expect(rules.currentPlayer(play(s(0), o(1)))).toBe('X')
  })

  it('S-O-S across scores, and the scorer moves again', () => {
    const state = play(s(0), o(1), s(2))
    expect(rules.selectors.made(state)).toEqual([{ line: [0, 1, 2], by: 'X' }])
    expect(rules.selectors.counts(state)).toEqual({ X: 1, O: 0 })
    expect(rules.currentPlayer(state)).toBe('X')
  })

  it('S-O-S down and diagonally score too', () => {
    expect(rules.selectors.made(play(s(0), o(6), s(12)))).toEqual([{ line: [0, 6, 12], by: 'X' }])
    expect(rules.selectors.made(play(s(0), o(7), s(14)))).toEqual([{ line: [0, 7, 14], by: 'X' }])
  })

  it('the player who writes the last letter scores, whoever wrote the rest', () => {
    // X writes S on 0 and O on 1; O completes 0–1–2 and scores.
    const state = play(s(0), s(5), o(1), s(2))
    expect(rules.selectors.made(state)).toEqual([{ line: [0, 1, 2], by: 'O' }])
    expect(rules.currentPlayer(state)).toBe('O')
  })

  it('one letter can spell two SOSs and score 2', () => {
    // An S on 2 finishes the top row (0–1–2) and the column down from it (2–8–14).
    const state = play(s(0), o(1), o(8), s(14), s(2))
    expect(rules.selectors.counts(state)).toEqual({ X: 2, O: 0 })
    expect(rules.currentPlayer(state)).toBe('X')
  })

  it('O-S-O and S-S-S spell nothing', () => {
    expect(rules.selectors.made(play(o(0), s(1), o(2)))).toEqual([])
    expect(rules.selectors.made(play(s(0), s(1), s(2)))).toEqual([])
  })

  it('a full board with equal counts is a draw', () => {
    // Thirty-six S's spell no SOS at all.
    const state = play(...allSExcept(-1))
    expect(rules.selectors.counts(state)).toEqual({ X: 0, O: 0 })
    expect(rules.outcome(state)).toEqual({ kind: 'draw' })
  })

  it('when the board fills, the most SOSs wins', () => {
    // S everywhere but square 7; then O, on the 36th move, writes an O there, the middle of four SOSs:
    // 6–7–8 across, 1–7–13 down, 0–7–14 and 2–7–12 diagonally.
    const moves = [...allSExcept(7), o(7)]
    expect(rules.currentPlayer(play(...allSExcept(7)))).toBe('O')
    const state = play(...moves)
    expect(rules.selectors.counts(state)).toEqual({ X: 0, O: 4 })
    expect(rules.outcome(state)).toEqual({ kind: 'won', winner: 'O', highlight: [0, 1, 2, 6, 7, 8, 12, 13, 14] })
    expect(rules.legalMoves(state)).toEqual([])
  })

  it('rejects a taken square, a square off the board and a letter that isn’t S or O', () => {
    const state = play(s(0))
    expect(() => rules.applyMove(state, o(0))).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, s(36))).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, s(-1))).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(state, { square: 1, letter: 'X' } as unknown as SosMove)).toThrow(IllegalMoveError)
  })

  it('accepts no moves once the game is over', () => {
    const over = play(...allSExcept(7), o(7))
    expect(() => rules.applyMove(over, s(7))).toThrow(IllegalMoveError)
  })
})
