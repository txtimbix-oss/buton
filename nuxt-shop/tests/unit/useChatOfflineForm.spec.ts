import { describe, expect, it, vi } from 'vitest'

import { useChatOfflineForm } from '~/composables/useChatOfflineForm'

function createBotGuardStub() {
  return {
    headers: vi.fn(() => ({ 'x-client-session-id': 'sid-test' })),
    payload: vi.fn(() => ({ startedAt: 1, website: '' })),
    withBody: vi.fn(<T extends Record<string, unknown>>(body: T) => ({
      ...body,
      _botGuard: { startedAt: 1, website: '' },
    })),
  }
}

describe('useChatOfflineForm', () => {
  it('submits a trimmed chat_offline inquiry through the guarded body', async () => {
    const submit = vi.fn(async () => ({ ok: true }))
    const botGuard = createBotGuardStub()

    const form = useChatOfflineForm({ submit, botGuard })
    form.name.value = '  Анна  '
    form.email.value = '  anna@example.com '
    form.message.value = '  Когда доставите?  '

    await form.submit()

    expect(submit).toHaveBeenCalledTimes(1)
    expect(submit).toHaveBeenCalledWith({
      type: 'custom',
      name: 'Анна',
      email: 'anna@example.com',
      message: 'Когда доставите?',
      source: 'chat_offline',
      _botGuard: { startedAt: 1, website: '' },
    })
    expect(form.sent.value).toBe(true)
    expect(form.sending.value).toBe(false)
  })

  it('does not submit without name or message', async () => {
    const submit = vi.fn(async () => ({ ok: true }))
    const form = useChatOfflineForm({ submit, botGuard: createBotGuardStub() })

    form.name.value = ''
    form.message.value = 'есть текст'
    await form.submit()

    form.name.value = 'Анна'
    form.message.value = '   '
    await form.submit()

    expect(submit).not.toHaveBeenCalled()
    expect(form.sent.value).toBe(false)
  })

  it('does not resubmit once already sent', async () => {
    const submit = vi.fn(async () => ({ ok: true }))
    const form = useChatOfflineForm({ submit, botGuard: createBotGuardStub() })

    form.name.value = 'Анна'
    form.message.value = 'вопрос'
    await form.submit()
    await form.submit()

    expect(submit).toHaveBeenCalledTimes(1)
  })
})
