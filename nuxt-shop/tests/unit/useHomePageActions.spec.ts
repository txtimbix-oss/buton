import { describe, expect, it, vi } from 'vitest'

import type { Product } from '~/composables/useShop'
import { useHomePageActions } from '~/composables/useHomePageActions'

function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    _id: 'prod-1',
    name: 'Белые ночи',
    slug: 'belye-nochi',
    meta: 'Авторский букет',
    description: 'Свежий авторский букет',
    price: 9100,
    bloom: 'cream',
    tag: 'Новинка',
    oldPrice: 9900,
    images: ['/flowers.jpg'],
    sizes: [
      { label: 'M', desc: 'Высота 45 см', price: 9100 },
      { label: 'L', desc: 'Высота 55 см', price: 10900 },
    ],
    composition: [],
    careInstructions: 'Менять воду каждые два дня',
    addons: [],
    catalogAddonIds: [],
    rating: 4.9,
    reviewCount: 18,
    inStock: true,
    featured: true,
    ...overrides,
  }
}

describe('useHomePageActions', () => {
  it('copies promo code and shows success toast when clipboard write succeeds', async () => {
    const addLine = vi.fn()
    const showToast = vi.fn()
    const writeText = vi.fn().mockResolvedValue(undefined)
    const getPromoCopyMessage = vi.fn((code: string, copied: boolean) =>
      copied ? `copied:${code}` : `fallback:${code}`,
    )

    const actions = useHomePageActions({
      addLine,
      showToast,
      writeText,
      getPromoCopyMessage,
    })

    await actions.copyPromo('JUNE')

    expect(writeText).toHaveBeenCalledWith('JUNE')
    expect(getPromoCopyMessage).toHaveBeenCalledWith('JUNE', true)
    expect(showToast).toHaveBeenCalledWith('copied:JUNE')
  })

  it('shows fallback toast when clipboard write fails', async () => {
    const addLine = vi.fn()
    const showToast = vi.fn()
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    const getPromoCopyMessage = vi.fn((code: string, copied: boolean) =>
      copied ? `copied:${code}` : `fallback:${code}`,
    )

    const actions = useHomePageActions({
      addLine,
      showToast,
      writeText,
      getPromoCopyMessage,
    })

    await actions.copyPromo('JUNE')

    expect(writeText).toHaveBeenCalledWith('JUNE')
    expect(getPromoCopyMessage).toHaveBeenCalledWith('JUNE', false)
    expect(showToast).toHaveBeenCalledWith('fallback:JUNE')
  })

  it('adds the resolved primary size to cart and shows a toast', () => {
    const line = { lineId: 'line-1', lineKey: 'line-key-1' }
    const addLine = vi.fn()
    const showToast = vi.fn()
    const buildCartLine = vi.fn().mockReturnValue(line)
    const getPrimarySize = vi.fn().mockReturnValue({ label: 'L', price: 10900 })

    const actions = useHomePageActions({
      addLine,
      showToast,
      writeText: vi.fn(),
      buildCartLine,
      getPrimarySize,
    })

    actions.quickAdd(createProduct())

    expect(getPrimarySize).toHaveBeenCalledWith(expect.objectContaining({
      slug: 'belye-nochi',
      name: 'Белые ночи',
    }))
    expect(buildCartLine).toHaveBeenCalledWith({
      slug: 'belye-nochi',
      name: 'Белые ночи',
      bloom: 'cream',
      meta: 'Размер L',
      sizeLabel: 'L',
      price: 10900,
    })
    expect(addLine).toHaveBeenCalledWith(line)
    expect(showToast).toHaveBeenCalledWith('Белые ночи · Размер L')
  })

  it('falls back to size M and base price when no primary size is resolved', () => {
    const line = { lineId: 'line-2', lineKey: 'line-key-2' }
    const addLine = vi.fn()
    const showToast = vi.fn()
    const buildCartLine = vi.fn().mockReturnValue(line)

    const actions = useHomePageActions({
      addLine,
      showToast,
      writeText: vi.fn(),
      buildCartLine,
      getPrimarySize: vi.fn().mockReturnValue(undefined),
    })

    actions.quickAdd(createProduct())

    expect(buildCartLine).toHaveBeenCalledWith({
      slug: 'belye-nochi',
      name: 'Белые ночи',
      bloom: 'cream',
      meta: 'Размер M',
      sizeLabel: 'M',
      price: 9100,
    })
    expect(addLine).toHaveBeenCalledWith(line)
    expect(showToast).toHaveBeenCalledWith('Белые ночи · Размер M')
  })
})
