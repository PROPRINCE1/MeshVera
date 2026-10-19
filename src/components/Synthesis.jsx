import React from 'react'

export default function Synthesis({ result, status }) {
  const { answer, metadata } = result
  if (!answer) {
    const msg = status === 'failed' ? 'The run failed; no answer was synthesized.'
      : status === 'cancelled' ? 'The run was cancelled before a synthesis was produced.'
      : status === 'partial' ? 'Insufficient usable contributions for a synthesis.'
      : 'Synthesis not available yet.'
    return <div className="card"><p className="muted">{msg}</p></div>
  }
  const partial = status === 'partial' || result.outcome === 'partial'
  const names = answer.contributionIds
    .map((id) => result.contributions.find((c) => c.id === id)?.model || id)
  return (
    <div className="card synth">
      <div className="row">
        {metadata?.mode === 'mock' && <span className="badge mock">MOCK</span>}
        {partial && <span className="badge warn">PARTIAL</span>}
        {answer.singleModel && <span className="badge warn">SINGLE-MODEL OUTPUT — not cross-checked</span>}
      </div>
      <p className="text">{answer.text}</p>
      <div className="muted small">Sources: {names.length ? names.join(', ') : 'not reported'}</div>
      <div className="muted small">Synthesis is a model-generated summary of the contributions; it has not been independently verified.</div>
    </div>
  )
}
