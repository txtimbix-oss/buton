import { computed, ref } from 'vue'

export type AppDatePickerCalendarCell = {
  key: string
  date: string | null
  label: string
}

export const APP_DATE_PICKER_WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'] as const

export function useAppDatePickerCalendar() {
  const year = ref(new Date().getFullYear())
  const month = ref(new Date().getMonth())
  const today = getTodayIsoDate()

  const monthLabel = computed(() => `${MONTHS[month.value]} ${year.value}`)
  const cells = computed(() => buildDatePickerCalendarCells(year.value, month.value))

  function shiftMonth(step: -1 | 1) {
    const nextValue = month.value + step

    if (nextValue < 0) {
      month.value = 11
      year.value--
      return
    }

    if (nextValue > 11) {
      month.value = 0
      year.value++
      return
    }

    month.value = nextValue
  }

  function prevMonth() {
    shiftMonth(-1)
  }

  function nextMonth() {
    shiftMonth(1)
  }

  function syncToDate(date: string) {
    if (!date) return

    const selectedDate = toDatePickerDate(date)
    year.value = selectedDate.getFullYear()
    month.value = selectedDate.getMonth()
  }

  return {
    today,
    monthLabel,
    cells,
    prevMonth,
    nextMonth,
    syncToDate,
  }
}

export function buildDatePickerCalendarCells(currentYear: number, currentMonth: number): AppDatePickerCalendarCell[] {
  const first = new Date(currentYear, currentMonth, 1)
  const last = new Date(currentYear, currentMonth + 1, 0)
  const offset = (first.getDay() + 6) % 7
  const result: AppDatePickerCalendarCell[] = []

  for (let i = 0; i < offset; i++) result.push({ key: `e${i}`, date: null, label: '' })

  for (let day = 1; day <= last.getDate(); day++) {
    result.push({
      key: `d${day}`,
      date: toDatePickerIsoDate(currentYear, currentMonth, day),
      label: String(day),
    })
  }

  return result
}

export function toDatePickerIsoDate(currentYear: number, currentMonth: number, day: number) {
  const monthValue = String(currentMonth + 1).padStart(2, '0')
  const dayValue = String(day).padStart(2, '0')

  return `${currentYear}-${monthValue}-${dayValue}`
}

export function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

export function isDatePickerDateDisabled(date: string, options: {
  today: string
  blockPast?: boolean
  blockFuture?: boolean
}) {
  if (options.blockPast && date < options.today) return true
  if (options.blockFuture && date > options.today) return true
  return false
}

export function formatDatePickerValueRu(date: string) {
  return toDatePickerDate(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function toDatePickerDate(date: string) {
  return new Date(`${date}T00:00:00`)
}
