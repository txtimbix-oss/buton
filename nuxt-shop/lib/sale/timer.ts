export interface SaleTimerSegment {
  value: string
  label: string
}

export const initialSaleTimerSegments: SaleTimerSegment[] = [
  { value: '02', label: 'дня' },
  { value: '14', label: 'часа' },
  { value: '38', label: 'мин' },
  { value: '05', label: 'сек' },
]

export function getNextSaleDeadline(now: Date): Date {
  const nextMonday = new Date(now)
  const dayOfWeek = nextMonday.getDay()
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek

  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday)
  nextMonday.setHours(0, 0, 0, 0)

  return nextMonday
}

export function getSaleCountdownSegments(now: Date): SaleTimerSegment[] {
  const deadline = getNextSaleDeadline(now)
  const diff = Math.max(0, deadline.getTime() - now.getTime())

  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  return [
    { value: String(days).padStart(2, '0'), label: days === 1 ? 'день' : 'дня' },
    { value: String(hours).padStart(2, '0'), label: 'часа' },
    { value: String(minutes).padStart(2, '0'), label: 'мин' },
    { value: String(seconds).padStart(2, '0'), label: 'сек' },
  ]
}
