import { lectures, totalSlides } from '../../lib/data'

/**
 * CourseSidebar — left column showing course navigation with progress indicators.
 */
export default function CourseSidebar({ course, exploredSlides, onViewChange }) {
  const exploredCount = exploredSlides.size
  const pct = totalSlides > 0 ? Math.round((exploredCount / totalSlides) * 100) : 0

  return (
    <div className="flex flex-col h-full border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Course identity */}
      <div className="px-4 pt-4 pb-3 border-b border-[var(--color-border-subtle)]">
        <div className="text-[10px] font-semibold tracking-wider uppercase mb-1"
             style={{ color: 'var(--color-primary)' }}>
          {course?.code || 'CS 4780'}
        </div>
        <div className="text-[13px] font-semibold leading-snug mb-0.5"
             style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>
          {course?.title || 'Machine Learning for Engineers'}
        </div>
        <div className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
          {course?.instructor || 'Dr. Elena Márquez'}
        </div>
      </div>

      {/* Lecture list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <div className="text-[10px] font-semibold tracking-wider uppercase px-2 mb-2"
             style={{ color: 'var(--color-text-tertiary)' }}>
          Lectures
        </div>

        {lectures.map((lecture) => {
          const exploredInWeek = lecture.slides.filter(
            s => exploredSlides.has(`${lecture.week}:${s.slide_number}`)
          ).length
          const wPct = lecture.slides.length > 0
            ? Math.round((exploredInWeek / lecture.slides.length) * 100) : 0
          const started = exploredInWeek > 0

          return (
            <button
              key={lecture.lecture_id}
              onClick={() => onViewChange('course')}
              className="w-full flex items-start gap-2.5 px-2.5 py-2.5 rounded-xl text-left
                         hover:bg-[var(--color-surface-raised)] transition-colors duration-200 group"
            >
              {/* Week badge */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                style={{
                  backgroundColor: started ? 'var(--color-primary-tint)' : 'var(--color-surface-raised)',
                  color: started ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                }}
              >
                W{lecture.week}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium leading-snug mb-0.5"
                     style={{ color: 'var(--color-text-primary)' }}>
                  Week {lecture.week}
                </div>
                <div className="text-[10px] truncate mb-1.5"
                     style={{ color: 'var(--color-text-tertiary)' }}>
                  {started
                    ? `${exploredInWeek} / ${lecture.slides.length} slides`
                    : `${lecture.slides.length} slides`}
                </div>

                {/* Progress bar */}
                <div className="h-1 rounded-full overflow-hidden"
                     style={{ backgroundColor: 'var(--color-border)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${wPct}%`,
                      backgroundColor: 'var(--color-primary)',
                      minWidth: started ? '4px' : '0',
                    }}
                  />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Bottom: overall count */}
      <div
        className="px-4 py-3 border-t text-[11px]"
        style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-tertiary)' }}
      >
        {exploredCount} of {totalSlides} slides explored
      </div>
    </div>
  )
}
