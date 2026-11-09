import { Navigate, Route, Routes } from 'react-router'
import { HubScreen } from './hub/HubScreen.tsx'

/**
 * Every screen in the app, by web address. Kept apart from the browser
 * router in main.tsx so tests can render it at any address.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HubScreen />} />
      {/* Any address we don't know, including /play/<unknown variant>, goes back to the hub. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
