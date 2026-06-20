import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  APP_DATE_PICKER_WEEKDAYS,
  buildDatePickerCalendarCells,
  formatDatePickerValueRu,
  isDatePickerDateDisabled,
  toDatePickerIsoDate,
  useAppDatePickerCalendar,
} from '@/composables/useAppDatePickerCalendar'

describe('useAppDatePickerCalendar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('строит сетку календаря с понедельника и учитывает високосный февраль', () => {
    expect(APP_DATE_PICKER_WEEKDAYS).toEqual(['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'])

    const january = buildDatePickerCalendarCells(2024, 0)
    expect(january).toHaveLength(31)
    expect(january[0]).toEqual({ key: 'd1', date: '2024-01-01', label: '1' })

    const february = buildDatePickerCalendarCells(2024, 1)
    expect(february).toHaveLength(32)
    expect(february.slice(0, 3).map(cell => cell.date)).toEqual([null, null, null])
    expect(february[3]).toEqual({ key: 'd1', date: '2024-02-01', label: '1' })
    expect(february.at(-1)).toEqual({ key: 'd29', date: '2024-02-29', label: '29' })
  })

  it('синхронизируется с выбранной датой и корректно переходит между месяцами на границе года', () => {
    const calendar = useAppDatePickerCalendar()

    expect(calendar.today).toBe('2026-06-15')
    expect(calendar.monthLabel.value).toBe('Июнь 2026')

    calendar.syncToDate('2025-01-10')
    expect(calendar.monthLabel.value).toBe('Январь 2025')

    calendar.prevMonth()
    expect(calendar.monthLabel.value).toBe('Декабрь 2024')

    calendar.nextMonth()
    expect(calendar.monthLabel.value).toBe('Январь 2025')
  })

  it('форматирует и блокирует даты через pure helpers', () => {
    expect(toDatePickerIsoDate(2026, 5, 7)).toBe('2026-06-07')
    expect(isDatePickerDateDisabled('2026-06-14', { today: '2026-06-15', blockPast: true })).toBe(true)
    expect(isDatePickerDateDisabled('2026-06-16', { today: '2026-06-15', blockFuture: true })).toBe(true)
    expect(isDatePickerDateDisabled('2026-06-15', { today: '2026-06-15', blockPast: true, blockFuture: true })).toBe(false)

    const formatted = formatDatePickerValueRu('2026-06-05').toLowerCase()
    expect(formatted).toContain('2026')
    expect(formatted).toContain('июн')
  })
})
