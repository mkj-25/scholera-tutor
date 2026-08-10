import { useState, useRef, useEffect, useCallback } from 'react'
import {
  BookOpen,
  FileText,
  Trash2,
  Lightbulb,
  Plus,
  Pencil,
  X,
  Save,
  StickyNote,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Type,
  Link2,
  Strikethrough,
} from 'lucide-react'
import { resolveCitation } from '../../lib/resolveCitation'
import { lectures } from '../../lib/data'

// ─────────────────────────────────────────────────────────────
//  WYSIWYG TOOLBAR DEFINITION
// ─────────────────────────────────────────────────────────────

// Each button calls a handler in the editor.
// Some use execCommand, headings use insertHTML.
const TOOLBAR_GROUPS = [
  [
    { id: 'h1',         label: 'Heading 1',    icon: null,           shortText: 'H1' },
    { id: 'h2',         label: 'Heading 2',    icon: null,           shortText: 'H2' },
    { id: 'h3',         label: 'Heading 3',    icon: null,           shortText: 'H3' },
  ],
  [
    { id: 'bold',       label: 'Bold',         icon: Bold                             },
    { id: 'italic',     label: 'Italic',       icon: Italic                           },
    { id: 'underline',  label: 'Underline',    icon: Underline                        },
    { id: 'strikethrough', label: 'Strikethrough', icon: Strikethrough               },
  ],
  [
    { id: 'insertUnorderedList', label: 'Bullet list',   icon: List                  },
    { id: 'insertOrderedList',   label: 'Numbered list', icon: ListOrdered           },
    { id: 'blockquote',          label: 'Quote',         icon: Quote                 },
  ],
  [
    { id: 'code',       label: 'Inline code',  icon: Code                             },
    { id: 'hr',         label: 'Divider',      icon: Minus                            },
  ],
]

// ─────────────────────────────────────────────────────────────
//  WYSIWYG EDITOR (contenteditable)
// ─────────────────────────────────────────────────────────────

/**
 * RichEditor — a contenteditable-based WYSIWYG editor.
 *
 * Content is stored as HTML. The toolbar buttons call document.execCommand
 * (for inline formats + lists) or inject semantic HTML (for headings, code,
 * blockquote, hr) at the current selection.
 *
 * Props:
 *   html         — current HTML content string
 *   onChange     — called with new HTML string whenever content changes
 *   placeholder  — placeholder text
 */
function RichEditor({ html, onChange, placeholder }) {
  const editorRef = useRef(null)
  // Track whether we're in a composition session (CJK/autocorrect)
  const composingRef = useRef(false)
  // Suppress the first onInput that fires when we set innerHTML externally
  const externalSetRef = useRef(false)

  // Push incoming html prop into the DOM only when it changes from the outside
  // (e.g. opening a different note). We skip this while the user is typing.
  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    // Compare sanitised to avoid cursor-jumping on every keystroke
    if (el.innerHTML !== html) {
      externalSetRef.current = true
      el.innerHTML = html || ''
    }
  }, [html])

  // Auto-focus when mounted
  useEffect(() => {
    editorRef.current?.focus()
  }, [])

  const emitChange = useCallback(() => {
    const el = editorRef.current
    if (!el) return
    onChange(el.innerHTML)
  }, [onChange])

  const handleInput = useCallback(() => {
    if (externalSetRef.current) { externalSetRef.current = false; return }
    if (!composingRef.current) emitChange()
  }, [emitChange])

  const handleCompositionStart = () => { composingRef.current = true }
  const handleCompositionEnd   = () => { composingRef.current = false; emitChange() }

  // Apply a toolbar action at the current selection
  const applyFormat = useCallback((id) => {
    const el = editorRef.current
    if (!el) return
    el.focus()

    switch (id) {
      case 'h1':
      case 'h2':
      case 'h3': {
        const tag = id.toUpperCase() // H1 H2 H3
        document.execCommand('formatBlock', false, tag)
        break
      }
      case 'blockquote': {
        document.execCommand('formatBlock', false, 'BLOCKQUOTE')
        break
      }
      case 'code': {
        // Wrap selection in <code>. If nothing selected, insert placeholder.
        const sel = window.getSelection()
        if (!sel || sel.rangeCount === 0) break
        const range = sel.getRangeAt(0)
        const selectedText = range.toString()
        const codeEl = document.createElement('code')
        codeEl.style.fontFamily = '"SF Mono", "Fira Code", monospace'
        codeEl.style.fontSize   = '0.875em'
        codeEl.style.padding    = '0.1em 0.35em'
        codeEl.style.borderRadius = '4px'
        codeEl.style.backgroundColor = 'var(--color-surface-raised)'
        codeEl.style.border   = '1px solid var(--color-border-subtle)'
        codeEl.style.color    = 'var(--color-text-primary)'
        codeEl.textContent    = selectedText || 'code'
        range.deleteContents()
        range.insertNode(codeEl)
        // Move cursor to end of inserted node
        range.setStartAfter(codeEl)
        range.collapse(true)
        sel.removeAllRanges()
        sel.addRange(range)
        break
      }
      case 'hr': {
        document.execCommand('insertHTML', false,
          '<hr style="border:none;border-top:1px solid var(--color-border);margin:1rem 0"><br>')
        break
      }
      default:
        // bold, italic, underline, strikethrough, insertUnorderedList, insertOrderedList
        document.execCommand(id, false, null)
        break
    }
    emitChange()
  }, [emitChange])

  // Handle Enter inside a blockquote — exit on double Enter (blank line)
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      const sel = window.getSelection()
      if (!sel || !sel.rangeCount) return
      // If inside a blockquote and the current block is empty, exit the blockquote
      const block = sel.getRangeAt(0).startContainer.parentElement?.closest('blockquote')
      if (block) {
        const range = sel.getRangeAt(0)
        const text  = range.startContainer.textContent || ''
        if (text.trim() === '') {
          e.preventDefault()
          document.execCommand('formatBlock', false, 'P')
        }
      }
    }

    // Tab → indent
    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;')
    }
  }, [])

  const isEmpty = !html || html.replace(/<[^>]*>/g, '').trim() === ''

  return (
    <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
      {/* Placeholder */}
      {isEmpty && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            padding: '20px 24px',
            pointerEvents: 'none',
            fontSize: 'var(--text-body)',
            color: 'var(--color-text-tertiary)',
            lineHeight: 1.7,
            userSelect: 'none',
          }}
        >
          {placeholder || 'Start writing…'}
        </div>
      )}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
        spellCheck
        style={{
          outline: 'none',
          minHeight: '100%',
          padding: '20px 24px 40px',
          fontSize: 'var(--text-body)',
          lineHeight: 1.75,
          color: 'var(--color-text-primary)',
          caretColor: 'var(--color-primary)',
          overflowY: 'auto',
          height: '100%',
          boxSizing: 'border-box',
          wordBreak: 'break-word',
        }}
        className="wysiwyg-editor"
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  TOOLBAR
// ─────────────────────────────────────────────────────────────

function FormatToolbar({ onFormat }) {
  return (
    <div
      className="flex items-center gap-px flex-wrap flex-shrink-0"
      style={{
        padding: '4px 8px',
        borderBottom: '1px solid var(--color-border-subtle)',
        backgroundColor: 'var(--color-surface-raised)',
      }}
    >
      {TOOLBAR_GROUPS.map((group, gi) => (
        <div key={gi} className="flex items-center gap-px">
          {group.map((btn) => {
            const Icon = btn.icon
            return (
              <button
                key={btn.id}
                onMouseDown={(e) => {
                  // Prevent blur on the contenteditable before execCommand fires
                  e.preventDefault()
                  onFormat(btn.id)
                }}
                title={btn.label}
                aria-label={btn.label}
                className="flex items-center justify-center rounded-md transition-colors duration-150
                           hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]"
                style={{
                  width: 30,
                  height: 28,
                  color: 'var(--color-text-secondary)',
                  fontSize: btn.shortText ? 11 : undefined,
                  fontWeight: btn.shortText ? 700 : undefined,
                  fontFamily: btn.shortText ? 'var(--font-sans)' : undefined,
                  flexShrink: 0,
                }}
              >
                {Icon ? <Icon size={14} strokeWidth={1.8} /> : btn.shortText}
              </button>
            )
          })}
          {/* Separator between groups */}
          {gi < TOOLBAR_GROUPS.length - 1 && (
            <div
              style={{
                width: 1,
                height: 18,
                backgroundColor: 'var(--color-border-subtle)',
                margin: '0 4px',
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  NOTEBOOK VIEW
// ─────────────────────────────────────────────────────────────

export default function NotebookView({
  concepts,
  onRemove,
  onOpenSource,
  personalNotes = [],
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}) {
  // null = closed | 'new' = creating | note-id = editing
  const [editorTarget,  setEditorTarget]  = useState(null)
  const [editorTitle,   setEditorTitle]   = useState('')
  const [editorHtml,    setEditorHtml]    = useState('')

  // Ref to the RichEditor's applyFormat method (passed via a callback ref)
  const applyFormatRef = useRef(null)

  // ── Editor helpers ────────────────────────────────────────────

  const openNew = () => {
    setEditorTarget('new')
    setEditorTitle('')
    setEditorHtml('')
  }

  const openEdit = (note) => {
    setEditorTarget(note.id)
    setEditorTitle(note.title)
    // Support notes saved as plain markdown (old format) — treat as text content
    // New notes are saved as HTML. Detect HTML by presence of a tag.
    const content = note.content || ''
    const isHtml = /<[a-z][\s\S]*>/i.test(content)
    setEditorHtml(isHtml ? content : plainToHtml(content))
  }

  const closeEditor = () => {
    setEditorTarget(null)
    setEditorTitle('')
    setEditorHtml('')
  }

  const handleSave = () => {
    if (editorTarget === 'new') {
      onAddNote(editorTitle, editorHtml)
    } else {
      onUpdateNote(editorTarget, { title: editorTitle, content: editorHtml })
    }
    closeEditor()
  }

  const isEmpty = concepts.length === 0 && personalNotes.length === 0

  // ─────────────────────────────────────────────────────────────
  //  EMPTY STATE
  // ─────────────────────────────────────────────────────────────

  if (isEmpty && editorTarget === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ backgroundColor: 'var(--color-primary-tint)' }}
        >
          <BookOpen size={26} style={{ color: 'var(--color-primary)' }} />
        </div>
        <h2
          className="font-semibold mb-2"
          style={{ fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)' }}
        >
          My Notebook
        </h2>
        <p
          className="max-w-xs leading-relaxed mb-6"
          style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}
        >
          Save tutor answers using the bookmark icon, or create your own personal notes.
        </p>

        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200"
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
        >
          <Plus size={15} />
          New Note
        </button>

        <div
          className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium"
          style={{
            color: 'var(--color-text-tertiary)',
            borderColor: 'var(--color-border-subtle)',
            backgroundColor: 'var(--color-surface-raised)',
          }}
        >
          <Lightbulb size={13} />
          Tip: hover any tutor answer and click Save
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  //  NOTE EDITOR (WYSIWYG)
  // ─────────────────────────────────────────────────────────────

  if (editorTarget !== null) {
    return (
      <div className="flex-1 flex flex-col" style={{ minHeight: 0 }}>

        {/* ── Top bar ── */}
        <div
          className="flex items-center gap-3 px-5 py-3 border-b flex-shrink-0"
          style={{
            borderColor: 'var(--color-border-subtle)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <StickyNote size={16} style={{ color: 'var(--color-primary)' }} />
          <span
            className="text-sm font-semibold flex-1"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {editorTarget === 'new' ? 'New Note' : 'Edit Note'}
          </span>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150"
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
          >
            <Save size={12} />
            Save
          </button>

          <button
            onClick={closeEditor}
            className="p-1.5 rounded-lg transition-colors duration-150"
            style={{ color: 'var(--color-text-tertiary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-tertiary)' }}
            aria-label="Discard and close"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Title ── */}
        <div
          className="px-5 py-3 border-b flex-shrink-0"
          style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-surface)' }}
        >
          <input
            type="text"
            value={editorTitle}
            onChange={(e) => setEditorTitle(e.target.value)}
            placeholder="Note title…"
            className="w-full bg-transparent text-lg font-semibold outline-none"
            style={{ color: 'var(--color-text-primary)' }}
          />
        </div>

        {/* ── Formatting toolbar ── */}
        <FormatToolbar onFormat={(id) => applyFormatRef.current?.(id)} />

        {/* ── WYSIWYG body ── */}
        <div
          className="flex-1"
          style={{ position: 'relative', minHeight: 0, overflow: 'hidden', backgroundColor: 'var(--color-surface)' }}
        >
          <RichEditorWithRef
            html={editorHtml}
            onChange={setEditorHtml}
            placeholder={'Start writing…\n\nUse the toolbar above to apply headings, bold, lists, and more.'}
            applyFormatRef={applyFormatRef}
          />
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  //  MAIN NOTEBOOK LIST
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
      <div className="max-w-2xl mx-auto">

        {/* Header row */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-primary-tint)' }}
          >
            <BookOpen size={20} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div className="flex-1">
            <h2
              className="font-semibold leading-snug"
              style={{ fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)' }}
            >
              My Notebook
            </h2>
            <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
              {personalNotes.length > 0 && `${personalNotes.length} note${personalNotes.length !== 1 ? 's' : ''}`}
              {personalNotes.length > 0 && concepts.length > 0 && ' · '}
              {concepts.length > 0 && `${concepts.length} saved concept${concepts.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors duration-150"
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
          >
            <Plus size={13} />
            New Note
          </button>
        </div>

        {/* ── Personal Notes ── */}
        {personalNotes.length > 0 && (
          <section className="mb-7">
            <div
              className="text-[10px] font-semibold tracking-widest uppercase mb-3"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Personal Notes
            </div>
            <div className="space-y-3">
              {personalNotes.map((note) => (
                <PersonalNoteCard
                  key={note.id}
                  note={note}
                  onEdit={openEdit}
                  onDelete={onDeleteNote}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Saved Concepts ── */}
        {concepts.length > 0 && (
          <section>
            {personalNotes.length > 0 && (
              <div
                className="text-[10px] font-semibold tracking-widest uppercase mb-3"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Saved Concepts
              </div>
            )}
            <div className="space-y-3">
              {concepts.map((concept) => (
                <SavedConceptCard
                  key={concept.id}
                  concept={concept}
                  onRemove={onRemove}
                  onOpenSource={onOpenSource}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  RichEditor with imperative handle for toolbar
// ─────────────────────────────────────────────────────────────

/**
 * Wraps RichEditor and exposes applyFormat imperatively via a ref callback
 * so the toolbar (which lives outside the editor) can trigger formats.
 */
function RichEditorWithRef({ html, onChange, placeholder, applyFormatRef }) {
  const editorRef = useRef(null)
  const composingRef = useRef(false)
  const externalSetRef = useRef(false)

  // Sync html → DOM when the prop changes externally
  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    if (el.innerHTML !== html) {
      externalSetRef.current = true
      el.innerHTML = html || ''
    }
  }, [html])

  // Auto-focus
  useEffect(() => {
    editorRef.current?.focus()
  }, [])

  const emitChange = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }, [onChange])

  // Expose applyFormat to parent via ref
  useEffect(() => {
    applyFormatRef.current = (id) => {
      const el = editorRef.current
      if (!el) return
      el.focus()
      applyFormatAction(id, el, emitChange)
    }
  }, [applyFormatRef, emitChange])

  const handleInput = useCallback(() => {
    if (externalSetRef.current) { externalSetRef.current = false; return }
    if (!composingRef.current) emitChange()
  }, [emitChange])

  const handleKeyDown = useCallback((e) => {
    // Exit blockquote on empty line
    if (e.key === 'Enter') {
      const sel = window.getSelection()
      if (sel?.rangeCount) {
        const block = sel.getRangeAt(0).startContainer.parentElement?.closest('blockquote')
        if (block && (sel.getRangeAt(0).startContainer.textContent || '').trim() === '') {
          e.preventDefault()
          document.execCommand('formatBlock', false, 'P')
        }
      }
    }
    // Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertHTML', false, '\u00a0\u00a0\u00a0\u00a0')
    }
  }, [])

  const isEmpty = !html || html.replace(/<[^>]*>/g, '').trim() === ''

  return (
    <div style={{ position: 'relative', flex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {isEmpty && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            padding: '20px 24px',
            pointerEvents: 'none',
            fontSize: 'var(--text-body)',
            color: 'var(--color-text-tertiary)',
            lineHeight: 1.7,
            userSelect: 'none',
          }}
        >
          Start writing…
        </div>
      )}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onCompositionStart={() => { composingRef.current = true }}
        onCompositionEnd={() => { composingRef.current = false; emitChange() }}
        onKeyDown={handleKeyDown}
        spellCheck
        style={{
          outline: 'none',
          flex: 1,
          padding: '20px 24px 40px',
          fontSize: 'var(--text-body)',
          lineHeight: 1.75,
          color: 'var(--color-text-primary)',
          caretColor: 'var(--color-primary)',
          overflowY: 'auto',
          boxSizing: 'border-box',
          wordBreak: 'break-word',
        }}
        className="wysiwyg-editor"
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  FORMAT ACTION — shared logic called by toolbar buttons
// ─────────────────────────────────────────────────────────────

function applyFormatAction(id, el, emitChange) {
  switch (id) {
    case 'h1':
    case 'h2':
    case 'h3':
      document.execCommand('formatBlock', false, id.toUpperCase())
      break

    case 'blockquote':
      document.execCommand('formatBlock', false, 'BLOCKQUOTE')
      break

    case 'code': {
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) break
      const range = sel.getRangeAt(0)
      const text  = range.toString()
      const code  = document.createElement('code')
      // inline styling so it works without external CSS
      Object.assign(code.style, {
        fontFamily: '"SF Mono","Fira Code","Cascadia Code",monospace',
        fontSize: '0.875em',
        padding: '0.1em 0.4em',
        borderRadius: '4px',
        backgroundColor: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border-subtle)',
        color: 'var(--color-text-primary)',
      })
      code.textContent = text || 'code'
      range.deleteContents()
      range.insertNode(code)
      // Place cursor after the node
      const after = document.createRange()
      after.setStartAfter(code)
      after.collapse(true)
      sel.removeAllRanges()
      sel.addRange(after)
      break
    }

    case 'hr':
      document.execCommand('insertHTML', false,
        '<hr style="border:none;border-top:1px solid var(--color-border);margin:1.25rem 0"><br>')
      break

    default:
      // bold, italic, underline, strikethrough,
      // insertUnorderedList, insertOrderedList
      document.execCommand(id, false, null)
      break
  }
  emitChange()
}

// ─────────────────────────────────────────────────────────────
//  UTILITY — convert old plain-text / markdown notes to HTML
// ─────────────────────────────────────────────────────────────

function plainToHtml(text) {
  if (!text) return ''
  // Very simple: wrap each paragraph in <p>, preserve line breaks
  return text
    .split(/\n\n+/)
    .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
    .join('')
}

// ─────────────────────────────────────────────────────────────
//  PERSONAL NOTE CARD
// ─────────────────────────────────────────────────────────────

function PersonalNoteCard({ note, onEdit, onDelete }) {
  const updatedDate = note.updatedAt
    ? new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  // Strip HTML tags for the snippet preview
  const snippetText = (note.content || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return (
    <div
      className="p-4 rounded-[var(--radius-card)] border group transition-shadow duration-200 hover:shadow-[var(--shadow-card)]"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <StickyNote size={13} className="flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
          <h3
            className="font-medium leading-snug truncate"
            style={{ fontSize: 'var(--text-body)', color: 'var(--color-text-primary)' }}
          >
            {note.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 rounded-lg transition-colors duration-200"
            style={{ color: 'var(--color-text-tertiary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-tertiary)' }}
            aria-label="Edit note"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1.5 rounded-lg transition-colors duration-200 hover:bg-[var(--color-error-tint)]"
            style={{ color: 'var(--color-text-tertiary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-error)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-tertiary)' }}
            aria-label="Delete note"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {snippetText && (
        <p
          className="leading-relaxed mb-2 line-clamp-3"
          style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}
        >
          {snippetText}
        </p>
      )}

      {updatedDate && (
        <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
          Updated {updatedDate}
        </span>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  SAVED CONCEPT CARD  (unchanged logic)
// ─────────────────────────────────────────────────────────────

function SavedConceptCard({ concept, onRemove, onOpenSource }) {
  const handleSourceClick = (citation) => {
    const resolved = resolveCitation(citation, lectures)
    if (resolved && onOpenSource) onOpenSource(resolved)
  }

  const savedDate = concept.savedAt
    ? new Date(concept.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  return (
    <div
      className="p-4 rounded-[var(--radius-card)] border group transition-shadow duration-200 hover:shadow-[var(--shadow-card)]"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3
          className="font-medium leading-snug"
          style={{ fontSize: 'var(--text-body)', color: 'var(--color-text-primary)' }}
        >
          {concept.title}
        </h3>
        <button
          onClick={() => onRemove(concept.id)}
          className="flex-shrink-0 p-1.5 rounded-lg transition-colors duration-200
                     opacity-0 group-hover:opacity-100
                     hover:bg-[var(--color-error-tint)]"
          style={{ color: 'var(--color-text-tertiary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-error)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-tertiary)' }}
          aria-label="Remove from notebook"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Snippet */}
      <p
        className="leading-relaxed mb-3 line-clamp-3"
        style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}
      >
        {concept.snippet?.replace(/[*#`$]/g, '').replace(/\\/g, '').trim()}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex flex-wrap gap-1.5">
          {concept.citations?.map((citation, i) => {
            const resolved = resolveCitation(citation, lectures)
            if (!resolved) return null
            return (
              <button
                key={i}
                onClick={() => handleSourceClick(citation)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium
                           transition-colors duration-150
                           hover:bg-[var(--color-primary-tint-hover)]"
                style={{
                  backgroundColor: 'var(--color-primary-tint)',
                  color: 'var(--color-primary)',
                }}
                aria-label={`View Week ${resolved.week}, Slide ${citation.slide}`}
              >
                <FileText size={11} />
                W{resolved.week} · S{citation.slide}
              </button>
            )
          })}
        </div>

        {savedDate && (
          <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
            Saved {savedDate}
          </span>
        )}
      </div>
    </div>
  )
}
