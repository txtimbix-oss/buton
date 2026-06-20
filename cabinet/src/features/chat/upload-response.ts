/**
 * Безопасно достаёт тело ответа загрузки.
 * Предпочитает `text()` (чтобы суметь распарсить JSON или вернуть сырую строку),
 * откатывается на `json()`, и никогда не кидает — при ошибке возвращает `null`.
 */
export async function readResponsePayload(response: Response): Promise<unknown> {
  if (typeof response.text !== 'function') {
    if (typeof response.json === 'function') {
      return response.json().catch(() => null)
    }
    return null
  }

  const text = await response.text().catch(() => '')
  if (!text) {
    if (typeof response.json === 'function') {
      return response.json().catch(() => null)
    }
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
