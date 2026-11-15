import type { Outcome, Player, VariantRules } from './rules.ts'

/**
 * The AI (see CONTEXT.md): the app playing Player 2's seat. It is a Monte
 * Carlo tree search (decision D-47) that knows nothing about any variant:
 * it only asks the rules contract whose turn it is, which moves are legal,
 * what a move leads to and how a game ended.
 *
 * Like the rules, it is pure: no React, no browser APIs, no clock. Its
 * randomness comes from the `random` function it is given, so a seeded one
 * makes every choice replay exactly.
 */

export type AiLevel = 'easy' | 'medium' | 'hard'

/** The levels, easiest first. */
export const AI_LEVELS: readonly AiLevel[] = ['easy', 'medium', 'hard']

export const AI_LEVEL_NAMES: Readonly<Record<AiLevel, string>> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }

/** The level named in the address (`?ai=hard`), or null for a person: anything unknown is a person (D-46). */
export function parseAiLevel(value: string | null): AiLevel | null {
  return AI_LEVELS.find((level) => level === value) ?? null
}

export interface AiSettings {
  /**
   * How much searching it does before it chooses, counted in moves played
   * inside the search. More is stronger and slower. Counting moves rather
   * than playouts keeps a turn about as quick in Ultimate, whose games run
   * to 50 moves, as in Classic, whose games end within 9.
   */
  readonly budget: number
  /** The chance of playing a random legal move instead of searching, so the level can be beaten. */
  readonly slip: number
  /** Always take a win that is one move away, and never leave the opponent one. */
  readonly careful: boolean
}

/**
 * What each level does. A level is an amount of search, not a thinking time,
 * so it plays as well on a slow phone as a fast one (D-47). Hard is tuned to
 * answer Ultimate, the slowest variant per move, in under about a second on
 * a mid-range phone.
 */
export const AI_SETTINGS: Readonly<Record<AiLevel, AiSettings>> = {
  easy: { budget: 1_500, slip: 0.35, careful: false },
  medium: { budget: 8_000, slip: 0, careful: true },
  hard: { budget: 30_000, slip: 0, careful: true },
}

/**
 * The longest a playout runs before it is counted as a draw. Infinite and
 * Shift can go on forever; inside the search they must not (D-47).
 */
export const PLAYOUT_CAP = 60

/** How strongly the search explores moves it has tried less (the UCT constant, √2). */
const EXPLORATION = Math.SQRT2

/**
 * The move the AI plays for whoever's turn it is in `state`, which must be a
 * game in progress. `level` is a level's name, or settings of its own (for
 * tests).
 */
export function chooseMove<State, Move>(
  rules: VariantRules<State, Move>,
  state: State,
  level: AiLevel | AiSettings,
  random: () => number,
): Move {
  const settings = typeof level === 'string' ? AI_SETTINGS[level] : level
  const moves = rules.legalMoves(state)
  if (moves.length === 0) throw new Error('The AI was asked to move in a game that is over')
  if (moves.length === 1) return moves[0]
  if (random() < settings.slip) return pick(moves, random)

  const candidates = settings.careful ? carefulMoves(rules, state, moves) : moves
  if (candidates.length === 1) return candidates[0]
  return search(rules, state, candidates, settings.budget, random)
}

/**
 * The moves worth searching, after two quick checks any player would make:
 * a move that wins at once is the only one; otherwise drop every move that
 * loses at once or lets the opponent win with their reply, unless all of
 * them do.
 */
function carefulMoves<State, Move>(rules: VariantRules<State, Move>, state: State, moves: readonly Move[]): Move[] {
  const me = rules.currentPlayer(state)
  const after = moves.map((move) => rules.applyMove(state, move))

  const winning = moves.findIndex((_, i) => winnerOf(rules.outcome(after[i])) === me)
  if (winning >= 0) return [moves[winning]]

  const safe = moves.filter((_, i) => {
    const outcome = rules.outcome(after[i])
    if (outcome.kind === 'won') return false // won by someone else: a move that loses at once
    if (outcome.kind === 'draw') return true
    const them = rules.currentPlayer(after[i])
    return !rules
      .legalMoves(after[i])
      .some((reply) => winnerOf(rules.outcome(rules.applyMove(after[i], reply))) === them)
  })
  return safe.length > 0 ? safe : moves.slice()
}

/** One position in the search tree, reached by `move` from its parent. */
interface Node<State, Move> {
  readonly state: State
  readonly move: Move | null
  readonly parent: Node<State, Move> | null
  /** The player who made `move`: the node's results are counted for them. */
  readonly mover: Player | null
  readonly children: Node<State, Move>[]
  /** Moves from here not yet added as children. */
  readonly untried: Move[]
  visits: number
  /** Total result for `mover` over every visit: 1 a win, ½ a draw, 0 a loss. */
  reward: number
}

/**
 * Monte Carlo tree search: until `budget` moves have been played, walk down
 * the tree favouring moves that have done well (and ones tried less), add
 * one new move, play a random game out from it, and count the result back up
 * the path. The move tried most often from the root is the choice.
 */
function search<State, Move>(
  rules: VariantRules<State, Move>,
  state: State,
  rootMoves: readonly Move[],
  budget: number,
  random: () => number,
): Move {
  const root: Node<State, Move> = {
    state,
    move: null,
    parent: null,
    mover: null,
    children: [],
    untried: rootMoves.slice(),
    visits: 0,
    reward: 0,
  }

  for (let spent = 0; spent < budget;) {
    // 1. Select: follow the most promising children down to a node with untried moves, or the end of a game.
    let node = root
    while (node.untried.length === 0 && node.children.length > 0) node = bestChild(node)

    // 2. Expand: add one untried move as a new child.
    if (node.untried.length > 0) {
      const index = Math.floor(random() * node.untried.length)
      const [move] = node.untried.splice(index, 1)
      const next = rules.applyMove(node.state, move)
      const child: Node<State, Move> = {
        state: next,
        move,
        parent: node,
        mover: rules.currentPlayer(node.state),
        children: [],
        untried: rules.legalMoves(next).slice(),
        visits: 0,
        reward: 0,
      }
      node.children.push(child)
      node = child
      spent++
    }

    // 3. Play out: random legal moves until the game ends or the cap is reached.
    const { outcome, moves } = playout(rules, node.state, random)
    spent += moves + 1 // + 1, so a search that keeps reaching finished games still ends

    // 4. Count the result for every node on the path.
    for (let n: Node<State, Move> | null = node; n; n = n.parent) {
      n.visits++
      if (n.mover) n.reward += resultFor(outcome, n.mover)
    }
  }

  let best = root.children[0]
  for (const child of root.children) if (child.visits > best.visits) best = child
  return best.move as Move
}

/** The child with the best balance of a good record and few visits (UCT). */
function bestChild<State, Move>(node: Node<State, Move>): Node<State, Move> {
  const logVisits = Math.log(node.visits)
  let best = node.children[0]
  let bestScore = -Infinity
  for (const child of node.children) {
    const score = child.reward / child.visits + EXPLORATION * Math.sqrt(logVisits / child.visits)
    if (score > bestScore) {
      best = child
      bestScore = score
    }
  }
  return best
}

/** Plays random moves from `start`: how the game ended (or stood at the cap), and how many moves that took. */
function playout<State, Move>(
  rules: VariantRules<State, Move>,
  start: State,
  random: () => number,
): { outcome: Outcome; moves: number } {
  let state = start
  let i = 0
  for (; i < PLAYOUT_CAP; i++) {
    // The contract promises no legal moves once a game is over, and at least one before.
    const moves = rules.legalMoves(state)
    if (moves.length === 0) break
    state = rules.applyMove(state, pick(moves, random))
  }
  return { outcome: rules.outcome(state), moves: i }
}

/** 1 if `player` won, 0 if someone else did, ½ for a draw or a playout stopped at the cap. */
function resultFor(outcome: Outcome, player: Player): number {
  if (outcome.kind === 'won') return outcome.winner === player ? 1 : 0
  return 0.5
}

function winnerOf(outcome: Outcome): Player | null {
  return outcome.kind === 'won' ? outcome.winner : null
}

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)]
}
