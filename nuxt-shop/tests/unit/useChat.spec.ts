import { ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { ChatAttachment, ChatMessage } from '~/lib/chat/store'

interface TransportMock {
  connect: ReturnType<typeof vi.fn>
  send: ReturnType<typeof vi.fn>
  emitTyping: ReturnType<typeof vi.fn>
  emitRate: ReturnType<typeof vi.fn>
}

type TransportFactory = ReturnType<typeof vi.fn>

interface TransportCallbacks {
  onConnectedChange?: (connected: boolean) => void
  onReady?: (payload: { chatId: string; messages: ChatMessage[] }) => void
  onMessage?: (message: ChatMessage) => void
  onAdminTypingStart?: () => void
  onAdminTypingStop?: () => void
  onClosed?: () => void
  onError?: (message: string, cause?: unknown) => void
}

function createUseStateMock() {
  const store = new Map<string, ReturnType<typeof ref>>()

  return <T>(key: string, init: () => T) => {
    if (!store.has(key)) {
      store.set(key, ref(init()))
    }
    return store.get(key) as ReturnType<typeof ref<T>>
  }
}

async function loadChatModule(options: {
  sendResult?: boolean
  emitTypingResult?: boolean
  emitRateResult?: boolean
  uploadImpl?: (files: File[]) => Promise<ChatAttachment[]>
} = {}) {
  vi.resetModules()

  const callbacksRef: { current: TransportCallbacks } = { current: {} }
  const transportMock: TransportMock = {
    connect: vi.fn(async () => {}),
    send: vi.fn(() => options.sendResult ?? true),
    emitTyping: vi.fn(() => options.emitTypingResult ?? true),
    emitRate: vi.fn(() => options.emitRateResult ?? true),
  }
  const createChatTransportMock: TransportFactory = vi.fn((nextCallbacks: TransportCallbacks) => {
    callbacksRef.current = nextCallbacks
    return transportMock
  })

  const uploadImpl = options.uploadImpl ?? vi.fn(async () => [])

  vi.doMock('~/lib/chat/transport', () => ({
    createChatTransport: createChatTransportMock,
  }))

  vi.doMock('~/lib/chat/attachments', () => ({
    uploadChatFiles: vi.fn(uploadImpl),
  }))

  vi.stubGlobal('useState', createUseStateMock())
  vi.stubGlobal('useRuntimeConfig', () => ({ public: { wsBase: 'https://ws.test' } }))

  const module = await import('~/composables/useChat')

  return {
    useChat: module.useChat,
    callbacksRef,
    createChatTransportMock,
    transportMock,
  }
}

describe('useChat', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('opens chat, clears unread, and asks transport to connect', async () => {
    const { useChat, transportMock } = await loadChatModule()
    const chat = useChat()

    chat.unread.value = 4
    chat.open()

    expect(chat.isOpen.value).toBe(true)
    expect(chat.unread.value).toBe(0)
    expect(transportMock.connect).toHaveBeenCalledTimes(1)
  })

  it('does not create a new transport instance on repeated opens', async () => {
    const { useChat, createChatTransportMock, transportMock } = await loadChatModule()
    const chat = useChat()

    chat.open()
    chat.open()

    expect(createChatTransportMock).toHaveBeenCalledTimes(1)
    expect(transportMock.connect).toHaveBeenCalledTimes(2)
  })

  it('maps transport events into unread and ready state without UI logic', async () => {
    const { useChat, callbacksRef } = await loadChatModule()
    const chat = useChat()

    chat.open()
    chat.close()

    callbacksRef.current.onConnectedChange?.(true)
    callbacksRef.current.onReady?.({
      chatId: 'chat-88',
      messages: [],
    })
    callbacksRef.current.onMessage?.({
      _id: 'm-1',
      sender: 'admin',
      text: 'Нужна помощь',
      attachments: [],
      createdAt: new Date().toISOString(),
      readByUser: false,
      readByAdmin: false,
    })

    expect(chat.isConnected.value).toBe(true)
    expect(chat.chatId.value).toBe('chat-88')
    expect(chat.messages.value).toHaveLength(1)
    expect(chat.unread.value).toBe(1)
  })

  it('tracks typing visibility and close event from transport callbacks', async () => {
    const { useChat, callbacksRef } = await loadChatModule()
    const chat = useChat()
    chat.open()

    callbacksRef.current.onAdminTypingStart?.()
    expect(chat.adminTyping.value).toBe(true)

    callbacksRef.current.onAdminTypingStop?.()
    callbacksRef.current.onClosed?.()

    expect(chat.adminTyping.value).toBe(false)
    expect(chat.isClosed.value).toBe(true)
  })

  it('keeps unread on close and clears it when opening again', async () => {
    const { useChat, callbacksRef } = await loadChatModule()
    const chat = useChat()

    chat.open()
    chat.close()

    callbacksRef.current.onMessage?.({
      _id: 'm-1',
      sender: 'admin',
      text: 'Нужна помощь',
      attachments: [],
      createdAt: new Date().toISOString(),
      readByUser: false,
      readByAdmin: false,
    })

    expect(chat.unread.value).toBe(1)

    chat.open()
    expect(chat.unread.value).toBe(0)
    expect(chat.isOpen.value).toBe(true)
  })

  it('returns false for typing/rate when socket is disconnected and does not attempt to connect', async () => {
    const { useChat, transportMock } = await loadChatModule({
      emitTypingResult: false,
      emitRateResult: false,
    })
    const chat = useChat()

    expect(chat.emitTyping()).toBe(false)
    expect(chat.emitRate(3)).toBe(false)
    expect(transportMock.connect).not.toHaveBeenCalled()
    expect(transportMock.emitTyping).toHaveBeenCalledTimes(1)
    expect(transportMock.emitRate).toHaveBeenCalledTimes(1)
  })

  it('proxies emit guards from transport', async () => {
    const { useChat, transportMock } = await loadChatModule({
      emitTypingResult: false,
      emitRateResult: false,
    })
    const chat = useChat()

    expect(chat.emitTyping()).toBe(false)
    expect(chat.emitRate(5)).toBe(false)
    expect(transportMock.emitTyping).toHaveBeenCalledTimes(1)
    expect(transportMock.emitRate).toHaveBeenCalledWith(5)
  })

  it('delegates upload and preserves upload failures', async () => {
    const error = new Error('Ошибка загрузки')
    const { useChat } = await loadChatModule({
      uploadImpl: vi.fn(async () => {
        throw error
      }),
    })
    const chat = useChat()

    await expect(chat.uploadFiles([{} as File])).rejects.toThrow('Ошибка загрузки')
  })

  it('maps attachment rate limit socket errors to user-friendly message', async () => {
    const { useChat, callbacksRef } = await loadChatModule()
    const chat = useChat()
    chat.open()

    callbacksRef.current.onError?.('Слишком много вложений в чате. Подождите минуту и попробуйте снова.')

    expect(chat.lastError.value).toBe('Слишком много файлов за короткое время. Подождите немного и попробуйте снова.')
  })

  it('delegates send to transport and keeps its return value', async () => {
    const { useChat, transportMock } = await loadChatModule({ sendResult: false })
    const chat = useChat()

    expect(chat.send('hello')).toBe(false)
    expect(transportMock.send).toHaveBeenCalledWith('hello', [])
  })
})
