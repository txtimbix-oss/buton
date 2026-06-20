import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useChatStore } from '@/stores/chat'
import type { ChatMessage } from '@/features/chat/messages'

function makeMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
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

describe('useChatStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('openChat открывает чат и сбрасывает unread', () => {
    const store = useChatStore()
    store.unread = 5

    store.openChat()

    expect(store.isOpen).toBe(true)
    expect(store.unread).toBe(0)
  })

  it('closeChat закрывает чат', () => {
    const store = useChatStore()
    store.openChat()

    store.closeChat()

    expect(store.isOpen).toBe(false)
  })

  it('setReady при первой инициализации сохраняет id и сообщения', () => {
    const store = useChatStore()
    const msgs = [makeMessage()]

    store.setReady('chat-1', msgs)

    expect(store.chatId).toBe('chat-1')
    expect(store.messages).toEqual(msgs)
  })

  it('setReady при повторном вызове обновляет id, но не перезаписывает сообщения', () => {
    const store = useChatStore()
    store.setReady('chat-1', [makeMessage({ _id: 'a' })])

    store.setReady('chat-2', [makeMessage({ _id: 'b' })])

    expect(store.chatId).toBe('chat-2')
    expect(store.messages).toHaveLength(1)
    expect(store.messages[0]._id).toBe('a')
  })

  it('appendMessage добавляет сообщение и увеличивает unread для admin при закрытом чате', () => {
    const store = useChatStore()

    store.appendMessage(makeMessage({ _id: 'a', sender: 'admin' }))

    expect(store.messages).toHaveLength(1)
    expect(store.unread).toBe(1)
  })

  it('appendMessage не увеличивает unread, если чат открыт или сообщение от пользователя', () => {
    const store = useChatStore()
    store.openChat()
    store.appendMessage(makeMessage({ _id: 'a', sender: 'admin' }))
    expect(store.unread).toBe(0)

    store.closeChat()
    store.appendMessage(makeMessage({ _id: 'b', sender: 'user' }))
    expect(store.unread).toBe(0)
    expect(store.messages).toHaveLength(2)
  })

  it('setConnected(true) очищает ошибку, setConnected(false) сбрасывает chatId', () => {
    const store = useChatStore()
    store.setError('boom')

    store.setConnected(true)
    expect(store.isConnected).toBe(true)
    expect(store.lastError).toBe('')

    store.setReady('chat-1', [])
    store.setConnected(false)
    expect(store.isConnected).toBe(false)
    expect(store.chatId).toBeNull()
  })

  it('setAdminTyping, setError и markClosed обновляют соответствующее состояние', () => {
    const store = useChatStore()

    store.setAdminTyping(true)
    store.setError('ошибка')
    store.markClosed()

    expect(store.adminTyping).toBe(true)
    expect(store.lastError).toBe('ошибка')
    expect(store.isClosed).toBe(true)
  })

  it('resetChat возвращает всё состояние к исходному', () => {
    const store = useChatStore()
    store.setReady('chat-1', [makeMessage()])
    store.setConnected(true)
    store.setAdminTyping(true)
    store.markClosed()
    store.setError('boom')
    store.appendMessage(makeMessage({ _id: 'b' }))

    store.resetChat()

    expect(store.messages).toEqual([])
    expect(store.chatId).toBeNull()
    expect(store.isOpen).toBe(false)
    expect(store.unread).toBe(0)
    expect(store.isConnected).toBe(false)
    expect(store.adminTyping).toBe(false)
    expect(store.isClosed).toBe(false)
    expect(store.lastError).toBe('')
  })
})
