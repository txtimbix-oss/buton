import { describe, expect, it, vi } from 'vitest'

import { useCorporatePageState } from '~/composables/useCorporatePageState'

describe('useCorporatePageState', () => {
  it('does not submit when required fields are empty', async () => {
    const submitInquiry = vi.fn(async () => undefined)
    const state = useCorporatePageState({}, { submitInquiry })

    await state.submit()

    expect(state.errors.name).toBe(true)
    expect(state.errors.phone).toBe(true)
    expect(submitInquiry).not.toHaveBeenCalled()
  })

  it('submits a corporate inquiry payload and marks the page success state', async () => {
    const submitInquiry = vi.fn(async () => undefined)
    const state = useCorporatePageState({}, { submitInquiry })

    state.form.company = 'ООО Нева'
    state.form.inn = '7801000000'
    state.form.volume = 'от 50 000 ₽/мес'
    state.form.frequency = 'По событиям'
    state.form.name = 'Ирина'
    state.form.phone = '+7 812 000 00 00'

    await state.submit()

    expect(submitInquiry).toHaveBeenCalledWith({
      type: 'corporate',
      name: 'Ирина',
      phone: '+7 812 000 00 00',
      data: {
        company: 'ООО Нева',
        inn: '7801000000',
        volume: 'от 50 000 ₽/мес',
        frequency: 'По событиям',
        name: 'Ирина',
        phone: '+7 812 000 00 00',
      },
    })
    expect(state.sent.value).toBe(true)
    expect(state.loading.value).toBe(false)
    expect(state.apiError.value).toBe('')
  })

  it('stores a stable api error on submit failure', async () => {
    const state = useCorporatePageState({}, {
      submitInquiry: vi.fn(async () => {
        throw new Error('down')
      }),
    })

    state.form.name = 'Ирина'
    state.form.phone = '+7 812 000 00 00'

    await state.submit()

    expect(state.sent.value).toBe(false)
    expect(state.loading.value).toBe(false)
    expect(state.apiError.value).toBe('Ошибка отправки. Попробуйте ещё раз.')
  })

  it('sends trimmed corporate payload fields', async () => {
    const submitInquiry = vi.fn(async () => undefined)
    const state = useCorporatePageState({}, { submitInquiry })

    state.form.company = '  ООО Нева  '
    state.form.inn = '  7801000000 '
    state.form.volume = '  от 50 000 ₽/мес '
    state.form.frequency = '  Еженедельно '
    state.form.name = '  Ирина '
    state.form.phone = ' +7 812 000 00 00 '

    await state.submit()

    expect(submitInquiry).toHaveBeenCalledWith({
      type: 'corporate',
      name: 'Ирина',
      phone: '+7 812 000 00 00',
      data: {
        company: 'ООО Нева',
        inn: '7801000000',
        volume: 'от 50 000 ₽/мес',
        frequency: 'Еженедельно',
        name: 'Ирина',
        phone: '+7 812 000 00 00',
      },
    })
  })

  it('ignores second submit while request is already in progress', async () => {
    let resolveAction: () => void = () => {}
    const submitInquiry = vi.fn(async () => new Promise<void>((resolve) => {
      resolveAction = resolve
    }))
    const state = useCorporatePageState({}, { submitInquiry })

    state.form.name = 'Алексей'
    state.form.phone = '+7 921 123 00 00'

    const first = state.submit()
    const second = state.submit()

    expect(submitInquiry).toHaveBeenCalledTimes(1)

    resolveAction()
    await first
    await second

    expect(state.loading.value).toBe(false)
    expect(state.sent.value).toBe(true)
  })
})
