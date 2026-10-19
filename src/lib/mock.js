// Clearly-labelled MOCK backend: an in-browser fake of the MeshVera run API.
// It produces canned, deterministic content. Nothing here is a real model answer.
import { ApiError } from './errors.js'

const MODELS = [
  { id: 'mock-alpha', label: 'Mock Alpha' },
  { id: 'mock-beta', label: 'Mock Beta' },
  { id: 'mock-gamma', label: 'Mock Gamma' },
]
// Stage boundaries in ms since start.
const T = { queued: 600, generating: 2800, reviewing: 4800, evaluating: 5800, synthesizing: 7400, checking: 8400 }
const runs = new Map()
let counter = 0

function statusOf(run) {
  if (run.cancelled) return 'cancelled'
  const dt = Date.now() - run.startedAt
  for (const k of Object.keys(T)) if (dt < T[k]) return k
  return 'completed'
}

export function startRun(prompt) {
  const id = `mock-run-${++counter}`
  runs.set(id, { id, prompt, startedAt: Date.now(), cancelled: false })
  return Promise.resolve({ id })
}

export function getRun(id) {
  const run = runs.get(id)
  if (!run) return Promise.reject(new ApiError(404, 'NOT_FOUND', 'Run not found'))
  return Promise.resolve({ id, status: statusOf(run), mode: 'mock' })
}

export function cancelRun(id) {
  const run = runs.get(id)
  if (run && statusOf(run) !== 'completed') run.cancelled = true
  return Promise.resolve({ id })
}

const R = (relevance, completeness, clarity, evidenceHandling) => ({ relevance, completeness, clarity, evidenceHandling })

export function getResult(id) {
  const run = runs.get(id)
  if (!run) return Promise.reject(new ApiError(404, 'NOT_FOUND', 'Run not found'))
  const status = statusOf(run)
  const dt = Date.now() - run.startedAt
  if (dt < T.generating && status !== 'cancelled') {
    return Promise.reject(new ApiError(409, 'RESULT_NOT_READY', 'Result is not ready yet'))
  }
  const topic = run.prompt.slice(0, 80)
  const contributions = MODELS.map((m, i) => ({
    id: `c${i + 1}`,
    model: m.label,
    status: 'succeeded',
    eligible: true,
    finishStatus: 'stop',
    latencyMs: 900 + i * 350,
    text: `[MOCK] ${m.label} independent answer to "${topic}". ` +
      ['It emphasises a step-by-step approach and states its assumptions.',
       'It gives a shorter answer and flags that one claim is uncertain.',
       'It takes a different position on trade-offs and cites no sources.'][i],
  }))
  const out = { outcome: status, final: false, contributions, reviews: [], scores: {}, disagreements: [], limitations: [], answer: null,
    metadata: { mode: 'mock', policyVersion: 'baseline-v1', note: 'Mock data — not produced by real models.' } }
  if (dt < T.reviewing) return Promise.resolve(out)

  const ratings = [R(4, 3, 4, 2), R(3, 2, 3, 3), R(3, 3, 2, null)]
  out.reviews = MODELS.map((m, i) => {
    const target = (i + 1) % 3
    return {
      id: `r${i + 1}`, reviewer: m.label, targetId: `c${target + 1}`,
      ratings: ratings[target],
      explanations: { relevance: 'Addresses the question directly.', completeness: 'Some parts left out.',
        clarity: 'Readable.', evidenceHandling: ratings[target].evidenceHandling == null ? 'Reviewer did not return a valid rating.' : 'Partly discloses uncertainty.' },
      summary: `[MOCK] ${m.label} reviewed ${MODELS[target].label}.`,
    }
  })
  if (dt < T.evaluating) return Promise.resolve(out)

  const W = { relevance: 30, completeness: 25, clarity: 20, evidenceHandling: 25 }
  ratings.forEach((r, i) => {
    const bad = Object.values(r).some((v) => v == null)
    out.scores[`c${i + 1}`] = bad
      ? { score: null, label: 'unassessed', reason: 'A required rating was missing; no score computed and weights were not renormalised.' }
      : { score: Object.keys(W).reduce((s, k) => s + (W[k] * r[k]) / 4, 0), label: 'assessed', reason: null }
  })
  out.disagreements = [{ topic: 'Trade-offs', detail: 'Mock Gamma disagrees with Alpha about which trade-off matters most. This was not resolved.' }]
  if (dt < T.checking) return Promise.resolve(out)

  out.final = status === 'completed'
  out.answer = { text: `[MOCK] Synthesized answer for "${topic}". It combines Alpha's structure with Beta's uncertainty flag and keeps Gamma's minority view as a caveat.`,
    contributionIds: ['c1', 'c2', 'c3'], singleModel: false }
  out.limitations = [
    'Mock data: no real model was called.',
    'Review scores are heuristic and were not verified against independent sources.',
    'Model agreement does not establish that any claim is true.',
  ]
  return Promise.resolve(out)
}
