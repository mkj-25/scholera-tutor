import { Lightbulb, BookOpen, PanelRightClose, PanelRightOpen, TrendingUp } from 'lucide-react'
import { lectures, totalSlides } from '../../lib/data'

/**
 * LearningSidebar — right column showing learning summary + compact progress.
 */
export default function LearningSidebar({
  exploredSlides,
  savedCount,
  recentCitations,
  isCollapsed,
  onToggleCollapse,
  onViewChange,
  onOpenProgress,
}) {
  const exploredCount = exploredSlides.size
  const pct = totalSlides > 0 ? Math.round((exploredCount / totalSlides) * 100) : 0

  // Compact ring
  const r = 18, stroke = 3, vb = 48, cx = 24, cy = 24
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center pt-4 px-1 border-l border-[var(--color-border)] bg-[var(--color-surface)]">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-[var(--color-surface-raised)]
                     text-[var(--color-text-tertiary)] transition-colors duration-200"
          aria-label="Expand learning sidebar"
        >
          <PanelRightOpen size={18} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full border-l border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[var(--color-border-subtle)]">
        <span className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)]">
          Your Learning
        </span>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-[var(--color-surface-raised)]
                     text-[var(--color-text-tertiary)] transition-colors duration-200"
          aria-label="Collapse learning sidebar"
        >
          <PanelRightClose size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 pt-3">
        {/* Compact progress widget */}
        <button
          onClick={onOpenProgress}
          className="w-full flex items-center gap-3 p-3 rounded-xl border text-left
                     transition-all duration-200 group
                     hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-tint)]"
          style={{
            borderColor: 'var(--color-border-subtle)',
            backgroundColor: 'var(--color-surface-raised)',
          }}
          aria-label={`View course progress: ${pct}%`}
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
            {/* Center % */}
            <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
                  fontSize="10" fontWeight="600" fill="var(--color-text-primary)">
              {pct}
            </text>
          </svg>

          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
              Course Progress
            </div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
              {exploredCount}/{totalSlides} slides explored
            </div>
          </div>

          <TrendingUp size={13} className="opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      style={{ color: 'var(--color-primary)' }} />
        </button>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2.5 rounded-xl border"
               style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-surface-raised)' }}>
            <div className="text-xl font-semibold leading-none" style={{ color: 'var(--color-text-primary)' }}>
              {exploredCount}
            </div>
            <div className="mt-0.5 text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
              slides explored
            </div>
          </div>
          <button
            onClick={() => onViewChange('learn')}
            className="p-2.5 rounded-xl border text-left transition-all duration-200
                       hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-tint)]"
            style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-surface-raised)' }}
            aria-label="Open notebook"
          >
            <div className="text-xl font-semibold leading-none" style={{ color: 'var(--color-text-primary)' }}>
              {savedCount}
            </div>
            <div className="mt-0.5 text-[10px] group-hover:text-[var(--color-primary)] transition-colors"
                 style={{ color: 'var(--color-text-tertiary)' }}>
              concepts saved
            </div>
          </button>
        </div>

        {/* Recently explored */}
        {recentCitations.length > 0 && (
          <div>
            <h3 className="text-[10px] font-semibold tracking-wider uppercase mb-2"
                style={{ color: 'var(--color-text-tertiary)' }}>
              Recently Explored
            </h3>
            <div className="space-y-0.5">
              {recentCitations.slice(0, 5).map((item, i) => (
                <div
                  key={i}
                  className="px-2 py-1.5 rounded-lg hover:bg-[var(--color-surface-raised)] transition-colors duration-200"
                >
                  <div className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 mt-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: 'var(--color-primary)' }} />
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium truncate"
                           style={{ color: 'var(--color-text-secondary)' }}>
                        {item.title}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                        Week {item.week} · Slide {item.slideNumber}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        
      </div>
    </div>
  )
}
