import { useState, useRef, useCallback, useEffect } from 'react'
import { Send, Square } from 'lucide-react'

//Composer - floating glass input bar.

export default function Composer({ onSend, onStop, isStreaming, disabled }) {
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef(null)

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming || disabled) return
    onSend(trimmed)
    setInput('')
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
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px'
  }, [input])

  const hasInput = input.trim().length > 0

  return (
    <div className="px-4 pb-4 pt-2 sm:px-6">
      <div className="max-w-3xl mx-auto">

        {/* Floating glass card */}
        <div
          className="flex items-end gap-2 rounded-2xl px-3.5 py-2 transition-all duration-200"
          style={{
            backgroundColor: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 4px 24px rgba(16,24,40,0.10), 0 1px 4px rgba(16,24,40,0.06)',
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Ask anything about this course…"
            rows={1}
            disabled={isStreaming || disabled}
            className="flex-1 bg-transparent border-none outline-none resize-none disabled:opacity-40"
            style={{
              fontSize: 'var(--text-body)',
              color: 'var(--color-text-primary)',
              minHeight: '24px',
              maxHeight: '128px',
              lineHeight: '1.6',
              outline: 'none',
            }}
            aria-label="Type your question"
          />

          {/* Send / Stop */}
          {isStreaming ? (
            <button
              onClick={onStop}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl
                         transition-all duration-150 hover:opacity-80"
              style={{
                backgroundColor: 'var(--color-text-primary)',
                color: 'var(--color-bg)',
              }}
              aria-label="Stop generating"
              title="Stop"
            >
              <Square size={14} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!hasInput || disabled}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl
                         transition-all duration-150
                         disabled:opacity-25 disabled:cursor-not-allowed"
              style={{
                backgroundColor: hasInput ? 'var(--color-primary)' : 'var(--color-surface-raised)',
                color: hasInput ? 'white' : 'var(--color-text-tertiary)',
                boxShadow: hasInput ? '0 2px 8px rgba(37,99,235,0.28)' : 'none',
              }}
              aria-label="Send message"
              title="Send (Enter)"
            >
              <Send size={15} />
            </button>
          )}
        </div>

        {/* Hint row */}
        <div className="flex items-center justify-between mt-1.5 px-1">
          <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
            {isStreaming ? (
              <span className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
                Generating…
              </span>
            ) : (
              'Answers grounded in lecture material'
            )}
          </span>
          <span className="text-[10px] hidden sm:block" style={{ color: 'var(--color-text-tertiary)' }}>
            {isStreaming ? 'Click ■ to stop' : 'Enter to send · Shift+Enter for newline'}
          </span>
        </div>
      </div>
    </div>
  )
}
