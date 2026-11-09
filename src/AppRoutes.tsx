import { Navigate, Route, Routes } from 'react-router'
import { HubScreen } from './hub/HubScreen.tsx'
import { GameRoute } from './screens/GameRoute.tsx'

/**
 * Every screen in the app, by web address. Kept apart from the browser
 * router in main.tsx so tests can render it at any address.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HubScreen />} />
      <Route path="/play/:variantId" element={<GameRoute />} />
      {/* Any other address goes back to the hub. Unknown variants are handled in GameRoute. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
