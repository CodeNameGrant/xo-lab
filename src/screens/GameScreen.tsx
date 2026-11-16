import { use, useCallback, useEffect, useMemo, useRef, useState, type Ref } from 'react'
import { Link, useSearchParams } from 'react-router'
import { askAi } from '../ai/askAi.ts'
import { rememberPlayerTwo } from '../ai/remembered.ts'
import { AI_LEVEL_NAMES, type AiLevel } from '../game/ai.ts'
import { playerName, playersOf, type Outcome, type Player } from '../game/rules.ts'
import { addResult, describeScore, NO_SCORE } from '../game/score.ts'
import { currentState, newGame, playMove, startGame, type Game } from '../game/session.ts'
import { iconButton } from '../ui/classes.ts'
import { Icon } from '../ui/icon.tsx'
import { Mark } from '../ui/Mark.tsx'
import { NumberPiece } from '../ui/NumberPiece.tsx'
import { ThemeToggle } from '../ui/ThemeToggle.tsx'
import { Tooltip } from '../ui/Tooltip.tsx'
import type { AnyBoard, AnyRules, NumberSide, VariantEntry, VariantInfo } from '../variants/types.ts'
import { HowToPlay } from './HowToPlay.tsx'
import { PlayerTwoMenu } from './PlayerTwoMenu.tsx'

/** The AI's move appears no sooner than this after the person's, so both can be seen landing (D-47). */
const AI_PAUSE_MS = 400

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
export function GameScreen({ entry, ai }: { entry: VariantEntry; ai: AiLevel | null }) {
  const { rules, Board } = use(loadVariant(entry))
  const [game, setGame] = useState(() => startGame<unknown>())
  // Kept beside the game, never in it, and only while this screen is open (D-42).
  const [score, setScore] = useState(NO_SCORE)
  const [, setParams] = useSearchParams()

  const state = useMemo(() => currentState(rules, game), [rules, game])
  const outcome = rules.outcome(state)
  const turn = rules.currentPlayer(state)
  const over = outcome.kind !== 'in-progress'
  const winner = outcome.kind === 'won' ? outcome.winner : null
  const players = playersOf(entry.info.players)
  /** Player 2 is the AI's seat against the AI (D-46). */
  const aiThinking = ai !== null && !over && turn === 'O'
  const name = (player: Player) => (ai !== null && player === 'O' ? 'AI' : playerName(player))

  /**
   * Records `next` as the game and, if it has ended, adds the result to the score.
   * useCallback keeps it the same function from render to render while `rules` is, so the
   * effect below, which lists it, doesn't rerun just because the screen rendered again.
   */
  const commit = useCallback(
    (next: Game<unknown>) => {
      setGame(next)
      setScore((s) => addResult(s, rules.outcome(currentState(rules, next))))
    },
    [rules],
  )

  /** A move from the board. Ignored while the AI is thinking: the board is the AI's then. */
  function play(move: unknown) {
    if (aiThinking) return
    const next = playMove(rules, game, move)
    if (next !== game) commit(next)
  }

  // On the AI's turn, ask it for a move and play it, no sooner than AI_PAUSE_MS after the
  // person's move (D-47). If the game changes first (New game, or the screen closes), the
  // cleanup marks this answer stale and it is dropped.
  useEffect(() => {
    if (!aiThinking) return
    let live = true
    let timer: ReturnType<typeof setTimeout> | undefined
    const asked = Date.now()
    askAi(entry.id, game, ai).then(
      (move) => {
        if (!live) return
        timer = setTimeout(() => commit(playMove(rules, game, move)), Math.max(0, AI_PAUSE_MS - (Date.now() - asked)))
      },
      (error: unknown) => console.error('The AI could not choose a move', error),
    )
    return () => {
      live = false
      clearTimeout(timer)
    }
  }, [aiThinking, ai, entry.id, game, rules, commit])

  /*
   * The rules the board sees. While the AI is thinking, no move is legal for the person, so
   * every square is aria-disabled, as the board would draw it at the end of a game, without
   * the board knowing anything about the AI.
   */
  const boardRules = useMemo(() => (aiThinking ? { ...rules, legalMoves: () => [] } : rules), [rules, aiThinking])

  /**
   * Choosing who plays Player 2 changes the address, which starts a fresh screen (D-48), and is
   * remembered on the device, so the next variant opened from the hub starts with it (D-49).
   */
  function choosePlayerTwo(level: AiLevel | null) {
    rememberPlayerTwo(level)
    setParams(level ? { ai: level } : {}, { replace: true })
  }

  const status =
    outcome.kind === 'won'
      ? `${name(outcome.winner)} wins! ${describeScore(score, players, name)}`
      : outcome.kind === 'draw'
        ? `It's a draw. ${describeScore(score, players, name)}`
        : aiThinking
          ? 'AI is thinking'
          : `${name(turn)} to move`

  return (
    <main className="mx-auto flex min-h-dvh max-w-110 flex-col gap-6 px-6 pt-4 pb-8">
      <title>{`${entry.info.name} · XO Lab`}</title>

      {/* Equal outer columns keep the variant name centred, with one button on the left and two on the right. */}
      <header className="grid h-12 grid-cols-[1fr_auto_1fr] items-center">
        <Tooltip label="Back to all variants" align="start" className="justify-self-start">
          <Link to="/" className={iconButton} aria-label="Back to all variants">
            <Icon name="back" />
          </Link>
        </Tooltip>
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
          {players.map((player) =>
            // In a two-player variant, Player 2's card also chooses a person or the AI (D-48).
            player === 'O' && players.length === 2 ? (
              <PlayerTwoCard
                key={player}
                ai={ai}
                onChoose={choosePlayerTwo}
                look={cardLook(player, outcome, turn)}
                starter={game.firstPlayer === player}
                wins={score.wins[player]}
                sharedMarks={entry.info.sharedMarks}
                numbers={numberSide(entry.info, game.firstPlayer === player)}
              />
            ) : (
              <PlayerCard
                key={player}
                player={player}
                name={playerName(player)}
                look={cardLook(player, outcome, turn)}
                starter={game.firstPlayer === player}
                wins={score.wins[player]}
                sharedMarks={entry.info.sharedMarks}
                numbers={numberSide(entry.info, game.firstPlayer === player)}
                className={player === 'S' ? 'col-span-2 w-[calc(50%-6px)] justify-self-center' : ''}
              />
            ),
          )}
        </div>
        {entry.info.canDraw !== false && (
          <p className="text-center text-[13px] text-ink-muted">
            {score.draws === 1 ? '1 draw' : `${score.draws} draws`}
          </p>
        )}
      </div>

      <div className="flex grow items-center justify-center">
        <Board state={state} rules={boardRules} onMove={play} />
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
  /** "Player 1", or "AI" for Player 2 against the AI. */
  readonly name: string
  readonly look: CardLook
  /** This player made the first move of this game. */
  readonly starter: boolean
  /** Games this player has won since the screen opened. */
  readonly wins: number
  /** The variant's shared marks, if its players share them, drawn in this player's colour. */
  readonly sharedMarks?: VariantInfo['sharedMarks']
  /** This game's numbers for this player, in a numbers variant (D-57): they swap with each new game. */
  readonly numbers?: NumberSide
  /** The detail line in place of "Noughts" or the shared marks' detail: the AI's level. */
  readonly detail?: string
  /** Makes the card a button that opens Player 2's menu (D-48). */
  readonly chooser?: { readonly open: boolean; readonly onToggle: () => void }
  /** The card's button, when it has a `chooser`. React 19 passes `ref` as an ordinary prop. */
  readonly ref?: Ref<HTMLButtonElement>
  /** For layout only: where the card sits in the grid. */
  readonly className?: string
}

/*
 * The card's parts are spans, not divs, because the card can be a button, which may hold
 * only text-level elements; `block` and `flex` give the spans the same layout.
 */
function PlayerCard({
  player,
  name,
  look,
  starter,
  wins,
  sharedMarks,
  numbers,
  detail,
  chooser,
  ref,
  className,
}: PlayerCardProps) {
  const role = detail ?? numbers?.detail ?? (sharedMarks ? sharedMarks.detail : ROLE[player])
  const line = look === 'won' ? 'Wins!' : look === 'draw' ? 'Draw' : role
  // While its menu is open, the card takes its Turn border, so the menu reads as coming from it.
  const colours = chooser?.open ? CARD.turn[player] : CARD[look][player]
  const classes = `flex items-center gap-1.5 rounded-card border-2 px-1.75 py-3 motion-safe:transition-[border-color,box-shadow,background-color,opacity] motion-safe:duration-200 ${colours} ${className ?? ''}`

  const content = (
    <>
      {numbers ? (
        // A sample of the numbers this player plays this game, in their colour.
        <span className="flex w-7 shrink-0 justify-center gap-0.5">
          {numbers.sample.map((number) => (
            <NumberPiece key={number} value={number} tone={player} size={18} />
          ))}
        </span>
      ) : sharedMarks ? (
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
      <span className="block min-w-0 grow">
        <span className="flex items-center gap-1 text-[15px] font-semibold">
          {name}
          {chooser && <Icon name="chooser" size={14} className="-ml-0.25 shrink-0 text-ink-muted" />}
          {starter && <Icon name="starter" size={13} className="shrink-0 text-ink-muted" />}
          {starter && <span className="sr-only">, started this game</span>}
          {look === 'turn' && <span className="sr-only"> (to move)</span>}
        </span>
        <span className={`block text-[13px] ${look === 'won' ? 'font-semibold text-ink' : 'text-ink-muted'}`}>
          {line}
        </span>
      </span>
      <span
        className={`ml-0.5 flex h-6.5 min-w-6.5 shrink-0 items-center justify-center rounded-score px-1.5 text-[15px] font-semibold tabular-nums dark:font-bold ${look === 'won' ? 'bg-surface' : SCORE_BOX[player]}`}
      >
        {/* A new key on each change remounts the number, so its pop plays again. */}
        <span key={wins} className="motion-safe:animate-place">
          {wins}
        </span>
        <span className="sr-only">{wins === 1 ? ' win' : ' wins'}</span>
      </span>
      {chooser && <span className="sr-only">. Change who plays Player 2</span>}
    </>
  )

  if (!chooser) return <div className={classes}>{content}</div>
  return (
    <button
      ref={ref}
      type="button"
      aria-haspopup="menu"
      aria-expanded={chooser.open}
      onClick={chooser.onToggle}
      className={`${classes} w-full text-left`}
    >
      {content}
    </button>
  )
}

interface PlayerTwoCardProps extends Omit<
  PlayerCardProps,
  'player' | 'name' | 'detail' | 'chooser' | 'ref' | 'className'
> {
  /** The AI's level, or null when a person plays Player 2. */
  readonly ai: AiLevel | null
  /** Called with a different choice: a level, or null for a person. */
  readonly onChoose: (level: AiLevel | null) => void
}

/** Player 2's card in a two-player variant: tapping it opens the menu choosing a person or the AI (D-48). */
function PlayerTwoCard({ ai, onChoose, ...card }: PlayerTwoCardProps) {
  const [open, setOpen] = useState(false)
  const cardRef = useRef<HTMLButtonElement>(null)

  function close(returnFocus: boolean) {
    setOpen(false)
    if (returnFocus) cardRef.current?.focus()
  }

  return (
    <div className="relative">
      <PlayerCard
        {...card}
        player="O"
        name={ai ? 'AI' : playerName('O')}
        detail={ai ? AI_LEVEL_NAMES[ai] : undefined}
        chooser={{ open, onToggle: () => setOpen((o) => !o) }}
        ref={cardRef}
        className="h-full"
      />
      {open && (
        <PlayerTwoMenu
          current={ai}
          anchor={cardRef}
          onChoose={(level) => {
            close(true)
            if (level !== ai) onChoose(level)
          }}
          onClose={close}
        />
      )}
    </div>
  )
}

/** In a numbers variant, the card for the starter or for the other player this game (D-57). */
function numberSide(info: VariantInfo, isStarter: boolean): NumberSide | undefined {
  if (!info.numberSides) return undefined
  return isStarter ? info.numberSides.starter : info.numberSides.other
}
