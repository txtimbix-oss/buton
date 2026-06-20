import { describe, expect, it, vi } from 'vitest'

import { useGiftCardsPageState } from '~/composables/useGiftCardsPageState'

function setup() {
  const submitInquiry = vi.fn(async () => undefined)
  const state = useGiftCardsPageState({}, { submitInquiry })

  return {
    state,
    submitInquiry,
  }
}

describe('useGiftCardsPageState', () => {
  it('derives the current amount from the active nominal and custom amount', () => {
    const { state } = setup()

    expect(state.currentAmount.value).toBe(5000)

    state.selectNominal(4)
    state.customAmount.value = '9200'

    expect(state.currentAmount.value).toBe(9200)
  })

  it('clears the custom amount when the custom nominal is selected', () => {
    const { state } = setup()
    state.customAmount.value = '8100'

    state.selectNominal(4)

    expect(state.customAmount.value).toBe('')
    expect(state.activeNominal.value).toBe(4)
  })

  it('blocks submit when no amount is selected', async () => {
    const { state, submitInquiry } = setup()
    state.selectNominal(4)

    await state.submit()

    expect(submitInquiry).not.toHaveBeenCalled()
    expect(state.apiError.value).toBe('Укажите номинал')
    expect(state.loading.value).toBe(false)
    expect(state.sent.value).toBe(false)
  })

  it('submits the preserved inquiry payload and opens the success state', async () => {
    const { state, submitInquiry } = setup()
    state.selectNominal(4)
    state.customAmount.value = '8400'
    state.activeDesign.value = 2
    state.form.from = 'Анна'
    state.form.to = 'Ольга'
    state.form.wish = 'Люблю тебя'
    state.form.email = 'olga@example.com'
    state.form.format = 'print'

    await state.submit()

    expect(submitInquiry).toHaveBeenCalledWith({
      type: 'custom',
      name: 'Анна',
      phone: '—',
      email: 'olga@example.com',
      data: {
        subtype: 'gift-card',
        amount: 8400,
        design: 'peach',
        from: 'Анна',
        to: 'Ольга',
        wish: 'Люблю тебя',
        email: 'olga@example.com',
        format: 'print',
      },
    })
    expect(state.sent.value).toBe(true)
    expect(state.loading.value).toBe(false)
    expect(state.apiError.value).toBe('')
  })

  it('stores a stable error when inquiry submission fails', async () => {
    const submitInquiry = vi.fn(async () => {
      throw new Error('down')
    })
    const state = useGiftCardsPageState({}, { submitInquiry })
    state.form.email = 'olga@example.com'

    await state.submit()

    expect(state.apiError.value).toBe('Ошибка оформления. Попробуйте ещё раз.')
    expect(state.loading.value).toBe(false)
    expect(state.sent.value).toBe(false)
  })

  it('sends trimmed metadata payload from form inputs', async () => {
    const submitInquiry = vi.fn(async () => undefined)
    const state = useGiftCardsPageState({}, { submitInquiry })

    state.selectNominal(4)
    state.customAmount.value = '8400'
    state.activeDesign.value = 1
    state.form.from = '  Анна  '
    state.form.to = '  Ольга  '
    state.form.wish = '  Люблю тебя  '
    state.form.email = '  olga@example.com '
    state.form.format = ' print '

    await state.submit()

    expect(submitInquiry).toHaveBeenCalledWith({
      type: 'custom',
      name: 'Анна',
      phone: '—',
      email: 'olga@example.com',
      data: {
        subtype: 'gift-card',
        amount: 8400,
        design: 'green',
        from: 'Анна',
        to: 'Ольга',
        wish: 'Люблю тебя',
        email: 'olga@example.com',
        format: 'print',
      },
    })
  })

  it('ignores duplicate inquiry submits while a request is pending', async () => {
    let resolveAction: () => void = () => {}
    const submitInquiry = vi.fn(async () => new Promise<void>((resolve) => {
      resolveAction = resolve
    }))
    const state = useGiftCardsPageState({}, { submitInquiry })

    state.selectNominal(4)
    state.customAmount.value = '7200'

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
