import { uploadChatFiles } from '~/lib/chat/attachments'
import {
  applyReadyPayload,
  appendIncomingMessage,
  clearChatError,
  closeChat,
  markChatClosed,
  openChat,
  openProactiveChat,
  setAdminTyping,
  setChatError,
  setConnectionState,
  type ChatAttachment,
  type ChatMessage,
  type ChatStoreState,
} from '~/lib/chat/store'
import { createChatTransport, type ChatTransport } from '~/lib/chat/transport'

export type { ChatAttachment, ChatMessage } from '~/lib/chat/store'

let transport: ChatTransport | null = null

function getSessionId(): string {
  const storage = typeof localStorage === 'undefined' ? null : localStorage
  let id = storage?.getItem('chat_sid') ?? null
  if (!id) {
    id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`
    storage?.setItem('chat_sid', id)
  }
  return id
}

export const useChat = () => {
  const messages = useState<ChatMessage[]>('chat_messages', () => [])
  const chatId = useState<string | null>('chat_id', () => null)
  const isOpen = useState<boolean>('chat_open', () => false)
  const unread = useState<number>('chat_unread', () => 0)
  const isConnected = useState<boolean>('chat_connected', () => false)
  const adminTyping = useState<boolean>('chat_admin_typing', () => false)
  const isClosed = useState<boolean>('chat_is_closed', () => false)
  const proactiveMsg = useState<string>('chat_proactive_msg', () => '')
  const lastError = useState<string>('chat_last_error', () => '')

  function snapshot(): ChatStoreState {
    return {
      messages: messages.value,
      chatId: chatId.value,
      isOpen: isOpen.value,
      unread: unread.value,
      isConnected: isConnected.value,
      adminTyping: adminTyping.value,
      isClosed: isClosed.value,
      proactiveMsg: proactiveMsg.value,
      lastError: lastError.value,
    }
  }

  function commit(next: ChatStoreState) {
    messages.value = next.messages
    chatId.value = next.chatId
    isOpen.value = next.isOpen
    unread.value = next.unread
    isConnected.value = next.isConnected
    adminTyping.value = next.adminTyping
    isClosed.value = next.isClosed
    proactiveMsg.value = next.proactiveMsg
    lastError.value = next.lastError
  }

  function update(mutator: (state: ChatStoreState) => ChatStoreState) {
    commit(mutator(snapshot()))
  }

  function ensureTransport() {
    if (transport) return transport

    const wsUrl = (useRuntimeConfig().public.wsBase as string) || ''
    transport = createChatTransport(
      {
        onConnectedChange(connected) {
          update(state => setConnectionState(state, connected))
        },
        onReady(payload) {
          update(state => applyReadyPayload(state, payload))
        },
        onMessage(message) {
          update(state => appendIncomingMessage(state, message))
        },
        onAdminTypingStart() {
          update(state => setAdminTyping(state, true))
        },
        onAdminTypingStop() {
          update(state => setAdminTyping(state, false))
        },
        onClosed() {
          update(state => markChatClosed(state))
        },
        onError(message, cause) {
          if (message === 'connect_failed') {
            console.error('[chat] connect() failed:', cause)
            update(state => setChatError(state, 'Не удалось подключиться к чату. Попробуйте позже.'))
            return
          }
          if (message === 'connect_error') {
            update(state => setChatError(state, 'Чат временно недоступен. Попробуйте позже.'))
            return
          }
          update(state => setChatError(state, normalizeChatError(message)))
        },
      },
      {
        isClient: process.client,
        wsUrl,
        getSessionId,
        navigator: typeof navigator === 'undefined' ? undefined : navigator,
      },
    )

    return transport
  }

  function open() {
    update(state => openChat(state))
    void ensureTransport().connect()
  }

  function close() {
    update(state => closeChat(state))
  }

  function openProactive(message?: string) {
    const currentState = snapshot()
    if (currentState.isOpen) return
    commit(openProactiveChat(currentState, message || ''))
    void ensureTransport().connect()
  }

  function send(text: string, attachments: ChatAttachment[] = []) {
    return ensureTransport().send(text, attachments)
  }

  async function uploadFiles(files: File[]) {
    try {
      const uploaded = await uploadChatFiles(files, { sessionId: getSessionId() })
      update(state => clearChatError(state))
      return uploaded
    } catch (error) {
      update(state => setChatError(state, normalizeChatError(error)))
      throw error
    }
  }

  function clearError() {
    update(state => clearChatError(state))
  }

  function reportError(error: unknown) {
    update(state => setChatError(state, normalizeChatError(error)))
  }

  function emitTyping() {
    return ensureTransport().emitTyping()
  }

  function emitRate(rating: number) {
    return ensureTransport().emitRate(rating)
  }

  return {
    messages,
    chatId,
    isOpen,
    unread,
    isConnected,
    adminTyping,
    isClosed,
    proactiveMsg,
    lastError,
    open,
    close,
    openProactive,
    send,
    uploadFiles,
    emitTyping,
    emitRate,
    clearError,
    reportError,
  }
}

function normalizeChatError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error || '')

  if (!message || message === 'undefined' || message === 'null') {
    return 'Не удалось отправить сообщение. Попробуйте еще раз.'
  }

  if (message.includes('Слишком много сообщений')) {
    return 'Вы отправляете сообщения слишком часто. Подождите немного и попробуйте снова.'
  }

  if (
    message.includes('Слишком много загрузок')
    || message.includes('Слишком много вложений')
    || message.includes('Слишком много файлов в чате')
    || message.includes('Слишком много файлов в этой сессии чата')
    || message.includes('Слишком много запросов к чату')
  ) {
    return 'Слишком много файлов за короткое время. Подождите немного и попробуйте снова.'
  }

  if (message.includes('Можно прикрепить не более')) {
    return 'Можно прикрепить не более 5 файлов к одному сообщению.'
  }

  if (message.includes('Сообщение слишком длинное')) {
    return 'Сообщение слишком длинное. Сократите текст и отправьте снова.'
  }

  if (message.includes('Некорректная ссылка на вложение') || message.includes('Некорректное вложение')) {
    return 'Не удалось отправить вложение. Прикрепите файл заново.'
  }

  if (message.includes('Файл слишком большой')) {
    return 'Файл слишком большой. Максимальный размер — 5 МБ.'
  }

  if (message.includes('Недопустимый формат файла')) {
    return message
  }

  return message
}
