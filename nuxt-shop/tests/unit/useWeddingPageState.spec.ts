import { describe, expect, it, vi } from 'vitest'

import { useWeddingPageState } from '~/composables/useWeddingPageState'
import { weddingPageContent } from '~/lib/wedding/content'

describe('useWeddingPageState', () => {
  it('exposes page content under the pageContent contract used by the route shell', () => {
    const state = useWeddingPageState({}, {
      submitInquiry: vi.fn(async () => undefined),
      scrollToId: vi.fn(),
    })

    expect(state.pageContent).toBe(weddingPageContent)
    expect(state.pageContent.heroEyebrow).toBe('Свадебная флористика')
  })

  it('delegates scroll orchestration through injected dependencies', () => {
    const scrollToId = vi.fn()
    const state = useWeddingPageState({}, {
      submitInquiry: vi.fn(async () => undefined),
      scrollToId,
    })

    state.scrollToForm()

    expect(scrollToId).toHaveBeenCalledWith('wed-form')
  })

  it('does not submit when required fields are empty', async () => {
    const submitInquiry = vi.fn(async () => undefined)
    const state = useWeddingPageState({}, {
      submitInquiry,
      scrollToId: vi.fn(),
    })

    await state.submit()

    expect(state.errors.name).toBe(true)
    expect(state.errors.phone).toBe(true)
    expect(submitInquiry).not.toHaveBeenCalled()
  })

  it('submits a wedding inquiry payload and marks the success state', async () => {
    const submitInquiry = vi.fn(async () => undefined)
    const state = useWeddingPageState({}, {
      submitInquiry,
      scrollToId: vi.fn(),
    })

    state.form.name = 'Анна'
    state.form.phone = '+7 921 000 00 00'
    state.form.date = '2026-07-01'
    state.form.format = 'Выездная церемония'
    state.form.budget = '90 000 — 150 000 ₽'

    await state.submit()

    expect(submitInquiry).toHaveBeenCalledWith({
      type: 'wedding',
      name: 'Анна',
      phone: '+7 921 000 00 00',
      data: {
        name: 'Анна',
        phone: '+7 921 000 00 00',
        date: '2026-07-01',
        format: 'Выездная церемония',
        budget: '90 000 — 150 000 ₽',
      },
    })
    expect(state.sent.value).toBe(true)
    expect(state.loading.value).toBe(false)
    expect(state.apiError.value).toBe('')
  })

  it('stores a stable api error on submit failure', async () => {
    const state = useWeddingPageState({}, {
      submitInquiry: vi.fn(async () => {
        throw new Error('down')
      }),
      scrollToId: vi.fn(),
    })

    state.form.name = 'Анна'
    state.form.phone = '+7 921 000 00 00'

    await state.submit()

    expect(state.sent.value).toBe(false)
    expect(state.loading.value).toBe(false)
    expect(state.apiError.value).toBe('Ошибка отправки. Попробуйте ещё раз.')
  })

  it('sends trimmed and stable payload fields', async () => {
    const submitInquiry = vi.fn(async () => undefined)
    const state = useWeddingPageState({}, {
      submitInquiry,
      scrollToId: vi.fn(),
    })

    state.form.name = '  Анна '
    state.form.phone = ' +7 921 000 00 00 '
    state.form.date = ' 2026-07-01 '
    state.form.format = ' Выездная церемония '
    state.form.budget = ' 90 000 — 150 000 ₽ '

    await state.submit()

    expect(submitInquiry).toHaveBeenCalledWith({
      type: 'wedding',
      name: 'Анна',
      phone: '+7 921 000 00 00',
      data: {
        name: 'Анна',
        phone: '+7 921 000 00 00',
        date: '2026-07-01',
        format: 'Выездная церемония',
        budget: '90 000 — 150 000 ₽',
      },
    })
  })

  it('ignores duplicate wedding inquiry submits while pending', async () => {
    let resolveAction: () => void = () => {}
    const submitInquiry = vi.fn(async () => new Promise<void>((resolve) => {
      resolveAction = resolve
    }))
    const state = useWeddingPageState({}, {
      submitInquiry,
      scrollToId: vi.fn(),
    })

    state.form.name = 'Анна'
    state.form.phone = '+7 921 000 00 00'
    state.form.date = '2026-07-11'
    state.form.format = 'Выездная церемония'
    state.form.budget = '30 000 — 70 000 ₽'

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
