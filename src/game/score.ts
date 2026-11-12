import { playerName, type Outcome, type Player } from './rules.ts'

/**
 * The Score (see CONTEXT.md): each player's wins, and the draws, since the
 * game screen was opened. It is kept beside the game, never inside it (the
 * game is the first player plus the move list), and only in memory: the
 * game screen starts a fresh one every time it opens (D-42).
 */
export interface Score {
  readonly wins: Readonly<Record<Player, number>>
  readonly draws: number
}

export const NO_SCORE: Score = { wins: { X: 0, O: 0, S: 0 }, draws: 0 }

/**
 * The score once a game has ended with `outcome`: one more win for the
 * winner, or one more draw. A game still in progress changes nothing, so a
 * game abandoned with New game never counts.
 */
export function addResult(score: Score, outcome: Outcome): Score {
  if (outcome.kind === 'won') {
    return { ...score, wins: { ...score.wins, [outcome.winner]: score.wins[outcome.winner] + 1 } }
  }
  if (outcome.kind === 'draw') return { ...score, draws: score.draws + 1 }
  return score
}

/**
 * The score in words, for the screen-reader status line after a game: who
 * leads, or who is tied, among `players` (the variant's players, in turn
 * order). Draws aren't mentioned.
 *
 * Two players: "Player 1 leads 3 games to 1." or "The score is tied at 3 games each."
 * Three: "Player 3 leads with 3 games.", "Player 1 and Player 3 are tied at 2 games each."
 * or "All three players are tied at 2 games each."
 */
export function describeScore(score: Score, players: readonly Player[]): string {
  const top = Math.max(...players.map((player) => score.wins[player]))
  const leaders = players.filter((player) => score.wins[player] === top)

  if (leaders.length === players.length) {
    return players.length === 2
      ? `The score is tied at ${games(top)} each.`
      : `All three players are tied at ${games(top)} each.`
  }
  if (leaders.length > 1) {
    return `${leaders.map(playerName).join(' and ')} are tied at ${games(top)} each.`
  }
  const leader = leaders[0]
  if (players.length === 2) {
    const other = players.find((player) => player !== leader)!
    return `${playerName(leader)} leads ${games(top)} to ${score.wins[other]}.`
  }
  return `${playerName(leader)} leads with ${games(top)}.`
}

function games(count: number): string {
  return count === 1 ? '1 game' : `${count} games`
}
