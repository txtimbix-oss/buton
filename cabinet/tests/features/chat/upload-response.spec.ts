import { describe, expect, it, vi } from 'vitest'
import { readResponsePayload } from '@/features/chat/upload-response'

describe('readResponsePayload', () => {
  it('парсит JSON из text()', async () => {
    const response = { text: vi.fn(async () => '{"error":"boom"}') } as unknown as Response
    expect(await readResponsePayload(response)).toEqual({ error: 'boom' })
  })

  it('возвращает сырую строку, если text() не JSON', async () => {
    const response = { text: vi.fn(async () => 'просто текст') } as unknown as Response
    expect(await readResponsePayload(response)).toBe('просто текст')
  })

  it('откатывается на json(), когда text() недоступен', async () => {
    const response = { json: vi.fn(async () => ({ ok: true })) } as unknown as Response
    expect(await readResponsePayload(response)).toEqual({ ok: true })
  })

  it('откатывается на json(), когда text() пустой', async () => {
    const response = {
      text: vi.fn(async () => ''),
      json: vi.fn(async () => ({ fallback: true })),
    } as unknown as Response
    expect(await readResponsePayload(response)).toEqual({ fallback: true })
  })

  it('возвращает null, когда нет ни text(), ни json()', async () => {
    expect(await readResponsePayload({} as unknown as Response)).toBeNull()
  })

  it('возвращает null при ошибке text() и отсутствии json()', async () => {
    const response = {
      text: vi.fn(async () => { throw new Error('fail') }),
    } as unknown as Response
    expect(await readResponsePayload(response)).toBeNull()
  })
})
