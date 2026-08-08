import { useState, useRef, useCallback, useEffect } from 'react'
import { Send, Square } from 'lucide-react'

/**
 * Composer — the message input area with send/stop controls.
 *
 * - When idle: shows a text input + send button
 * - When streaming: shows a stop button that triggers abort
 * - Auto-resizes the textarea as content grows (up to ~4 lines)
 * - Supports Enter to send, Shift+Enter for newline
 */
export default function Composer({ onSend, onStop, isStreaming, disabled }) {
  const [input, setInput] = useState('')
  const textareaRef = useRef(null)

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming || disabled) return
    onSend(trimmed)
    setInput('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [input, isStreaming, disabled, onSend])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }, [input])

  return (
    <div
      className="border-t border-[var(--color-border)] px-4 py-3 sm:px-6"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <div className="flex-1 flex items-end border border-[var(--color-border)] rounded-xl
                        bg-[var(--color-bg)] px-3.5 py-2.5 transition-colors duration-200
                        focus-within:border-[var(--color-primary)]">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the course…"
            rows={1}
            disabled={isStreaming || disabled}
            className="flex-1 bg-transparent border-none outline-none resize-none
                       text-[var(--text-body)] text-[var(--color-text-primary)]
                       placeholder:text-[var(--color-text-tertiary)]
                       disabled:opacity-50"
            style={{ minHeight: '24px', maxHeight: '120px' }}
            aria-label="Type your question"
          />
        </div>

        {isStreaming ? (
          <button
            onClick={onStop}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl
                       bg-[var(--color-text-primary)] text-[var(--color-bg)]
                       hover:opacity-80 transition-opacity duration-200"
            aria-label="Stop generating"
          >
            <Square size={16} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || disabled}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl
                       transition-all duration-200
                       disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              backgroundColor: input.trim() ? 'var(--color-primary)' : 'var(--color-surface-raised)',
              color: input.trim() ? 'white' : 'var(--color-text-tertiary)',
            }}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
