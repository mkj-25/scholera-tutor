import {
  Sparkles,
  ArrowRight,
} from 'lucide-react'

import {
  STARTER_PROMPTS,
} from '../../lib/matchScenario'

import {
  totalSlides,
  lectures,
} from '../../lib/data'

export default function EmptyState({
  course,
  onSendPrompt,
}) {
  return (
    <div
      className="
        min-h-full
        flex items-center justify-center
        px-4 sm:px-6
        py-12
      "
    >
      <div
        className="
          w-full
          max-w-[760px]
          text-center
        "
      >
        {/* Course badge */}
        <div
          className="
            inline-flex
            items-center gap-2
            px-2.5 py-1
            rounded-full
            mb-5
            text-[10px]
            font-semibold
            tracking-widest
            uppercase
          "
          style={{
            backgroundColor:
              'var(--color-primary-tint)',
            color:
              'var(--color-primary)',
          }}
        >
          <Sparkles size={12} />
          CS 4780
        </div>

        {/* Title */}
        <h1
          className="
            font-serif
            text-4xl
            sm:text-5xl
            font-semibold
            tracking-[-0.03em]
            leading-[1.08]
            mb-4
          "
          style={{
            fontFamily:
              'var(--font-serif)',
            color:
              'var(--color-text-primary)',
          }}
        >
          {course?.title ||
            'Machine Learning for Engineers'}
        </h1>

        {/* Instructor */}
        <p
          className="
            text-sm
            mb-3
          "
          style={{
            color:
              'var(--color-text-secondary)',
          }}
        >
          {course?.instructor ||
            'Dr. Elena Márquez'}
        </p>

        {/* Description */}
        <p
          className="
            text-sm
            max-w-[480px]
            mx-auto
            mb-9
          "
          style={{
            color:
              'var(--color-text-tertiary)',
          }}
        >
          Ask questions, revisit concepts,
          and trace every answer back to
          your professor's lecture material.
        </p>

        {/* Prompt cards */}
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-2.5
            text-left
          "
        >
          {STARTER_PROMPTS.map((item) => (
            <button
              key={item.scenario}
              onClick={() =>
                onSendPrompt?.(item.prompt)
              }
              className="
                group
                flex items-center gap-3
                px-4 py-3.5
                rounded-xl
                border
                text-left
                transition-all duration-200
                hover:-translate-y-[1px]
                hover:shadow-[var(--shadow-card)]
              "
              style={{
                backgroundColor:
                  'var(--color-surface)',
                borderColor:
                  'var(--color-border-subtle)',
              }}
              aria-label={`Ask: ${item.prompt}`}
            >
              <div className="flex-1 min-w-0">
                <div
                  className="
                    text-[10px]
                    font-semibold
                    tracking-wider
                    uppercase
                    mb-1
                  "
                  style={{
                    color:
                      'var(--color-text-tertiary)',
                  }}
                >
                  Week {item.week}
                </div>

                <div
                  className="
                    text-[var(--text-body-sm)]
                    font-medium
                    leading-snug
                  "
                  style={{
                    color:
                      'var(--color-text-primary)',
                  }}
                >
                  {item.label}
                </div>
              </div>

              <ArrowRight
                size={15}
                className="
                  flex-shrink-0
                  transition-all
                  duration-200
                  group-hover:translate-x-0.5
                "
                style={{
                  color:
                    'var(--color-text-tertiary)',
                }}
              />
            </button>
          ))}
        </div>

        {/* Course stats */}
        <div
          className="
            flex items-center justify-center
            gap-2
            mt-8
            text-[11px]
          "
          style={{
            color:
              'var(--color-text-tertiary)',
          }}
        >
          <span>
            {lectures.length} lectures
          </span>

          <span>·</span>

          <span>
            {totalSlides} slides
          </span>

          <span>·</span>

          <span>
            Course-grounded answers
          </span>
        </div>
      </div>
    </div>
  )
}