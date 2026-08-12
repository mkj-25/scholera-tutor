import {
  useEffect,
  useRef,
} from 'react'
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
} from 'lucide-react'
import {
  lectures,
  totalSlides,
} from '../../lib/data'
import tabBg from '../../assets/tab_bg.png'

/**
 * CourseView — shows all lectures and their slides with per-week progress.
 * Auto-scrolls to selectedWeek when navigating from the CourseSidebar.
 * Clicking a slide opens the SourcePanel via onOpenSlide.
 */
export default function CourseView({
  exploredSlides,
  selectedWeek,
  onOpenSlide,
}) {
  // ============================================================
  // TOTAL PROGRESS
  // ============================================================

  const exploredCount =
    exploredSlides?.size ?? 0

  const courseProgress =
    totalSlides > 0
      ? Math.round(
          (exploredCount / totalSlides) * 100
        )
      : 0

  // ============================================================
  // AUTO-SCROLL TO SELECTED WEEK
  // ============================================================

  // Map week number -> section DOM element
  const weekRefs = useRef({})

  useEffect(() => {
    if (selectedWeek == null) return
    const el = weekRefs.current[selectedWeek]
    if (!el) return

    // Small delay so the view has mounted/transitioned in
    const timer = setTimeout(() => {
      const HEADER_OFFSET = 80 // px — clears the fixed header
      const rect = el.getBoundingClientRect()
      const scrollParent = el.closest('.overflow-y-auto')
      if (scrollParent) {
        const parentRect = scrollParent.getBoundingClientRect()
        const target =
          scrollParent.scrollTop +
          (rect.top - parentRect.top) -
          HEADER_OFFSET
        scrollParent.scrollTo({
          top: Math.max(0, target),
          behavior: 'smooth',
        })
      } else {
        // Fallback: window scroll
        const y =
          window.scrollY +
          rect.top -
          HEADER_OFFSET
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
      }
    }, 80)

    return () => clearTimeout(timer)
  }, [selectedWeek])

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {/* Course hero — title, description, and overall progress bar */}

      <section
        className="relative overflow-hidden
                   border-b"
        style={{
          borderColor:
            'var(--color-border-subtle)',
        }}
      >
        {/* Subtle grid */}

        <div
          className="absolute inset-0 bg-dot-grid
                     pointer-events-none"
          style={{
            opacity: 0.55,
          }}
        />

        <div
          className="relative max-w-5xl mx-auto
                     px-6 sm:px-8
                     pt-10 pb-8"
        >
          {/* Eyebrow */}

          <div
            className="flex items-center gap-2
                       text-[10px] font-semibold
                       tracking-widest uppercase mb-3"
            style={{
              color: 'var(--color-primary)',
            }}
          >
            <BookOpen size={13} />

            Course
          </div>

          {/* Heading */}

          <h1
            className="text-3xl sm:text-4xl
                       font-semibold leading-tight"
            style={{
              color:
                'var(--color-text-primary)',
              fontFamily:
                'var(--font-serif)',
            }}
          >
            Machine Learning for Engineers
          </h1>

          <p
            className="text-sm mt-2 max-w-2xl"
            style={{
              color:
                'var(--color-text-secondary)',
            }}
          >
            Explore the lecture material and
            open individual slides to study the
            concepts covered in the course.
          </p>

          {/* Progress */}

          <div className="mt-7 max-w-xl">

            <div
              className="flex items-center
                         justify-between mb-2"
            >
              <span
                className="text-xs font-medium"
                style={{
                  color:
                    'var(--color-text-secondary)',
                }}
              >
                Course progress
              </span>

              <span
                className="text-xs font-semibold"
                style={{
                  color:
                    'var(--color-primary)',
                }}
              >
                {exploredCount} / {totalSlides}{' '}
                slides · {courseProgress}%
              </span>
            </div>

            <div
              className="h-2 rounded-full
                         overflow-hidden"
              style={{
                backgroundColor:
                  'var(--color-surface-raised)',
                border:
                  '1px solid var(--color-border-subtle)',
              }}
            >
              <div
                className="h-full rounded-full
                           transition-all duration-700"
                style={{
                  width: `${courseProgress}%`,
                  background:
                    'linear-gradient(90deg, var(--color-primary), var(--color-accent-cyan))',
                  boxShadow:
                    '0 0 12px color-mix(in srgb, var(--color-primary) 25%, transparent)',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Lecture list */}

      <div
        className="max-w-5xl mx-auto
                   px-6 sm:px-8
                   py-8 space-y-5"
      >
        {lectures.map((lecture) => {
          const isSelected =
            selectedWeek === lecture.week

          const exploredInWeek =
            lecture.slides.filter((slide) =>
              exploredSlides?.has(
                `${lecture.week}:${slide.slide_number}`
              )
            ).length

          const weekProgress =
            lecture.slides.length > 0
              ? Math.round(
                  (exploredInWeek /
                    lecture.slides.length) *
                    100
                )
              : 0

          return (
            <section
              key={
                lecture.lecture_id ||
                lecture.week
              }
              id={`course-week-${lecture.week}`}
              ref={(el) => {
                weekRefs.current[lecture.week] = el
              }}
              className={`
                course-week-card
                rounded-2xl
                border
                overflow-hidden
                transition-all
                duration-500
                ${
                  isSelected
                    ? 'course-week-selected'
                    : ''
                }
              `}
              style={{
                backgroundColor:
                  isSelected
                    ? 'var(--color-primary-tint)'
                    : 'var(--color-surface)',

                borderColor:
                  isSelected
                    ? 'color-mix(in srgb, var(--color-primary) 35%, var(--color-border))'
                    : 'var(--color-border-subtle)',

                boxShadow:
                  isSelected
                    ? '0 8px 30px color-mix(in srgb, var(--color-primary) 10%, transparent)'
                    : 'none',
              }}
            >
              {/* Lecture header */}

              <div
                className="px-5 sm:px-6 py-5
                           flex items-start gap-4"
                style={{
                  backgroundImage: `url(${tabBg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {/* Week badge */}

                <div
                  className="w-11 h-11
                             rounded-xl
                             flex-shrink-0
                             flex items-center
                             justify-center
                             font-bold text-xs"
                  style={{
                    backgroundColor:
                      isSelected
                        ? 'var(--color-primary)'
                        : 'var(--color-surface-raised)',

                    color:
                      isSelected
                        ? '#fff'
                        : 'var(--color-text-secondary)',

                    border:
                      isSelected
                        ? '1px solid var(--color-primary)'
                        : '1px solid var(--color-border-subtle)',

                    boxShadow:
                      isSelected
                        ? '0 5px 16px color-mix(in srgb, var(--color-primary) 22%, transparent)'
                        : 'none',
                  }}
                >
                  W{lecture.week}
                </div>

                {/* Header content */}

                <div className="flex-1 min-w-0">

                  <div className="flex items-center gap-2">

                    <h2
                      className="text-lg font-semibold"
                      style={{
                        color: '#000',
                      }}
                    >
                      Week {lecture.week}
                    </h2>

                    {isSelected && (
                      <span
                        className="px-2 py-0.5
                                   rounded-full
                                   text-[9px]
                                   font-semibold
                                   uppercase
                                   tracking-wider"
                        style={{
                          color:
                            'var(--color-primary)',
                          backgroundColor:
                            'var(--color-primary-tint)',
                          border:
                            '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)',
                        }}
                      >
                        Selected
                      </span>
                    )}

                  </div>

                  <p
                    className="text-sm mt-1"
                    style={{
                      color: '#000',
                    }}
                  >
                    {lecture.title}
                  </p>

                  {/* Week progress */}

                  <div className="mt-3 max-w-sm">

                    <div
                      className="flex items-center
                                 justify-between
                                 text-[10px] mb-1"
                    >
                      <span
                        style={{
                          color: '#000',
                        }}
                      >
                        {exploredInWeek} of{' '}
                        {lecture.slides.length}{' '}
                        slides explored
                      </span>

                      <span
                        style={{
                          color: '#000',
                        }}
                      >
                        {weekProgress}%
                      </span>
                    </div>

                    <div
                      className="h-1 rounded-full
                                 overflow-hidden"
                      style={{
                        backgroundColor:
                          'var(--color-border-subtle)',
                      }}
                    >
                      <div
                        className="h-full rounded-full
                                   transition-all duration-500"
                        style={{
                          width: `${weekProgress}%`,
                          backgroundColor:
                            'var(--color-primary)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Slides grid */}

              <div
                className="border-t px-4 sm:px-6
                           py-4"
                style={{
                  borderColor:
                    'var(--color-border-subtle)',
                }}
              >
                <div
                  className="text-[10px]
                             font-semibold
                             tracking-widest
                             uppercase mb-3"
                  style={{
                    color:
                      'var(--color-text-tertiary)',
                  }}
                >
                  Slides ·{' '}
                  {lecture.slides.length}
                </div>

                <div className="grid gap-2">

                  {lecture.slides.map(
                    (slide) => {
                      const key =
                        `${lecture.week}:${slide.slide_number}`

                      const explored =
                        exploredSlides?.has(key)

                      return (
                        <button
                          key={
                            slide.slide_number
                          }
                          type="button"
                          onClick={() =>
                            onOpenSlide?.(
                              lecture,
                              slide
                            )
                          }
                          className="course-slide-item
                                     group
                                     w-full
                                     flex
                                     items-center
                                     gap-3
                                     text-left
                                     px-3.5
                                     py-3
                                     rounded-xl
                                     border
                                     transition-all
                                     duration-200"
                          style={{
                            backgroundColor:
                              'var(--color-surface)',

                            borderColor:
                              'var(--color-border-subtle)',
                          }}
                        >
                          {/* Icon */}

                          <div
                            className="w-8 h-8
                                       rounded-lg
                                       flex-shrink-0
                                       flex items-center
                                       justify-center"
                            style={{
                              backgroundColor:
                                explored
                                  ? 'var(--color-primary-tint)'
                                  : 'var(--color-surface-raised)',

                              color:
                                explored
                                  ? 'var(--color-primary)'
                                  : 'var(--color-text-tertiary)',
                            }}
                          >
                            {explored ? (
                              <CheckCircle2
                                size={15}
                              />
                            ) : (
                              <FileText
                                size={15}
                              />
                            )}
                          </div>

                          {/* Slide info */}

                          <div className="flex-1 min-w-0">

                            <div
                              className="text-xs
                                         font-semibold"
                              style={{
                                color:
                                  'var(--color-text-primary)',
                              }}
                            >
                              Slide{' '}
                              {
                                slide.slide_number
                              }
                            </div>

                            <div
                              className="text-xs
                                         truncate
                                         mt-0.5"
                              style={{
                                color:
                                  'var(--color-text-secondary)',
                              }}
                            >
                              {slide.title}
                            </div>
                          </div>

                          {/* Explored label */}

                          {explored && (
                            <span
                              className="hidden sm:block
                                         text-[9px]
                                         font-medium"
                              style={{
                                color:
                                  'var(--color-primary)',
                              }}
                            >
                              Explored
                            </span>
                          )}

                          {/* Arrow */}

                          <ChevronRight
                            size={15}
                            className="flex-shrink-0
                                       transition-transform
                                       duration-200
                                       group-hover:translate-x-0.5"
                            style={{
                              color:
                                'var(--color-text-tertiary)',
                            }}
                          />
                        </button>
                      )
                    }
                  )}

                </div>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}