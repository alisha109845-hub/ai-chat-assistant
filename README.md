# Flowchat

A fast, streaming AI chat assistant built from scratch with React, Tailwind CSS, and the Google Gemini API. No backend, no database — just a clean frontend that talks directly to an LLM.

![Flowchat screenshot](./screenshot.png)

## Features

- **Real-time streaming responses** — replies appear token-by-token as the model generates them, not all at once
- **Multi-chat sidebar** — create, switch between, rename, and delete conversations, each with its own history
- **Persistent history** — conversations are saved to `localStorage` and survive page reloads
- **Markdown + syntax-highlighted code** — model responses render properly formatted text, tables, and code blocks with a one-click copy button
- **Per-chat settings** — customize the system prompt (persona/behavior) and temperature (creativity) independently for each conversation
- **Typing indicator** — animated dots while waiting for the model to start responding
- **Fully responsive** — collapsible drawer sidebar on mobile, fixed sidebar on desktop
- **Graceful error handling** — clear, human-readable messages for rate limits and API failures instead of raw error dumps

## Tech Stack

| Layer | Choice |
|---|---|
| Build tool | Vite |
| UI framework | React |
| Styling | Tailwind CSS v4 |
| AI model | Google Gemini 3.6 Flash (via REST API, streaming) |
| Markdown rendering | react-markdown + remark-gfm |
| Code highlighting | react-syntax-highlighter |
| State/persistence | React state + localStorage (no backend) |

## Why these choices

**No backend, bring-your-own-key.** The Gemini API key lives in the browser via an environment variable. This keeps the project simple to run and deploy (static hosting only) at the cost of the key being visible in the client bundle — a deliberate trade-off for a portfolio/demo project, not a production SaaS pattern. A production app would proxy requests through a server to keep the key private.

**Streaming over request/response.** Gemini's `streamGenerateContent` endpoint sends the reply in incremental chunks over Server-Sent Events. The app reads these chunks with the browser's native `ReadableStream` API and re-renders progressively, which is what creates the "typing" effect and makes the app feel responsive even on longer replies.

**Per-chat settings, not global.** System prompt and temperature are stored on each individual chat object, not as app-wide config. This means different conversations can have entirely different personas or creativity levels running side-by-side.

## Getting Started

### Prerequisites
- Node.js 18+
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Setup

```bash
git clone <your-repo-url>
cd ai-chat-assistant
npm install
```

Create a `.env` file in the project root:

```
VITE_GEMINI_API_KEY=your_api_key_here
```

Run the dev server:

```bash
npm run dev
```

Open the printed local URL in your browser.

### Build for production

```bash
npm run build
```

Output goes to `dist/`, ready for static hosting (Vercel, Netlify, GitHub Pages, etc.).

## Project Structure

```
src/
  components/     # UI components (Sidebar, ChatWindow, MessageBubble, InputBar, SettingsPanel)
  services/       # Gemini API integration (gemini.js)
  App.jsx         # App state, chat management, localStorage persistence
  index.css       # Tailwind imports + custom animations
```

## Known Limitations

- API key is exposed client-side (see "Why these choices" above) — fine for a personal/demo project, not for public production use
- Free-tier Gemini API has a rate limit (20 requests per window); the app surfaces this clearly rather than failing silently
- Chat history is local to the browser (no cross-device sync, since there's no backend/database)

## What I Learned Building This

- Consuming a streaming HTTP API in the browser with `ReadableStream` and Server-Sent Events parsing
- Structuring React state for a multi-entity app (chats, each with their own messages and settings)
- Separating API/service logic from UI components for maintainability
- Building genuinely responsive layouts (mobile drawer patterns, not just breakpoint tweaks)
- Practical LLM API concepts: system prompts, temperature, stateless conversation context, and streaming vs. blocking generation
