export const CABINET_API_ERROR_FALLBACK = 'Не удалось выполнить запрос. Попробуйте ещё раз.'

type CabinetApiErrorShape = Error & { status?: number }

type MessageRule = {
  test: RegExp
  message: string
}

const MESSAGE_RULES: MessageRule[] = [
  {
    test: /запросов авторизации|попыток.*авторизац|попыток.*вход/i,
    message: 'Слишком много попыток входа. Подождите немного и попробуйте снова.',
  },
  {
    test: /запросов к чату|сессии чата|вложений в чате|файлов в чате/i,
    message: 'Чат получил слишком много сообщений или файлов. Подождите немного и попробуйте снова.',
  },
  {
    test: /загрузок в аккаунте|слишком много загрузок/i,
    message: 'Слишком много загрузок за короткое время. Подождите немного и попробуйте снова.',
  },
  {
    test: /запросов к заказам|слишком много заказов/i,
    message: 'Слишком много действий с заказами. Подождите немного и попробуйте снова.',
  },
  {
    test: /заявок с этой страницы|слишком много заявок/i,
    message: 'Слишком много заявок за короткое время. Подождите немного и попробуйте снова.',
  },
  {
    test: /network error|failed to fetch|timeout|сети|соединени/i,
    message: 'Не удалось связаться с сервером. Проверьте интернет и попробуйте ещё раз.',
  },
  {
    test: /too many files|files limit|file count|не больше|слишком много файлов/i,
    message: 'Слишком много файлов. Прикрепите не больше 5 файлов за раз.',
  },
  {
    test: /file.*(large|size)|too large|payload too large|request entity|файл.*больш|лимит.*файл/i,
    message: 'Файл слишком большой. Выберите файл поменьше и попробуйте снова.',
  },
  {
    test: /unsupported|mime|file type|тип файла|формат/i,
    message: 'Формат файла не поддерживается. Прикрепите изображение, аудио или документ в разрешённом формате.',
  },
  {
    test: /rate limit|too many requests|too many attempts|часто|лимит|429/i,
    message: 'Слишком много попыток. Подождите немного и попробуйте снова.',
  },
  {
    test: /objectid|invalid.*id|id.*invalid|cast to|идентификатор/i,
    message: 'Запись не найдена или устарела. Обновите страницу и попробуйте ещё раз.',
  },
  {
    test: /slug|productslug/i,
    message: 'Не удалось найти товар по ссылке. Обновите страницу и попробуйте ещё раз.',
  },
  {
    test: /order status|invalid status|status.*invalid|статус|enum/i,
    message: 'Статус сейчас некорректен для этого действия. Обновите страницу и попробуйте ещё раз.',
  },
  {
    test: /price|amount|total|qty|quantity|bonus|points|сумм|колич|бонус/i,
    message: 'Проверьте сумму, количество или бонусы и попробуйте ещё раз.',
  },
  {
    test: /date|birth|дат/i,
    message: 'Проверьте дату: она должна быть указана в корректном формате.',
  },
  {
    test: /email|почт/i,
    message: 'Проверьте email: адрес должен быть указан без ошибок.',
  },
  {
    test: /phone|телефон/i,
    message: 'Проверьте номер телефона и попробуйте ещё раз.',
  },
  {
    test: /password|парол/i,
    message: 'Проверьте пароль и попробуйте ещё раз.',
  },
  {
    test: /required|missing|обяз/i,
    message: 'Заполните обязательные поля и попробуйте ещё раз.',
  },
  {
    test: /not found|не найден/i,
    message: 'Запись не найдена. Обновите страницу и попробуйте ещё раз.',
  },
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toStatus(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

function readStatus(error: unknown): number | undefined {
  if (!isRecord(error)) return undefined

  const directStatus = toStatus(error.status) ?? toStatus(error.statusCode)
  if (directStatus) return directStatus

  if (isRecord(error.response)) {
    return toStatus(error.response.status)
  }

  return undefined
}

function readResponsePayload(error: unknown): unknown {
  if (!isRecord(error)) return undefined

  if (isRecord(error.response) && 'data' in error.response) {
    return error.response.data
  }

  if ('data' in error) return error.data

  return undefined
}

function readMessageFromPayload(payload: unknown): string {
  if (typeof payload === 'string') return payload
  if (!isRecord(payload)) return ''

  for (const key of ['error', 'message', 'detail']) {
    const value = payload[key]
    if (typeof value === 'string') return value
  }

  const errors = payload.errors
  if (Array.isArray(errors)) {
    const first = errors.find((item) => typeof item === 'string' || isRecord(item))
    if (typeof first === 'string') return first
    if (isRecord(first)) return readMessageFromPayload(first)
  }

  if (isRecord(errors)) {
    for (const value of Object.values(errors)) {
      if (typeof value === 'string') return value
      if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
    }
  }

  return ''
}

function readRawMessage(error: unknown): string {
  const payloadMessage = readMessageFromPayload(readResponsePayload(error))
  if (payloadMessage) return payloadMessage

  if (isRecord(error) && typeof error.message === 'string') return error.message
  if (error instanceof Error) return error.message

  return ''
}

function isUnsafeServerMessage(message: string): boolean {
  return /request failed with status code|objectid|mongodb|mongoose|validationerror|casterror|e11000|stack|trace|schema|enum|jwt|tokenexpired|cannot read|undefined|null|syntaxerror/i.test(message)
}

function isReadableServerMessage(message: string): boolean {
  return /[а-яё]/i.test(message) && !isUnsafeServerMessage(message)
}

function cleanMessage(message: string): string {
  return message.replace(/\s+/g, ' ').trim()
}

export function normalizeCabinetApiError(error: unknown, fallback = CABINET_API_ERROR_FALLBACK): string {
  const status = readStatus(error)
  const rawMessage = cleanMessage(readRawMessage(error))
  const finalFallback = fallback || CABINET_API_ERROR_FALLBACK

  if (status === 401) return 'Нужно войти в аккаунт. Авторизуйтесь и повторите действие.'
  if (status === 403) return 'Нет доступа к этому действию.'
  if (status === 413) return 'Файл слишком большой или данных слишком много. Уменьшите вложения и попробуйте снова.'
  if (status === 415) return 'Формат файла не поддерживается. Выберите другой файл.'
  if (status === 429 && rawMessage) {
    const specificRule = MESSAGE_RULES.find(rule => rule.test.test(rawMessage))
    if (specificRule) return specificRule.message
    if (isReadableServerMessage(rawMessage)) return rawMessage
  }
  if (status === 429) return 'Слишком много попыток. Подождите немного и попробуйте снова.'

  if (rawMessage && isReadableServerMessage(rawMessage)) return rawMessage

  for (const rule of MESSAGE_RULES) {
    if (rule.test.test(rawMessage)) return rule.message
  }

  if (status === 404) return 'Запись не найдена. Обновите страницу и попробуйте ещё раз.'
  if (status === 409) return rawMessage && !isUnsafeServerMessage(rawMessage)
    ? rawMessage
    : 'Данные уже изменились или конфликтуют с текущим состоянием. Обновите страницу и попробуйте ещё раз.'
  if (status === 400 || status === 422) return rawMessage && !isUnsafeServerMessage(rawMessage)
    ? rawMessage
    : 'Проверьте данные в форме и попробуйте ещё раз.'
  if (status && status >= 500) return 'На сервере временная ошибка. Попробуйте чуть позже.'

  if (rawMessage && !isUnsafeServerMessage(rawMessage)) return rawMessage

  return finalFallback
}

export function toCabinetApiError(error: unknown, fallback?: string): CabinetApiErrorShape {
  const next = new Error(normalizeCabinetApiError(error, fallback)) as CabinetApiErrorShape
  const status = readStatus(error)
  if (status) next.status = status
  return next
}
