import { useState, useCallback, useMemo } from 'react'
import Header from './components/layout/Header'
import CourseSidebar from './components/layout/CourseSidebar'
import LearningSidebar from './components/layout/LearningSidebar'
import ChatView from './components/chat/ChatView'
import NotebookView from './components/notebook/NotebookView'
import CourseView from './components/course/CourseView'
import SourcePanel from './components/citations/SourcePanel'
import StudentSelector from './components/layout/StudentSelector'
import { useTheme } from './hooks/useTheme'
import { useNotebook } from './hooks/useNotebook'
import {
  conversations,
  defaultConversationId,
  emptyConversationId,
  lectures,
} from './lib/data'
import { resolveCitation } from './lib/resolveCitation'

// Pre-populate exploredSlides from citations already present in a conversation
function deriveExploredSlides(conversationId) {
  const explored = new Set()
  const conv = conversations[conversationId]
  if (conv?.messages) {
    conv.messages.forEach((msg) => {
      if (!msg.citations) return
      msg.citations.forEach((citation) => {
        const resolved = resolveCitation(citation, lectures)
        if (resolved) {
          explored.add(`${resolved.week}:${citation.slide}`)
        }
      })
    })
  }
  return explored
}

export default function App() {
  const { theme, toggleTheme } = useTheme()

  const {
    concepts,
    saveConcept,
    removeConcept,
    isConceptSaved,
    savedCount,
    personalNotes,
    addNote,
    updateNote,
    deleteNote,
  } = useNotebook()

  // null = show selector screen; 'existing' or 'new' = main UI
  const [selectedMode, setSelectedMode] = useState(null)

  const handleSelectMode = useCallback((mode) => {
    const convId = mode === 'existing' ? defaultConversationId : emptyConversationId
    setActiveConversationId(convId)
    setMessageOverrides({})
    setExploredSlides(deriveExploredSlides(convId))
    setSelectedMode(mode)
    setActiveView('chat')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [activeView, setActiveView] = useState('chat')
  const [selectedWeek, setSelectedWeek] = useState(null)

  // Tracks which conversation is loaded (existing vs. new student)
  const [activeConversationId, setActiveConversationId] =
    useState(defaultConversationId)

  const conversation = conversations[activeConversationId]

  // Merges seed messages with any messages added during this session
  const [messageOverrides, setMessageOverrides] = useState({})

  const messages = useMemo(() => {
    const base = conversation?.messages || []
    return messageOverrides[activeConversationId]
      ? [...base, ...messageOverrides[activeConversationId]]
      : base
  }, [conversation, activeConversationId, messageOverrides])

  const [sourcePanel, setSourcePanel] = useState({
    isOpen: false,
    lecture: null,
    slide: null,
  })

  // Tracks which slides the student has viewed, keyed as "week:slideNumber"
  const [exploredSlides, setExploredSlides] = useState(() =>
    deriveExploredSlides(defaultConversationId)
  )

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [progressCardOpen, setProgressCardOpen] = useState(false)

  // Derives the N most-recently cited slides for the Learning sidebar
  const recentCitations = useMemo(() => {
    const seen = new Set()
    const recent = []

    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i]
      if (!msg.citations) continue

      for (const citation of msg.citations) {
        const resolved = resolveCitation(citation, lectures)
        if (!resolved) continue
        const key = `${resolved.week}:${citation.slide}`
        if (seen.has(key)) continue
        seen.add(key)
        recent.push({
          title: resolved.slide.title,
          week: resolved.week,
          slideNumber: citation.slide,
          messageId: msg.id,
        })
      }
    }

    return recent.slice(0, 8)
  }, [messages])

  // Appends a new message and marks any cited slides as explored
  const handleAddMessage = useCallback(
    (message) => {
      setMessageOverrides((prev) => ({
        ...prev,
        [activeConversationId]: [
          ...(prev[activeConversationId] || []),
          message,
        ],
      }))

      if (message.citations?.length > 0) {
        setExploredSlides((prev) => {
          const next = new Set(prev)
          message.citations.forEach((citation) => {
            const resolved = resolveCitation(citation, lectures)
            if (resolved) {
              next.add(`${resolved.week}:${citation.slide}`)
            }
          })
          return next
        })
      }
    },
    [activeConversationId]
  )

  const handleOpenSource = useCallback((resolved) => {
    setSourcePanel({
      isOpen: true,
      lecture: resolved.lecture,
      slide: resolved.slide,
    })
    setExploredSlides((prev) => {
      const next = new Set(prev)
      next.add(`${resolved.lecture.week}:${resolved.slide.slide_number}`)
      return next
    })
  }, [])

  const handleCloseSource = useCallback(() => {
    setSourcePanel((prev) => ({ ...prev, isOpen: false }))
  }, [])

  // Navigate between slides within the SourcePanel
  const handleNavigateSlide = useCallback((lecture, slide) => {
    setSourcePanel({ isOpen: true, lecture, slide })
    setExploredSlides((prev) => {
      const next = new Set(prev)
      next.add(`${lecture.week}:${slide.slide_number}`)
      return next
    })
  }, [])

  const handleSlideViewed = useCallback((week, slideNumber) => {
    setExploredSlides((prev) => {
      const next = new Set(prev)
      next.add(`${week}:${slideNumber}`)
      return next
    })
  }, [])

  const handleOpenSlide = useCallback((lecture, slide) => {
    setSourcePanel({ isOpen: true, lecture, slide })
    setExploredSlides((prev) => {
      const next = new Set(prev)
      next.add(`${lecture.week}:${slide.slide_number}`)
      return next
    })
  }, [])

  // Selects a week from the sidebar and switches to the Course view
  const handleSelectLecture = useCallback((week) => {
    setSelectedWeek(week)
    setActiveView('course')
  }, [])

  // Opens the SourcePanel for a recently cited slide, or scrolls to the message
  const handleRecentItemClick = useCallback((item) => {
    const lecture = lectures.find((lec) => lec.week === item.week)
    if (lecture) {
      const slide = lecture.slides.find((s) => s.slide_number === item.slideNumber)
      if (slide) {
        setSourcePanel({ isOpen: true, lecture, slide })
        setExploredSlides((prev) => {
          const next = new Set(prev)
          next.add(`${lecture.week}:${slide.slide_number}`)
          return next
        })
        return
      }
    }
    // Fallback: switch to chat and scroll to the originating message
    setActiveView('chat')
    setTimeout(() => {
      const msgEl = document.getElementById(`msg-${item.messageId}`)
      if (msgEl) {
        msgEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        msgEl.classList.add('citation-highlight')
        setTimeout(() => msgEl.classList.remove('citation-highlight'), 2000)
      }
    }, 100)
  }, [])

  // Gate: show the student selector until a mode is chosen
  if (selectedMode === null) {
    return (
      <StudentSelector
        onSelect={handleSelectMode}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    )
  }

  return (
    <div
      className="h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <Header
        activeView={activeView}
        onViewChange={setActiveView}
        theme={theme}
        onToggleTheme={toggleTheme}
        exploredSlides={exploredSlides}
        savedCount={savedCount}
        onOpenProgress={() => setProgressCardOpen(v => !v)}
        progressCardOpen={progressCardOpen}
        onCloseProgress={() => setProgressCardOpen(false)}
      />

      <div className="flex-1 flex overflow-hidden">

        {/* Left sidebar — hidden on mobile */}
        <div className="hidden lg:flex w-[250px] flex-shrink-0">
          <CourseSidebar
            course={conversation?.course}
            exploredSlides={exploredSlides}
            selectedWeek={selectedWeek}
            onSelectLecture={handleSelectLecture}
            onViewChange={setActiveView}
            theme={theme}
          />
        </div>

        <main
          className="flex-1 flex flex-col min-w-0 overflow-hidden"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          {activeView === 'chat' && (
            <ChatView
              conversation={conversation}
              messages={messages}
              onAddMessage={handleAddMessage}
              onOpenSource={handleOpenSource}
              isConceptSaved={isConceptSaved}
              onSaveConcept={saveConcept}
            />
          )}

          {activeView === 'learn' && (
            <NotebookView
              concepts={concepts}
              onRemove={removeConcept}
              onOpenSource={handleOpenSource}
              personalNotes={personalNotes}
              onAddNote={addNote}
              onUpdateNote={updateNote}
              onDeleteNote={deleteNote}
            />
          )}

          {activeView === 'course' && (
            <CourseView
              exploredSlides={exploredSlides}
              selectedWeek={selectedWeek}
              onOpenSlide={handleOpenSlide}
            />
          )}
        </main>

        {/* Right sidebar — collapses to icon strip, hidden on mobile */}
        {activeView === 'chat' && (
          <div
            className={`
              hidden md:flex
              flex-shrink-0
              transition-all duration-300
              ${sidebarCollapsed ? 'w-[48px]' : 'w-[280px]'}
            `}
          >
            <LearningSidebar
              exploredSlides={exploredSlides}
              savedCount={savedCount}
              recentCitations={recentCitations}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              onViewChange={setActiveView}
              onOpenProgress={() => setProgressCardOpen(v => !v)}
              onRecentItemClick={handleRecentItemClick}
            />
          </div>
        )}
      </div>

      <SourcePanel
        isOpen={sourcePanel.isOpen}
        onClose={handleCloseSource}
        lecture={sourcePanel.lecture}
        slide={sourcePanel.slide}
        onNavigate={handleNavigateSlide}
        onSlideViewed={handleSlideViewed}
      />
    </div>
  )
}