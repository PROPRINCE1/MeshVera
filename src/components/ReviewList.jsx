import React from 'react'
import { DIMENSIONS } from '../lib/constants.js'

export default function ReviewList({ result }) {
  const name = (id) => result.contributions.find((c) => c.id === id)?.model || id || 'unknown'
  return (
    <div className="grid">
      {result.reviews.map((r) => (
        <article key={r.id} className="card">
          <div><strong>{r.reviewer || 'Reviewer'}</strong> <span className="muted">reviewed</span> <strong>{name(r.targetId)}</strong></div>
          {r.summary && <p>{r.summary}</p>}
          {r.ratings ? (
            <ul className="dims">
              {DIMENSIONS.map(([k, l]) => (
                <li key={k}>
                  <span>{l}: <b>{r.ratings[k] == null ? 'invalid/missing' : `${r.ratings[k]}/4`}</b></span>
                  {r.explanations?.[k] && <span className="muted small"> — {r.explanations[k]}</span>}
                </li>
              ))}
            </ul>
          ) : <p className="warn">No valid assessment returned by this reviewer.</p>}
        </article>
      ))}
    </div>
  )
}
