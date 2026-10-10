# VirtualWork Internship Apps — Implementation Plan

## Scope and architecture

Deliver one small hosted web application with five independently navigable, shareable task routes: `/notes`, `/profiles`, `/coffee`, `/quotes`, and `/team`. The root route acts as an index and links to each app. Keep the frontend in the initialized React + Vite + TypeScript client. Keep the four backend-driven tasks in the initialized Node/Express + Drizzle stack and managed MySQL database. The Quick Note task explicitly calls for a Python backend, so implement it as a small Python HTTP service using the same managed MySQL database; Express will expose same-origin `/api/notes` endpoints by proxying requests internally to the Python service. Run the Python process as a child service in both development and the production container. Use parameterized SQL and validate incoming data on the server.

The database stores notes; generated profile-card submissions; coffee items and vote counts; quote history; and team availability. Initialize sample coffee and team rows idempotently so restarts do not overwrite later user edits. Quote requests will fetch a random quote from a public quote API, return it to the client, and persist it in history through the backend.

## Project structure

- `client/src/App.tsx`, `client/src/pages/` — route shell and the five app screens.
- `client/src/components/` — shared navigation, headers, empty/loading/error states, and reusable form/display elements.
- `client/src/index.css` — responsive visual system and task-specific styles.
- `server/_core/index.ts` — Express REST endpoints, `/api/health`, static/Vite serving, and startup/shutdown of the Python notes service.
- `server/db.ts` — managed MySQL queries for the TypeScript-backed tasks.
- `drizzle/schema.ts` and `drizzle/` migrations — durable application tables and additive migrations.
- `python/notes_service.py` — Python HTTP API for creating and listing notes in the same managed MySQL database.
- `requirements.txt` — pinned Python MySQL driver.
- `public/manus-routes.json` — complete declaration of the app's client-side routes.
- `Dockerfile` — production build, Node + Python runtime, and the container entrypoint.

## Design system

- **Design movement:** contemporary editorial software, with a tactile workshop-board sensibility.
- **Core principles:** clear hierarchy; useful information before decoration; playful task-specific character; accessible, direct controls.
- **Color philosophy:** warm paper and ink establish calm focus, while an electric leaf-green accent signals saved/available states and distinct app colors give each assignment its own identity.
- **Layout paradigm:** a compact persistent navigation rail on wide screens, a stacked mobile header, and a single prominent work surface per task rather than dense dashboard grids.
- **Signature elements:** numbered task markers; soft, offset card shadows; small status pills for saved/available/count states.
- **Interaction philosophy:** visible save/vote/toggle feedback, optimistic only when safe, disabled submit states during requests, and plain-language errors.
- **Animation:** short 120–180 ms transitions for hover/focus/status changes; no continuous motion; honor reduced-motion preferences.
- **Typography system:** system sans-serif for readable interface text, with a distinctive high-contrast serif for selected display headings; restrained type scale with strong labels and legible body copy.
- **Brand essence:** a friendly, proof-ready workshop for internship assignments; **clear, capable, lively**.
- **Brand voice:** concise and encouraging, never overly promotional. Example lines: “Make a note. Keep the thought.” and “One tap, one vote—your count is saved.”
- **Wordmark & logo:** a compact “FIELD / NOTES” style stamp with a hand-drawn five-point marker motif, implemented as text/vector CSS (not a default-font brand label).
- **Signature brand color:** vivid leaf green used for primary actions and positive state feedback.

## Build and serving

The Vite client is served by Express in development and from the compiled `dist/public` output in production. Express handles the TypeScript-backed app APIs and same-origin proxy routes for the Python Notes API. The Notes service listens only on localhost port 3001; it is not exposed publicly. The web container installs the pinned frontend dependencies and Python requirements, builds the frontend/Node server, and launches the Node server, which starts the Notes service. The hosted server listens on the platform-provided `PORT` (default 3000) and exposes an unauthenticated `/api/health` endpoint. Durable user-facing state lives in managed MySQL; do not rely on container filesystem persistence.

## Acceptance scope

Each route demonstrates its task's defining behavior: notes sent to Python and saved/listed from MySQL; profile form POST processed by the backend and rendered as a card; coffee list votes atomically incremented in MySQL; random external quotes displayed and added to persistent history; and team availability toggles persisted as database booleans and reflected in the UI. The LinkedIn post is only drafted with placeholders until the offer-letter file and user details are supplied; do not publish or submit it without the user's review and approval. Do not submit task proof URLs on VirtualWork without showing the exact payloads to the user first.
