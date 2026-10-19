import React from 'react'

export default function ErrorBox({ error }) {
  if (!error) return null
  return (
    <div className="error" role="alert">
      <strong>{error.code ? `${error.code}: ` : ''}</strong>{error.message}
      {error.requestId && <div className="muted small">Request ID: {error.requestId}</div>}
    </div>
  )
}
