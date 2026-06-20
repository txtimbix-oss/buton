import { describe, expect, it, vi } from 'vitest'

import { useSubscriptionPageState } from '~/composables/useSubscriptionPageState'

describe('useSubscriptionPageState', () => {
  it('selects a plan and scrolls the form into view after next tick', async () => {
    const nextTickMock = vi.fn(async () => undefined)
    const state = useSubscriptionPageState({}, {
      submitSubscription: vi.fn(async () => undefined),
      nextTick: nextTickMock,
    })

    const scrollIntoView = vi.fn()
    state.formRef.value = { scrollIntoView } as unknown as HTMLElement

    await state.selectPlan(state.plans[1]!)

    expect(state.selectedPlan.value?.id).toBe('monthly-2')
    expect(nextTickMock).toHaveBeenCalledTimes(1)
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  })

  it('submits the selected plan, resets the form, and opens success state', async () => {
    const submitSubscription = vi.fn(async () => undefined)
    const state = useSubscriptionPageState({}, {
      submitSubscription,
      nextTick: async () => undefined,
    })

    state.selectedPlan.value = state.plans[0]!
    state.subForm.name = 'Анна'
    state.subForm.phone = '+79990000000'
    state.subForm.email = 'anna@example.com'
    state.subForm.address = 'Невский, 1'
    state.subForm.day = 'Среда'
    state.subForm.time = '12:00-14:00'
    state.subForm.notes = 'Без лилий'

    await state.submit()

    expect(submitSubscription).toHaveBeenCalledWith({
      name: 'Анна',
      phone: '+79990000000',
      email: 'anna@example.com',
      address: 'Невский, 1',
      day: 'Среда',
      time: '12:00-14:00',
      notes: 'Без лилий',
      plan: state.plans[0]!.title,
    })
    expect(state.subSuccess.value).toBe(true)
    expect(state.selectedPlan.value).toBeNull()
    expect(state.subForm).toMatchObject({
      name: '',
      phone: '',
      email: '',
      address: '',
      day: 'Пятница',
      time: '18:00-20:00',
      notes: '',
    })
  })

  it('sends trimmed payload through a stable subscription builder order', async () => {
    const submitSubscription = vi.fn(async () => undefined)
    const state = useSubscriptionPageState({}, {
      submitSubscription,
      nextTick: async () => undefined,
    })

    state.selectedPlan.value = state.plans[1]!
    state.subForm.name = '  Анна '
    state.subForm.phone = ' +7 921 111 22 33 '
    state.subForm.email = ' anna@example.com '
    state.subForm.address = ' Невский пр. 1 '
    state.subForm.day = 'Среда'
    state.subForm.time = '12:00-14:00'
    state.subForm.notes = ' Без лилий '

    await state.submit()

    expect(submitSubscription).toHaveBeenCalledWith({
      name: 'Анна',
      phone: '+7 921 111 22 33',
      email: 'anna@example.com',
      address: 'Невский пр. 1',
      day: 'Среда',
      time: '12:00-14:00',
      notes: 'Без лилий',
      plan: state.plans[1]!.title,
    })
  })

  it('skips submit when no plan is selected and exposes a stable error on failure', async () => {
    const submitSubscription = vi.fn(async () => {
      throw new Error('down')
    })
    const state = useSubscriptionPageState({}, {
      submitSubscription,
      nextTick: async () => undefined,
    })

    await state.submit()
    expect(submitSubscription).not.toHaveBeenCalled()

    state.selectedPlan.value = state.plans[2]!
    state.subForm.name = 'Анна'
    state.subForm.phone = '+79990000000'
    state.subForm.email = 'anna@example.com'
    state.subForm.address = 'Невский, 1'

    await state.submit()

    expect(state.subError.value).toBe('Не удалось отправить заявку. Проверьте соединение и попробуйте снова.')
    expect(state.subSubmitting.value).toBe(false)
    expect(state.subSuccess.value).toBe(false)
  })

  it('ignores duplicate subscription submits while request is in progress', async () => {
    let resolveAction: () => void = () => {}
    const submitSubscription = vi.fn(async () => new Promise<void>((resolve) => {
      resolveAction = resolve
    }))
    const state = useSubscriptionPageState({}, {
      submitSubscription,
      nextTick: async () => undefined,
    })

    state.selectedPlan.value = state.plans[1]!
    state.subForm.name = 'Анна'
    state.subForm.phone = '+79990000000'
    state.subForm.email = 'anna@example.com'
    state.subForm.address = 'Невский, 1'
    state.subForm.day = 'Среда'
    state.subForm.time = '12:00-14:00'

    const first = state.submit()
    const second = state.submit()

    expect(submitSubscription).toHaveBeenCalledTimes(1)

    resolveAction()
    await first
    await second

    expect(state.subSubmitting.value).toBe(false)
    expect(state.subSuccess.value).toBe(true)
  })
})
