import { useRef, useEffect, useCallback, useState } from 'react'
import UserMessage from './UserMessage'
import AssistantMessage from './AssistantMessage'
import StreamingMessage from './StreamingMessage'
import Composer from './Composer'
import EmptyState from './EmptyState'
import DevScenarioTrigger from './DevScenarioTrigger'
import { useStreamingMessage } from '../../hooks/useStreamingMessage'
import { matchScenario } from '../../lib/matchScenario'

/**
 * ChatView — the main conversation view.
 *
 * Manages the message list, streaming state, and composer.
 * Renders EmptyState when conversation has no messages, but always shows
 * the composer at the bottom so the student can start typing immediately.
 */
export default function ChatView({
  conversation,
  messages,
  onAddMessage,
  onOpenSource,
  isConceptSaved,
  onSaveConcept,
}) {
  const messagesEndRef = useRef(null)

  // Ref to prevent double-finalization of streaming messages
  const finalizingRef = useRef(false)

  const {
    content: streamContent,
    status: streamStatus,
    error: streamError,
    citations: streamCitations,
    startStream,
    abort,
    reset: resetStream,
  } = useStreamingMessage()

  // Track the scenario ID of the current stream for retry
  const currentScenarioRef = useRef(null)

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages.length, scrollToBottom])

  // Scroll during streaming (throttled — only when content changes)
  useEffect(() => {
    if (streamStatus === 'streaming') {
      scrollToBottom()
    }
  }, [streamContent, streamStatus, scrollToBottom])

  // Finalize streaming message when done
  useEffect(() => {
    if (streamStatus === 'done' && streamContent && !finalizingRef.current) {
      finalizingRef.current = true
      onAddMessage({
        id: `m_${Date.now()}`,
        role: 'assistant',
        created_at: new Date().toISOString(),
        content: streamContent,
        citations: streamCitations,
      })
      resetStream()
      finalizingRef.current = false
    }
  }, [streamStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  // Finalize stopped/errored messages (only if there is content to show)
  useEffect(() => {
    if ((streamStatus === 'stopped' || streamStatus === 'error') && streamContent && !finalizingRef.current) {
      finalizingRef.current = true
      onAddMessage({
        id: `m_${Date.now()}`,
        role: 'assistant',
        created_at: new Date().toISOString(),
        content: streamContent,
        citations: streamCitations,
        _streamStatus: streamStatus,
        _streamError: streamError,
        _scenarioId: currentScenarioRef.current,
      })
      resetStream()
      finalizingRef.current = false
    }
  }, [streamStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback((text) => {
    finalizingRef.current = false
    // Add user message
    onAddMessage({
      id: `m_${Date.now()}_user`,
      role: 'user',
      created_at: new Date().toISOString(),
      content: text,
    })

    // Match to a scenario and start streaming
    const scenarioId = matchScenario(text)
    currentScenarioRef.current = scenarioId
    startStream(scenarioId)
  }, [onAddMessage, startStream])

  const handleDevTrigger = useCallback((prompt, scenarioId) => {
    finalizingRef.current = false
    onAddMessage({
      id: `m_${Date.now()}_user`,
      role: 'user',
      created_at: new Date().toISOString(),
      content: prompt,
    })
    currentScenarioRef.current = scenarioId
    startStream(scenarioId)
  }, [onAddMessage, startStream])

  const handleRetry = useCallback((scenarioId) => {
    finalizingRef.current = false
    currentScenarioRef.current = scenarioId
    startStream(scenarioId)
  }, [startStream])

  const handleSave = useCallback((message) => {
    const msgIndex = messages.findIndex(m => m.id === message.id)
    const userMsg = msgIndex > 0 ? messages[msgIndex - 1] : null
    const title = userMsg?.role === 'user'
      ? userMsg.content.slice(0, 80)
      : message.content.split('\n')[0].replace(/[*#]/g, '').trim().slice(0, 80)

    onSaveConcept({
      messageId: message.id,
      title,
      snippet: message.content.slice(0, 200),
      citations: message.citations || [],
    })
  }, [messages, onSaveConcept])

  const isStreaming = streamStatus === 'streaming' || streamStatus === 'connecting'
  const hasMessages = messages.length > 0 || isStreaming

  return (
    <div className="flex flex-col h-full">
      {/* Message area — empty state hero OR message list */}
      {!hasMessages ? (
        <EmptyState
          course={conversation.course}
          onSendPrompt={handleSend}
        />
      ) : (
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="max-w-3xl mx-auto">
            {messages.map((msg) => {
              if (msg.role === 'user') {
                return <UserMessage key={msg.id} message={msg} />
              }

              return (
                <div key={msg.id}>
                  <AssistantMessage
                    message={msg}
                    isSaved={isConceptSaved(msg.id)}
                    onSave={handleSave}
                    onOpenSource={onOpenSource}
                  />
                  {/* Inline error notice for finalized error messages */}
                  {msg._streamStatus === 'error' && (
                    <div className="pl-8 mb-4">
                      <div
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                        style={{
                          borderColor: 'rgba(220,38,38,0.3)',
                          backgroundColor: 'var(--color-error-tint)',
                        }}
                      >
                        <span className="text-sm flex-1" style={{ color: 'var(--color-error)' }}>
                          {msg._streamError || 'Connection lost while generating.'}
                        </span>
                        <button
                          onClick={() => handleRetry(msg._scenarioId)}
                          className="flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-medium
                                     transition-colors duration-200"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}
                  {msg._streamStatus === 'stopped' && (
                    <div
                      className="pl-8 mb-4 text-xs"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      Generation stopped
                    </div>
                  )}
                </div>
              )
            })}

            {/* Active streaming message */}
            {isStreaming && (
              <StreamingMessage
                content={streamContent}
                status={streamStatus}
                error={streamError}
              />
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Composer — always visible at bottom of chat */}
      <Composer
        onSend={handleSend}
        onStop={abort}
        isStreaming={isStreaming}
      />

      {/* Dev scenario trigger */}
      <DevScenarioTrigger onTrigger={handleDevTrigger} />
    </div>
  )
}
