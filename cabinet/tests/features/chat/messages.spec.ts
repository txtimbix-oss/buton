import { describe, expect, it } from 'vitest'
import { normalizeIncomingMessage } from '@/features/chat/messages'
import type { ChatMessage } from '@/features/chat/messages'

function createMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    _id: 'msg-1',
    sender: 'admin',
    text: 'Привет',
    attachments: [],
    createdAt: '2026-06-13T00:00:00.000Z',
    readByUser: false,
    readByAdmin: false,
    ...overrides,
  }
}

describe('normalizeIncomingMessage', () => {
  it('возвращает сообщение, пришедшее напрямую', () => {
    const message = createMessage()
    expect(normalizeIncomingMessage(message)).toBe(message)
  })

  it('разворачивает сообщение из обёртки { message }', () => {
    const message = createMessage({ _id: 'wrapped' })
    expect(normalizeIncomingMessage({ message })).toBe(message)
  })

  it('возвращает null для невалидных payload', () => {
    expect(normalizeIncomingMessage(null)).toBeNull()
    expect(normalizeIncomingMessage('строка')).toBeNull()
    expect(normalizeIncomingMessage({})).toBeNull()
    expect(normalizeIncomingMessage({ sender: 123 })).toBeNull()
    expect(normalizeIncomingMessage({ message: 'не объект' })).toBeNull()
  })
})
