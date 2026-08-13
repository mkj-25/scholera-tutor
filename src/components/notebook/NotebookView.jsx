import { useState, useCallback, useRef, useEffect } from 'react'
import {
  BookOpen,
  Trash2,
  Lightbulb,
  Plus,
  X,
  Save,
  StickyNote,
  Pencil,
  ExternalLink,
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Code,
  Quote,
  Minus,
} from 'lucide-react'
import { resolveCitation } from '../../lib/resolveCitation'
import { lectures } from '../../lib/data'

// Toolbar button

function ToolbarBtn({ icon: Icon, label, onClick, active }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        // Prevent editor from losing focus on toolbar click
        e.preventDefault()
        onClick()
      }}
      title={label}
      aria-label={label}
      className="w-7 h-7 flex items-center justify-center rounded-md transition-colors duration-150"
      style={{
        color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        backgroundColor: active ? 'var(--color-primary-tint)' : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'var(--color-surface)'
          e.currentTarget.style.color = 'var(--color-text-primary)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.color = 'var(--color-text-secondary)'
        }
      }}
    >
      <Icon size={13} strokeWidth={2} />
    </button>
  )
}

// Rich text editor (WYSIWYG via contenteditable + execCommand)

function RichTextEditor({ isNew, title, content, onTitleChange, onContentChange, onSave, onClose }) {
  const editorRef = useRef(null)
  const [activeFormats, setActiveFormats] = useState({})

  // Initialise the contenteditable with existing content once on mount
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content || ''
      // Move cursor to end
      const range = document.createRange()
      const sel = window.getSelection()
      range.selectNodeContents(editorRef.current)
      range.collapse(false)
      sel.removeAllRanges()
      sel.addRange(range)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Track which formats are active at current selection
  const updateActiveFormats = () => {
    setActiveFormats({
      bold:      document.queryCommandState('bold'),
      italic:    document.queryCommandState('italic'),
      bullet:    document.queryCommandState('insertUnorderedList'),
      ordered:   document.queryCommandState('insertOrderedList'),
      quote:     document.queryCommandValue('formatBlock') === 'blockquote',
      heading:   document.queryCommandValue('formatBlock') === 'h2',
    })
  }

  // Execute a rich-text command and sync state
  const exec = (cmd, value) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, value ?? null)
    onContentChange(editorRef.current?.innerHTML || '')
    updateActiveFormats()
  }

  // Wrap selection in an inline <code> element (execCommand has no code cmd)
  const insertInlineCode = () => {
    editorRef.current?.focus()
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    if (range.collapsed) {
      // Insert empty code node with placeholder
      const code = document.createElement('code')
      code.textContent = 'code'
      range.insertNode(code)
      // Select the placeholder
      const r2 = document.createRange()
      r2.selectNodeContents(code)
      sel.removeAllRanges()
      sel.addRange(r2)
    } else {
      // Wrap selection
      const code = document.createElement('code')
      range.surroundContents(code)
    }
    onContentChange(editorRef.current?.innerHTML || '')
  }

  // Toggle heading h2 / back to paragraph
  const toggleHeading = () => {
    const current = document.queryCommandValue('formatBlock')
    exec('formatBlock', current === 'h2' ? 'p' : 'h2')
  }

  // Toggle blockquote / back to paragraph
  const toggleQuote = () => {
    const current = document.queryCommandValue('formatBlock')
    exec('formatBlock', current === 'blockquote' ? 'p' : 'blockquote')
  }

  const toolbarGroups = [
    [
      { label: 'Bold (Ctrl+B)',    icon: Bold,        action: () => exec('bold'),                   key: 'bold' },
      { label: 'Italic (Ctrl+I)',  icon: Italic,      action: () => exec('italic'),                 key: 'italic' },
      { label: 'Heading 2',        icon: Heading2,    action: toggleHeading,                        key: 'heading' },
    ],
    [
      { label: 'Bullet list',      icon: List,        action: () => exec('insertUnorderedList'),    key: 'bullet' },
      { label: 'Numbered list',    icon: ListOrdered, action: () => exec('insertOrderedList'),      key: 'ordered' },
      { label: 'Blockquote',       icon: Quote,       action: toggleQuote,                          key: 'quote' },
    ],
    [
      { label: 'Inline code',      icon: Code,        action: insertInlineCode,                     key: 'code' },
      { label: 'Divider',          icon: Minus,       action: () => exec('insertHorizontalRule'),   key: 'divider' },
    ],
  ]

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); exec('bold') }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); exec('italic') }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); onSave() }
  }

  return (
    <div className="flex-1 flex flex-col" style={{ minHeight: 0 }}>

      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-b flex-shrink-0"
        style={{
          borderColor: 'var(--color-border-subtle)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <StickyNote size={15} style={{ color: 'var(--accent-saved)' }} />
        <span className="text-sm font-semibold flex-1" style={{ color: 'var(--color-text-primary)' }}>
          {isNew ? 'New Note' : 'Edit Note'}
        </span>
        <button
          onClick={onSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                     transition-colors duration-150 hover:opacity-90"
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
        >
          <Save size={12} />
          Save
        </button>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors duration-150
                     text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]
                     hover:bg-[var(--color-surface-raised)]"
          aria-label="Discard and close"
        >
          <X size={15} />
        </button>
      </div>

      {/* Editor body */}
      <div
        className="flex-1 flex flex-col"
        style={{ backgroundColor: 'var(--color-surface)', minHeight: 0 }}
      >
        {/* Title input */}
        <div className="px-5 pt-5 pb-3">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Note title…"
            className="w-full bg-transparent font-semibold outline-none border-b pb-3 transition-colors duration-150"
            style={{
              fontSize: 'var(--text-h3)',
              color: 'var(--color-text-primary)',
              borderColor: 'var(--color-border-subtle)',
            }}
            autoFocus
          />
        </div>

        {/* Formatting toolbar */}
        <div
          className="flex items-center gap-0.5 px-4 py-1.5 border-b flex-shrink-0 flex-wrap"
          style={{
            borderColor: 'var(--color-border-subtle)',
            backgroundColor: 'var(--color-surface-raised)',
          }}
        >
          {toolbarGroups.map((group, gi) => (
            <div key={gi} className="flex items-center gap-0.5">
              {group.map(({ label, icon, action, key }) => (
                <ToolbarBtn
                  key={key}
                  icon={icon}
                  label={label}
                  onClick={action}
                  active={!!activeFormats[key]}
                />
              ))}
              {gi < toolbarGroups.length - 1 && (
                <div
                  className="w-px h-4 mx-1.5 flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-border-subtle)' }}
                />
              )}
            </div>
          ))}
          <span
            className="ml-auto text-[10px] hidden sm:block select-none"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Ctrl+B · Ctrl+I · Ctrl+S
          </span>
        </div>

        {/* Contenteditable rich text area */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={() => onContentChange(editorRef.current?.innerHTML || '')}
          onKeyDown={handleKeyDown}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          onSelect={updateActiveFormats}
          data-placeholder="Write your note…"
          className="flex-1 outline-none px-5 py-4 overflow-y-auto rich-editor"
          style={{
            color: 'var(--color-text-primary)',
            fontSize: '14px',
            lineHeight: '1.7',
            minHeight: '120px',
          }}
        />
      </div>
    </div>
  )
}

// NotebookView - main export

export default function NotebookView({
  concepts,
  onRemove,
  onOpenSource,
  personalNotes = [],
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}) {
  // null = list view | 'new' = creating | note-id = editing
  const [editorTarget, setEditorTarget] = useState(null)
  const [editorTitle, setEditorTitle] = useState('')
  const [editorContent, setEditorContent] = useState('')

  const openNew = () => {
    setEditorTarget('new')
    setEditorTitle('')
    setEditorContent('')
  }

  const openEdit = (note) => {
    setEditorTarget(note.id)
    setEditorTitle(note.title)
    // Content is stored as HTML; pass through directly
    setEditorContent(note.content || '')
  }

  const closeEditor = useCallback(() => {
    setEditorTarget(null)
    setEditorTitle('')
    setEditorContent('')
  }, [])

  const handleSave = useCallback(() => {
    const title = editorTitle.trim() || 'Untitled Note'
    const content = editorContent.trim()
    if (editorTarget === 'new') {
      onAddNote(title, content)
    } else {
      onUpdateNote(editorTarget, { title, content })
    }
    closeEditor()
  }, [editorTarget, editorTitle, editorContent, onAddNote, onUpdateNote, closeEditor])

  const isEmpty = concepts.length === 0 && personalNotes.length === 0

  // Editor view
  if (editorTarget !== null) {
    return (
      <RichTextEditor
        isNew={editorTarget === 'new'}
        title={editorTitle}
        content={editorContent}
        onTitleChange={setEditorTitle}
        onContentChange={setEditorContent}
        onSave={handleSave}
        onClose={closeEditor}
      />
    )
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{ backgroundColor: 'var(--accent-saved-tint)' }}
        >
          <BookOpen size={24} style={{ color: 'var(--accent-saved)' }} />
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
          Save tutor answers using the bookmark icon on any response, or write your own notes here.
        </p>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                     transition-colors duration-150 hover:opacity-90"
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
        >
          <Plus size={14} />
          New Note
        </button>
        <div
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg border text-[11px]"
          style={{
            color: 'var(--color-text-tertiary)',
            borderColor: 'var(--color-border-subtle)',
            backgroundColor: 'var(--color-surface-raised)',
          }}
        >
          <Lightbulb size={12} />
          <span>Tip: click Save on any tutor answer</span>
        </div>
      </div>
    )
  }

  // Main list
  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--accent-saved-tint)' }}
          >
            <BookOpen size={17} style={{ color: 'var(--accent-saved)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2
              className="font-semibold leading-snug"
              style={{ fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)' }}
            >
              My Notebook
            </h2>
            <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-tertiary)' }}>
              {[personalNotes.length > 0 && `${personalNotes.length} note${personalNotes.length !== 1 ? 's' : ''}`,
                concepts.length > 0 && `${concepts.length} saved concept${concepts.length !== 1 ? 's' : ''}`]
                .filter(Boolean).join(' · ')}
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold
                       transition-colors duration-150 hover:opacity-90"
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
          >
            <Plus size={12} />
            New Note
          </button>
        </div>

        {/* Personal Notes section */}
        {personalNotes.length > 0 && (
          <section className="mb-7">
            <div
              className="text-[10px] font-semibold tracking-widest uppercase mb-3"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Personal Notes
            </div>
            <div className="space-y-2.5">
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

        {/* Saved Concepts section */}
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
            <div className="space-y-2.5">
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

// Personal Note Card

function PersonalNoteCard({ note, onEdit, onDelete }) {
  const updatedDate = note.updatedAt
    ? new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  const snippetText = (note.content || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return (
    <div
      className="p-4 rounded-[var(--radius-card)] border group transition-all duration-200
                 hover:shadow-[var(--shadow-card)] hover:border-[var(--color-border)]"
      style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-surface)' }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <StickyNote size={12} className="flex-shrink-0" style={{ color: 'var(--accent-saved)' }} />
          <h3
            className="font-medium leading-snug truncate"
            style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)' }}
          >
            {note.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 rounded-md transition-colors duration-150
                       text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)]
                       hover:bg-[var(--color-primary-tint)]"
            aria-label="Edit note"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1.5 rounded-md transition-colors duration-150
                       text-[var(--color-text-tertiary)] hover:text-[var(--color-error)]
                       hover:bg-[var(--color-error-tint)]"
            aria-label="Delete note"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      {snippetText && (
        <p
          className="text-[12px] leading-relaxed line-clamp-2"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {snippetText}
        </p>
      )}
      {updatedDate && (
        <div className="mt-2 text-[10px]" style={{ color: 'var(--color-text-tertiary)', opacity: 0.6 }}>
          Updated {updatedDate}
        </div>
      )}
    </div>
  )
}

// Saved Concept Card

function SavedConceptCard({ concept, onRemove, onOpenSource }) {
  const firstCitation = concept.citations?.[0]
  const resolved = firstCitation ? resolveCitation(firstCitation, lectures) : null

  const handleOpenSource = () => {
    if (resolved && onOpenSource) {
      onOpenSource(resolved)
    }
  }

  const savedDate = concept.savedAt
    ? new Date(concept.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  return (
    <div
      className="p-4 rounded-[var(--radius-card)] border group transition-all duration-200
                 hover:shadow-[var(--shadow-card)] hover:border-[var(--color-border)]"
      style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-surface)' }}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3
          className="font-medium leading-snug"
          style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)' }}
        >
          {concept.title}
        </h3>
        <button
          onClick={() => onRemove(concept.id)}
          className="p-1.5 rounded-md flex-shrink-0 opacity-0 group-hover:opacity-100
                     transition-all duration-150
                     text-[var(--color-text-tertiary)] hover:text-[var(--color-error)]
                     hover:bg-[var(--color-error-tint)]"
          aria-label="Remove from notebook"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Excerpt */}
      {concept.snippet && (
        <p
          className="text-[12px] leading-relaxed line-clamp-3 mb-3"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {concept.snippet}
        </p>
      )}

      {/* Footer: source link + date */}
      <div className="flex items-center justify-between">
        {resolved ? (
          <button
            onClick={handleOpenSource}
            className="flex items-center gap-1 text-[11px] font-medium transition-colors duration-150
                       text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)]"
          >
            <ExternalLink size={11} />
            Week {resolved.week} · Slide {firstCitation.slide}
          </button>
        ) : (
          <span />
        )}
        {savedDate && (
          <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)', opacity: 0.5 }}>
            Saved {savedDate}
          </span>
        )}
      </div>
    </div>
  )
}
