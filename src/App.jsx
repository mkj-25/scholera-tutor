import { useState, useCallback, useMemo } from 'react'
import Header from './components/layout/Header'
import { MobileNav } from './components/layout/GlassNav'
import CourseSidebar from './components/layout/CourseSidebar'
import LearningSidebar from './components/layout/LearningSidebar'
import ChatView from './components/chat/ChatView'
import NotebookView from './components/notebook/NotebookView'
import CourseView from './components/course/CourseView'
import SourcePanel from './components/citations/SourcePanel'
import { useTheme } from './hooks/useTheme'
import { useNotebook } from './hooks/useNotebook'
import {
  conversations,
  defaultConversationId,
  emptyConversationId,
  lectures,
} from './lib/data'
import { resolveCitation } from './lib/resolveCitation'

/**
 * App — root component orchestrating all views, state, and navigation.
 *
 * State:
 * - activeView: 'chat' | 'learn' | 'course'
 * - activeConversationId: current conversation
 * - messages: conversation messages + streamed messages
 * - sourcePanel: currently opened lecture/slide
 * - exploredSlides: Set of "week:slide" keys
 * - sidebarCollapsed: right sidebar state
 * - selectedWeek: lecture currently selected in Course view
 */
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

  // ============================================================
  // NAVIGATION
  // ============================================================

  const [activeView, setActiveView] = useState('chat')

  // Which week is currently selected in the Course view
  const [selectedWeek, setSelectedWeek] = useState(null)

  // ============================================================
  // CONVERSATION
  // ============================================================

  const [activeConversationId, setActiveConversationId] =
    useState(defaultConversationId)

  const conversation = conversations[activeConversationId]

  // ============================================================
  // MESSAGES
  // ============================================================

  const [messageOverrides, setMessageOverrides] = useState({})

  const messages = useMemo(() => {
    const base = conversation?.messages || []

    return messageOverrides[activeConversationId]
      ? [
          ...base,
          ...messageOverrides[activeConversationId],
        ]
      : base
  }, [
    conversation,
    activeConversationId,
    messageOverrides,
  ])

  // ============================================================
  // SOURCE PANEL
  // ============================================================

  const [sourcePanel, setSourcePanel] = useState({
    isOpen: false,
    lecture: null,
    slide: null,
  })

  // ============================================================
  // EXPLORED SLIDES
  // ============================================================

  const [exploredSlides, setExploredSlides] = useState(() => {
    const explored = new Set()

    const conv = conversations[defaultConversationId]

    if (conv?.messages) {
      conv.messages.forEach((msg) => {
        if (!msg.citations) return

        msg.citations.forEach((citation) => {
          const resolved = resolveCitation(
            citation,
            lectures
          )

          if (resolved) {
            explored.add(
              `${resolved.week}:${citation.slide}`
            )
          }
        })
      })
    }

    return explored
  })

  // ============================================================
  // RIGHT SIDEBAR
  // ============================================================

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false)

  // ============================================================
  // RECENT CITATIONS
  // ============================================================

  const recentCitations = useMemo(() => {
    const seen = new Set()
    const recent = []

    for (
      let i = messages.length - 1;
      i >= 0;
      i--
    ) {
      const msg = messages[i]

      if (!msg.citations) continue

      for (const citation of msg.citations) {
        const resolved = resolveCitation(
          citation,
          lectures
        )

        if (!resolved) continue

        const key =
          `${resolved.week}:${citation.slide}`

        if (seen.has(key)) continue

        seen.add(key)

        recent.push({
          title: resolved.slide.title,
          week: resolved.week,
          slideNumber: citation.slide,
        })
      }
    }

    return recent.slice(0, 8)
  }, [messages])

  // ============================================================
  // ADD MESSAGE
  // ============================================================

  const handleAddMessage = useCallback(
    (message) => {
      setMessageOverrides((prev) => ({
        ...prev,

        [activeConversationId]: [
          ...(prev[activeConversationId] || []),
          message,
        ],
      }))

      // Track citations as explored
      if (message.citations?.length > 0) {
        setExploredSlides((prev) => {
          const next = new Set(prev)

          message.citations.forEach((citation) => {
            const resolved = resolveCitation(
              citation,
              lectures
            )

            if (resolved) {
              next.add(
                `${resolved.week}:${citation.slide}`
              )
            }
          })

          return next
        })
      }
    },
    [activeConversationId]
  )

  // ============================================================
  // OPEN SOURCE
  // ============================================================

  const handleOpenSource = useCallback((resolved) => {
    setSourcePanel({
      isOpen: true,
      lecture: resolved.lecture,
      slide: resolved.slide,
    })

    setExploredSlides((prev) => {
      const next = new Set(prev)

      next.add(
        `${resolved.lecture.week}:${resolved.slide.slide_number}`
      )

      return next
    })
  }, [])

  // ============================================================
  // CLOSE SOURCE
  // ============================================================

  const handleCloseSource = useCallback(() => {
    setSourcePanel((prev) => ({
      ...prev,
      isOpen: false,
    }))
  }, [])

  // ============================================================
  // NAVIGATE SOURCE SLIDES
  // ============================================================

  const handleNavigateSlide = useCallback(
    (lecture, slide) => {
      setSourcePanel({
        isOpen: true,
        lecture,
        slide,
      })

      setExploredSlides((prev) => {
        const next = new Set(prev)

        next.add(
          `${lecture.week}:${slide.slide_number}`
        )

        return next
      })
    },
    []
  )

  // ============================================================
  // TRACK VIEWED SLIDE
  // ============================================================

  const handleSlideViewed = useCallback(
    (week, slideNumber) => {
      setExploredSlides((prev) => {
        const next = new Set(prev)

        next.add(`${week}:${slideNumber}`)

        return next
      })
    },
    []
  )

  // ============================================================
  // OPEN SLIDE FROM COURSE VIEW
  // ============================================================

  const handleOpenSlide = useCallback(
    (lecture, slide) => {
      setSourcePanel({
        isOpen: true,
        lecture,
        slide,
      })

      setExploredSlides((prev) => {
        const next = new Set(prev)

        next.add(
          `${lecture.week}:${slide.slide_number}`
        )

        return next
      })
    },
    []
  )

  // ============================================================
  // SELECT LECTURE
  // ============================================================

  const handleSelectLecture = useCallback((week) => {
    setSelectedWeek(week)
    setActiveView('course')
  }, [])

  // ============================================================
  // SWITCH CONVERSATION
  // ============================================================

  const handleSwitchConversation = useCallback(() => {
    setActiveConversationId((prev) =>
      prev === defaultConversationId
        ? emptyConversationId
        : defaultConversationId
    )
  }, [])

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="h-screen flex flex-col"
      style={{
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {/* ======================================================
          HEADER
      ======================================================= */}

      <Header
        activeView={activeView}
        onViewChange={setActiveView}
        theme={theme}
        onToggleTheme={toggleTheme}
        exploredSlides={exploredSlides}
        savedCount={savedCount}
      />

      {/* ======================================================
          MAIN LAYOUT
      ======================================================= */}

      <div className="flex-1 flex overflow-hidden">

        {/* ====================================================
            LEFT COURSE SIDEBAR
        ===================================================== */}

        <div className="hidden lg:flex w-[250px] flex-shrink-0">
          <CourseSidebar
            course={conversation?.course}
            exploredSlides={exploredSlides}
            selectedWeek={selectedWeek}
            onSelectLecture={handleSelectLecture}
            onViewChange={setActiveView}
          />
        </div>

        {/* ====================================================
            CENTER
        ===================================================== */}

        <main
          className="flex-1 flex flex-col min-w-0 overflow-hidden"
          style={{
            backgroundColor: 'var(--color-bg)',
          }}
        >
          {/* CHAT */}

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

          {/* LEARN */}

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

          {/* COURSE */}

          {activeView === 'course' && (
            <CourseView
              exploredSlides={exploredSlides}
              selectedWeek={selectedWeek}
              onOpenSlide={handleOpenSlide}
            />
          )}
        </main>

        {/* ====================================================
            RIGHT LEARNING SIDEBAR
        ===================================================== */}

        {activeView === 'chat' && (
          <div
            className={`
              hidden md:flex
              flex-shrink-0
              transition-all duration-300
              ${
                sidebarCollapsed
                  ? 'w-[48px]'
                  : 'w-[280px]'
              }
            `}
          >
            <LearningSidebar
              exploredSlides={exploredSlides}
              savedCount={savedCount}
              recentCitations={recentCitations}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() =>
                setSidebarCollapsed(
                  !sidebarCollapsed
                )
              }
              onViewChange={setActiveView}
            />
          </div>
        )}
      </div>

      {/* ======================================================
          MOBILE NAV
      ======================================================= */}

      <MobileNav
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* ======================================================
          SOURCE PANEL
      ======================================================= */}

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