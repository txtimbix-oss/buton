import { describe, expect, it, vi } from 'vitest'
import { getSessionId } from '@/features/chat/session'

function createStorage(initial: Record<string, string> = {}) {
  const store = { ...initial }
  return {
    store,
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
  }
}

describe('getSessionId', () => {
  it('возвращает уже сохранённый chat_sid не трогая генератор', () => {
    const storage = createStorage({ chat_sid: 'existing-id' })
    const randomId = vi.fn(() => 'new-id')

    const id = getSessionId({ getItem: storage.getItem, setItem: storage.setItem, randomId })

    expect(id).toBe('existing-id')
    expect(randomId).not.toHaveBeenCalled()
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it('генерирует и сохраняет новый id при отсутствии значения', () => {
    const storage = createStorage()
    const randomId = vi.fn(() => 'generated-id')

    const id = getSessionId({ getItem: storage.getItem, setItem: storage.setItem, randomId })

    expect(id).toBe('generated-id')
    expect(randomId).toHaveBeenCalledTimes(1)
    expect(storage.setItem).toHaveBeenCalledWith('chat_sid', 'generated-id')
    expect(storage.store.chat_sid).toBe('generated-id')
  })
})
