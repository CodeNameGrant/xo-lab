import { Suspense } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router'
import { parseAiLevel } from '../game/ai.ts'
import { findVariant } from '../variants/registry.ts'
import { GameScreen } from './GameScreen.tsx'

/**
 * /play/:variantId — the game screen for a registered variant, or back to the hub for anything else.
 * `?ai=easy|medium|hard` gives Player 2 to the AI in a two-player variant (D-46).
 */
export function GameRoute() {
  const { variantId } = useParams()
  const [params] = useSearchParams()
  const entry = findVariant(variantId)
  if (!entry) return <Navigate to="/" replace />
  const ai = entry.info.players === 2 ? parseAiLevel(params.get('ai')) : null

  return (
    <Suspense
      fallback={<p className="flex min-h-dvh items-center justify-center text-ink-muted">Loading {entry.info.name}…</p>}
    >
      {/*
        key: switching variants, or who plays Player 2, starts a fresh screen: a new game with
        Player 1 to start, and the score back at 0 (D-48).
      */}
      <GameScreen key={`${entry.id}:${ai ?? 'person'}`} entry={entry} ai={ai} />
    </Suspense>
  )
}
