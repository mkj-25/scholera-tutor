import { useState, useCallback } from 'react'

/**
 * useNotebook — manages saved concepts with localStorage persistence.
 *
 * Each saved concept has:
 * - id: unique identifier (generated)
 * - title: short concept title (derived from the question or answer)
 * - snippet: brief explanation excerpt
 * - citations: array of citation objects from the assistant message
 * - savedAt: ISO timestamp
 * - messageId: the original message ID it was saved from
 */

const STORAGE_KEY = 'scholera-notebook'

function loadSavedConcepts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function persistConcepts(concepts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(concepts))
  } catch {
    // Storage full or unavailable — fail silently
  }
}

export function useNotebook() {
  const [concepts, setConcepts] = useState(loadSavedConcepts)

  const saveConcept = useCallback((concept) => {
    setConcepts(prev => {
      // Don't save duplicates by messageId
      if (prev.some(c => c.messageId === concept.messageId)) return prev

      const newConcept = {
        ...concept,
        id: `concept_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        savedAt: new Date().toISOString(),
      }
      const updated = [newConcept, ...prev]
      persistConcepts(updated)
      return updated
    })
  }, [])

  const removeConcept = useCallback((conceptId) => {
    setConcepts(prev => {
      const updated = prev.filter(c => c.id !== conceptId)
      persistConcepts(updated)
      return updated
    })
  }, [])

  const isConceptSaved = useCallback((messageId) => {
    return concepts.some(c => c.messageId === messageId)
  }, [concepts])

  return {
    concepts,
    saveConcept,
    removeConcept,
    isConceptSaved,
    savedCount: concepts.length,
  }
}
