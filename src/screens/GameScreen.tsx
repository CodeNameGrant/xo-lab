import { use, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { playerName, type Player } from '../game/rules.ts'
import { canUndo, currentState, newGame, playMove, startGame, undoMove } from '../game/session.ts'
import { BackIcon, NewGameIcon, UndoIcon } from '../ui/icons.tsx'
import { Mark } from '../ui/Mark.tsx'
import type { AnyBoard, AnyRules, VariantEntry } from '../variants/types.ts'
import { HowToPlay } from './HowToPlay.tsx'
import './GameScreen.css'

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
    <main className="game-screen">
      <title>{`${entry.info.name} · XO Lab`}</title>

      <header className="top-bar">
        <Link to="/" className="icon-button" aria-label="Back to all variants">
          <BackIcon />
        </Link>
        <div className="top-bar-title">
          <div className="top-bar-label">Variant</div>
          <h1 className="top-bar-name">{entry.info.name}</h1>
        </div>
        <HowToPlay info={entry.info} />
      </header>

      <div className="player-cards">
        {(['X', 'O'] as const).map((player) => (
          <PlayerCard
            key={player}
            player={player}
            active={!over && turn === player}
            first={game.firstPlayer === player}
          />
        ))}
      </div>

      <div className="board-area">
        <Board state={state} rules={rules} onMove={(move: unknown) => setGame((g) => playMove(rules, g, move))} />
      </div>

      <p className="status" aria-live="polite">
        {status}
      </p>

      <div className="game-actions">
        <button
          type="button"
          className="action-button"
          disabled={!canUndo(game)}
          onClick={() => setGame(undoMove)}
        >
          <UndoIcon />
          Undo
        </button>
        <button type="button" className="action-button primary" onClick={() => setGame(newGame)}>
          <NewGameIcon />
          New game
        </button>
      </div>
    </main>
  )
}

function PlayerCard({ player, active, first }: { player: Player; active: boolean; first: boolean }) {
  return (
    <div className="player-card" data-player={player} data-active={active || undefined}>
      <Mark player={player} size={28} stroke={10} />
      <div className="player-text">
        <div className="player-name">
          {playerName(player)}
          {active && <span className="visually-hidden"> (to move)</span>}
        </div>
        <div className="player-role">
          {player === 'X' ? 'Crosses' : 'Noughts'}
          {first && ' · first move'}
        </div>
      </div>
    </div>
  )
}
