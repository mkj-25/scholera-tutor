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
 *
 * Personal notes (separate) have:
 * - id: unique identifier
 * - title: user-supplied note title
 * - content: markdown string
 * - createdAt: ISO timestamp
 * - updatedAt: ISO timestamp
 */

const STORAGE_KEY = 'scholera-notebook'
const NOTES_STORAGE_KEY = 'scholera-personal-notes'

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

function loadPersonalNotes() {
  try {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function persistNotes(notes) {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes))
  } catch {
    // fail silently
  }
}

export function useNotebook() {
  const [concepts, setConcepts] = useState(loadSavedConcepts)
  const [personalNotes, setPersonalNotes] = useState(loadPersonalNotes)

  // ── Saved Concepts ──────────────────────────────────────────

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

  // ── Personal Notes ──────────────────────────────────────────

  const addNote = useCallback((title, content) => {
    const newNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim() || 'Untitled Note',
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setPersonalNotes(prev => {
      const updated = [newNote, ...prev]
      persistNotes(updated)
      return updated
    })
    return newNote.id
  }, [])

  const updateNote = useCallback((noteId, { title, content }) => {
    setPersonalNotes(prev => {
      const updated = prev.map(n =>
        n.id === noteId
          ? {
              ...n,
              title: title !== undefined ? (title.trim() || 'Untitled Note') : n.title,
              content: content !== undefined ? content : n.content,
              updatedAt: new Date().toISOString(),
            }
          : n
      )
      persistNotes(updated)
      return updated
    })
  }, [])

  const deleteNote = useCallback((noteId) => {
    setPersonalNotes(prev => {
      const updated = prev.filter(n => n.id !== noteId)
      persistNotes(updated)
      return updated
    })
  }, [])

  return {
    concepts,
    saveConcept,
    removeConcept,
    isConceptSaved,
    savedCount: concepts.length,
    // personal notes
    personalNotes,
    addNote,
    updateNote,
    deleteNote,
  }
}
