import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  applyReadyPayload,
  appendIncomingMessage,
  markChatClosed,
  setAdminTyping,
  setConnectionState,
  type ChatMessage,
  type ChatStoreState,
} from '~/lib/chat/store'
import { createChatTransport, type ChatTransportEvents, type SocketLike } from '~/lib/chat/transport'

interface MockSocket extends SocketLike {
  emit: ReturnType<typeof vi.fn>
  on: ReturnType<typeof vi.fn>
  connect: ReturnType<typeof vi.fn>
  handlers: Record<string, Array<(...args: any[]) => void>>
  trigger: (event: string, payload?: any) => void
}

function createMockSocket(): MockSocket {
  const handlers: Record<string, Array<(...args: any[]) => void>> = {}

  return {
    connected: false,
    emit: vi.fn(),
    on: vi.fn((event: string, callback: (...args: any[]) => void) => {
      handlers[event] = handlers[event] ?? []
      handlers[event].push(callback)
    }),
    connect: vi.fn(),
    handlers,
    trigger(event: string, payload?: any) {
      for (const callback of handlers[event] ?? []) {
        callback(payload)
      }
    },
  }
}

function createInitialState(): ChatStoreState {
  return {
    messages: [],
    chatId: null,
    isOpen: false,
    unread: 0,
    isConnected: false,
    adminTyping: false,
    isClosed: false,
    proactiveMsg: '',
  }
}

function createTransportSetup(options: {
  socket?: MockSocket
  isClient?: boolean
  loadSocketIo?: () => Promise<{ io: () => MockSocket }>
  events?: ChatTransportEvents
} = {}) {
  const socket = options.socket ?? createMockSocket()
  let state = createInitialState()
  const events = {
    onConnectedChange: vi.fn((connected: boolean) => {
      state = setConnectionState(state, connected)
    }),
    onReady: vi.fn((payload: { chatId: string; messages: ChatMessage[] }) => {
      state = applyReadyPayload(state, payload)
    }),
    onMessage: vi.fn((message: ChatMessage) => {
      state = appendIncomingMessage(state, message)
    }),
    onAdminTypingStart: vi.fn(() => {
      state = setAdminTyping(state, true)
    }),
    onAdminTypingStop: vi.fn(() => {
      state = setAdminTyping(state, false)
    }),
    onClosed: vi.fn(() => {
      state = markChatClosed(state)
    }),
    onError: vi.fn(),
    ...options.events,
  }

  const transport = createChatTransport(events, {
    isClient: options.isClient ?? true,
    wsUrl: 'https://ws.test',
    loadSocketIo: options.loadSocketIo ?? (async () => ({ io: () => socket })),
    getSessionId: () => 'session-1',
  })

  return {
    socket,
    transport,
    events,
    getState: () => state,
  }
}

describe('chat transport', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('buffers outgoing messages until ready and flushes them exactly once', async () => {
    const loadSocketIo = vi.fn(async () => ({ io: () => createMockSocket() }))
    const socket = createMockSocket()
    loadSocketIo.mockResolvedValue({ io: () => socket })
    const { transport, events } = createTransportSetup({ socket, loadSocketIo })

    await transport.connect()
    socket.connected = true

    expect(transport.send('  hello  ')).toBe(true)
    expect(socket.emit).not.toHaveBeenCalled()

    socket.trigger('chat:ready', {
      chatId: 'chat-77',
      messages: [],
    })
    socket.trigger('chat:ready', {
      chatId: 'chat-77',
      messages: [],
    })

    expect(loadSocketIo).toHaveBeenCalledTimes(1)
    expect(events.onReady).toHaveBeenCalledTimes(2)
    expect(socket.emit).toHaveBeenCalledTimes(1)
    expect(socket.emit).toHaveBeenCalledWith('chat:message', {
      text: 'hello',
      attachments: [],
    })
  })

  it('reuses the same socket on reconnect, keeps existing history, and appends new ready messages', async () => {
    const readyAfterReconnectAt = '2026-06-08T00:00:01.000Z'
    const socket = createMockSocket()
    const loadSocketIo = vi.fn(async () => ({ io: () => socket }))
    const { transport, getState } = createTransportSetup({ socket, loadSocketIo })

    const initialMessages: ChatMessage[] = [{
      _id: 'm-1',
      sender: 'admin',
      text: 'Первое сообщение',
      attachments: [],
      createdAt: '2026-06-08T00:00:00.000Z',
      readByUser: true,
      readByAdmin: false,
    }]

    await transport.connect()
    socket.connected = true
    socket.trigger('connect')
    socket.trigger('chat:ready', { chatId: 'chat-7', messages: initialMessages })

    expect(getState().messages).toEqual(initialMessages)

    socket.connected = false
    socket.trigger('disconnect')
    expect(getState().chatId).toBeNull()

    expect(transport.send('повторно после реконнекта')).toBe(true)
    expect(loadSocketIo).toHaveBeenCalledTimes(1)
    expect(socket.connect).toHaveBeenCalledTimes(1)

    socket.connected = true
    socket.trigger('chat:ready', {
      chatId: 'chat-7',
      messages: [
        ...initialMessages,
        {
          _id: 'm-2',
          sender: 'admin',
          text: 'Сообщение после реконнекта',
          attachments: [],
          createdAt: readyAfterReconnectAt,
          readByUser: true,
          readByAdmin: false,
        },
      ],
    })

    expect(getState().messages).toEqual([
      ...initialMessages,
      {
        _id: 'm-2',
        sender: 'admin',
        text: 'Сообщение после реконнекта',
        attachments: [],
        createdAt: readyAfterReconnectAt,
        readByUser: true,
        readByAdmin: false,
      },
    ])
    expect(socket.emit).toHaveBeenCalledWith('chat:message', {
      text: 'повторно после реконнекта',
      attachments: [],
    })
  })

  it('prevents duplicate connection attempts while socket.io is still loading', async () => {
    let resolveIo: ((value: { io: () => MockSocket }) => void) | null = null
    const loadSocketIo = vi.fn(() => new Promise<{ io: () => MockSocket }>(resolve => {
      resolveIo = resolve
    }))
    const socket = createMockSocket()
    const { transport } = createTransportSetup({ socket, loadSocketIo })

    const firstConnect = transport.connect()
    const secondConnect = transport.connect()

    expect(loadSocketIo).toHaveBeenCalledTimes(1)

    resolveIo?.({ io: () => socket })
    await Promise.all([firstConnect, secondConnect])
  })

  it('toggles typing state and clears it after timeout', async () => {
    vi.useFakeTimers()
    const { socket, transport, events, getState } = createTransportSetup()

    await transport.connect()
    socket.trigger('admin:typing')

    expect(events.onAdminTypingStart).toHaveBeenCalledTimes(1)
    expect(getState().adminTyping).toBe(true)
    expect(events.onAdminTypingStop).not.toHaveBeenCalled()

    vi.advanceTimersByTime(2999)
    expect(events.onAdminTypingStop).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(events.onAdminTypingStop).toHaveBeenCalledTimes(1)
    expect(getState().adminTyping).toBe(false)
  })

  it('guards typing and rating emits until chat is ready', async () => {
    const { socket, transport } = createTransportSetup()

    await transport.connect()

    expect(transport.emitTyping()).toBe(false)
    expect(transport.emitRate(5)).toBe(false)

    socket.connected = true
    socket.trigger('chat:ready', { chatId: 'chat-21', messages: [] })

    expect(transport.emitTyping()).toBe(true)
    expect(transport.emitRate(5)).toBe(true)
    expect(socket.emit).toHaveBeenCalledWith('chat:typing')
    expect(socket.emit).toHaveBeenCalledWith('chat:rate', { rating: 5 })
  })

  it('reports connect errors and resets connected state on disconnect', async () => {
    const { socket, transport, events, getState } = createTransportSetup()

    await transport.connect()
    socket.trigger('connect')
    socket.trigger('connect_error', new Error('boom'))
    socket.trigger('disconnect')

    expect(events.onConnectedChange).toHaveBeenNthCalledWith(1, true)
    expect(events.onConnectedChange).toHaveBeenNthCalledWith(2, false)
    expect(events.onError).toHaveBeenCalledWith('connect_error', expect.any(Error))
    expect(getState().chatId).toBeNull()
    expect(transport.emitTyping()).toBe(false)
  })

  it('returns false for empty outbound payloads', () => {
    const { transport } = createTransportSetup()

    expect(transport.send('   ', [])).toBe(false)
  })
})
