import { describe, expect, it, vi } from 'vitest'

import { getLocalDateInputValue, useCustomPageState } from '~/composables/useCustomPageState'

function createCartLineStub() {
  let index = 0

  return vi.fn((input: {
    slug: string
    name: string
    bloom: string
    meta: string
    sizeLabel: string
    price: number
    addons?: string[]
  }) => ({
    lineId: `line-${++index}`,
    lineKey: `${input.slug}-${index}`,
    qty: 1,
    addons: input.addons ?? [],
    ...input,
  }))
}

function setup() {
  const addLine = vi.fn()
  const showToast = vi.fn()
  const navigate = vi.fn(async () => undefined)
  const submitInquiry = vi.fn(async () => undefined)
  const createCartLine = createCartLineStub()

  const state = useCustomPageState({}, {
    addLine,
    showToast,
    navigate,
    submitInquiry,
    createCartLine,
    getToday: () => '2026-06-08',
  })

  return {
    state,
    addLine,
    showToast,
    navigate,
    submitInquiry,
    createCartLine,
  }
}

describe('getLocalDateInputValue', () => {
  it('formats the local calendar date without UTC shift', () => {
    const date = new Date(2026, 5, 8, 0, 30, 0)

    expect(getLocalDateInputValue(date)).toBe('2026-06-08')
  })
})

describe('useCustomPageState', () => {
  it('adds a custom bouquet to cart and shows a toast', () => {
    const { state, addLine, showToast } = setup()

    state.addCustomToCart()

    expect(addLine).toHaveBeenCalledTimes(1)
    expect(addLine).toHaveBeenCalledWith(expect.objectContaining({
      slug: 'custom-m-roses-rose-airy-craft',
      name: 'Собранный букет · Романтика',
      addons: ['Фото перед отправкой'],
    }))
    expect(showToast).toHaveBeenCalledWith('Собранный букет добавлен в корзину')
  })

  it('validates name and phone for quick order and does not navigate on error', async () => {
    const { state, addLine, navigate } = setup()

    await state.addCustomQuickOrder()

    expect(state.errors.name).toBe(true)
    expect(state.errors.phone).toBe(true)
    expect(addLine).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('adds a quick order to cart, shows a toast, and navigates to cart on success', async () => {
    const { state, addLine, showToast, navigate } = setup()
    state.form.name = 'Мария'
    state.form.phone = '+7 921 000 00 00'
    state.selectedAddons.value = ['photo', 'card']

    await state.addCustomQuickOrder()

    expect(addLine).toHaveBeenCalledTimes(1)
    expect(addLine).toHaveBeenCalledWith(expect.objectContaining({
      slug: 'custom-today-m-roses-rose-airy-craft',
      addons: ['Фото перед отправкой', 'Доставка сегодня', 'Открытка с текстом'],
    }))
    expect(showToast).toHaveBeenCalledWith('Быстрый заказ оформлен: Романтика')
    expect(navigate).toHaveBeenCalledWith('/cart')
  })

  it('submits a trimmed quote payload and keeps mandatory photo in addons', async () => {
    const { state, submitInquiry } = setup()

    state.form.name = '  Мария  '
    state.form.phone = ' +7 921 000 00 00 '
    state.form.message = '  Без пыльцы  '
    state.selectedAddons.value = ['card']

    await state.submitQuote()

    expect(submitInquiry).toHaveBeenCalledWith({
      type: 'custom',
      name: 'Мария',
      phone: '+7 921 000 00 00',
      data: expect.objectContaining({
        addons: ['Открытка с текстом', 'Фото перед отправкой'],
        message: 'Без пыльцы',
      }),
    })
  })

  it('submits a manual-builder inquiry payload and marks quote as sent on success', async () => {
    const { state, submitInquiry, showToast } = setup()
    state.form.name = 'Мария'
    state.form.phone = '+7   921   000  00 00'
    state.form.message = 'Без пыльцы'
    state.deliveryDate.value = '2026-06-09'
    state.selectedAddons.value = ['photo', 'card']

    await state.submitQuote()

    expect(submitInquiry).toHaveBeenCalledWith(expect.objectContaining({
      type: 'custom',
      name: 'Мария',
      phone: '+7 921 000 00 00',
      data: expect.objectContaining({
        type: 'manual-builder',
        occasion: 'Романтика',
        size: 'M',
        addons: ['Открытка с текстом', 'Фото перед отправкой'],
      }),
    }))
    expect(state.quoteSent.value).toBe(true)
    expect(showToast).toHaveBeenCalledWith('Заявка на сборку отправлена')
  })

  it('stores a stable api error when quote submission fails', async () => {
    const submitInquiry = vi.fn(async () => {
      throw new Error('down')
    })
    const state = useCustomPageState({}, {
      addLine: vi.fn(),
      showToast: vi.fn(),
      navigate: vi.fn(),
      submitInquiry,
      createCartLine: createCartLineStub(),
      getToday: () => '2026-06-08',
    })
    state.form.name = 'Мария'
    state.form.phone = '+7 921 000 00 00'

    await state.submitQuote()

    expect(state.apiError.value).toBe('Не удалось отправить заявку. Проверьте телефон или попробуйте позже.')
    expect(state.quoteLoading.value).toBe(false)
    expect(state.quoteSent.value).toBe(false)
  })

  it('ignores a second quote submit call while the previous one is in-flight', async () => {
    let resolveAction: () => void = () => {}
    const submitInquiry = vi.fn(async () => new Promise<void>((resolve) => {
      resolveAction = resolve
    }))
    const state = useCustomPageState({}, {
      addLine: vi.fn(),
      showToast: vi.fn(),
      navigate: vi.fn(),
      submitInquiry,
      createCartLine: createCartLineStub(),
      getToday: () => '2026-06-08',
    })

    state.form.name = 'Мария'
    state.form.phone = '+7 921 000 00 00'

    const first = state.submitQuote()
    const second = state.submitQuote()

    expect(submitInquiry).toHaveBeenCalledTimes(1)

    resolveAction()
    await first
    await second

    expect(state.quoteSent.value).toBe(true)
    expect(state.quoteLoading.value).toBe(false)
  })

  it('keeps the mandatory photo addon while toggling other addons', () => {
    const { state } = setup()

    state.selectedAddons.value = ['card']
    state.toggleAddon()

    expect(state.selectedAddons.value).toContain('photo')
    expect(state.selectedAddons.value).toContain('card')
    expect(state.selectedAddons.value).toHaveLength(2)
  })
})
