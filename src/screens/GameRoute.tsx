import { Suspense } from 'react'
import { Navigate, useParams } from 'react-router'
import { findVariant } from '../variants/registry.ts'
import { GameScreen } from './GameScreen.tsx'

/** /play/:variantId — the game screen for a registered variant, or back to the hub for anything else. */
export function GameRoute() {
  const { variantId } = useParams()
  const entry = findVariant(variantId)
  if (!entry) return <Navigate to="/" replace />

  return (
    <Suspense
      fallback={<p className="flex min-h-dvh items-center justify-center text-ink-muted">Loading {entry.info.name}…</p>}
    >
      {/* key: switching variants starts a fresh screen instead of reusing the old game's state. */}
      <GameScreen key={entry.id} entry={entry} />
    </Suspense>
  )
}
