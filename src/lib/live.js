// Live client for the MeshVera backend API contract (AGENT.md §9).
// Auth: a Firebase ID token supplied by the user, kept only in memory.
import { ApiError } from './errors.js'

export function createLiveClient(getToken) {
  async function call(method, path, body) {
    const token = getToken()
    if (!token) throw new ApiError(401, 'NO_TOKEN', 'Paste a Firebase ID token to use live mode.')
    let res
    try {
      res = await fetch(`/api/v1${path}`, {
        method,
        headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      })
    } catch {
      throw new ApiError(0, 'NETWORK', 'Could not reach the MeshVera backend. Is it running and MESHVERA_API_URL set?')
    }
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      const e = data?.error || {}
      throw new ApiError(res.status, e.code, e.message || `Request failed (${res.status})`, e.requestId)
    }
    return data
  }

  return {
    async startRun(prompt) {
      const s = await call('POST', '/sessions', { title: prompt.slice(0, 60) })
      const sessionId = s?.id ?? s?.session?.id ?? s?.sessionId
      if (!sessionId) throw new ApiError(502, 'BAD_RESPONSE', 'Backend did not return a session id.')
      const r = await call('POST', `/sessions/${encodeURIComponent(sessionId)}/runs`, { prompt })
      const id = r?.id ?? r?.runId ?? r?.run?.id
      if (!id) throw new ApiError(502, 'BAD_RESPONSE', 'Backend did not return a run id.')
      return { id }
    },
    getRun: (id) => call('GET', `/runs/${encodeURIComponent(id)}`).then((r) => ({ ...(r?.run ?? r), mode: 'live' })),
    getResult: (id) => call('GET', `/runs/${encodeURIComponent(id)}/result`),
    cancelRun: (id) => call('POST', `/runs/${encodeURIComponent(id)}/cancel`),
  }
}
