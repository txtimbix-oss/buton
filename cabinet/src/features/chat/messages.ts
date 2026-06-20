export interface ChatAttachment {
  url:      string
  name:     string
  mimeType: string
}

export interface ChatMessage {
  _id:         string
  sender:      'user' | 'admin'
  text:        string
  attachments: ChatAttachment[]
  createdAt:   string
  readByUser:  boolean
  readByAdmin: boolean
}

/**
 * Приводит входящий socket-payload к `ChatMessage`.
 * Сервер шлёт сообщение либо напрямую (`{ sender, text, ... }`),
 * либо завёрнутым в `{ message: {...} }`. Всё остальное — игнор.
 */
export function normalizeIncomingMessage(value: unknown): ChatMessage | null {
  if (!value || typeof value !== 'object') return null
  if ('sender' in value && typeof (value as ChatMessage).sender === 'string') {
    return value as ChatMessage
  }
  if ('message' in value && typeof (value as { message?: unknown }).message === 'object') {
    return (value as { message: ChatMessage }).message
  }
  return null
}
