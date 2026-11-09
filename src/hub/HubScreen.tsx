import { Link } from 'react-router'
import { ChevronRightIcon } from '../ui/icons.tsx'
import { Mark } from '../ui/Mark.tsx'
import { variants } from '../variants/registry.ts'
import type { VariantInfo } from '../variants/types.ts'
import './HubScreen.css'

/** The home screen: one card per registered variant. Uses only each variant's info, so nothing else loads. */
export function HubScreen() {
  return (
    <main className="hub">
      <title>XO Lab</title>
      <header className="hub-header">
        <h1>XO Lab</h1>
        <p>Tic-tac-toe, and its stranger cousins. Pick a variant to play on this device.</p>
      </header>
      <ul className="variant-list">
        {variants.map((variant) => (
          <li key={variant.id}>
            <Link to={`/play/${variant.id}`} className="variant-card">
              <Preview rows={variant.info.preview} />
              <span className="variant-text">
                <span className="variant-name">{variant.info.name}</span>
                <span className="variant-tagline">{variant.info.tagline}</span>
              </span>
              <ChevronRightIcon />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

function Preview({ rows }: { rows: VariantInfo['preview'] }) {
  return (
    <span className="variant-preview" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${rows.length}, 1fr)` }}>
      {rows.join('').split('').map((cell, index) => (
        <span key={index} className="variant-preview-cell">
          {(cell === 'X' || cell === 'O') && <Mark player={cell} size={14} stroke={12} />}
        </span>
      ))}
    </span>
  )
}
