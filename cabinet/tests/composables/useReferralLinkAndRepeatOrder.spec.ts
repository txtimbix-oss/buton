import { describe, expect, it, vi } from 'vitest'
import { useReferralLink } from '@/composables/useReferralLink'
import { useRepeatOrder } from '@/composables/useRepeatOrder'

const toast = {
  show: vi.fn(),
}

vi.mock('@/stores/toast', () => ({
  useToastStore: () => toast,
}))

vi.mock('@/api', () => ({
  SHOP_URL: 'https://shop.test',
}))

describe('referral link', () => {
  it('копирует реферальную ссылку и сбрасывает состояние через 2 секунды', async () => {
    vi.useFakeTimers()

    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })

    const { copied, copyReferralLink } = useReferralLink()
    await copyReferralLink('ABC123')

    expect(copied.value).toBe(true)
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/register?ref=ABC123`)

    vi.advanceTimersByTime(2000)
    expect(copied.value).toBe(false)

    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('не меняет состояние если код пуст', async () => {
    const { copied, copyReferralLink } = useReferralLink()
    await copyReferralLink('')
    expect(copied.value).toBe(false)
  })
})

describe('repeat order', () => {
  it('сохраняет payload в localStorage и открывает магазин', () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null)
    const setItem = vi.fn()
    vi.stubGlobal('localStorage', { setItem, removeItem: vi.fn(), getItem: vi.fn() })

    const { repeatOrder } = useRepeatOrder()
    repeatOrder({
      items: [
        {
          slug: 'rose',
          name: 'Роза',
          bloom: 'red',
          meta: 'L',
          sizeLabel: 'L',
          qty: 2,
          price: 100,
        },
      ],
    }, { target: 'cart', message: 'Готово', toastType: 'success' })

    expect(setItem).toHaveBeenCalledWith('repeatOrder', JSON.stringify([
      {
        slug: 'rose',
        name: 'Роза',
        bloom: 'red',
        meta: 'L',
        sizeLabel: 'L',
        qty: 2,
        price: 100,
      },
    ]))
    expect(openSpy).toHaveBeenCalledWith('https://shop.test/cart', '_blank')
    expect(toast.show).toHaveBeenCalledWith('Готово', 'success')

    openSpy.mockRestore()
    vi.unstubAllGlobals()
  })
})
