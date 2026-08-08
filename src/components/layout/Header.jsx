import ThemeToggle from './ThemeToggle'
import GlassNav from './GlassNav'
import { Users } from 'lucide-react'

/**
 * Header — compact, sticky header bar.
 *
 * Layout: Scholera wordmark | course identity | glass nav (center) | demo switcher + student + theme toggle
 */
export default function Header({
  activeView,
  onViewChange,
  theme,
  onToggleTheme,
  studentName,
  onSwitchConversation,
}) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 h-14 flex-shrink-0"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Left — Brand + Course */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            S
          </div>
          <span
            className="font-semibold hidden sm:inline"
            style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-body)' }}
          >
            Scholera
          </span>
        </div>
        <div
          className="hidden md:flex items-center gap-1.5"
          style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}
        >
          <span style={{ color: 'var(--color-border)' }}>·</span>
          <span className="font-medium">CS 4780</span>
          <span style={{ color: 'var(--color-border)' }}>·</span>
          <span className="truncate max-w-[180px]">Machine Learning for Engineers</span>
        </div>
      </div>

      {/* Center — Glass Nav (desktop) */}
      <div className="hidden sm:block">
        <GlassNav activeView={activeView} onViewChange={onViewChange} />
      </div>

      {/* Right — Demo switcher + student + theme */}
      <div className="flex items-center gap-2">
        {/* Demo conversation switcher — small, labeled */}
        {onSwitchConversation && (
          <button
            onClick={onSwitchConversation}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border
                       transition-all duration-200"
            style={{
              fontSize: 'var(--text-caption)',
              color: 'var(--color-text-secondary)',
              borderColor: 'var(--color-border)',
            }}
            title="Switch between populated and empty conversation (demo)"
            aria-label="Switch demo conversation"
          >
            <Users size={13} />
            <span className="font-medium">{studentName || 'Student'}</span>
          </button>
        )}

        {!onSwitchConversation && studentName && (
          <span
            className="hidden sm:inline"
            style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}
          >
            {studentName}
          </span>
        )}

        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  )
}
