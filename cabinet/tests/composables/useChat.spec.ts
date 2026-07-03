import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

type ChatMessage = {
  _id: string
  sender: 'user' | 'admin'
  text: string
  attachments: any[]
  createdAt: string
  readByUser: boolean
  readByAdmin: boolean
}

type SocketLike = {
  connected: boolean
  on: ReturnType<typeof vi.fn>
  emit: ReturnType<typeof vi.fn>
}

function mockSocketModule() {
  const callbacks: Record<string, (...args: unknown[]) => void> = {}
  const socket: SocketLike = {
    connected: false,
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      callbacks[event] = handler
    }),
    emit: vi.fn(),
  }

  const io = vi.fn(() => socket)

  return { callbacks, socket, io }
}

async function loadChatModule() {
  vi.resetModules()
  setActivePinia(createPinia())
  const fixture = mockSocketModule()
  const storage: Record<string, string> = {}

  vi.doMock('socket.io-client', () => ({
    io: fixture.io,
  }))
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => storage[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key]
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key])
    }),
    key: vi.fn(),
    length: Object.keys(storage).length,
  })

  const chatModule = await import('@/composables/useChat')
  return { ...fixture, ...chatModule }
}

function createAdminMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    _id: 'msg-1',
    sender: 'admin',
    text: 'Нужна помощь',
    attachments: [],
    createdAt: new Date().toISOString(),
    readByUser: false,
    readByAdmin: false,
    ...overrides,
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('useChat', () => {
  it('connects customer chat socket to api.butonshop.ru /chat namespace in production env', async () => {
    vi.stubEnv('VITE_WS_URL', 'https://api.butonshop.ru')
    const { useChat, io } = await loadChatModule()

    useChat().open()
    await vi.waitFor(() => expect(io).toHaveBeenCalled())

    expect(io).toHaveBeenCalledWith('https://api.butonshop.ru/chat', expect.objectContaining({
      withCredentials: true,
      reconnectionAttempts: 5,
    }))
  })

  it('open() открывает чат, очищает unread и инициирует подключение', async () => {
    const { useChat, io } = await loadChatModule()
    const chat = useChat()

    chat.unread.value = 4
    chat.open()

    await vi.waitFor(() => expect(io).toHaveBeenCalledTimes(1))

    expect(chat.isOpen.value).toBe(true)
    expect(chat.unread.value).toBe(0)
  })

  it('send() игнорирует пустое сообщение и не инициирует отправку', async () => {
    const { useChat, socket } = await loadChatModule()
    const chat = useChat()

    expect(chat.send('   ')).toBe(false)
    expect(socket.emit).not.toHaveBeenCalled()
  })

  it('send() ставит сообщение в очередь пока нет сокета и флашит после chat:ready', async () => {
    const { useChat, socket, callbacks, io } = await loadChatModule()
    const chat = useChat()
    chat.open()

    await vi.waitFor(() => expect(io).toHaveBeenCalledTimes(1))
    expect(chat.send('hello')).toBe(true)
    expect(socket.emit).toHaveBeenCalledTimes(0)

    callbacks['chat:ready']?.({ chatId: 'chat-1', messages: [] })
    expect(chat.chatId.value).toBe('chat-1')
    expect(socket.emit).toHaveBeenCalledWith('chat:message', { text: 'hello', attachments: [] })
  })

  it('обрабатывает events от сокета, считает непрочитанные и очищает счётчик после повторного открытия', async () => {
    const { useChat, socket, callbacks, io } = await loadChatModule()
    const chat = useChat()
    chat.open()

    await vi.waitFor(() => expect(io).toHaveBeenCalledTimes(1))
    callbacks['connect']?.()
    expect(chat.isConnected.value).toBe(true)

    callbacks['chat:ready']?.({ chatId: 'chat-2', messages: [createAdminMessage({ _id: 'init-1', sender: 'admin', text: 'Привет' })] })
    expect(chat.messages.value).toHaveLength(1)

    io.mockClear()
    socket.connected = true
    socket.on.mockClear()
    socket.emit.mockClear()

    chat.close()
    callbacks['chat:closed']?.()
    expect(chat.isClosed.value).toBe(true)

    callbacks['chat:message']?.({ message: createAdminMessage({ _id: 'incoming-1', sender: 'admin', text: 'Новый' }) })
    expect(chat.unread.value).toBe(1)

    chat.open()
    expect(chat.unread.value).toBe(0)
  })

  it('guard для emitTyping/emitRate выполняет событие только после установки chatId и соединения', async () => {
    const { useChat, socket, callbacks } = await loadChatModule()
    const chat = useChat()
    chat.open()

    await vi.waitFor(() => expect(socket.on).toHaveBeenCalled())

    chat.emitTyping()
    chat.emitRate(3)
    expect(socket.emit).toHaveBeenCalledTimes(0)

    socket.connected = true
    callbacks['chat:ready']?.({ chatId: 'chat-3', messages: [] })
    chat.emitTyping()
    chat.emitRate(5)

    expect(socket.emit).toHaveBeenCalledWith('chat:typing')
    expect(socket.emit).toHaveBeenCalledWith('chat:rate', { rating: 5 })
  })

  it('uploadFiles() успешно отправляет файлы и пробрасывает ошибку сервера', async () => {
    const { useChat } = await loadChatModule()
    const attachments = [{ url: '/files/a.png', name: 'a.png', mimeType: 'image/png' }]

    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ files: attachments }),
    })))
    const okResult = await useChat().uploadFiles([new File(['a'], 'a.txt')])
    expect(okResult).toEqual(attachments)

    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false,
      json: async () => ({ error: 'Ошибка загрузки' }),
    })))
    const error = useChat().uploadFiles
    await expect(error([new File(['a'], 'a.txt')])).rejects.toThrow('Ошибка загрузки')
  })

  it('uploads chat files to the configured production API base', async () => {
    vi.stubEnv('VITE_API_BASE', 'https://api.butonshop.ru')
    const { useChat } = await loadChatModule()
    const attachments = [{ url: '/files/a.png', name: 'a.png', mimeType: 'image/png' }]
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ files: attachments }),
    }))
    vi.stubGlobal('fetch', fetchMock)

    await useChat().uploadFiles([new File(['a'], 'a.txt')])

    expect(fetchMock).toHaveBeenCalledWith('https://api.butonshop.ru/api/chats/upload', expect.objectContaining({
      method: 'POST',
    }))
  })
})
