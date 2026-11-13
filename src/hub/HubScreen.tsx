import { Link } from 'react-router'
import { Icon } from '../ui/icon.tsx'
import { ThemeToggle } from '../ui/ThemeToggle.tsx'
import { Mark } from '../ui/Mark.tsx'
import { variants } from '../variants/registry.ts'
import type { VariantInfo } from '../variants/types.ts'

/** The home screen: one card per registered variant. Uses only each variant's info, so nothing else loads. */
export function HubScreen() {
  return (
    <main className="mx-auto max-w-110 px-6 py-8">
      <title>XO Lab</title>
      <header>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-[32px] font-bold">XO Lab</h1>
          <ThemeToggle />
        </div>
        <p className="mt-2 leading-normal text-ink-muted">
          Tic-tac-toe, and its stranger cousins. Pick a variant to play on this device.
        </p>
      </header>
      <ul className="mt-6 flex flex-col gap-3">
        {variants.map((variant) => (
          <li key={variant.id}>
            <Link
              to={`/play/${variant.id}`}
              // Dark has no panel shadows (artboard B), so the card gets a dim border instead.
              className="flex min-h-11 items-center gap-4 rounded-card bg-surface px-4 py-3.5 text-ink shadow-board hover:text-ink dark:border dark:border-grid"
            >
              <Preview rows={variant.info.preview} neutral={variant.info.sharedMarks !== undefined} />
              <span className="flex grow flex-col gap-0.5">
                <span className="text-[17px] font-semibold">{variant.info.name}</span>
                <span className="text-sm text-ink-muted">{variant.info.tagline}</span>
              </span>
              <Icon name="open" size={20} className="shrink-0 text-ink-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

/** The hub card's picture is 56 px whatever the board, so pieces shrink as the board grows: 14 px on 3×3, 9 on 4×4, 7 on 5×5. */
function Preview({ rows, neutral }: { rows: VariantInfo['preview']; neutral: boolean }) {
  const piece = rows.length >= 5 ? 7 : rows.length === 4 ? 9 : 14
  return (
    <span
      className="grid size-14 shrink-0 gap-0.5 rounded-[10px] bg-grid p-1"
      aria-hidden="true"
      style={{
        gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows.length}, minmax(0, 1fr))`,
      }}
    >
      {rows
        .join('')
        .split('')
        .map((cell, index) => (
          <span key={index} className="flex items-center justify-center rounded-[3px] bg-surface">
            {(cell === 'X' || cell === 'O' || cell === 'S') && (
              <Mark player={cell} tone={neutral ? 'neutral' : cell} size={piece} stroke={3} />
            )}
          </span>
        ))}
    </span>
  )
}
