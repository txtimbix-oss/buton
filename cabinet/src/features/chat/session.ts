export interface ChatSessionDeps {
  getItem:  (key: string) => string | null
  setItem:  (key: string, value: string) => void
  randomId: () => string
}

const SESSION_KEY = 'chat_sid'

/**
 * Возвращает стабильный `chat_sid`: читает из storage, а при отсутствии
 * генерирует новый id и сохраняет. Storage и генератор инъектятся,
 * чтобы помощник был чистым и тестируемым.
 */
export function getSessionId(deps: ChatSessionDeps): string {
  let id = deps.getItem(SESSION_KEY)
  if (!id) {
    id = deps.randomId()
    deps.setItem(SESSION_KEY, id)
  }
  return id
}
