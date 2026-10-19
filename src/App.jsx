import React, { useMemo, useState } from 'react'
import { useRun } from './hooks/useRun.js'
import { createLiveClient } from './lib/live.js'
import * as mock from './lib/mock.js'
import PromptView from './components/PromptView.jsx'
import TrustView from './components/TrustView.jsx'
import ModeBar from './components/ModeBar.jsx'

const DEFAULT_MODE = import.meta.env.VITE_API_MODE === 'live' ? 'live' : 'mock'

export default function App() {
  const [mode, setMode] = useState(DEFAULT_MODE)
  const [token, setToken] = useState('') // memory only, never persisted
  const [tab, setTab] = useState('prompt')
  const client = useMemo(() => (mode === 'live' ? createLiveClient(() => token) : mock), [mode, token])
  const run = useRun(client)

  const switchMode = (m) => { run.reset(); setMode(m) }

  return (
    <div className="app">
      <header>
        <h1>MeshVera</h1>
        <p className="muted">One prompt → independent model answers → cross-review → trust policy → synthesis.</p>
      </header>
      <ModeBar mode={mode} onMode={switchMode} token={token} onToken={setToken} />
      <nav className="tabs">
        <button className={tab === 'prompt' ? 'active' : ''} onClick={() => setTab('prompt')}>1 · Prompt &amp; answers</button>
        <button className={tab === 'trust' ? 'active' : ''} onClick={() => setTab('trust')}>2 · Review, trust &amp; synthesis</button>
      </nav>
      {tab === 'prompt'
        ? <PromptView run={run} mode={mode} onSeeReview={() => setTab('trust')} />
        : <TrustView run={run} onBack={() => setTab('prompt')} />}
    </div>
  )
}
