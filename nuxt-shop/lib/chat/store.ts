export interface ChatAttachment {
  url: string
  name: string
  mimeType: string
}

export interface ChatMessage {
  _id: string
  sender: 'user' | 'admin'
  text: string
  attachments: ChatAttachment[]
  createdAt: string
  readByUser: boolean
  readByAdmin: boolean
}

export interface ChatStoreState {
  messages: ChatMessage[]
  chatId: string | null
  isOpen: boolean
  unread: number
  isConnected: boolean
  adminTyping: boolean
  isClosed: boolean
  proactiveMsg: string
  lastError?: string
}

function mergeReadyMessages(current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  if (current.length === 0) return incoming

  const knownIds = new Set(current.map(message => message._id))
  const nextMessages = incoming.filter(message => !knownIds.has(message._id))

  return nextMessages.length > 0 ? [...current, ...nextMessages] : current
}

export function sanitizeOutgoingText(text: string): string {
  return text.trim()
}

export function hasOutgoingContent(text: string, attachments: ChatAttachment[] = []): boolean {
  return sanitizeOutgoingText(text).length > 0 || attachments.length > 0
}

export function openChat(state: ChatStoreState): ChatStoreState {
  return {
    ...state,
    isOpen: true,
    unread: 0,
  }
}

export function closeChat(state: ChatStoreState): ChatStoreState {
  return {
    ...state,
    isOpen: false,
  }
}

export function openProactiveChat(state: ChatStoreState, message = ''): ChatStoreState {
  if (state.isOpen) return state

  return {
    ...openChat(state),
    proactiveMsg: message,
  }
}

export function setConnectionState(state: ChatStoreState, isConnected: boolean): ChatStoreState {
  return {
    ...state,
    isConnected,
    chatId: isConnected ? state.chatId : null,
  }
}

export function applyReadyPayload(
  state: ChatStoreState,
  payload: { chatId: string; messages: ChatMessage[] },
): ChatStoreState {
  return {
    ...state,
    chatId: payload.chatId,
    messages: mergeReadyMessages(state.messages, payload.messages),
    lastError: '',
  }
}

export function appendIncomingMessage(state: ChatStoreState, message: ChatMessage): ChatStoreState {
  return {
    ...state,
    messages: [...state.messages, message],
    unread: message.sender === 'admin' && !state.isOpen ? state.unread + 1 : state.unread,
    lastError: '',
  }
}

export function setAdminTyping(state: ChatStoreState, adminTyping: boolean): ChatStoreState {
  return {
    ...state,
    adminTyping,
  }
}

export function markChatClosed(state: ChatStoreState): ChatStoreState {
  return {
    ...state,
    isClosed: true,
  }
}

export function setChatError(state: ChatStoreState, message: string): ChatStoreState {
  return {
    ...state,
    lastError: message,
  }
}

export function clearChatError(state: ChatStoreState): ChatStoreState {
  if (!state.lastError) return state

  return {
    ...state,
    lastError: '',
  }
}
