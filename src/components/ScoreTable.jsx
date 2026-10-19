import React from 'react'
import { DIMENSIONS } from '../lib/constants.js'

function avgRatings(result, id) {
  const rs = result.reviews.filter((r) => r.targetId === id && r.ratings)
  return rs
}

export default function ScoreTable({ result }) {
  if (!result.contributions.length) return <p className="muted">No contributions.</p>
  return (
    <div className="card scroll">
      <table>
        <thead>
          <tr>
            <th>Model</th>
            <th>Weight</th>
            {DIMENSIONS.map(([k, l, w]) => <th key={k}>{l} <span className="muted small">({w}%)</span></th>)}
            <th>Score (0–100)</th>
          </tr>
        </thead>
        <tbody>
          {result.contributions.map((c) => {
            const s = result.scores[c.id]
            const rs = avgRatings(result, c.id)
            return (
              <tr key={c.id} className={!c.eligible ? 'dim' : ''}>
                <td>{c.model}{!c.eligible && <div className="small bad-text">excluded (ineligible)</div>}</td>
                <td>1.0</td>
                {DIMENSIONS.map(([k]) => (
                  <td key={k}>{rs.length ? rs.map((r, i) => <span key={i} className="rating">{r.ratings[k] == null ? '—' : `${r.ratings[k]}/4`}</span>) : '—'}</td>
                ))}
                <td>
                  {s && s.score != null ? <strong>{s.score.toFixed(1)}</strong>
                    : <span className="badge warn" title={s?.reason || ''}>unassessed</span>}
                  {s?.reason && <div className="small muted">{s.reason}</div>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="muted small">All models start with equal weight 1.0 (no historical reputation). Scores are heuristic and advisory; they do not exclude or rank contributions in v1. A missing rating gives no score, not zero.</p>
    </div>
  )
}
