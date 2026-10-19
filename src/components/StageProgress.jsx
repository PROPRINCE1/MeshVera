import React from 'react'
import { STAGES } from '../lib/constants.js'

export default function StageProgress({ status }) {
  const idx = STAGES.findIndex(([k]) => k === status)
  const done = status === 'completed' || status === 'partial'
  return (
    <ol className="stages">
      {STAGES.map(([k, label], i) => {
        const cls = done || i < idx ? 'done' : i === idx ? 'current' : ''
        return <li key={k} className={cls}>{label}</li>
      })}
    </ol>
  )
}
