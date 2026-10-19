# MeshVera UI

A thin React + Vite client with two features, built from `AGENT.md`, `SKILL.md` and `SPEC.md`:

1. **Prompt & answers** – submit one prompt, watch run status (stage progress), see each model's independent answer in its own card, with loading, error and **cancel** states.
2. **Review, trust & synthesis** – cross-reviews, per-model trust scores (baseline policy v1: relevance 30%, completeness 25%, clarity 20%, evidence handling 25%, each rated 0–4), the synthesized answer with source contributions, unresolved disagreements and limitations.

The UI never presents model agreement as proof of truth; scores are labelled heuristic/advisory, missing ratings show as "unassessed" (never 0), partial / single-model / cancelled / failed outcomes are labelled.

> Note: `AGENT.md` scopes the repo to backend work. This UI is added at the user's explicit request and adds no backend behavior. It consumes the contract in AGENT.md §9.

## Run

```
npm install
npm run dev
```

Default is **mock mode**: an in-browser fake with clearly labelled "[MOCK]" canned data (no real models are called) so the UI works with no backend.

## Live mode

Switch "Backend mode" to *Live* in the UI, or set `VITE_API_MODE=live`. Set `MESHVERA_API_URL` (see `.env.example`; add it in the workspace Secrets panel) to your MeshVera backend; the Vite dev server proxies `/api/*` to it. Paste a Firebase ID token in the UI; it is held in memory only (not stored).

Live calls: `POST /api/v1/sessions` → `POST /api/v1/sessions/:id/runs` → poll `GET /api/v1/runs/:id` and `/result` → `POST /api/v1/runs/:id/cancel`. The result payload is mapped tolerantly in `src/lib/normalize.js`; adjust it if the backend's field names differ (no backend was available to verify against).

## Layout

- `src/lib/` – constants, mock backend, live client, result normalizer
- `src/hooks/useRun.js` – submit/poll/cancel state machine
- `src/components/` – PromptView, AnswerCard, TrustView, ScoreTable, ReviewList, Synthesis

Nothing is persisted; run state resets on reload.
