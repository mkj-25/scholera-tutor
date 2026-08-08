import { useState, useCallback, useMemo } from 'react'
import Header from './components/layout/Header'
import { MobileNav } from './components/layout/GlassNav'
import CourseSidebar from './components/layout/CourseSidebar'
import LearningSidebar from './components/layout/LearningSidebar'
import ChatView from './components/chat/ChatView'
import NotebookView from './components/notebook/NotebookView'
import CourseView from './components/course/CourseView'
import SourcePanel from './components/citations/SourcePanel'
import AuthScreen from './components/auth/AuthScreen'
import ProgressOverview from './components/ui/ProgressOverview'
import { useTheme } from './hooks/useTheme'
import { useNotebook } from './hooks/useNotebook'
import { useAuth } from './hooks/useAuth'
import {
  conversations,
  defaultConversationId,
  emptyConversationId,
  lectures,
} from './lib/data'
import { resolveCitation } from './lib/resolveCitation'

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const { concepts, saveConcept, removeConcept, isConceptSaved, savedCount } = useNotebook()
  const { user, login, logout, isAuthenticated } = useAuth()

  // Navigation
  const [activeView, setActiveView] = useState('chat')

  // Conversation state
  const [activeConversationId, setActiveConversationId] = useState(defaultConversationId)
  const conversation = conversations[activeConversationId]

  // Messages
  const [messageOverrides, setMessageOverrides] = useState({})
  const messages = useMemo(() => {
    const base = conversation.messages || []
    return messageOverrides[activeConversationId]
      ? [...base, ...messageOverrides[activeConversationId]]
      : base
  }, [conversation, activeConversationId, messageOverrides])

  // Source panel
  const [sourcePanel, setSourcePanel] = useState({
    isOpen: false,
    lecture: null,
    slide: null,
  })

  // Progress overview modal
  const [progressOpen, setProgressOpen] = useState(false)

  // Explored slides (session-scoped, pre-populated from existing conversation)
  const [exploredSlides, setExploredSlides] = useState(() => {
    const explored = new Set()
    const conv = conversations[defaultConversationId]
    if (conv.messages) {
      conv.messages.forEach(msg => {
        if (msg.citations) {
          msg.citations.forEach(c => {
            const resolved = resolveCitation(c, lectures)
            if (resolved) {
              explored.add(`${resolved.week}:${c.slide}`)
            }
          })
        }
      })
    }
    return explored
  })

  // Right sidebar collapsed
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Recent citations
  const recentCitations = useMemo(() => {
    const seen = new Set()
    const recent = []
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i]
      if (msg.citations) {
        for (const c of msg.citations) {
          const resolved = resolveCitation(c, lectures)
          if (resolved && !seen.has(`${resolved.week}:${c.slide}`)) {
            seen.add(`${resolved.week}:${c.slide}`)
            recent.push({
              title: resolved.slide.title,
              week: resolved.week,
              slideNumber: c.slide,
            })
          }
        }
      }
    }
    return recent.slice(0, 8)
  }, [messages])

  const handleAddMessage = useCallback((message) => {
    setMessageOverrides(prev => ({
      ...prev,
      [activeConversationId]: [
        ...(prev[activeConversationId] || []),
        message,
      ],
    }))

    if (message.citations?.length > 0) {
      setExploredSlides(prev => {
        const next = new Set(prev)
        message.citations.forEach(c => {
          const resolved = resolveCitation(c, lectures)
          if (resolved) {
            next.add(`${resolved.week}:${c.slide}`)
          }
        })
        return next
      })
    }
  }, [activeConversationId])

  const handleOpenSource = useCallback((resolved) => {
    setSourcePanel({
      isOpen: true,
      lecture: resolved.lecture,
      slide: resolved.slide,
    })
    setExploredSlides(prev => {
      const next = new Set(prev)
      next.add(`${resolved.lecture.week}:${resolved.slide.slide_number}`)
      return next
    })
  }, [])

  const handleCloseSource = useCallback(() => {
    setSourcePanel(prev => ({ ...prev, isOpen: false }))
  }, [])

  const handleNavigateSlide = useCallback((lecture, slide) => {
    setSourcePanel({ isOpen: true, lecture, slide })
    setExploredSlides(prev => {
      const next = new Set(prev)
      next.add(`${lecture.week}:${slide.slide_number}`)
      return next
    })
  }, [])

  const handleSlideViewed = useCallback((week, slideNumber) => {
    setExploredSlides(prev => {
      const next = new Set(prev)
      next.add(`${week}:${slideNumber}`)
      return next
    })
  }, [])

  const handleOpenSlide = useCallback((lecture, slide) => {
    setSourcePanel({ isOpen: true, lecture, slide })
    setExploredSlides(prev => {
      const next = new Set(prev)
      next.add(`${lecture.week}:${slide.slide_number}`)
      return next
    })
  }, [])

  const handleSwitchConversation = useCallback(() => {
    setActiveConversationId(prev =>
      prev === defaultConversationId ? emptyConversationId : defaultConversationId
    )
  }, [])

  const handleAuth = useCallback((email, name) => {
    login(email, name)
  }, [login])

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen onAuth={handleAuth} />
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <Header
        activeView={activeView}
        onViewChange={setActiveView}
        theme={theme}
        onToggleTheme={toggleTheme}
        user={user}
        onLogout={logout}
        exploredSlides={exploredSlides}
        savedCount={savedCount}
        onOpenProgress={() => setProgressOpen(true)}
      />

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar — desktop only */}
        <div className="hidden lg:flex w-[240px] flex-shrink-0">
          <CourseSidebar
            course={conversation.course}
            exploredSlides={exploredSlides}
            onViewChange={setActiveView}
          />
        </div>

        {/* Center — main content area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden"
              style={{ backgroundColor: 'var(--color-bg)' }}>
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
            />
          )}

          {activeView === 'course' && (
            <CourseView
              exploredSlides={exploredSlides}
              onOpenSlide={handleOpenSlide}
            />
          )}
        </main>

        {/* Right sidebar — desktop only, chat view only */}
        {activeView === 'chat' && (
          <div className={`hidden md:flex flex-shrink-0 transition-all duration-300 ${
            sidebarCollapsed ? 'w-[48px]' : 'w-[272px]'
          }`}>
            <LearningSidebar
              exploredSlides={exploredSlides}
              savedCount={savedCount}
              recentCitations={recentCitations}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              onViewChange={setActiveView}
              onOpenProgress={() => setProgressOpen(true)}
            />
          </div>
        )}
      </div>

      {/* Mobile bottom nav */}
      <MobileNav activeView={activeView} onViewChange={setActiveView} />

      {/* Source panel */}
      <SourcePanel
        isOpen={sourcePanel.isOpen}
        onClose={handleCloseSource}
        lecture={sourcePanel.lecture}
        slide={sourcePanel.slide}
        onNavigate={handleNavigateSlide}
        onSlideViewed={handleSlideViewed}
      />

      {/* Progress overview modal */}
      <ProgressOverview
        isOpen={progressOpen}
        onClose={() => setProgressOpen(false)}
        exploredSlides={exploredSlides}
        savedCount={savedCount}
      />
    </div>
  )
}
