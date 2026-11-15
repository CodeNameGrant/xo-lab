import { chooseTheme, useTheme } from '../theme/theme.ts'
import { iconButton } from './classes.ts'
import { Icon } from './icon.tsx'
import { Tooltip } from './Tooltip.tsx'

/**
 * The sun/moon button on the hub and in the game screen's top bar: shows the
 * theme it switches to, and saves the choice on the device.
 */
export function ThemeToggle() {
  const theme = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  const label = `Switch to ${next} theme`
  return (
    // Always the rightmost button, so its tooltip lines up with its right edge.
    <Tooltip label={label} align="end">
      <button type="button" className={iconButton} aria-label={label} onClick={() => chooseTheme(next)}>
        <Icon name={next === 'light' ? 'lightTheme' : 'darkTheme'} />
      </button>
    </Tooltip>
  )
}
