import { MessageSquare, BookOpen, GraduationCap } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'course', label: 'Course', icon: GraduationCap },
]

/**
 * GlassNav — the floating glass navigation control.
 *
 * Desktop: a horizontal pill floating in the header area.
 * Mobile: rendered separately via MobileNav as a bottom bar.
 *
 * The active indicator is a blue pill that slides behind the active item.
 */
export default function GlassNav({ activeView, onViewChange }) {
  const activeIndex = NAV_ITEMS.findIndex(item => item.id === activeView)

  return (
    <nav
      className="glass rounded-full px-1 py-1 flex items-center gap-0.5 relative"
      style={{ boxShadow: 'var(--shadow-glass)' }}
      aria-label="Primary navigation"
    >
      {/* Sliding active indicator */}
      <div
        className="absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-out"
        style={{
          width: `${100 / NAV_ITEMS.length}%`,
          left: `calc(${activeIndex * (100 / NAV_ITEMS.length)}% + 2px)`,
          width: `calc(${100 / NAV_ITEMS.length}% - 4px)`,
          backgroundColor: 'var(--color-primary-tint)',
        }}
        aria-hidden="true"
      />

      {NAV_ITEMS.map(item => {
        const Icon = item.icon
        const isActive = activeView === item.id
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`
              relative z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full
              text-[var(--text-body-sm)] font-medium transition-colors duration-200
              ${isActive
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }
            `}
            aria-current={isActive ? 'page' : undefined}
            aria-label={`Navigate to ${item.label}`}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

/**
 * MobileNav — bottom floating glass navigation for mobile.
 * Full-width with labels always visible.
 */
export function MobileNav({ activeView, onViewChange }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]
                 flex items-center justify-around sm:hidden"
      style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.06)' }}
      aria-label="Primary navigation"
    >
      {NAV_ITEMS.map(item => {
        const Icon = item.icon
        const isActive = activeView === item.id
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`
              flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl
              transition-colors duration-200 min-w-[60px]
              ${isActive
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--color-text-tertiary)]'
              }
            `}
            aria-current={isActive ? 'page' : undefined}
            aria-label={`Navigate to ${item.label}`}
          >
            <Icon size={20} />
            <span className="text-[11px] font-medium">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
