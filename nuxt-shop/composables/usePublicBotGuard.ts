const PUBLIC_SESSION_KEY = 'buton_public_sid'

type PublicBotGuardPayload = {
  startedAt: number
  website: string
}

function createSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `sid-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getStoredSessionId(): string {
  if (!process.client) return ''

  let sessionId = localStorage.getItem(PUBLIC_SESSION_KEY)
  if (!sessionId) {
    sessionId = createSessionId()
    localStorage.setItem(PUBLIC_SESSION_KEY, sessionId)
  }

  return sessionId
}

export function usePublicBotGuard() {
  const startedAt = Date.now()

  function headers(): Record<string, string> {
    const sessionId = getStoredSessionId()
    return sessionId ? { 'x-client-session-id': sessionId } : {}
  }

  function payload(): PublicBotGuardPayload {
    return {
      startedAt,
      website: '',
    }
  }

  function withBody<T extends Record<string, unknown>>(body: T): T & { _botGuard: PublicBotGuardPayload } {
    return {
      ...body,
      _botGuard: payload(),
    }
  }

  return {
    headers,
    payload,
    withBody,
  }
}
