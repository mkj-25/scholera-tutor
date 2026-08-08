import { Sun, Moon } from 'lucide-react'

/**
 * ThemeToggle — switches between light and dark themes.
 * Uses a sun/moon icon with a smooth crossfade.
 */
export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="relative flex items-center justify-center w-9 h-9 rounded-full
                 hover:bg-[var(--color-surface-raised)] transition-colors duration-200"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon size={18} className="text-[var(--color-text-secondary)]" />
      ) : (
        <Sun size={18} className="text-[var(--color-text-secondary)]" />
      )}
    </button>
  )
}
