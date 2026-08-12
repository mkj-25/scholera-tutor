import scholeraLogo from '../../assets/scholera_logo.png'
import { useRef, useEffect } from 'react'
import {
  BookOpen,
  MessageSquare,
  GraduationCap,
  Moon,
  Sun,
  TrendingUp,
  X,
} from 'lucide-react'
import { lectures, totalSlides } from '../../lib/data'

// ── Progress Card ─────────────────────────────────────────────────────────────

function ProgressCard({ exploredSlides, savedCount, onClose }) {
  const cardRef = useRef(null)
  const exploredCount = exploredSlides?.size ?? 0
  const pct = totalSlides > 0 ? Math.round((exploredCount / totalSlides) * 100) : 0

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!cardRef.current?.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Per-week progress
  const weekStats = lectures.map((lec) => {
    const weekSlides = lec.slides.length
    const exploredWeek = lec.slides.filter((s) =>
      exploredSlides?.has(`${lec.week}:${s.slide_number}`)
    ).length
    const weekPct = weekSlides > 0 ? Math.round((exploredWeek / weekSlides) * 100) : 0
    return { week: lec.week, explored: exploredWeek, total: weekSlides, pct: weekPct }
  })

  // "What's next" — least explored week
  const nextWeek = weekStats.reduce((min, w) =>
    w.pct < min.pct ? w : min, weekStats[0])

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-label="Course Progress"
      aria-modal="true"
      className="absolute right-0 top-full mt-2 w-72 rounded-2xl border overflow-hidden z-50 progress-card-enter"
      style={{
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'var(--glass-border)',
        boxShadow: 'var(--shadow-glass)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <TrendingUp size={14} style={{ color: 'var(--color-primary)' }} />
          <span className="text-[12px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Course Progress
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-[var(--color-surface-raised)] transition-colors"
          style={{ color: 'var(--color-text-tertiary)' }}
          aria-label="Close progress card"
        >
          <X size={13} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Overall ring + pct */}
        <div className="flex items-center gap-4">
          {(() => {
            const r = 24, stroke = 3.5, vb = 60, cx = 30, cy = 30
            const circ = 2 * Math.PI * r
            const offset = circ - (pct / 100) * circ
            return (
              <svg width={vb} height={vb} viewBox={`0 0 ${vb} ${vb}`} className="flex-shrink-0">
                <circle cx={cx} cy={cy} r={r} fill="none"
                        stroke="var(--color-border)" strokeWidth={stroke} />
                <circle cx={cx} cy={cy} r={r} fill="none"
                        stroke="var(--color-primary)" strokeWidth={stroke}
                        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                        transform={`rotate(-90 ${cx} ${cy})`}
                        style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)' }} />
                <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
                      fontSize="11" fontWeight="700" fill="var(--color-text-primary)">
                  {pct}%
                </text>
              </svg>
            )
          })()}
          <div>
            <div className="text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {pct}% complete
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
              {exploredCount} / {totalSlides} slides explored
            </div>
            {/* --accent-saved: violet reinforces saved content's identity
                across the app — same color as the sidebar's concepts-saved stat. */}
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--accent-saved)' }}>
              {savedCount} concept{savedCount !== 1 ? 's' : ''} saved
            </div>
          </div>
        </div>

        {/* Per-week bars */}
        <div className="space-y-2.5">
          <div className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: 'var(--color-text-tertiary)' }}>
            By Week
          </div>
          {weekStats.map(({ week, explored, total, pct: wPct }) => (
            <div key={week}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Week {week}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                  {explored}/{total} slides · {wPct}%
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--color-border)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${wPct}%`,
                    /* --accent-success: per-week bars measure exploration progress
                       (completion state), not navigation or AI content. Green
                       distinguishes these from the blue overall-ring summary. */
                    backgroundColor: 'var(--accent-success)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* What's next */}
        <div
          className="px-3 py-2.5 rounded-xl border"
          style={{
            borderColor: 'var(--color-border-subtle)',
            backgroundColor: 'var(--color-surface-raised)',
          }}
        >
          <div className="text-[10px] font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
            What's next
          </div>
          <div className="text-[11px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {nextWeek.pct === 100
              ? '🎉 All weeks complete!'
              : `Continue Week ${nextWeek.week} — ${nextWeek.total - nextWeek.explored} slides remaining`}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Header ────────────────────────────────────────────────────────────────────

export default function Header({
  activeView = 'chat',
  onViewChange,
  theme = 'light',
  onToggleTheme,
  exploredSlides,
  savedCount,
  onOpenProgress,
  progressCardOpen,
  onCloseProgress,
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

  const progressRef = useRef(null)

  return (
    <header
      className="h-[68px] flex-shrink-0 flex items-center px-5 sm:px-7 relative z-30"
      style={{
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--glass-border)',
        boxShadow: '0 1px 12px rgba(16,24,40,0.06)',
      }}
    >
      {/* LEFT: Brand */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: 'rgba(170, 184, 255, 0.36)',
          border: '1.5px solid rgba(255, 255, 255, 0.24)',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
        }}
      >
        <img
          src={scholeraLogo}
          alt="Scholera"
          className="w-7 h-7 object-contain"
          style={{
            filter: 'brightness(7) invert(1)',
          }}
        />
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

        {/* Progress button */}
        <div className="relative" ref={progressRef}>
          <button
            id="progress-btn"
            onClick={onOpenProgress}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border
                       transition-all duration-200 hover:bg-[var(--color-surface-raised)]"
            style={{
              borderColor: progressCardOpen ? 'var(--color-primary)' : 'var(--color-border-subtle)',
              backgroundColor: progressCardOpen ? 'var(--color-primary-tint)' : 'transparent',
            }}
            aria-label={`View course progress: ${pct}%`}
            aria-expanded={progressCardOpen}
          >
            {/* Mini ring */}
            <svg width={vb} height={vb} viewBox={`0 0 ${vb} ${vb}`} className="flex-shrink-0">
              <circle cx={cx} cy={cy} r={r} fill="none"
                      stroke="var(--color-border)" strokeWidth={stroke} />
              <circle cx={cx} cy={cy} r={r} fill="none"
                      stroke="var(--color-primary)" strokeWidth={stroke}
                      strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                      transform={`rotate(-90 ${cx} ${cy})`}
                      style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)' }} />
              <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
                    fontSize="8" fontWeight="600" fill="var(--color-text-primary)">
                {pct}
              </text>
            </svg>
            <span className="hidden sm:block text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {pct}%
            </span>
          </button>

          {/* Progress Card */}
          {progressCardOpen && (
            <ProgressCard
              exploredSlides={exploredSlides}
              savedCount={savedCount}
              onClose={onCloseProgress}
            />
          )}
        </div>

        {/* Theme toggle */}
        <button
          id="theme-toggle-btn"
          onClick={onToggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center
                     transition-colors duration-200 hover:bg-[var(--color-surface-raised)]"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} color="#fffc97" /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  )
}