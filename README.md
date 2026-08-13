# Scholera Tutor

A course-specific AI tutor interface, not a general chatbot. Every answer is grounded in the actual lecture material and traceable back to the exact slide it came from. The goal was to build something that respects what makes a *course tutor* different from a generic assistant: the ability to verify answers against what was actually taught.

---

**Live Demo:** [Open Scholera Tutor](https://scholera-tutor.vercel.app/)

---

## Setup

**Prerequisites:** Node.js 18+ and npm (included with Node).

```bash
git clone <repository-url>
cd scholera-tutor
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

- No API key required
- No backend required
- No environment variables required

You will land on a student selector screen. Choose **Existing Student** to load a pre-populated conversation history, or **New Student** to start fresh. Both are backed by the provided data files.

---

## What I Decided to Build and Why

The assignment asked us to think beyond a normal chronological chat log. That framing led me to one central question: *what does a course tutor provide that a general chatbot doesn't?*

The answer is **traceability**. A tutor's credibility comes from pointing to the source - "this is in slide 3 of Week 2." A general assistant can only assert; a course tutor can cite. That distinction shaped every product decision.

### Lecture-grounded answers and clickable citations

Every response includes citations that resolve to a specific lecture slide. Clicking a citation opens a slide drawer (SourcePanel) showing the slide's full content - title, bullets, formulas, and speaker notes. The answer becomes *checkable*: students can verify it rather than trust it on faith.

### Two starting experiences

The provided data includes both a populated conversation and an empty one. Rather than picking one arbitrarily, I surfaced both as an intentional choice on the landing screen: the student selector lets a reviewer experience the "returning student" and "new student" states, and makes the empty state a deliberate part of the product rather than an unused data file.

### Course navigation and explored material tracking

The Course tab provides a browse view of all three lectures. Slides cited in conversation or viewed directly are visually marked as explored. The application tracks explored slide keys in a `Set`, updated whenever a citation is opened, a slide is viewed in the Course tab, or navigation happens inside the SourcePanel. This feeds the sidebar progress ring and the per-week progress breakdown in the Progress card - not as analytics, but as a lightweight signal to help a student answer "where have I already been?"

### The Learn area - saved concepts and personal notes

The Learn tab has two sections:

1. **Saved Concepts** - any assistant response can be bookmarked from the chat, saving its title, snippet, and citations to `localStorage`.
2. **Personal Notes** - a rich-text editor for the student's own notes, also persisted locally, with a formatting toolbar (bold, italic, headings, lists, code blocks, block quotes).

A tutor session is only as useful as what the student takes away from it. Saved concepts and notes create a personal knowledge base that outlasts the conversation.

### Streaming, cancellation, and error handling

Responses arrive token-by-token with realistic timing. The UI handles four stream states:

- **Connecting** - loading indicator before the first token
- **Streaming** - live token rendering with a Stop button
- **Stopped** - partial response preserved and labelled
- **Error mid-stream** - partial response preserved with an inline error notice and Retry button

Partial content is kept on stop or error rather than discarded, because even an incomplete answer is often useful.

### Responsive layout

The left sidebar is hidden on smaller screens. The right Learning sidebar collapses to an icon strip at tablet width and is hidden on mobile. The main chat column is fully usable at any width.

---

## Testing Streaming Scenarios

The dev panel is only visible when `?dev=1` is appended to the URL:

```
http://localhost:5173?dev=1
```

A **Dev: Scenario Trigger** panel appears at the bottom of the chat. Click any scenario button to send the associated prompt directly and observe the streaming behaviour:

Plain - a normal text response with a citation.
Code - a response containing a syntax-highlighted Python code block.
Math - equations rendered using LaTeX and KaTeX.
Table - markdown table rendering.
Long response - tests how the interface handles longer answers with multiple sections.
Slow response - delays the first token to test the connecting and loading state.
Refusal - tests how the tutor responds to an out-of-scope question.
Error mid-stream - interrupts the response midway, preserves the generated content, and provides a Retry option.

These scenarios are also reachable through keyword-matched free-form input (e.g. typing "show me code" routes to the `code` scenario).

---

## Project Structure

```text
scholera-tutor/
├── data/
│   ├── conversation.json
│   ├── conversation-empty.json
│   ├── mock-stream.mjs
│   ├── responses.json
│   └── lectures/
│
├── src/
│   ├── components/
│   │   ├── chat/          Chat interface and streaming states
│   │   ├── citations/     Citation cards and source slide panel
│   │   ├── course/        Course and lecture browser
│   │   ├── layout/        Header, sidebars, and student selector
│   │   ├── notebook/      Saved concepts and personal notes
│   │   └── ui/            Shared UI and markdown rendering
│   │
│   ├── hooks/             Streaming, notebook, and theme logic
│   ├── lib/               Data loading, citation resolution, and response matching
│   ├── App.jsx            Root application state and view coordination
│   ├── main.jsx
│   └── index.css          Global styles and design tokens
│
├── README.md
├── AI_USAGE.md
├── package.json
└── vite.config.js

```
---

## What I Deliberately Left Out

**Depth beats breadth.** The goal was to make the core tutor experience genuinely good, not to add features that sound impressive but dilute focus.

**No real AI backend.** The assignment provides `mock-stream.mjs`, a streaming endpoint that behaves like a real model connection - tokens arrive gradually, first tokens are delayed, and one scenario intentionally dies mid-stream. Adding a real model call would not improve what the assignment is evaluating and would require an API key, increasing setup friction for reviewers.

**No authentication or user accounts.** There is no sign-in, no database, no server. Concepts and notes persist in `localStorage`. Authentication would introduce significant infrastructure overhead without contributing anything to the core learning experience the assignment is asking to evaluate.

**No sentence-level inline citations.** I considered superscript citation numbers mid-paragraph (e.g. "gradient descent updates weights¹"). The data doesn't support this: citations are attributed per-answer, not per-sentence. Adding it would mean fabricating attribution, which is worse than not having it.

**No social or collaborative features.** No sharing, no discussion threads, no analytics dashboards. Each of these would have been easy to stub in and would have made the feature list look longer. None of them belong in a focused, first-pass course tutor.

**No search across slides or conversation history.** A useful feature in a production tutor, but out of scope for a UI assignment without a real backend. The "Recently Explored" sidebar provides a lightweight navigational substitute.

---

## What's Still Rough / Known Limitations

These are known limitations, not hidden problems.

**Keyword-based response routing is fragile.** Free-form questions first go through exact and keyword matching in `matchScenario.js`. If nothing matches, they fall through to `topicResponses.js`, which contains topic-aware responses for concepts covered in the three provided lectures (linear models, gradient descent, regularisation). Questions outside that set receive a generic fallback. There is no real language model - the matching is deterministic and approximate.

**Mock data only.** All responses, slides, and conversation history come from the provided static files. The application cannot meaningfully answer questions about material beyond what is in the three lecture JSON files.

**Rich-text note editor uses `execCommand`.** The personal notes editor is implemented via `contenteditable` and `document.execCommand`, which is deprecated in modern browser specs. It works correctly in current browsers but would need to be replaced with a proper editor library (e.g. Tiptap, Slate) for a production build.

**Conversation state is not persisted.** The message history within a session is held in React state. Refreshing the page resets the conversation to its seed state (the pre-loaded messages from `conversation.json`). Saved concepts and personal notes do persist via `localStorage`.

**No mobile sidebar access.** The CourseSidebar and LearningSidebar are hidden on small screens. The Chat, Course, and Learn views are accessible via the header tabs, but the contextual sidebar content isn't exposed on mobile. This is a known gap, not a bug.

---

## Design Philosophy

The project responds directly to the four evaluation criteria:

**Product judgement** - the core decision is to build a traceable tutor, not a feature showcase. Citation → slide is the primary interaction. Everything else - course navigation, progress tracking, the notebook - supports that central loop rather than existing for its own sake.

**Craft** - streaming states (connecting, live, stopped, errored) each have distinct, considered UI treatment. Partial responses are preserved on cancellation or error. The slide drawer supports keyboard dismissal and prev/next navigation. The collapsible sidebar, per-week progress breakdown, and rich-text note editor are polished interaction details rather than rough stubs.

**Originality** - connecting conversation history, explored lecture material, and a personal notebook is not something a default chatbot UI provides. It is a specific design response to: *how do you make a learning tool, not just a question-answering tool?*

**Restraint** - no authentication, no real backend, no social features, no analytics. Scope decisions are documented honestly above, and each one kept the focus on the core tutor experience.

---

## AI Usage

See [`AI_USAGE.md`](./AI_USAGE.md).
