function toDate(value: string | number | Date) {
  return value instanceof Date ? value : new Date(value)
}

const shortDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
})

const longDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatPrice(value: number) {
  return `${value.toLocaleString('ru-RU')} ₽`
}

export function formatShortDate(value: string | number | Date) {
  return shortDateFormatter.format(toDate(value))
}

export function formatLongDate(value: string | number | Date) {
  return longDateFormatter.format(toDate(value))
}

export function formatDateTime(value: string | number | Date) {
  return dateTimeFormatter.format(toDate(value))
}
