import type { ChatAttachment } from '~/lib/chat/store'

const CHAT_UPLOAD_MAX_FILE_SIZE = 5 * 1024 * 1024
const CHAT_UPLOAD_ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.pdf',
  '.doc',
  '.docx',
  '.mp3',
  '.ogg',
  '.webm',
  '.m4a',
  '.mp4',
]

export interface ChatAttachmentsDeps {
  fetchFn?: typeof fetch
  endpoint?: string
  sessionId?: string
}

function resolveFileExtension(name = '') {
  const lastDot = name.lastIndexOf('.')
  return lastDot >= 0 ? name.slice(lastDot).toLowerCase() : ''
}

function isAllowedFile(file: File): boolean {
  if (file.size > CHAT_UPLOAD_MAX_FILE_SIZE) return false

  const extension = resolveFileExtension(file.name).trim()
  if (!CHAT_UPLOAD_ALLOWED_EXTENSIONS.includes(extension)) {
    if (extension && file.type?.startsWith('audio/')) return true
    return false
  }

  return true
}

function parseChatResponse(payload: unknown): ChatAttachment[] {
  if (!payload || typeof payload !== 'object') return []

  const candidate = payload as { files?: unknown }
  return Array.isArray(candidate.files)
    ? candidate.files as ChatAttachment[]
    : []
}

function getUploadResponseFallback(status: number): string {
  if (status === 413) return 'Файл слишком большой. Максимальный размер — 5 МБ.'
  if (status === 429) return 'Слишком много загрузок. Попробуйте позже.'
  return 'Ошибка загрузки файла'
}

export async function uploadChatFiles(
  files: File[],
  deps: ChatAttachmentsDeps = {},
): Promise<ChatAttachment[]> {
  if (files.length > 5) {
    throw new Error('Можно загрузить не более 5 файлов')
  }

  const invalidFile = files.find(file => !isAllowedFile(file))
  if (invalidFile) {
    const extension = resolveFileExtension(invalidFile.name)
    if (invalidFile.size > CHAT_UPLOAD_MAX_FILE_SIZE) {
      throw new Error('Файл слишком большой. Максимальный размер — 5 МБ.')
    }

    throw new Error(`Недопустимый формат файла${extension ? `: ${extension}` : ''}`)
  }

  const fetchFn = deps.fetchFn ?? fetch
  const endpoint = deps.endpoint ?? '/api/chats/upload'

  const formData = new FormData()
  for (const file of files) {
    formData.append('files', file)
  }

  const response = await fetchFn(endpoint, {
    method: 'POST',
    headers: deps.sessionId ? { 'x-chat-session-id': deps.sessionId } : undefined,
    body: formData,
  })

  if (!response.ok) {
    const fallback = getUploadResponseFallback(response.status)
    const errorPayload = await response.json().catch(() => ({ error: fallback }))
    throw new Error(errorPayload.error || fallback)
  }

  const data = await response.json().catch(() => ({}))
  return parseChatResponse(data)
}
