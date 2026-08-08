import { useMemo } from 'react'
import { lectures, totalSlides } from '../../lib/data'
import { X } from 'lucide-react'

/**
 * ProgressOverview — full-screen modal showing detailed course progress.
 * Opened by clicking the progress indicator in header/sidebar.
 */
export default function ProgressOverview({ isOpen, onClose, exploredSlides, savedCount }) {
  if (!isOpen) return null

  const exploredCount = exploredSlides.size
  const pct = totalSlides > 0 ? Math.round((exploredCount / totalSlides) * 100) : 0

  const weekStats = useMemo(() => {
    return lectures.map(lecture => {
      const exploredInWeek = lecture.slides.filter(
        s => exploredSlides.has(`${lecture.week}:${s.slide_number}`)
      ).length
      const weekPct = lecture.slides.length > 0
        ? Math.round((exploredInWeek / lecture.slides.length) * 100)
        : 0
      return {
        week: lecture.week,
        title: lecture.title,
        total: lecture.slides.length,
        explored: exploredInWeek,
        pct: weekPct,
      }
    })
  }, [exploredSlides])

  // Ring params
  const r = 60
  const stroke = 7
  const viewBox = 148
  const cx = viewBox / 2
  const cy = viewBox / 2
  const circumference = 2 * Math.PI * r
  const strokeDashoffset = circumference - (pct / 100) * circumference

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 transition-opacity duration-200"
        style={{ background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="fixed inset-x-4 top-[50%] -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2
                   z-50 w-full sm:max-w-md rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          boxShadow: '0 20px 60px rgba(16,24,40,0.15)',
          maxHeight: '88vh',
          overflowY: 'auto',
        }}
        role="dialog"
        aria-label="Course progress overview"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b sticky top-0"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <div>
            <div className="text-[10px] font-semibold tracking-wider uppercase mb-0.5"
                 style={{ color: 'var(--color-text-tertiary)' }}>
              CS 4780
            </div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Course Progress
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200
                       hover:bg-[var(--color-surface-raised)]"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label="Close progress overview"
          >
            <X size={17} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Circular progress */}
          <div className="flex justify-center">
            <div className="relative">
              <svg width={viewBox} height={viewBox} viewBox={`0 0 ${viewBox} ${viewBox}`}>
                {/* Track */}
                <circle cx={cx} cy={cy} r={r} fill="none"
                        stroke="var(--color-border)" strokeWidth={stroke} />
                {/* Glow */}
                <circle cx={cx} cy={cy} r={r} fill="none"
                        stroke="var(--color-primary)" strokeWidth={stroke}
                        strokeOpacity={0.08} strokeDasharray={circumference}
                        strokeDashoffset={0} transform={`rotate(-90 ${cx} ${cy})`} />
                {/* Arc */}
                <circle cx={cx} cy={cy} r={r} fill="none"
                        stroke="var(--color-primary)" strokeWidth={stroke}
                        strokeLinecap="round" strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        transform={`rotate(-90 ${cx} ${cy})`}
                        style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.16,1,0.3,1)' }} />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold tracking-tight"
                     style={{ color: 'var(--color-text-primary)' }}>
                  {pct}%
                </div>
                <div className="text-[11px] mt-1 font-medium"
                     style={{ color: 'var(--color-text-tertiary)' }}>
                  Course progress
                </div>
              </div>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: exploredCount, label: 'Slides explored' },
              { value: totalSlides - exploredCount, label: 'Remaining' },
              { value: savedCount, label: 'Concepts saved' },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="text-center p-3 rounded-xl border"
                style={{
                  borderColor: 'var(--color-border-subtle)',
                  backgroundColor: 'var(--color-surface-raised)',
                }}
              >
                <div className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {value}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Per-week breakdown */}
          <div>
            <div className="text-[10px] font-semibold tracking-wider uppercase mb-3"
                 style={{ color: 'var(--color-text-tertiary)' }}>
              Course Breakdown
            </div>
            <div className="space-y-4">
              {weekStats.map(({ week, title, total, explored, pct: wPct }) => (
                <div key={week}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <div className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                        Week {week}
                      </div>
                      <div className="text-[11px] truncate max-w-[220px]"
                           style={{ color: 'var(--color-text-tertiary)' }}>
                        {title}
                      </div>
                    </div>
                    <span className="text-xs font-semibold ml-2 flex-shrink-0"
                          style={{ color: wPct > 0 ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}>
                      {explored}/{total}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'var(--color-border)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${wPct}%`,
                        backgroundColor: 'var(--color-primary)',
                        minWidth: wPct > 0 ? '6px' : '0',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
