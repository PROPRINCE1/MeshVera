import React from 'react'

export default function AnswerCard({ c }) {
  const failed = c.status === 'failed' || c.error
  return (
    <article className={`card answer ${failed ? 'failed' : ''}`}>
      <div className="row">
        <strong>{c.model}</strong>
        <span className="spacer" />
        {failed ? <span className="badge bad">failed</span>
          : !c.eligible ? <span className="badge warn">ineligible</span>
          : <span className="badge ok">answered</span>}
      </div>
      {failed ? <p className="error">{c.error || 'This model did not return a usable answer.'}</p>
        : <p className="text">{c.text || <em className="muted">Empty response</em>}</p>}
      <div className="muted small">
        {c.finishStatus && <>finish: {c.finishStatus}{c.finishStatus === 'length' || c.finishStatus === 'truncated' ? ' (truncated)' : ''} · </>}
        {c.latencyMs != null ? `${c.latencyMs} ms` : 'latency n/a'}
      </div>
    </article>
  )
}
