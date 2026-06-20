import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDashboardPromos } from '@/composables/useDashboardPromos'
import { api } from '@/api'

vi.mock('@/api', () => ({
  api: {
    checkBirthdayPromo: vi.fn(),
    getAutoApplyPromo: vi.fn(),
  },
}))

describe('useDashboardPromos', () => {
  beforeEach(() => {
    vi.mocked(api.checkBirthdayPromo).mockReset()
    vi.mocked(api.getAutoApplyPromo).mockReset()
  })

  it('строит merged список акций и обрабатывает дедубликацию', async () => {
    vi.mocked(api.checkBirthdayPromo).mockResolvedValue({
      ok: true,
      promo: { code: 'BIRTHDAY', discount: 500 },
    })
    vi.mocked(api.getAutoApplyPromo).mockResolvedValue({
      code: 'AUTO10',
      discount: 10,
      discountType: 'percent_capped',
      maxDiscountAmount: 700,
    })

    const { activePromos, loadPromos } = useDashboardPromos()

    await loadPromos()

    expect(activePromos.value).toEqual([
      {
        code: 'BIRTHDAY',
        title: 'Подарок ко дню рождения',
        detail: '500 ₽',
      },
      {
        code: 'AUTO10',
        title: 'Персональное предложение',
        detail: '10% (до 700 ₽)',
      },
    ])
  })

  it('заменяет birthday промо на null при отсутствии данных и не падает на ошибках', async () => {
    vi.mocked(api.checkBirthdayPromo).mockRejectedValue(new Error('nope'))
    vi.mocked(api.getAutoApplyPromo).mockResolvedValue(null)

    const { activePromos, birthdayPromo, loadPromos } = useDashboardPromos()
    await loadPromos('u1')

    expect(birthdayPromo.value).toBeNull()
    expect(activePromos.value).toEqual([])
  })

  it('формирует текст для free_shipping и fixed скидок', async () => {
    vi.mocked(api.checkBirthdayPromo).mockResolvedValue({ ok: true, promo: null })
    vi.mocked(api.getAutoApplyPromo).mockResolvedValueOnce({
      code: 'SHIP',
      discount: 0,
      discountType: 'free_shipping',
    }).mockResolvedValueOnce({
      code: 'FIX',
      discount: 250,
      discountType: 'fixed',
    })

    const { activePromos, loadPromos } = useDashboardPromos()

    await loadPromos('u1')
    expect(activePromos.value[0]).toMatchObject({ code: 'SHIP', detail: 'бесплатная доставка' })

    await loadPromos('u1')
    expect(activePromos.value[0]).toMatchObject({ code: 'FIX', detail: '250 ₽' })
  })
})
