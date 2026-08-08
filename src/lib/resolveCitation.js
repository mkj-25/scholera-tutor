/**
 * resolveCitation(citation, lectures)
 *
 * Maps a citation object from conversation/response data to the actual
 * lecture and slide objects from the lecture JSON files.
 *
 * Citation shape (from conversation.json / responses.json):
 *   { "lecture": "Week 2 — Gradient Descent and Backpropagation", "slide": 9 }
 *
 * Lecture shape (from lectures/*.json):
 *   { lecture_id, course_code, course_title, week, title, slides: [...] }
 *   where title = "Gradient Descent and Backpropagation"
 *
 * The citation.lecture string is formatted as "Week N — <lecture title>",
 * so we match by extracting the title portion after the "—" dash.
 */

/**
 * @param {{ lecture: string, slide: number }} citation
 * @param {Array} lectures — array of lecture objects
 * @returns {{ lecture: object, slide: object, week: number } | null}
 */
export function resolveCitation(citation, lectures) {
  if (!citation || !citation.lecture || !lectures) return null

  // The citation lecture string looks like "Week 2 — Gradient Descent and Backpropagation"
  // Extract the title part after the em dash
  const dashIndex = citation.lecture.indexOf('—')
  const citationTitle = dashIndex !== -1
    ? citation.lecture.slice(dashIndex + 1).trim()
    : citation.lecture.trim()

  // Also extract the week number from the prefix "Week N"
  const weekMatch = citation.lecture.match(/Week\s+(\d+)/)
  const citationWeek = weekMatch ? parseInt(weekMatch[1], 10) : null

  // Find the matching lecture — try title match first, fall back to week match
  const lecture = lectures.find(lec => {
    if (lec.title === citationTitle) return true
    if (citationWeek !== null && lec.week === citationWeek) return true
    return false
  })

  if (!lecture) return null

  // Find the matching slide by slide_number
  const slide = lecture.slides.find(s => s.slide_number === citation.slide)

  if (!slide) return null

  return {
    lecture,
    slide,
    week: lecture.week,
    slideIndex: lecture.slides.indexOf(slide),
    totalSlides: lecture.slides.length,
  }
}

/**
 * Create a unique key for a citation, used for tracking explored slides.
 */
export function citationKey(citation) {
  if (!citation) return null
  return `${citation.lecture}::${citation.slide}`
}

/**
 * Given a lecture title string from a citation, return the week number.
 */
export function weekFromCitation(citation) {
  if (!citation?.lecture) return null
  const match = citation.lecture.match(/Week\s+(\d+)/)
  return match ? parseInt(match[1], 10) : null
}
