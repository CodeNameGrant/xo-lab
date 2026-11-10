import { chooseTheme, useTheme } from '../theme/theme.ts'
import { iconButton } from './classes.ts'
import { Icon } from './icon.tsx'

/**
 * The sun/moon button on the hub and in the game screen's top bar: shows the
 * theme it switches to, and saves the choice on the device.
 */
export function ThemeToggle() {
  const theme = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      className={iconButton}
      aria-label={`Switch to ${next} theme`}
      onClick={() => chooseTheme(next)}
    >
      <Icon name={next === 'light' ? 'lightTheme' : 'darkTheme'} />
    </button>
  )
}
