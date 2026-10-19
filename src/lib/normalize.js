// Tolerant mapping from the backend result payload to the shape the UI renders.
// Missing data stays missing (null / empty) — never invented.
const arr = (v) => (Array.isArray(v) ? v : [])
const str = (v) => (typeof v === 'string' ? v : v == null ? '' : JSON.stringify(v))

export function normalizeResult(raw) {
  if (!raw) return null
  const r = raw.result ?? raw
  const contributions = arr(r.contributions ?? r.responses).map((c, i) => ({
    id: str(c.id ?? c.contributionId ?? `c${i + 1}`),
    model: str(c.model ?? c.modelId ?? c.label ?? `Model ${i + 1}`),
    status: c.status ?? (c.error ? 'failed' : 'succeeded'),
    eligible: c.eligible !== false && !c.error,
    finishStatus: c.finishStatus ?? null,
    latencyMs: c.latencyMs ?? null,
    error: c.error ? str(c.error.message ?? c.error) : null,
    text: str(c.text ?? c.content),
  }))
  const reviews = arr(r.reviews).map((v, i) => ({
    id: str(v.id ?? `r${i + 1}`),
    reviewer: str(v.reviewer ?? v.reviewerModel ?? v.reviewerModelId),
    targetId: str(v.targetId ?? v.targetContributionId ?? v.contributionId),
    ratings: v.ratings ?? null,
    explanations: v.explanations ?? {},
    summary: str(v.summary),
  }))
  const scores = {}
  if (Array.isArray(r.scores)) {
    r.scores.forEach((s) => { scores[s.contributionId ?? s.id] = s })
  } else Object.assign(scores, r.scores ?? {})
  for (const k of Object.keys(scores)) {
    const s = scores[k]
    scores[k] = { score: typeof s.score === 'number' ? s.score : null, label: s.label ?? (typeof s.score === 'number' ? 'assessed' : 'unassessed'), reason: s.reason ?? null }
  }
  const a = r.answer ?? r.synthesis ?? null
  const answer = a ? {
    text: str(typeof a === 'string' ? a : a.text ?? a.content),
    contributionIds: arr(a.contributionIds ?? r.contributionIds),
    singleModel: Boolean(a.singleModel ?? r.singleModel),
  } : null
  return {
    outcome: r.outcome ?? r.status ?? null,
    final: r.final ?? Boolean(answer),
    contributions, reviews, scores, answer,
    disagreements: arr(r.disagreements ?? r.unresolvedDisagreements).map((d) => (typeof d === 'string' ? { topic: 'Disagreement', detail: d } : { topic: str(d.topic ?? 'Disagreement'), detail: str(d.detail ?? d.description) })),
    limitations: arr(r.limitations ?? r.evidenceLimitations).map(str),
    metadata: r.metadata ?? {},
  }
}
