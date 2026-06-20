import { describe, expect, it, vi } from 'vitest'

import { usePublicInquirySubmitter } from '~/composables/usePublicInquirySubmitter'

function createBotGuardStub(calls: string[]) {
  return {
    headers: vi.fn(() => ({ 'x-client-session-id': 'sid-test' })),
    payload: vi.fn(() => ({ startedAt: 111, website: '' })),
    withBody: vi.fn(<T extends Record<string, unknown>>(body: T) => {
      calls.push('withBody')
      return { ...body, _botGuard: { startedAt: 111, website: '' } }
    }),
  }
}

describe('usePublicInquirySubmitter', () => {
  it('posts to /api/inquiries with method POST by default', async () => {
    const fetcher = vi.fn(async () => ({ ok: true }))
    const botGuard = createBotGuardStub([])

    const { submitInquiry } = usePublicInquirySubmitter({ botGuard, fetcher })
    await submitInquiry({ type: 'custom', name: 'Анна' })

    expect(fetcher).toHaveBeenCalledTimes(1)
    const [url, options] = fetcher.mock.calls[0]!
    expect(url).toBe('/api/inquiries')
    expect(options.method).toBe('POST')
  })

  it('respects a custom endpoint', async () => {
    const fetcher = vi.fn(async () => ({ ok: true }))
    const botGuard = createBotGuardStub([])

    const { submitInquiry } = usePublicInquirySubmitter({
      endpoint: '/api/subscriptions',
      botGuard,
      fetcher,
    })
    await submitInquiry({ plan: 'weekly' })

    expect(fetcher.mock.calls[0]![0]).toBe('/api/subscriptions')
  })

  it('passes botGuard.headers() result to the fetcher', async () => {
    const fetcher = vi.fn(async () => ({ ok: true }))
    const botGuard = createBotGuardStub([])

    const { submitInquiry } = usePublicInquirySubmitter({ botGuard, fetcher })
    await submitInquiry({ type: 'custom' })

    expect(fetcher.mock.calls[0]![1].headers).toEqual({ 'x-client-session-id': 'sid-test' })
  })

  it('passes withBody(payload) result as the request body including _botGuard', async () => {
    const fetcher = vi.fn(async () => ({ ok: true }))
    const botGuard = createBotGuardStub([])

    const { submitInquiry } = usePublicInquirySubmitter({ botGuard, fetcher })
    await submitInquiry({ type: 'wedding', name: 'Мария' })

    const body = fetcher.mock.calls[0]![1].body
    expect(botGuard.withBody).toHaveBeenCalledWith({ type: 'wedding', name: 'Мария' })
    expect(body).toMatchObject({ type: 'wedding', name: 'Мария' })
    expect(body._botGuard).toEqual({ startedAt: 111, website: '' })
  })

  it('calls withBody before invoking the fetcher', async () => {
    const calls: string[] = []
    const fetcher = vi.fn(async () => {
      calls.push('fetcher')
      return { ok: true }
    })
    const botGuard = createBotGuardStub(calls)

    const { submitInquiry } = usePublicInquirySubmitter({ botGuard, fetcher })
    await submitInquiry({ type: 'gift_card' })

    expect(calls).toEqual(['withBody', 'fetcher'])
  })

  it('defaults to a real bot guard when none is injected', async () => {
    const fetcher = vi.fn(async () => ({ ok: true }))

    const { botGuard, submitInquiry } = usePublicInquirySubmitter({ fetcher })
    expect(botGuard).toMatchObject({
      headers: expect.any(Function),
      withBody: expect.any(Function),
    })

    await submitInquiry({ type: 'custom' })
    const body = fetcher.mock.calls[0]![1].body
    expect(body._botGuard).toBeDefined()
  })
})
