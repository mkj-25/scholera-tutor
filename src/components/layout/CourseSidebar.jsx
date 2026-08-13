import { lectures } from '../../lib/data'
import mlBg from '../../assets/ml_bg.png'
import mlBg1 from '../../assets/ml_bg1.png'
import {
  ChevronRight,
  GraduationCap,
} from 'lucide-react'

export default function CourseSidebar({
  course,
  exploredSlides,
  selectedWeek,
  onSelectLecture,
  onViewChange,
  theme,
}) {
  const exploredCount =
    exploredSlides?.size ?? 0

  return (
    <aside
      className="h-full w-full flex flex-col overflow-hidden border-r"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* COURSE HEADER */}

      <div
        className="px-5 py-5 border-b flex-shrink-0"
        style={{
          borderColor: 'var(--color-border-subtle)',
          backgroundImage: `url(${theme === 'light' ? mlBg1 : mlBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div
          className="text-[10px] font-semibold tracking-widest uppercase mb-2"
          style={{
            color: 'var(--color-primary)',
          }}
        >
          {course?.code || 'CS 4780'}
        </div>

        <h2
          className="text-[17px] leading-snug font-semibold"
          style={{
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-serif)',
          }}
        >
          {course?.title ||
            'Machine Learning for Engineers'}
        </h2>

        <p
          className="text-xs mt-1.5"
          style={{
            color: 'var(--color-text-secondary)',
          }}
        >
          {course?.instructor ||
            'Dr. Elena Márquez'}
        </p>
      </div>

      {/* LECTURES */}

      <div className="flex-1 overflow-y-auto px-3 py-5">

        <div
          className="px-2 mb-3 text-[10px] font-semibold
                     tracking-widest uppercase"
          style={{
            color: 'var(--color-text-tertiary)',
          }}
        >
          Lectures
        </div>

        <div className="space-y-1.5">
          {lectures.map((lecture) => {
            const isSelected =
              selectedWeek === lecture.week

            const exploredInWeek =
              lecture.slides.filter((slide) =>
                exploredSlides?.has(
                  `${lecture.week}:${slide.slide_number}`
                )
              ).length

            const lectureProgress =
              lecture.slides.length > 0
                ? Math.round(
                    (exploredInWeek /
                      lecture.slides.length) *
                      100
                  )
                : 0

            return (
              <button
                key={lecture.lecture_id || lecture.week}
                type="button"
                onClick={() =>
                  onSelectLecture?.(
                    lecture.week
                  )
                }
                className={`
                  course-sidebar-lecture
                  w-full
                  text-left
                  relative
                  flex
                  items-start
                  gap-3
                  px-3
                  py-3
                  rounded-xl
                  border
                  transition-all
                  duration-200
                  group
                  ${
                    isSelected
                      ? 'course-sidebar-lecture-selected'
                      : 'hover:bg-[var(--color-surface-raised)]'
                  }
                `}
                style={{
                  backgroundColor: isSelected
                    ? 'var(--surface-deep)'
                    : 'transparent',

                  borderColor: isSelected
                    ? 'color-mix(in srgb, var(--color-primary) 25%, var(--color-border))'
                    : 'transparent',
                }}
              >
                {/* Selected left indicator */}

                {isSelected && (
                  <span
                    className="absolute left-0 top-2.5 bottom-2.5
                               w-[3px] rounded-r-full"
                    style={{
                      backgroundColor:
                        'var(--color-primary)',
                      boxShadow:
                        '0 0 10px color-mix(in srgb, var(--color-primary) 45%, transparent)',
                    }}
                  />
                )}

                {/* Week badge */}

                <div
                  className="w-9 h-9 rounded-xl flex-shrink-0
                             flex items-center justify-center
                             text-[10px] font-bold
                             transition-all duration-200"
                  style={{
                    backgroundColor: isSelected
                      ? 'var(--color-primary)'
                      : 'var(--color-surface-raised)',

                    color: isSelected
                      ? '#fff'
                      : 'var(--color-text-secondary)',

                    border: isSelected
                      ? '1px solid var(--color-primary)'
                      : '1px solid var(--color-border-subtle)',

                    boxShadow: isSelected
                      ? '0 4px 12px color-mix(in srgb, var(--color-primary) 22%, transparent)'
                      : 'none',
                  }}
                >
                  W{lecture.week}
                </div>

                {/* Lecture details */}

                <div className="flex-1 min-w-0 pt-0.5">

                  <div
                    className="flex items-center gap-1"
                  >
                    <span
                      className="text-sm font-semibold truncate"
                      style={{
                        color: isSelected
                          ? 'var(--color-primary)'
                          : 'var(--color-text-primary)',
                      }}
                    >
                      Week {lecture.week}
                    </span>

                    {isSelected && (
                      <ChevronRight
                        size={13}
                        className="flex-shrink-0"
                        style={{
                          color:
                            'var(--color-primary)',
                        }}
                      />
                    )}
                  </div>

                  <div
                    className="text-[11px] leading-snug
                               mt-0.5 line-clamp-2"
                    style={{
                      color:
                        'var(--color-text-tertiary)',
                    }}
                  >
                    {lecture.title}
                  </div>

                  {/* Progress */}

                  <div className="mt-2.5">

                    <div
                      className="flex items-center justify-between
                                 text-[9px] mb-1"
                    >
                      <span
                        style={{
                          color:
                            'var(--color-text-tertiary)',
                        }}
                      >
                        {exploredInWeek} /{' '}
                        {lecture.slides.length}{' '}
                        slides
                      </span>

                      {exploredInWeek > 0 && (
                        <span
                          style={{
                            /* --accent-success: the explored % is a completion
                               signal, not a nav label, so green is the right color. */
                            color: 'var(--accent-success)',
                          }}
                        >
                          {lectureProgress}%
                        </span>
                      )}
                    </div>

                    <div
                      className="h-1 rounded-full overflow-hidden"
                      style={{
                        backgroundColor:
                          'var(--color-border-subtle)',
                      }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${lectureProgress}%`,
                          backgroundColor:
                            'var(--color-primary)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

    </aside>
  )
}