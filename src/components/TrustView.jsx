import React from 'react'
import { SCORE_DISCLAIMER } from '../lib/constants.js'
import ScoreTable from './ScoreTable.jsx'
import ReviewList from './ReviewList.jsx'
import Synthesis from './Synthesis.jsx'

export default function TrustView({ run, onBack }) {
  const { result, run: info, phase } = run
  if (!info || !result) {
    return (
      <div className="card">
        <p className="muted">{phase === 'running' || phase === 'submitting'
          ? 'Waiting for the first answers…' : 'No run yet. Submit a prompt on the first tab.'}</p>
        <button className="link" onClick={onBack}>← Go to prompt</button>
      </div>
    )
  }
  const status = info.status
  const reviewsPending = !result.reviews.length && !['completed', 'partial', 'failed', 'cancelled'].includes(status)
  return (
    <section>
      <div className="notice">{SCORE_DISCLAIMER}</div>

      <h2>Final synthesized answer</h2>
      <Synthesis result={result} status={status} />

      <h2>Trust scores <span className="muted small">(baseline policy v1, advisory)</span></h2>
      <ScoreTable result={result} />

      <h2>Cross-reviews</h2>
      {reviewsPending && <p className="muted loading">Cross-review in progress…</p>}
      {!reviewsPending && !result.reviews.length && <p className="muted">No reviews were returned for this run.</p>}
      <ReviewList result={result} />

      <h2>Disagreements &amp; limitations</h2>
      <div className="grid two">
        <div className="card">
          <strong>Unresolved disagreements</strong>
          {result.disagreements.length
            ? <ul>{result.disagreements.map((d, i) => <li key={i}><b>{d.topic}:</b> {d.detail}</li>)}</ul>
            : <p className="muted">None reported. This does not mean the models are correct.</p>}
        </div>
        <div className="card">
          <strong>Limitations</strong>
          {result.limitations.length
            ? <ul>{result.limitations.map((l, i) => <li key={i}>{l}</li>)}</ul>
            : <p className="muted">No limitations reported yet.</p>}
          <p className="muted small">Agreement between models and self-reported confidence are not evidence of truth.</p>
        </div>
      </div>
    </section>
  )
}
