import { Link } from 'react-router'
import { playAddress } from '../ai/remembered.ts'
import { iconButton } from '../ui/classes.ts'
import { Icon } from '../ui/icon.tsx'
import { Tooltip } from '../ui/Tooltip.tsx'
import { ThemeToggle } from '../ui/ThemeToggle.tsx'
import { Mark } from '../ui/Mark.tsx'
import { variants } from '../variants/registry.ts'
import type { VariantInfo } from '../variants/types.ts'
import { useHubView } from './hubView.ts'

/** Every hub card, in either view. Dark has no panel shadows (artboard B), so the card gets a dim border instead. */
const card = 'rounded-card bg-surface text-ink shadow-board hover:text-ink dark:border dark:border-grid'

/**
 * The home screen: one card per registered variant, as a list or a grid (D-50). Uses only each
 * variant's info, so nothing else loads.
 */
export function HubScreen() {
  const [view, setView] = useHubView()
  const next = view === 'list' ? 'grid' : 'list'
  return (
    <main className="mx-auto max-w-110 px-6 py-8">
      <title>XO Lab</title>
      <header>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-[32px] font-bold">XO Lab</h1>
          <div className="flex gap-1">
            {/* Like the theme toggle, it shows the view it switches to. */}
            <Tooltip label={`Show as ${next}`} align="end">
              <button type="button" className={iconButton} aria-label={`Show as ${next}`} onClick={() => setView(next)}>
                <Icon name={next === 'grid' ? 'gridView' : 'listView'} />
              </button>
            </Tooltip>
            <ThemeToggle />
          </div>
        </div>
        <p className="mt-2 leading-normal text-ink-muted">
          Tic-tac-toe, and its stranger cousins. Pick a variant to play with a friend on this device, or against the AI.
        </p>
      </header>
      <ul className={view === 'grid' ? 'mt-6 grid grid-cols-3 gap-3' : 'mt-6 flex flex-col gap-3'}>
        {variants.map((variant) => (
          <li key={variant.id}>
            {view === 'grid' ? (
              // The grid: the picture over the name, three across.
              <Link
                to={playAddress(variant.id, variant.info.players)}
                className={`${card} flex h-full flex-col items-center gap-2 px-2 pt-4 pb-3`}
              >
                <Preview rows={variant.info.preview} neutral={variant.info.sharedMarks !== undefined} />
                <span className="text-center text-[15px] font-semibold">{variant.info.name}</span>
              </Link>
            ) : (
              <Link
                // A two-player variant opens with whoever last played Player 2: a person or the AI (D-49).
                to={playAddress(variant.id, variant.info.players)}
                className={`${card} flex min-h-11 items-center gap-4 px-4 py-3.5`}
              >
                <Preview rows={variant.info.preview} neutral={variant.info.sharedMarks !== undefined} />
                <span className="flex grow flex-col gap-0.5">
                  <span className="text-[17px] font-semibold">{variant.info.name}</span>
                  <span className="text-sm text-ink-muted">{variant.info.tagline}</span>
                </span>
                <Icon name="open" size={20} className="shrink-0 text-ink-muted" />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}

/** The hub card's picture is 56 px whatever the board, so pieces shrink as the board grows: 14 px on 3×3, 9 on 4×4, 7 on 5×5. */
function Preview({ rows, neutral }: { rows: VariantInfo['preview']; neutral: boolean }) {
  // A picture can be wider than it is tall (Pyramid's is 5 × 3). Its squares stay square: the
  // columns share the width, each row is as tall as a square is wide, and the rows sit centred.
  const columns = rows[0].length
  const across = Math.max(columns, rows.length)
  const piece = across >= 5 ? 7 : across === 4 ? 9 : 14
  return (
    <span
      className="grid size-14 shrink-0 content-center gap-0.5 rounded-[10px] bg-grid p-1"
      aria-hidden="true"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {rows
        .join('')
        .split('')
        .map((cell, index) => (
          // A space is a square that isn't there: an empty slot with no tile.
          <span
            key={index}
            className={`flex aspect-square items-center justify-center rounded-[3px] ${cell === ' ' ? '' : 'bg-surface'}`}
          >
            {(cell === 'X' || cell === 'O' || cell === 'S') && (
              <Mark player={cell} tone={neutral ? 'neutral' : cell} size={piece} stroke={3} />
            )}
          </span>
        ))}
    </span>
  )
}
