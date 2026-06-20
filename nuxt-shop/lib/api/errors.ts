const DEFAULT_API_ERROR = 'Не удалось выполнить запрос. Попробуйте ещё раз.'

function readStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined
  const candidate = error as {
    status?: unknown
    statusCode?: unknown
    response?: { status?: unknown }
  }
  const status = candidate.status ?? candidate.statusCode ?? candidate.response?.status
  return typeof status === 'number' ? status : undefined
}

function hasApiPayload(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false
  const candidate = error as {
    data?: unknown
    response?: { _data?: unknown }
  }
  return Boolean(candidate.data || candidate.response?._data)
}

function readMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const candidate = error as {
      message?: unknown
      data?: { error?: unknown; message?: unknown }
      response?: { _data?: { error?: unknown; message?: unknown } }
    }
    const message = candidate.data?.error
      ?? candidate.data?.message
      ?? candidate.response?._data?.error
      ?? candidate.response?._data?.message
      ?? candidate.message
    return typeof message === 'string' ? message.trim() : ''
  }

  return typeof error === 'string' ? error.trim() : ''
}

function friendlyMessage(message: string): string {
  if (/запросов авторизации|попыток.*авторизац|попыток.*вход/i.test(message)) {
    return 'Слишком много попыток входа. Подождите немного и попробуйте снова.'
  }
  if (/запросов к чату|сессии чата|вложений в чате|файлов в чате/i.test(message)) {
    return 'Чат получил слишком много сообщений или файлов. Подождите немного и попробуйте снова.'
  }
  if (/загрузок в аккаунте|слишком много загрузок/i.test(message)) {
    return 'Слишком много загрузок за короткое время. Подождите немного и попробуйте снова.'
  }
  if (/запросов к заказам|слишком много заказов/i.test(message)) {
    return 'Слишком много действий с заказами. Подождите немного и попробуйте снова.'
  }
  if (/заявок с этой страницы|слишком много заявок/i.test(message)) {
    return 'Слишком много заявок за короткое время. Подождите немного и попробуйте снова.'
  }
  if (/slug|productSlug/i.test(message)) {
    return 'Ссылка на товар или раздел выглядит некорректно. Обновите страницу и попробуйте ещё раз.'
  }
  if (/должен быть числом|меньше допустимого|больше допустимого|price|total|qty/i.test(message)) {
    return 'В запросе есть некорректная сумма или количество. Проверьте данные и попробуйте снова.'
  }
  if (/должен быть корректной датой|deliveryDate|createdAt/i.test(message)) {
    return 'Дата указана некорректно. Выберите дату заново.'
  }
  if (/слишком длин/i.test(message)) {
    return 'Текст слишком длинный. Сократите его и попробуйте снова.'
  }
  if (/слишком много/i.test(message)) {
    return 'Слишком много данных за один раз. Уменьшите количество и попробуйте снова.'
  }
  if (/некорректный формат изображения|некорректное изображение/i.test(message)) {
    return 'Файл не похож на поддерживаемое изображение. Загрузите JPG, PNG, WEBP или AVIF.'
  }
  if (/payload/i.test(message)) {
    return 'Заявка получилась слишком большой. Сократите сообщение и попробуйте снова.'
  }
  if (/push-подпис/i.test(message)) {
    return 'Не удалось включить push-уведомления. Попробуйте позже.'
  }
  if (/некорректная ссылка на вложение/i.test(message)) {
    return 'Не удалось отправить вложение. Прикрепите файл заново.'
  }
  return message
}

export function normalizeApiError(error: unknown, fallback = DEFAULT_API_ERROR): string {
  const status = readStatus(error)
  const message = friendlyMessage(readMessage(error))

  if (status === undefined && !hasApiPayload(error)) {
    if (error instanceof Error && /^backend unavailable$/i.test(error.message.trim())) {
      return error.message.trim()
    }
    return fallback
  }

  if (status === 429) {
    return message || 'Слишком много попыток. Подождите несколько минут и попробуйте снова.'
  }
  if (status === 413) {
    return message || 'Слишком большой файл или слишком много данных. Уменьшите объём и попробуйте снова.'
  }
  if (status === 403) {
    return message || 'Нет доступа к этому действию.'
  }
  if (status === 401) {
    return message || 'Нужно войти в аккаунт.'
  }
  if (status === 400 || status === 404 || status === 409) {
    return message || fallback
  }

  return message && !/^HTTP\s+\d+$/i.test(message) ? message : fallback
}
