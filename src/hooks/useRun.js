import { useCallback, useEffect, useRef, useState } from 'react'
import { TERMINAL } from '../lib/constants.js'
import { normalizeResult } from '../lib/normalize.js'

const POLL_MS = 1500

// Drives one run: submit -> poll status -> fetch (partial/final) result -> cancel.
export function useRun(client) {
  const [state, setState] = useState({ phase: 'idle', run: null, result: null, error: null })
  const timer = useRef(null)
  const gen = useRef(0) // invalidates stale polls

  const stop = () => { clearTimeout(timer.current); gen.current++ }
  useEffect(() => stop, [])

  const poll = useCallback((id, myGen) => {
    const tick = async () => {
      try {
        const run = await client.getRun(id)
        if (myGen !== gen.current) return
        const terminal = TERMINAL.includes(run.status)
        let result = null
        if (run.status !== 'queued') {
          try { result = normalizeResult(await client.getResult(id)) } catch (e) {
            if (!e.notReady && terminal && run.status !== 'cancelled') throw e
          }
        }
        if (myGen !== gen.current) return
        setState((s) => ({ ...s, run, result: result ?? s.result, phase: terminal ? 'done' : 'running', error: null }))
        if (!terminal) timer.current = setTimeout(tick, POLL_MS)
      } catch (e) {
        if (myGen !== gen.current) return
        setState((s) => ({ ...s, phase: 'error', error: e }))
      }
    }
    tick()
  }, [client])

  const submit = useCallback(async (prompt) => {
    stop()
    const myGen = gen.current
    setState({ phase: 'submitting', run: null, result: null, error: null })
    try {
      const { id } = await client.startRun(prompt)
      if (myGen !== gen.current) return
      setState((s) => ({ ...s, phase: 'running', run: { id, status: 'queued' } }))
      poll(id, myGen)
    } catch (e) {
      if (myGen === gen.current) setState({ phase: 'error', run: null, result: null, error: e })
    }
  }, [client, poll])

  const cancel = useCallback(async () => {
    const id = state.run?.id
    if (!id) return
    try { await client.cancelRun(id) } catch (e) { setState((s) => ({ ...s, error: e })) }
  }, [client, state.run])

  const reset = useCallback(() => { stop(); setState({ phase: 'idle', run: null, result: null, error: null }) }, [])

  return { ...state, submit, cancel, reset }
}
