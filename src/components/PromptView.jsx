import React, { useState } from 'react'
import { MAX_PROMPT, TERMINAL } from '../lib/constants.js'
import ErrorBox from './ErrorBox.jsx'
import StageProgress from './StageProgress.jsx'
import AnswerCard from './AnswerCard.jsx'

export default function PromptView({ run, mode, onSeeReview }) {
  const [prompt, setPrompt] = useState('')
  const { phase, run: info, result, error } = run
  const busy = phase === 'submitting' || phase === 'running'
  const trimmed = prompt.trim()
  const status = info?.status

  const onSubmit = (e) => {
    e.preventDefault()
    if (trimmed && !busy) run.submit(trimmed)
  }

  return (
    <section>
      <form onSubmit={onSubmit} className="card">
        <label htmlFor="prompt"><strong>Your prompt</strong></label>
        <textarea id="prompt" rows={5} maxLength={MAX_PROMPT} value={prompt} disabled={busy}
          onChange={(e) => setPrompt(e.target.value)} placeholder="Ask one question. Every model answers it independently." />
        <div className="row">
          <span className="muted small">{prompt.length}/{MAX_PROMPT}</span>
          <span className="spacer" />
          {busy && <button type="button" className="danger" onClick={run.cancel}>Cancel run</button>}
          <button type="submit" disabled={!trimmed || busy}>{phase === 'submitting' ? 'Submitting…' : 'Ask models'}</button>
        </div>
      </form>

      <ErrorBox error={error} />

      {info && (
        <div className="card">
          <div className="row">
            <strong>Run status:</strong>
            <span className={`badge status-${status}`}>{status}</span>
            <span className="muted small">{info.id}{mode === 'mock' ? ' · mock' : ''}</span>
          </div>
          {status === 'cancelled' ? <p className="muted">This run was cancelled. Any answers below arrived before cancellation.</p>
            : <StageProgress status={status} />}
          {status === 'failed' && <p className="error">The run failed. No answer was synthesized. You can submit the prompt again.</p>}
          {status === 'partial' && <p className="warn">Partial outcome: too few usable contributions remained for a full synthesis.</p>}
        </div>
      )}

      {busy && !result?.contributions.length && <p className="muted loading">Waiting for models to answer…</p>}

      {result?.contributions.length > 0 && (
        <>
          <h2>Independent answers</h2>
          <p className="muted small">Each model answered without seeing the others. Answers may be wrong, even when they agree.</p>
          <div className="grid">
            {result.contributions.map((c) => <AnswerCard key={c.id} c={c} />)}
          </div>
          {(result.reviews.length > 0 || result.answer || TERMINAL.includes(status)) && (
            <button className="link" onClick={onSeeReview}>View cross-review, trust &amp; synthesis →</button>
          )}
        </>
      )}
    </section>
  )
}
