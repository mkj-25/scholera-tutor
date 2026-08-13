/**
 * Data loaders : re-export provided data files.
 * 
 * These import from the /data directory at the project root via the @data alias.
 * The conversation and lecture data is the immutable source of truth.
 */

import conversationData from '@data/conversation.json'
import conversationEmptyData from '@data/conversation-empty.json'
import lecture01 from '@data/lectures/lecture-01-linear-models.json'
import lecture02 from '@data/lectures/lecture-02-gradient-descent.json'
import lecture03 from '@data/lectures/lecture-03-regularization.json'

/** Both conversation files, keyed by ID for easy switching */
export const conversations = {
  [conversationData.id]: conversationData,
  [conversationEmptyData.id]: conversationEmptyData,
}

/** Default to the populated conversation */
export const defaultConversationId = conversationData.id
export const emptyConversationId = conversationEmptyData.id

/** All three lectures in an array, ordered by week */
export const lectures = [lecture01, lecture02, lecture03]

/** Total slide count across all lectures */
export const totalSlides = lectures.reduce(
  (sum, lec) => sum + lec.slides.length,
  0
)
