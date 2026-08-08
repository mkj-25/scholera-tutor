import { useState, useRef, useCallback } from 'react'

/**
 * useStreamingMessage — wraps mock-stream.mjs to stream AI responses.
 *
 * Supports two stream modes:
 * 1. startStream(scenarioId) — streams a predefined scenario (original behavior)
 * 2. startTextStream(text, citations) — streams arbitrary text with given citations
 *
 * Exposes:
 * - content: the streamed text accumulated so far
 * - status: 'idle' | 'connecting' | 'streaming' | 'done' | 'stopped' | 'error'
 * - error: error message string when status is 'error'
 * - citations: citations array from the scenario
 * - startStream(scenarioId): begin streaming a scenario
 * - startTextStream(text, citations): stream arbitrary text
 * - abort(): cancel the current stream (user pressed Stop)
 */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Split text into small chunks mimicking real streaming tokens */
function chunkify(text) {
  const chunks = []
  let i = 0
  let seed = 1337 + text.charCodeAt(0)
  const next = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)

  while (i < text.length) {
    const size = 2 + Math.floor(next() * 7)
    chunks.push(text.slice(i, i + size))
    i += size
  }
  return chunks
}

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
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setContent('')
    setError(null)
    setCitations([])
    setStatus('connecting')
    isStreamingRef.current = true

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const { streamResponse, getScenario } = await import('@data/mock-stream.mjs')

      const scenario = getScenario(scenarioId)
      setCitations(scenario.citations || [])

      setStatus('streaming')

      let accumulated = ''
      for await (const chunk of streamResponse(scenarioId, { signal: controller.signal })) {
        if (controller.signal.aborted) {
          isStreamingRef.current = false
          return
        }
        accumulated += chunk
        setContent(accumulated)
      }

      isStreamingRef.current = false
      setStatus('done')
    } catch (err) {
      isStreamingRef.current = false

      if (controller.signal.aborted) {
        setStatus('stopped')
        return
      }

      setError(err.message || 'An unexpected error occurred.')
      setStatus('error')
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null
      }
    }
  }, [])

  /**
   * Stream arbitrary text with given citations.
   * Used for topic-aware responses that don't have a scenario ID.
   */
  const startTextStream = useCallback(async (text, citationsArg = []) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setContent('')
    setError(null)
    setCitations(citationsArg)
    setStatus('connecting')
    isStreamingRef.current = true

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const chunks = chunkify(text)

      // First token delay: 300-600ms
      await sleep(350)
      if (controller.signal.aborted) {
        isStreamingRef.current = false
        return
      }

      setStatus('streaming')

      let accumulated = ''
      for (const chunk of chunks) {
        if (controller.signal.aborted) {
          isStreamingRef.current = false
          return
        }
        accumulated += chunk
        setContent(accumulated)
        await sleep(14)
      }

      isStreamingRef.current = false
      setStatus('done')
    } catch (err) {
      isStreamingRef.current = false

      if (controller.signal.aborted) {
        setStatus('stopped')
        return
      }

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
    startTextStream,
    abort,
    reset,
  }
}
