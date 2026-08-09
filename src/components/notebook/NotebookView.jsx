import { useState, useRef, useEffect } from 'react'
import {
  BookOpen,
  FileText,
  Trash2,
  Lightbulb,
  Plus,
  Pencil,
  Eye,
  X,
  Save,
  StickyNote,
} from 'lucide-react'
import { resolveCitation } from '../../lib/resolveCitation'
import { lectures } from '../../lib/data'
import MarkdownRenderer from '../ui/MarkdownRenderer'

// ─────────────────────────────────────────────────────────────
//  SLASH COMMAND PALETTE
// ─────────────────────────────────────────────────────────────

const SLASH_COMMANDS = [
  { key: 'h1',      label: 'Heading 1',      desc: 'Large section heading',  badge: 'H1'  },
  { key: 'h2',      label: 'Heading 2',      desc: 'Medium section heading', badge: 'H2'  },
  { key: 'h3',      label: 'Heading 3',      desc: 'Small section heading',  badge: 'H3'  },
  { key: 'bold',    label: 'Bold',           desc: '**bold text**',          badge: 'B'   },
  { key: 'italic',  label: 'Italic',         desc: '*italic text*',          badge: 'I'   },
  { key: 'code',    label: 'Inline Code',    desc: '`code`',                 badge: '<>'  },
  { key: 'block',   label: 'Code Block',     desc: 'Fenced code block',      badge: '{ }' },
  { key: 'bullet',  label: 'Bullet List',    desc: '- list item',            badge: '•'   },
  { key: 'number',  label: 'Numbered List',  desc: '1. list item',           badge: '1.'  },
  { key: 'link',    label: 'Link',           desc: '[text](url)',             badge: '↗'   },
  { key: 'divider', label: 'Divider',        desc: 'Horizontal rule',        badge: '—'   },
  { key: 'quote',   label: 'Quote',          desc: '> blockquote',           badge: '"'   },
]

/** Replace the /filter text with formatted markdown and return new text + cursor position */
function applyCommand(key, text, slashIdx, filterLen) {
  const pre  = text.slice(0, slashIdx)
  const post = text.slice(slashIdx + 1 + filterLen)
  switch (key) {
    case 'h1':      return { t: pre + '# '           + post, c: slashIdx + 2  }
    case 'h2':      return { t: pre + '## '          + post, c: slashIdx + 3  }
    case 'h3':      return { t: pre + '### '         + post, c: slashIdx + 4  }
    case 'bold':    return { t: pre + '****'         + post, c: slashIdx + 2  }
    case 'italic':  return { t: pre + '**'           + post, c: slashIdx + 1  }
    case 'code':    return { t: pre + '``'           + post, c: slashIdx + 1  }
    case 'block':   return { t: pre + '```\n\n```'   + post, c: slashIdx + 4  }
    case 'bullet':  return { t: pre + '- '           + post, c: slashIdx + 2  }
    case 'number':  return { t: pre + '1. '          + post, c: slashIdx + 3  }
    case 'link':    return { t: pre + '[](url)'      + post, c: slashIdx + 1  }
    case 'divider': return { t: pre + '\n---\n'      + post, c: slashIdx + 5  }
    case 'quote':   return { t: pre + '> '           + post, c: slashIdx + 2  }
    default:        return { t: text,                         c: slashIdx      }
  }
}

/**
 * Approximate Y offset (px) of the caret inside a textarea,
 * relative to the textarea's top-left (accounting for scroll).
 */
function getCaretTop(ta, cursorIdx) {
  if (!ta) return 0
  const cs = window.getComputedStyle(ta)
  const lh = parseFloat(cs.lineHeight) || 22
  const pt = parseFloat(cs.paddingTop) || 20
  const linesBefore = (ta.value.slice(0, cursorIdx).match(/\n/g) || []).length
  return pt + linesBefore * lh - ta.scrollTop
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
  // ── Editor state ─────────────────────────────────────────────
  // null = closed | 'new' = creating | note-id = editing
  const [editorTarget,  setEditorTarget]  = useState(null)
  const [editorTitle,   setEditorTitle]   = useState('')
  const [editorContent, setEditorContent] = useState('')
  const [editorTab,     setEditorTab]     = useState('write') // 'write' | 'preview'

  // ── Slash menu state ─────────────────────────────────────────
  // null = closed | { slashIdx, filter, activeIdx }
  const [slashMenu, setSlashMenu] = useState(null)

  const textareaRef = useRef(null)
  const menuRef     = useRef(null)

  // ── Editor helpers ────────────────────────────────────────────

  const openNew = () => {
    setEditorTarget('new')
    setEditorTitle('')
    setEditorContent('')
    setEditorTab('write')
    setSlashMenu(null)
  }

  const openEdit = (note) => {
    setEditorTarget(note.id)
    setEditorTitle(note.title)
    setEditorContent(note.content)
    setEditorTab('write')
    setSlashMenu(null)
  }

  const closeEditor = () => {
    setEditorTarget(null)
    setEditorTitle('')
    setEditorContent('')
    setSlashMenu(null)
  }

  const handleSave = () => {
    if (editorTarget === 'new') {
      onAddNote(editorTitle, editorContent)
    } else {
      onUpdateNote(editorTarget, { title: editorTitle, content: editorContent })
    }
    closeEditor()
  }

  // ── Slash menu logic ──────────────────────────────────────────

  const filteredCmds = slashMenu
    ? SLASH_COMMANDS.filter(cmd =>
        slashMenu.filter === '' ||
        cmd.label.toLowerCase().startsWith(slashMenu.filter.toLowerCase()) ||
        cmd.key.startsWith(slashMenu.filter.toLowerCase())
      )
    : []

  const doApplyCommand = (key) => {
    if (!slashMenu) return
    const ta = textareaRef.current
    const { t: newText, c: newCursor } = applyCommand(
      key, editorContent, slashMenu.slashIdx, slashMenu.filter.length,
    )
    setEditorContent(newText)
    setSlashMenu(null)
    requestAnimationFrame(() => {
      if (ta) { ta.focus(); ta.setSelectionRange(newCursor, newCursor) }
    })
  }

  // textarea onChange — detect '/' trigger and update filter
  const handleContentChange = (e) => {
    const val    = e.target.value
    const cursor = e.target.selectionStart
    setEditorContent(val)

    const justTyped = val[cursor - 1]

    // Newly typed '/' at the start of a line
    if (justTyped === '/') {
      const prevChar = val[cursor - 2]
      if (cursor === 1 || prevChar === '\n') {
        setSlashMenu({ slashIdx: cursor - 1, filter: '', activeIdx: 0 })
        return
      }
    }

    // Update filter if menu is already open
    if (slashMenu !== null) {
      const textAfterSlash = val.slice(slashMenu.slashIdx + 1, cursor)
      if (
        textAfterSlash.includes('\n') ||
        cursor <= slashMenu.slashIdx
      ) {
        setSlashMenu(null)
      } else {
        setSlashMenu(prev =>
          prev ? { ...prev, filter: textAfterSlash, activeIdx: 0 } : null
        )
      }
    }
  }

  // textarea onKeyDown — navigate / confirm / dismiss slash menu
  const handleKeyDown = (e) => {
    if (!slashMenu || filteredCmds.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSlashMenu(prev => prev
        ? { ...prev, activeIdx: (prev.activeIdx + 1) % filteredCmds.length }
        : null)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSlashMenu(prev => prev
        ? { ...prev, activeIdx: (prev.activeIdx - 1 + filteredCmds.length) % filteredCmds.length }
        : null)
    } else if (e.key === 'Enter') {
      const cmd = filteredCmds[slashMenu.activeIdx]
      if (cmd) { e.preventDefault(); doApplyCommand(cmd.key) }
    } else if (e.key === 'Escape') {
      setSlashMenu(null)
    } else if (e.key === 'Backspace') {
      const ta = textareaRef.current
      if (ta && ta.selectionStart <= slashMenu.slashIdx + 1) setSlashMenu(null)
    }
  }

  // Close menu on outside click
  useEffect(() => {
    if (!slashMenu) return
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setSlashMenu(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [slashMenu])

  // Scroll active item into view
  useEffect(() => {
    if (!menuRef.current || !slashMenu) return
    const active = menuRef.current.querySelector('[data-active="true"]')
    if (active) active.scrollIntoView({ block: 'nearest' })
  }, [slashMenu?.activeIdx])

  // Compute where to place the menu
  const menuTop = slashMenu && textareaRef.current
    ? getCaretTop(textareaRef.current, slashMenu.slashIdx) + 26
    : 0

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
  //  NOTE EDITOR
  // ─────────────────────────────────────────────────────────────

  if (editorTarget !== null) {
    return (
      <div
        className="flex-1 flex flex-col"
        style={{ minHeight: 0 }}
      >
        {/* ── Toolbar ── */}
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

          {/* Write / Preview toggle */}
          <div
            className="flex rounded-lg overflow-hidden border text-xs font-medium"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            <button
              onClick={() => setEditorTab('write')}
              className="px-3 py-1.5 flex items-center gap-1.5 transition-colors duration-150"
              style={{
                backgroundColor: editorTab === 'write' ? 'var(--color-primary-tint)' : 'transparent',
                color: editorTab === 'write' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              }}
            >
              <Pencil size={11} />
              Write
            </button>
            <button
              onClick={() => setEditorTab('preview')}
              className="px-3 py-1.5 flex items-center gap-1.5 transition-colors duration-150"
              style={{
                backgroundColor: editorTab === 'preview' ? 'var(--color-primary-tint)' : 'transparent',
                color: editorTab === 'preview' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              }}
            >
              <Eye size={11} />
              Preview
            </button>
          </div>

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
          style={{ borderColor: 'var(--color-border-subtle)' }}
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

        {/* ── Body (write / preview) — position:relative so menu + absolute panes work ── */}
        <div
          className="flex-1"
          style={{ position: 'relative', minHeight: 0, overflow: 'hidden' }}
        >
          {editorTab === 'write' ? (
            <>
              {/* Hint bar */}
              <div
                className="flex items-center gap-1.5 px-5 py-1.5 border-b text-[11px]"
                style={{
                  color: 'var(--color-text-tertiary)',
                  borderColor: 'var(--color-border-subtle)',
                  backgroundColor: 'var(--color-surface-raised)',
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  zIndex: 1,
                }}
              >
                <span
                  className="font-mono font-semibold px-1 rounded"
                  style={{
                    backgroundColor: 'var(--color-border-subtle)',
                    color: 'var(--color-primary)',
                  }}
                >
                  /
                </span>
                Type&nbsp;<strong>/</strong>&nbsp;at the start of a line to insert formatting
              </div>

              {/* Textarea — absolutely fills the body, padded for hint bar (28px) */}
              <textarea
                ref={textareaRef}
                value={editorContent}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                placeholder={'Start writing…\n\nType / at the start of a line to insert headings, lists, code blocks, and more.'}
                className="resize-none outline-none text-sm font-mono leading-relaxed"
                style={{
                  position: 'absolute',
                  top: 28,   // below hint bar
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: '100%',
                  padding: '20px',
                  background: 'transparent',
                  color: 'var(--color-text-primary)',
                  caretColor: 'var(--color-primary)',
                  overflowY: 'auto',
                  boxSizing: 'border-box',
                }}
                autoFocus
              />

              {/* ── Slash command menu ── */}
              {slashMenu && filteredCmds.length > 0 && (
                <div
                  ref={menuRef}
                  style={{
                    position: 'absolute',
                    // +28 accounts for the hint bar offset
                    top: Math.max(32, menuTop + 28),
                    left: 20,
                    zIndex: 50,
                    width: 260,
                    maxHeight: 300,
                    overflowY: 'auto',
                    borderRadius: 'var(--radius-card)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    boxShadow: 'var(--shadow-glass)',
                  }}
                >
                  {/* Menu header */}
                  <div
                    className="px-3 py-2 text-[10px] font-semibold tracking-widest uppercase border-b"
                    style={{
                      color: 'var(--color-text-tertiary)',
                      borderColor: 'var(--color-border-subtle)',
                    }}
                  >
                    {slashMenu.filter ? `"${slashMenu.filter}" — ` : ''}{filteredCmds.length} option{filteredCmds.length !== 1 ? 's' : ''}
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    {filteredCmds.map((cmd, i) => {
                      const isActive = i === slashMenu.activeIdx
                      return (
                        <button
                          key={cmd.key}
                          data-active={isActive}
                          onMouseDown={(e) => {
                            e.preventDefault() // prevent textarea blur
                            doApplyCommand(cmd.key)
                          }}
                          onMouseEnter={() =>
                            setSlashMenu(prev => prev ? { ...prev, activeIdx: i } : null)
                          }
                          className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors duration-100"
                          style={{
                            backgroundColor: isActive
                              ? 'var(--color-primary-tint)'
                              : 'transparent',
                          }}
                        >
                          {/* Badge */}
                          <span
                            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
                            style={{
                              backgroundColor: isActive
                                ? 'var(--color-primary)'
                                : 'var(--color-surface-raised)',
                              color: isActive ? '#fff' : 'var(--color-text-secondary)',
                              border: '1px solid var(--color-border-subtle)',
                              fontFamily: 'var(--font-sans)',
                            }}
                          >
                            {cmd.badge}
                          </span>

                          {/* Label + desc */}
                          <div className="flex-1 min-w-0">
                            <div
                              className="text-xs font-semibold"
                              style={{
                                color: isActive
                                  ? 'var(--color-primary)'
                                  : 'var(--color-text-primary)',
                              }}
                            >
                              {cmd.label}
                            </div>
                            <div
                              className="text-[11px] font-mono truncate"
                              style={{ color: 'var(--color-text-tertiary)' }}
                            >
                              {cmd.desc}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Keyboard hint */}
                  <div
                    className="px-3 py-2 flex items-center gap-3 border-t text-[10px]"
                    style={{
                      borderColor: 'var(--color-border-subtle)',
                      color: 'var(--color-text-tertiary)',
                    }}
                  >
                    <span>↑↓ navigate</span>
                    <span>↵ select</span>
                    <span>Esc dismiss</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ── Preview pane ── */
            <div
              style={{
                position: 'absolute',
                inset: 0,
                overflowY: 'auto',
                padding: '24px 24px 32px',
              }}
            >
              {editorContent.trim() ? (
                <div style={{ maxWidth: 680, margin: '0 auto' }}>
                  {editorTitle.trim() && (
                    <h1
                      className="font-semibold mb-5"
                      style={{
                        fontSize: 'var(--text-h1)',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-serif)',
                        lineHeight: 1.25,
                      }}
                    >
                      {editorTitle}
                    </h1>
                  )}
                  <MarkdownRenderer content={editorContent} />
                </div>
              ) : (
                <p
                  className="text-sm italic"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Nothing to preview yet — switch to Write and add some content.
                </p>
              )}
            </div>
          )}
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
//  PERSONAL NOTE CARD
// ─────────────────────────────────────────────────────────────

function PersonalNoteCard({ note, onEdit, onDelete }) {
  const updatedDate = note.updatedAt
    ? new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

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

      {note.content.trim() && (
        <p
          className="leading-relaxed mb-2 line-clamp-3"
          style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}
        >
          {note.content.replace(/[#*`_~[\]]/g, '').trim()}
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
//  SAVED CONCEPT CARD  (logic unchanged)
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
