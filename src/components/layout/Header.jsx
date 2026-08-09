import { useState, useRef, useEffect } from 'react'
import {
  BookOpen,
  MessageSquare,
  GraduationCap,
  Moon,
  Sun,
  LogOut,
  ChevronDown,
  TrendingUp,
} from 'lucide-react'
import { lectures, totalSlides } from '../../lib/data'

export default function Header({
  activeView = 'chat',
  onViewChange,
  theme = 'light',
  onToggleTheme,
  user,
  onLogout,
  exploredSlides,
  savedCount,
  onOpenProgress,
}) {
  const navItems = [
    { id: 'chat',   label: 'Chat',   icon: MessageSquare },
    { id: 'learn',  label: 'Learn',  icon: BookOpen },
    { id: 'course', label: 'Course', icon: GraduationCap },
  ]

  const exploredCount = exploredSlides?.size ?? 0
  const pct = totalSlides > 0 ? Math.round((exploredCount / totalSlides) * 100) : 0

  // Small ring params
  const r = 10, stroke = 2.5, vb = 28, cx = 14, cy = 14
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  // Close menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return
    const handler = (e) => {
      if (!userMenuRef.current?.contains(e.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [userMenuOpen])

  return (
    <header
      className="h-[60px] flex-shrink-0 flex items-center px-4 sm:px-5 relative z-30"
      style={{
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--glass-border)',
        boxShadow: '0 1px 12px rgba(16,24,40,0.06)',
      }}
    >
      {/* LEFT: Brand */}
      <div className="flex items-center gap-2.5 min-w-0 flex-shrink-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{
            backgroundColor: 'var(--color-primary)',
            boxShadow: '0 2px 8px rgba(37,99,235,0.22)',
          }}
        >
          S
        </div>
        <div className="hidden sm:block min-w-0">
          <div className="font-semibold text-[13px] leading-none" style={{ color: 'var(--color-text-primary)' }}>
            Scholera
          </div>
          <div className="text-[10px] mt-0.5 truncate max-w-[180px]" style={{ color: 'var(--color-text-tertiary)' }}>
            CS 4780 · Machine Learning
          </div>
        </div>
      </div>

      {/* CENTER: Nav pill */}
      <nav
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 p-1 rounded-xl"
        style={{
          backgroundColor: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border-subtle)',
        }}
        aria-label="Main navigation"
      >
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = activeView === id
          return (
            <button
              key={id}
              onClick={() => onViewChange?.(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                backgroundColor: active ? 'var(--color-surface)' : 'transparent',
                color: active ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                boxShadow: active ? 'var(--shadow-xs)' : 'none',
              }}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={14} strokeWidth={active ? 2.2 : 1.8} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          )
        })}
      </nav>

      {/* RIGHT: Controls */}
      <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
        

        {/* Theme toggle */}
        <button
          id="theme-toggle-btn"
          onClick={onToggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center
                     transition-colors duration-200 hover:bg-[var(--color-surface-raised)]"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            id="user-menu-btn"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-lg border
                       transition-all duration-200 hover:bg-[var(--color-surface-raised)]"
            style={{ borderColor: 'var(--color-border-subtle)' }}
            aria-label="Open user menu"
            aria-expanded={userMenuOpen}
          >
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {user?.initials || 'U'}
            </div>
            <span className="hidden sm:block text-[12px] font-medium max-w-[80px] truncate"
                  style={{ color: 'var(--color-text-secondary)' }}>
              {user?.name?.split(' ')[0] || 'Student'}
            </span>
            <ChevronDown
              size={12}
              className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
              style={{ color: 'var(--color-text-tertiary)' }}
            />
          </button>

          {/* Dropdown */}
          {userMenuOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border overflow-hidden z-50"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-glass)',
              }}
            >
              {/* User info */}
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: 'var(--color-border-subtle)' }}
              >
                <div className="text-[12px] font-semibold leading-snug"
                     style={{ color: 'var(--color-text-primary)' }}>
                  {user?.name || 'Student'}
                </div>
                <div className="text-[11px] mt-0.5 truncate"
                     style={{ color: 'var(--color-text-tertiary)' }}>
                  {user?.email || ''}
                </div>
              </div>

              

              {/* Logout */}
              <button
                id="logout-btn"
                onClick={() => { setUserMenuOpen(false); onLogout?.() }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs
                           transition-colors duration-150 hover:bg-[var(--color-error-tint)]
                           border-t"
                style={{
                  color: 'var(--color-error)',
                  borderColor: 'var(--color-border-subtle)',
                }}
              >
                <LogOut size={14} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}