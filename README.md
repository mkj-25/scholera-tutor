# Scholera Tutor — CS 4780

A chat interface that teaches. Every answer is grounded in the actual lecture material — click any citation to open the slide it came from.

---

## Setup (under 5 minutes)

**Prerequisites:** Node.js 18+ and npm (comes with Node).

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd scholera-tutor

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser. You'll see a student selector — pick either mode to enter the tutor.

No API key, no backend, no environment variables needed.

---

## What you can do

- **Ask anything** in the composer — answers arrive as a real token stream (via `data/mock-stream.mjs`)
- **Click a citation** below any answer to open the exact lecture slide it came from
- **Stop mid-stream** with the ■ button; retry a failed or interrupted response
- **Save concepts** to the Learn tab notebook using the Bookmark button on any answer
- **Browse all slides** in the Course tab, with progress tracked across the conversation
- **Toggle dark mode** with the sun/moon button in the header

### Testing all 8 stream scenarios

Add `?dev=1` to the URL (e.g. `http://localhost:5173?dev=1`) to reveal the scenario trigger panel at the bottom of the chat. This lets you fire any of the 8 canned responses directly:

| Scenario | What it tests |
|---|---|
| `plain` | Basic prose answer |
| `code` | Syntax-highlighted Python code block |
| `math` | LaTeX / KaTeX math rendering |
| `table` | GFM table layout |
| `long` | Scroll + long markdown with headers |
| `slow` | 4-second first-token delay (loading state) |
| `refusal` | Tutor says it doesn't know (styled differently) |
| `error-midstream` | Stream dies partway — retry button appears |

---

## Project structure

```
src/
  components/
    chat/          ChatView, Composer, AssistantMessage, StreamingMessage
    citations/     CitationCard, SourcePanel (slide drawer)
    layout/        Header, CourseSidebar, LearningSidebar, StudentSelector
    notebook/      NotebookView (saved concepts + personal notes)
    ui/            MarkdownRenderer (markdown + LaTeX + syntax highlight)
  hooks/
    useStreamingMessage.js   Wraps mock-stream.mjs with abort support
    useNotebook.js           LocalStorage persistence for saved concepts
    useTheme.js              Dark/light mode
  lib/
    data.js                  Loads conversation.json + lecture JSONs
    matchScenario.js         Maps typed input to scenario IDs
    resolveCitation.js       Maps citation → actual lecture slide
    topicResponses.js        Topic-aware fallback responses

data/
  conversation.json          Pre-loaded conversation (existing student mode)
  conversation-empty.json    Empty start (new student mode)
  mock-stream.mjs            Fake streaming endpoint — no API key needed
  responses.json             8 canned responses with timing and error behaviour
  lectures/                  3 lecture JSON files (slides, bullets, formulas, notes)
```

---

## Design decisions

**What I built and why:**

The core bet is that the value of a tutor over a chatbot lies in traceability — every answer should be checkable against the actual thing the professor said. The citation → slide panel is the product expression of that. Clicking a citation doesn't just show metadata; it opens the real slide with bullets, formulas, figures, and the professor's speaker notes. That makes the answers verifiable, which is what distinguishes a course tutor from a general assistant.

The "Recently Explored" sidebar is a lightweight revision map — it shows which slides the current conversation has already touched, so a student can find a previous topic without scrolling the full chat log.

**What I deliberately left out:**

- A real AI backend. The mock stream is enough to evaluate the product, and adding a model call would bloat setup time.
- Per-message inline citations (superscript numbers mid-paragraph). I considered this but the data doesn't have sentence-level attribution — the citations are per-answer, not per-sentence.

**What's still rough:**

- The Notebook WYSIWYG editor is over-built for the scope. It works, but I'd pare it back in a real iteration.
- Keyword matching for routing to scenarios is fragile. Free-typed input that doesn't match any pattern falls back to a generic response that may not feel relevant.

---

## AI usage

See `AI_USAGE.md`.
