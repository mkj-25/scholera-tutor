import { AlertTriangle, RotateCcw, StopCircle } from 'lucide-react'
import MarkdownRenderer from '../ui/MarkdownRenderer'

/**
 * StreamingMessage — renders a message that is currently being streamed.
 *
 * Handles all streaming states:
 * - connecting: "Preparing your answer…" with thinking dots
 * - streaming: progressively rendered content with blinking cursor
 * - done: final content (transition to AssistantMessage happens at the parent)
 * - stopped: partial content with "Generation stopped" notice
 * - error: partial content preserved + inline error with Retry button
 */
export default function StreamingMessage({ content, status, error, onRetry }) {
  return (
    <div className="mb-6">
      {/* Tutor indicator */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold text-white"
             style={{ backgroundColor: 'var(--color-primary)' }}>
          S
        </div>
        <span className="text-[var(--text-caption)] font-medium text-[var(--color-text-secondary)]">
          Scholera Tutor
        </span>
      </div>

      <div className="pl-8">
        {/* Connecting / thinking state */}
        {status === 'connecting' && !content && (
          <div className="flex items-center gap-1.5 text-[var(--text-body-sm)] text-[var(--color-text-secondary)]">
            <span>Preparing your answer</span>
            <span className="flex gap-0.5">
              <span className="thinking-dot w-1 h-1 rounded-full bg-[var(--color-text-tertiary)]" />
              <span className="thinking-dot w-1 h-1 rounded-full bg-[var(--color-text-tertiary)]" />
              <span className="thinking-dot w-1 h-1 rounded-full bg-[var(--color-text-tertiary)]" />
            </span>
          </div>
        )}

        {/* Streamed content */}
        {content && (
          <MarkdownRenderer
            content={content}
            isStreaming={status === 'streaming'}
          />
        )}

        {/* Stopped by user */}
        {status === 'stopped' && (
          <div className="flex items-center gap-1.5 mt-3 text-[var(--text-caption)] text-[var(--color-text-tertiary)]">
            <StopCircle size={13} />
            <span>Generation stopped</span>
          </div>
        )}

        {/* Error — mid-stream failure */}
        {status === 'error' && (
          <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg
                          border border-[var(--color-error)] bg-[var(--color-error-tint)]"
               style={{ borderColor: 'rgba(220,38,38,0.3)' }}>
            <AlertTriangle size={14} className="text-[var(--color-error)] flex-shrink-0" />
            <span className="text-[var(--text-body-sm)] text-[var(--color-error)]">
              {error || 'Connection lost while generating.'}
            </span>
            {onRetry && (
              <button
                onClick={onRetry}
                className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-md
                           text-[var(--text-caption)] font-medium
                           text-[var(--color-primary)] hover:bg-[var(--color-primary-tint)]
                           transition-colors duration-200"
                aria-label="Retry generation"
              >
                <RotateCcw size={13} />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
