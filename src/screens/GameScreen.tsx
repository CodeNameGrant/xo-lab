import { use, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { playerName, playersOf, type Outcome, type Player } from '../game/rules.ts'
import { addResult, describeScore, NO_SCORE } from '../game/score.ts'
import { currentState, newGame, playMove, startGame } from '../game/session.ts'
import { iconButton } from '../ui/classes.ts'
import { Icon } from '../ui/icon.tsx'
import { Mark } from '../ui/Mark.tsx'
import { ThemeToggle } from '../ui/ThemeToggle.tsx'
import type { AnyBoard, AnyRules, VariantEntry, VariantInfo } from '../variants/types.ts'
import { HowToPlay } from './HowToPlay.tsx'

interface LoadedVariant {
  readonly rules: AnyRules
  readonly Board: AnyBoard
}

/** One download per variant, started the first time it is opened and reused after that. */
const loading = new Map<string, Promise<LoadedVariant>>()

function loadVariant(entry: VariantEntry): Promise<LoadedVariant> {
  let promise = loading.get(entry.id)
  if (!promise) {
    promise = Promise.all([entry.loadRules(), entry.loadBoard()]).then(([rules, Board]) => ({ rules, Board }))
    loading.set(entry.id, promise)
  }
  return promise
}

/**
 * The shared game screen, the same for every variant: top bar, player
 * cards, the variant's own board and the bottom bar. The player cards show
 * whose turn it is and, at the end, who won or that it's a draw; the bottom
 * bar's New game then becomes Play again. The cards also keep the score of
 * every game played since the screen opened, and flag who started this one.
 * Must be rendered inside <Suspense>, which shows while the variant loads.
 */
export function GameScreen({ entry }: { entry: VariantEntry }) {
  const { rules, Board } = use(loadVariant(entry))
  const [game, setGame] = useState(() => startGame<unknown>())
  // Kept beside the game, never in it, and only while this screen is open (D-42).
  const [score, setScore] = useState(NO_SCORE)

  /** Plays `move` and, if it ends the game, adds the result to the score. */
  function play(move: unknown) {
    const next = playMove(rules, game, move)
    if (next === game) return
    setGame(next)
    setScore((s) => addResult(s, rules.outcome(currentState(rules, next))))
  }

  const state = useMemo(() => currentState(rules, game), [rules, game])
  const outcome = rules.outcome(state)
  const turn = rules.currentPlayer(state)
  const over = outcome.kind !== 'in-progress'
  const winner = outcome.kind === 'won' ? outcome.winner : null
  const players = playersOf(entry.info.players)

  const status =
    outcome.kind === 'won'
      ? `${playerName(outcome.winner)} wins! ${describeScore(score, players)}`
      : outcome.kind === 'draw'
        ? `It's a draw. ${describeScore(score, players)}`
        : `${playerName(turn)} to move`

  return (
    <main className="mx-auto flex min-h-dvh max-w-110 flex-col gap-6 px-6 pt-4 pb-8">
      <title>{`${entry.info.name} · XO Lab`}</title>

      {/* Equal outer columns keep the variant name centred, with one button on the left and two on the right. */}
      <header className="grid h-12 grid-cols-[1fr_auto_1fr] items-center">
        <Link to="/" className={`${iconButton} justify-self-start`} aria-label="Back to all variants">
          <Icon name="back" />
        </Link>
        <div className="text-center">
          <div className="text-xs font-medium tracking-[0.08em] text-ink-muted uppercase dark:tracking-[0.2em]">
            Tic-Tac-Toe
          </div>
          <h1 className="text-lg font-semibold dark:text-xl dark:font-bold dark:tracking-[0.12em] dark:uppercase">
            {entry.info.name}
          </h1>
        </div>
        <div className="flex gap-1 justify-self-end">
          <HowToPlay info={entry.info} />
          <ThemeToggle />
        </div>
      </header>

      {/*
        Two columns. With three players, Player 3's card wraps to a second row, the same width
        as the others and centred (D-37).
      */}
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-3">
          {players.map((player) => (
            <PlayerCard
              key={player}
              player={player}
              look={cardLook(player, outcome, turn)}
              starter={game.firstPlayer === player}
              wins={score.wins[player]}
              sharedMarks={entry.info.sharedMarks}
              className={player === 'S' ? 'col-span-2 w-[calc(50%-6px)] justify-self-center' : ''}
            />
          ))}
        </div>
        {entry.info.canDraw !== false && (
          <p className="text-center text-[13px] text-ink-muted">
            {score.draws === 1 ? '1 draw' : `${score.draws} draws`}
          </p>
        )}
      </div>

      <div className="flex grow items-center justify-center">
        <Board state={state} rules={rules} onMove={play} />
      </div>

      {/*
        The bottom bar. During play it is a quiet New game button; once the game is over it
        becomes Play again, in the winner's colour. The result itself shows on the player cards.
      */}
      {over ? (
        <button
          type="button"
          className={`${barButton} ${PLAY_AGAIN[winner ?? 'draw']}`}
          onClick={() => setGame((g) => newGame(g, players.length))}
        >
          <Icon name="newGame" size={20} />
          Play again
        </button>
      ) : (
        <button
          type="button"
          className={`${barButton} border border-line bg-surface text-ink dark:bg-transparent`}
          onClick={() => setGame((g) => newGame(g, players.length))}
        >
          <Icon name="newGame" size={20} />
          New game
        </button>
      )}

      {/*
        Never shown: the player cards carry the turn and the result. Always on the page, so
        screen readers hear every turn and the result as they change.
      */}
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
    </main>
  )
}

/** New game and Play again: the bottom bar's button in both of its states. */
const barButton = 'flex h-13 w-full items-center justify-center gap-2 rounded-card text-base font-semibold'

/** Play again takes the winner's colour (and glow in the dark theme); after a draw it is the usual primary button. */
const PLAY_AGAIN = {
  X: 'bg-player-x text-on-player-x dark:font-bold dark:shadow-glow-x',
  O: 'bg-player-o text-on-player-o dark:font-bold dark:shadow-glow-o',
  S: 'bg-player-s text-on-player-s dark:font-bold dark:shadow-glow-s',
  draw: 'bg-primary text-on-primary dark:font-bold dark:shadow-glow-primary',
} as const

/** How a player card reads right now: its player's turn, waiting, the winner, beaten, or a draw. */
type CardLook = 'turn' | 'waiting' | 'won' | 'lost' | 'draw'

function cardLook(player: Player, outcome: Outcome, turn: Player): CardLook {
  if (outcome.kind === 'draw') return 'draw'
  if (outcome.kind === 'won') return outcome.winner === player ? 'won' : 'lost'
  return turn === player ? 'turn' : 'waiting'
}

/**
 * Card colours per look. The current player and the winner get a border in their colour
 * (and a glow in the dark theme); the winner's card is also tinted. The beaten card fades;
 * a draw turns both cards grey. Text stays in the normal colours so it keeps its contrast.
 */
const WAITING = 'border-surface bg-surface dark:border-grid'
const LOST = 'border-surface bg-surface opacity-40 dark:border-grid'
const DRAW = 'border-grid bg-page'
const CARD = {
  turn: {
    X: 'border-player-x bg-surface dark:shadow-glow-x',
    O: 'border-player-o bg-surface dark:shadow-glow-o',
    S: 'border-player-s bg-surface dark:shadow-glow-s',
  },
  waiting: { X: WAITING, O: WAITING, S: WAITING },
  won: {
    X: 'border-player-x bg-tint-x dark:shadow-glow-x',
    O: 'border-player-o bg-tint-o dark:shadow-glow-o',
    S: 'border-player-s bg-tint-s dark:shadow-glow-s',
  },
  lost: { X: LOST, O: LOST, S: LOST },
  draw: { X: DRAW, O: DRAW, S: DRAW },
} as const

/** The detail line under each player's name. */
const ROLE = { X: 'Crosses', O: 'Noughts', S: 'Stars' } as const

/** The score box takes the player's tint, except on their winning card, which is already that tint (D-42). */
const SCORE_BOX = { X: 'bg-tint-x', O: 'bg-tint-o', S: 'bg-tint-s' } as const

interface PlayerCardProps {
  readonly player: Player
  readonly look: CardLook
  /** This player made the first move of this game. */
  readonly starter: boolean
  /** Games this player has won since the screen opened. */
  readonly wins: number
  /** The variant's shared marks, if its players share them, drawn in this player's colour. */
  readonly sharedMarks?: VariantInfo['sharedMarks']
  /** For layout only: where the card sits in the grid. */
  readonly className?: string
}

function PlayerCard({ player, look, starter, wins, sharedMarks, className }: PlayerCardProps) {
  const role = sharedMarks ? sharedMarks.detail : ROLE[player]
  const detail = look === 'won' ? 'Wins!' : look === 'draw' ? 'Draw' : role
  return (
    <div
      className={`flex items-center gap-1.5 rounded-card border-2 px-1.75 py-3 motion-safe:transition-[border-color,box-shadow,background-color,opacity] motion-safe:duration-200 ${CARD[look][player]} ${className ?? ''}`}
    >
      {sharedMarks ? (
        // The marks every player places, in this player's colour: one at full size, two side by side.
        <span className="flex shrink-0">
          {sharedMarks.marks.map((mark) => (
            <Mark
              key={mark}
              player={mark}
              tone={player}
              size={sharedMarks.marks.length > 1 ? 18 : 28}
              stroke={sharedMarks.marks.length > 1 ? 3 : 2.5}
            />
          ))}
        </span>
      ) : (
        <Mark player={player} size={28} stroke={2.5} className="shrink-0" />
      )}
      <div className="min-w-0 grow">
        <div className="flex items-center gap-1 text-[15px] font-semibold">
          {playerName(player)}
          {starter && <Icon name="starter" size={13} className="shrink-0 text-ink-muted" />}
          {starter && <span className="sr-only">, started this game</span>}
          {look === 'turn' && <span className="sr-only"> (to move)</span>}
        </div>
        <div className={`text-[13px] ${look === 'won' ? 'font-semibold text-ink' : 'text-ink-muted'}`}>{detail}</div>
      </div>
      <div
        className={`ml-0.5 flex h-6.5 min-w-6.5 shrink-0 items-center justify-center rounded-score px-1.5 text-[15px] font-semibold tabular-nums dark:font-bold ${look === 'won' ? 'bg-surface' : SCORE_BOX[player]}`}
      >
        {/* A new key on each change remounts the number, so its pop plays again. */}
        <span key={wins} className="motion-safe:animate-place">
          {wins}
        </span>
        <span className="sr-only">{wins === 1 ? ' win' : ' wins'}</span>
      </div>
    </div>
  )
}
