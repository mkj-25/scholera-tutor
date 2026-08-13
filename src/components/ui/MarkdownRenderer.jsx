import { useState, useCallback, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { Copy, Check } from 'lucide-react'

/**
 * theme light/dark mode.
 */
const codeTheme = {
  'pre[class*="language-"]': {
    background: 'transparent',
    margin: 0,
    padding: 0,
    fontSize: '0.8125rem',
    lineHeight: '1.6',
  },
  'code[class*="language-"]': {
    background: 'transparent',
    fontSize: '0.8125rem',
    lineHeight: '1.6',
    fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", monospace',
  },
  comment: { color: 'var(--color-text-tertiary)' },
  keyword: { color: 'var(--color-primary)' },
  string: { color: 'var(--color-success)' },
  number: { color: 'var(--color-warning)' },
  function: { color: 'var(--color-accent-cyan)' },
  'class-name': { color: 'var(--color-accent-cyan)' },
  operator: { color: 'var(--color-text-secondary)' },
  punctuation: { color: 'var(--color-text-secondary)' },
  builtin: { color: 'var(--color-primary)' },
  boolean: { color: 'var(--color-warning)' },
  property: { color: 'var(--color-text-primary)' },
  parameter: { color: 'var(--color-text-primary)' },
  decorator: { color: 'var(--color-warning)' },
}

/**
 * CopyButton - if any code is there in tutor's response
 */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API may not be available - fail silently
    }
  }, [text])

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium
                 transition-colors duration-200
                 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]
                 hover:bg-[var(--color-border-subtle)]"
      aria-label={copied ? 'Copied!' : 'Copy code'}
    >
      {copied ? (
        <>
          <Check size={13} />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy size={13} />
          <span>Copy</span>
        </>
      )}
    </button>
  )
}

/**
 * Custom components for react-markdown to handle code blocks, tables, etc.
 */
function makeComponents() {
  return {
    // Code blocks with syntax highlighting and copy button
    code({ children, className, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      const codeString = String(children).replace(/\n$/, '')

      if (match) {
        return (
          <div className="code-block-wrapper">
            <div className="code-block-header">
              <span>{match[1]}</span>
              <CopyButton text={codeString} />
            </div>
            <SyntaxHighlighter
              style={codeTheme}
              language={match[1]}
              PreTag="div"
              customStyle={{ background: 'transparent', padding: '1rem' }}
              {...props}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        )
      }

      // Inline code
      return (
        <code className={className} {...props}>
          {children}
        </code>
      )
    },

    // Tables with horizontal scroll wrapper
    table({ children }) {
      return (
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] my-3">
          <table>{children}</table>
        </div>
      )
    },

    // Paragraphs - prevent nesting block elements inside <p>
    p({ children }) {
      return <p>{children}</p>
    },
  }
}

/**
 * MarkdownRenderer - renders markdown content with LaTeX, code highlighting, and tables.
 *
 * Handles partial/streaming content defensively: if a render pass would error on
 * incomplete markdown, React's error boundary or the try-catch in remarkMath
 * will keep the last-good render visible.
 *
 * @param {string} content - markdown string to render
 * @param {boolean} isStreaming - if true, shows a blinking cursor at the end
 */
export default function MarkdownRenderer({ content, isStreaming = false }) {
  const components = useMemo(makeComponents, [])

  if (!content) return null

  return (
    <div className={`markdown-content ${isStreaming ? 'streaming-cursor' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
