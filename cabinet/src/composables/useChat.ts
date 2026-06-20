import { storeToRefs } from 'pinia'
import type { Socket } from 'socket.io-client'
import { normalizeCabinetApiError, toCabinetApiError } from '@/api/errors'
import { normalizeIncomingMessage } from '@/features/chat/messages'
import type { ChatAttachment, ChatMessage } from '@/features/chat/messages'
import { getSessionId as resolveSessionId } from '@/features/chat/session'
import { readResponsePayload } from '@/features/chat/upload-response'
import { useChatStore } from '@/stores/chat'

export type { ChatAttachment, ChatMessage } from '@/features/chat/messages'

interface PendingChatMessage {
  text: string
  attachments: ChatAttachment[]
}

// Reactive state живёт в Pinia store; здесь только socket lifecycle.
let socket:          Socket | null = null
let isConnecting                   = false
let pendingMessages: PendingChatMessage[] = []
let typingTimer:     ReturnType<typeof setTimeout> | null = null
const memoryStorage = new Map<string, string>()

function getStorageValue(key: string): string | null {
  if (typeof localStorage === 'undefined') return memoryStorage.get(key) ?? null
  return localStorage.getItem(key)
}

function setStorageValue(key: string, value: string): void {
  if (typeof localStorage === 'undefined') {
    memoryStorage.set(key, value)
    return
  }
  localStorage.setItem(key, value)
}

function getSessionId(): string {
  return resolveSessionId({
    getItem:  getStorageValue,
    setItem:  setStorageValue,
    randomId: () => (crypto?.randomUUID ? crypto.randomUUID() : `chat-${Date.now()}-${Math.random()}`),
  })
}

function createSocketUrl(): string {
  const wsUrl = (import.meta.env.VITE_WS_URL as string) || ''
  return `${wsUrl}/chat`
}

function flushPendingMessages() {
  if (!socket) return

  const pending = [...pendingMessages]
  pendingMessages = []

  for (const item of pending) {
    socket.emit('chat:message', item)
  }
}

function syncPushSubscription() {
  if (!('serviceWorker' in navigator) || !socket) return

  navigator.serviceWorker.ready.then(reg =>
    reg.pushManager.getSubscription()
  ).then(sub => {
    if (!sub || !socket) return

    const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh: string; auth: string } }
    if (json.endpoint && json.keys?.p256dh && json.keys?.auth) {
      socket.emit('chat:push-sub', { endpoint: json.endpoint, keys: json.keys })
    }
  }).catch(() => { /* push не поддерживается */ })
}

function handleChatReady({ chatId: id, messages: msgs }: { chatId: string; messages: ChatMessage[] }) {
  useChatStore().setReady(id, msgs)
  isConnecting = false
  flushPendingMessages()
  syncPushSubscription()
}

function handleIncomingMessage(value: unknown) {
  const message = normalizeIncomingMessage(value)
  if (!message) return
  useChatStore().appendMessage(message)
}

function handleAdminTyping() {
  const store = useChatStore()
  store.setAdminTyping(true)

  if (typingTimer) clearTimeout(typingTimer)
  typingTimer = setTimeout(() => {
    store.setAdminTyping(false)
  }, 3000)
}

function registerSocketListeners(activeSocket: Socket) {
  const store = useChatStore()

  activeSocket.on('connect', () => {
    store.setConnected(true)
  })

  activeSocket.on('disconnect', () => {
    store.setConnected(false)
    isConnecting = false
  })

  activeSocket.on('connect_error', () => {
    isConnecting = false
    store.setError('Чат временно недоступен. Если соединение не восстановится, оставьте сообщение через форму.')
  })

  activeSocket.on('chat:ready', handleChatReady)
  activeSocket.on('chat:message', (payload: unknown) => {
    handleIncomingMessage(payload)
  })
  activeSocket.on('admin:typing', handleAdminTyping)
  activeSocket.on('chat:closed', () => {
    store.markClosed()
  })
  activeSocket.on('chat:error', (msg: string) => {
    store.setError(normalizeCabinetApiError({ message: msg }, 'Не удалось отправить сообщение. Попробуйте позже.'))
    console.error('[chat] server error:', msg)
  })
}

async function connect() {
  if (socket?.connected || isConnecting) return
  isConnecting = true

  try {
    const { io } = await import('socket.io-client')
    socket = io(createSocketUrl(), {
      withCredentials: true,
      auth: { sessionId: getSessionId() },
      reconnectionAttempts: 5,
    })
    registerSocketListeners(socket)
  } catch (err) {
    console.error('[chat] connect() failed:', err)
    isConnecting = false
  }
}

export function useChat() {
  const store = useChatStore()

  function open() {
    store.openChat()
    connect()
  }

  function close() {
    store.closeChat()
  }

  function send(text: string, attachments: ChatAttachment[] = []): boolean {
    const trimmed = text.trim()
    if (!trimmed && !attachments.length) return false
    store.setError('')

    if (!socket?.connected || !store.chatId) {
      pendingMessages.push({ text: trimmed, attachments })
      if (!socket?.connected) connect()
      return true
    }

    socket.emit('chat:message', { text: trimmed, attachments })
    return true
  }

  async function uploadFiles(files: File[]): Promise<ChatAttachment[]> {
    store.setError('')

    try {
      const fd = new FormData()
      for (const f of files) fd.append('files', f)
      const res = await fetch('/api/chats/upload', {
        method: 'POST',
        headers: { 'x-chat-session-id': getSessionId() },
        body: fd,
      })

      if (!res.ok) {
        const data = await readResponsePayload(res)
        throw toCabinetApiError({ status: res.status, data }, 'Не удалось загрузить файл. Проверьте размер и формат.')
      }

      const data = await res.json() as { files?: ChatAttachment[] }
      if (!Array.isArray(data.files)) {
        throw new Error('Не удалось получить загруженные файлы. Попробуйте ещё раз.')
      }

      return data.files
    } catch (error) {
      const message = normalizeCabinetApiError(error, 'Не удалось загрузить файл. Проверьте размер и формат.')
      store.setError(message)
      throw new Error(message)
    }
  }

  function emitTyping() {
    if (!socket?.connected || !store.chatId) return
    socket.emit('chat:typing')
  }

  function emitRate(rating: number) {
    if (!socket?.connected || !store.chatId) return
    socket.emit('chat:rate', { rating })
  }

  const { messages, chatId, isOpen, unread, isConnected, adminTyping, isClosed, lastError } = storeToRefs(store)

  return {
    messages, chatId, isOpen, unread, isConnected,
    adminTyping, isClosed, lastError,
    open, close, send, uploadFiles, emitTyping, emitRate,
  }
}
