import { use, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { playerName, type Player } from '../game/rules.ts'
import { canUndo, currentState, newGame, playMove, startGame, undoMove } from '../game/session.ts'
import { iconButton } from '../ui/classes.ts'
import { Icon } from '../ui/icon.tsx'
import { Mark } from '../ui/Mark.tsx'
import { ThemeToggle } from '../ui/ThemeToggle.tsx'
import type { AnyBoard, AnyRules, VariantEntry } from '../variants/types.ts'
import { HowToPlay } from './HowToPlay.tsx'

/** Undo and New game: the same shape, each adds its own colours. */
const actionButton =
  'flex h-13 items-center justify-center gap-2 rounded-card text-base font-semibold disabled:opacity-45'

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
 * cards, the variant's own board, status line, Undo and New game.
 * Must be rendered inside <Suspense>, which shows while the variant loads.
 */
export function GameScreen({ entry }: { entry: VariantEntry }) {
  const { rules, Board } = use(loadVariant(entry))
  const [game, setGame] = useState(() => startGame<unknown>())

  const state = useMemo(() => currentState(rules, game), [rules, game])
  const outcome = rules.outcome(state)
  const turn = rules.currentPlayer(state)
  const over = outcome.kind !== 'in-progress'

  const status =
    outcome.kind === 'won'
      ? `${playerName(outcome.winner)} wins!`
      : outcome.kind === 'draw'
        ? "It's a draw"
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
            Variant
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

      <div className="grid grid-cols-2 gap-3">
        {(['X', 'O'] as const).map((player) => (
          <PlayerCard
            key={player}
            player={player}
            active={!over && turn === player}
            first={game.firstPlayer === player}
          />
        ))}
      </div>

      <div className="flex grow items-center justify-center">
        <Board state={state} rules={rules} onMove={(move: unknown) => setGame((g) => playMove(rules, g, move))} />
      </div>

      <p className="text-center text-xl font-semibold dark:tracking-[0.06em] dark:uppercase" aria-live="polite">
        {status}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className={`${actionButton} border border-line bg-surface text-ink dark:bg-transparent`}
          disabled={!canUndo(game)}
          onClick={() => setGame(undoMove)}
        >
          <Icon name="undo" size={20} />
          Undo
        </button>
        <button
          type="button"
          className={`${actionButton} bg-primary text-on-primary dark:font-bold dark:shadow-glow-primary`}
          onClick={() => setGame(newGame)}
        >
          <Icon name="newGame" size={20} />
          New game
        </button>
      </div>
    </main>
  )
}

/** The current player's card border; in the dark theme it glows too. Inactive: light hides the border, dark shows a dim one. */
const CARD_BORDER = {
  X: 'border-player-x dark:shadow-glow-x',
  O: 'border-player-o dark:shadow-glow-o',
  inactive: 'border-surface dark:border-grid',
} as const

function PlayerCard({ player, active, first }: { player: Player; active: boolean; first: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-card border-2 bg-surface px-3.5 py-3 motion-safe:transition-[border-color,box-shadow] motion-safe:duration-200 ${
        CARD_BORDER[active ? player : 'inactive']
      }`}
    >
      <Mark player={player} size={28} stroke={2.5} className="shrink-0" />
      <div className="min-w-0">
        <div className="text-[15px] font-semibold">
          {playerName(player)}
          {active && <span className="sr-only"> (to move)</span>}
        </div>
        <div className="text-[13px] text-ink-muted">
          {player === 'X' ? 'Crosses' : 'Noughts'}
          {first && ' · first move'}
        </div>
      </div>
    </div>
  )
}
