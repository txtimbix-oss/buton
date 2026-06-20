import type { Socket } from 'socket.io-client'

import { hasOutgoingContent, sanitizeOutgoingText, type ChatAttachment, type ChatMessage } from '~/lib/chat/store'

type SocketFactory = (url: string, options: Record<string, unknown>) => SocketLike

interface SocketIoModule {
  io: SocketFactory
}

interface PushSubscriptionJson {
  endpoint?: string
  keys?: {
    p256dh: string
    auth: string
  }
}

interface PushManagerLike {
  getSubscription: () => Promise<{ toJSON: () => PushSubscriptionJson } | null>
}

interface ServiceWorkerRegistrationLike {
  pushManager: PushManagerLike
}

interface NavigatorLike {
  serviceWorker?: {
    ready: Promise<ServiceWorkerRegistrationLike>
  }
}

export interface SocketLike {
  connected: boolean
  emit: Socket['emit']
  on: Socket['on']
  connect?: Socket['connect']
}

export interface ChatTransportEvents {
  onConnectedChange?: (connected: boolean) => void
  onReady?: (payload: { chatId: string; messages: ChatMessage[] }) => void
  onMessage?: (message: ChatMessage) => void
  onAdminTypingStart?: () => void
  onAdminTypingStop?: () => void
  onClosed?: () => void
  onError?: (message: string, cause?: unknown) => void
}

export interface ChatTransportDeps {
  isClient?: boolean
  wsUrl: string
  loadSocketIo?: () => Promise<SocketIoModule>
  getSessionId?: () => string
  navigator?: NavigatorLike
  setTimeoutFn?: typeof setTimeout
  clearTimeoutFn?: typeof clearTimeout
  typingDurationMs?: number
}

export interface ChatTransport {
  connect: () => Promise<void>
  send: (text: string, attachments?: ChatAttachment[]) => boolean
  emitTyping: () => boolean
  emitRate: (rating: number) => boolean
}

interface PendingMessage {
  text: string
  attachments: ChatAttachment[]
}

function createNoopSessionId(): string {
  return crypto.randomUUID()
}

async function emitPushSubscription(socket: SocketLike, navigatorLike?: NavigatorLike) {
  if (!navigatorLike?.serviceWorker?.ready) return

  try {
    const registration = await navigatorLike.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    const json = subscription?.toJSON() as PushSubscriptionJson | undefined
    if (!json?.endpoint || !json.keys?.p256dh || !json.keys?.auth) return
    socket.emit('chat:push-sub', { endpoint: json.endpoint, keys: json.keys })
  } catch {
    // Push не поддерживается или не разрешен — это не должно ломать чат.
  }
}

export function createChatTransport(
  events: ChatTransportEvents,
  deps: ChatTransportDeps,
): ChatTransport {
  const loadSocketIo = deps.loadSocketIo ?? (() => import('socket.io-client'))
  const getSessionId = deps.getSessionId ?? createNoopSessionId
  const navigatorLike = deps.navigator
  const setTimeoutFn = deps.setTimeoutFn ?? setTimeout
  const clearTimeoutFn = deps.clearTimeoutFn ?? clearTimeout
  const typingDurationMs = deps.typingDurationMs ?? 3000

  let socket: SocketLike | null = null
  let isConnecting = false
  let chatId: string | null = null
  let pendingMessages: PendingMessage[] = []
  let typingTimer: ReturnType<typeof setTimeout> | null = null

  function stopTypingIndicator() {
    if (typingTimer) {
      clearTimeoutFn(typingTimer)
      typingTimer = null
    }
    events.onAdminTypingStop?.()
  }

  function flushPendingMessages() {
    if (!socket?.connected || !chatId || pendingMessages.length === 0) return

    const pending = pendingMessages
    pendingMessages = []
    for (const item of pending) {
      socket.emit('chat:message', item)
    }
  }

  async function connect() {
    if (!deps.isClient) return
    if (socket?.connected || isConnecting) return

    if (socket) {
      isConnecting = true
      socket.connect?.()
      return
    }

    isConnecting = true

    try {
      const { io } = await loadSocketIo()
      socket = io(`${deps.wsUrl}/chat`, {
        withCredentials: true,
        auth: { sessionId: getSessionId() },
        reconnectionAttempts: 5,
      })

      socket.on('connect', () => {
        events.onConnectedChange?.(true)
      })

      socket.on('disconnect', () => {
        isConnecting = false
        chatId = null
        stopTypingIndicator()
        events.onConnectedChange?.(false)
      })

      socket.on('connect_error', (error: unknown) => {
        isConnecting = false
        events.onError?.('connect_error', error)
      })

      socket.on('chat:ready', ({ chatId: nextChatId, messages }: { chatId: string; messages: ChatMessage[] }) => {
        chatId = nextChatId
        isConnecting = false
        events.onReady?.({ chatId: nextChatId, messages })
        flushPendingMessages()
        void emitPushSubscription(socket!, navigatorLike)
      })

      socket.on('chat:message', ({ message }: { message: ChatMessage }) => {
        events.onMessage?.(message)
      })

      socket.on('admin:typing', () => {
        events.onAdminTypingStart?.()
        if (typingTimer) {
          clearTimeoutFn(typingTimer)
        }
        typingTimer = setTimeoutFn(() => {
          typingTimer = null
          events.onAdminTypingStop?.()
        }, typingDurationMs)
      })

      socket.on('chat:closed', () => {
        events.onClosed?.()
      })

      socket.on('chat:error', (message: string) => {
        events.onError?.(message)
      })
    } catch (error) {
      isConnecting = false
      events.onError?.('connect_failed', error)
    }
  }

  function send(text: string, attachments: ChatAttachment[] = []) {
    if (!hasOutgoingContent(text, attachments)) return false

    const payload = {
      text: sanitizeOutgoingText(text),
      attachments,
    }

    if (!socket?.connected || !chatId) {
      pendingMessages = [...pendingMessages, payload]
      if (!socket?.connected) {
        void connect()
      }
      return true
    }

    socket.emit('chat:message', payload)
    return true
  }

  function emitTyping() {
    if (!socket?.connected || !chatId) return false
    socket.emit('chat:typing')
    return true
  }

  function emitRate(rating: number) {
    if (!socket?.connected || !chatId) return false
    socket.emit('chat:rate', { rating })
    return true
  }

  return {
    connect,
    send,
    emitTyping,
    emitRate,
  }
}
