import { useState, useRef, useCallback } from 'react'

/**
 * useStreamingMessage — wraps mock-stream.mjs to stream AI responses.
 *
 * Exposes:
 * - content: the streamed text accumulated so far
 * - status: 'idle' | 'connecting' | 'streaming' | 'done' | 'stopped' | 'error'
 * - error: error message string when status is 'error'
 * - citations: citations array from the scenario
 * - startStream(scenarioId): begin streaming a scenario
 * - abort(): cancel the current stream (user pressed Stop)
 *
 * Uses the real mock-stream.mjs API:
 * - streamResponse(id, { signal }) — async generator yielding string chunks
 * - getScenario(id) — get full scenario record including citations
 *
 * Handles all edge cases from responses.json:
 * - Normal streaming (plain, code, math, table, long)
 * - Slow first token (~4.2s delay for 'slow' scenario)
 * - Mid-stream error (error-midstream: streams partial then throws)
 * - User cancellation via AbortController
 */

export function useStreamingMessage() {
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [citations, setCitations] = useState([])

  const abortControllerRef = useRef(null)
  const isStreamingRef = useRef(false)

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    if (isStreamingRef.current) {
      isStreamingRef.current = false
      setStatus('stopped')
    }
  }, [])

  const startStream = useCallback(async (scenarioId) => {
    // Abort any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Reset state
    setContent('')
    setError(null)
    setCitations([])
    setStatus('connecting')
    isStreamingRef.current = true

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      // Dynamic import of mock-stream.mjs from the data directory.
      // This uses Vite's ability to resolve relative paths at build time.
      const { streamResponse, getScenario } = await import('@data/mock-stream.mjs')

      // Get the scenario metadata (for citations)
      const scenario = getScenario(scenarioId)
      setCitations(scenario.citations || [])

      setStatus('streaming')

      // Stream chunks from the async generator
      let accumulated = ''
      for await (const chunk of streamResponse(scenarioId, { signal: controller.signal })) {
        if (controller.signal.aborted) {
          isStreamingRef.current = false
          return
        }
        accumulated += chunk
        setContent(accumulated)
      }

      // Stream completed successfully
      isStreamingRef.current = false
      setStatus('done')
    } catch (err) {
      isStreamingRef.current = false

      if (controller.signal.aborted) {
        // User-initiated abort — already set to 'stopped'
        setStatus('stopped')
        return
      }

      // Genuine error (e.g. error-midstream scenario)
      setError(err.message || 'An unexpected error occurred.')
      setStatus('error')
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null
      }
    }
  }, [])

  const reset = useCallback(() => {
    setContent('')
    setStatus('idle')
    setError(null)
    setCitations([])
  }, [])

  return {
    content,
    status,
    error,
    citations,
    startStream,
    abort,
    reset,
  }
}
