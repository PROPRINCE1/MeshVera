import React from 'react'

export default function ModeBar({ mode, onMode, token, onToken }) {
  return (
    <div className="modebar">
      <label>
        Backend mode{' '}
        <select value={mode} onChange={(e) => onMode(e.target.value)}>
          <option value="mock">Mock (in-browser demo data)</option>
          <option value="live">Live (MeshVera API)</option>
        </select>
      </label>
      {mode === 'mock' ? (
        <span className="badge mock">MOCK DATA — no real models are called</span>
      ) : (
        <label className="grow">
          Firebase ID token{' '}
          <input type="password" value={token} onChange={(e) => onToken(e.target.value)}
            placeholder="Bearer token (kept in memory only)" autoComplete="off" />
        </label>
      )}
    </div>
  )
}
