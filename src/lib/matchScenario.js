/**
 * matchScenario(userInput)
 *
 * Maps a student's free-typed prompt to one of the 8 scenario IDs in
 * responses.json. Since there is no real model behind this, we use a
 * deterministic keyword-matching approach.
 *
 * The 8 scenarios: plain, code, math, table, long, refusal, error-midstream, slow
 *
 * Strategy:
 * 1. Exact matches for curated starter prompts → guaranteed scenario IDs
 * 2. Keyword heuristics for free-typed input
 * 3. Default fallback to 'plain'
 */

/** Curated prompts that map directly to scenario IDs.
 *  These are used by the empty-state starter cards and guaranteed to work. */
const EXACT_PROMPTS = {
  'What is the difference between supervised and unsupervised learning?': 'plain',
  'Show me how gradient descent is implemented.': 'code',
  'Why is the sigmoid derivative at most 0.25?': 'math',
  'Compare the regularization techniques we covered.': 'table',
  'Explain everything about backpropagation.': 'long',
  'When is the final exam?': 'refusal',
  'Walk me through the midterm solutions.': 'error-midstream',
  'Summarise the whole course so far.': 'slow',
}

/**
 * Keyword patterns for fuzzy matching of free-typed input.
 * Each entry: [scenarioId, keywordPatterns]
 * Order matters — first match wins.
 */
const KEYWORD_RULES = [
  // Refusal — asking about things outside course material
  ['refusal', [/\b(exam|final|midterm date|grade|score|schedule|deadline|office hours)\b/i]],

  // Error midstream — midterm solutions specifically
  ['error-midstream', [/\b(midterm solution|midterm answer|walk.*through.*midterm)\b/i]],

  // Code — asking for implementation/code
  ['code', [/\b(code|implement|python|function|program|write.*code|show.*code)\b/i]],

  // Math — asking about mathematical derivations
  ['math', [/\b(sigmoid|derivative|proof|prove|math|formula|equation|why.*0\.25)\b/i]],

  // Table — comparing or listing things
  ['table', [/\b(compare|comparison|table|regulariz|l1.*l2|ridge.*lasso|technique|versus|vs)\b/i]],

  // Long — asking for comprehensive explanations
  ['long', [/\b(everything|backprop|explain.*all|full.*explanation|in.*depth|comprehensive)\b/i]],

  // Slow — course summary
  ['slow', [/\b(summar|overview|whole course|course so far|recap|review)\b/i]],
]

/**
 * @param {string} userInput — the student's typed prompt
 * @returns {string} — one of the 8 scenario IDs
 */
export function matchScenario(userInput) {
  if (!userInput || typeof userInput !== 'string') return 'plain'

  const trimmed = userInput.trim()

  // 1. Check exact match against curated prompts
  if (EXACT_PROMPTS[trimmed]) {
    return EXACT_PROMPTS[trimmed]
  }

  // 2. Check keyword heuristics
  const lower = trimmed.toLowerCase()
  for (const [scenarioId, patterns] of KEYWORD_RULES) {
    for (const pattern of patterns) {
      if (pattern.test(lower)) {
        return scenarioId
      }
    }
  }

  // 3. Default fallback
  return 'plain'
}

/**
 * The curated starter prompts for the empty state.
 * Each has a display label, the actual prompt text, and the scenario it triggers.
 */
export const STARTER_PROMPTS = [
  {
    label: 'Supervised vs Unsupervised',
    prompt: 'What is the difference between supervised and unsupervised learning?',
    scenario: 'plain',
    week: 1,
  },
  {
    label: 'Gradient Descent Code',
    prompt: 'Show me how gradient descent is implemented.',
    scenario: 'code',
    week: 2,
  },
  {
    label: 'Sigmoid Derivative',
    prompt: 'Why is the sigmoid derivative at most 0.25?',
    scenario: 'math',
    week: 1,
  },
  {
    label: 'Regularization Comparison',
    prompt: 'Compare the regularization techniques we covered.',
    scenario: 'table',
    week: 3,
  },
]

/** All 8 scenario IDs, for the dev trigger panel */
export const ALL_SCENARIOS = Object.values(EXACT_PROMPTS)
  .filter((v, i, a) => a.indexOf(v) === i) // unique

export { EXACT_PROMPTS }
