import { effectScope, nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { buildCareFaqSchema, parseCareFaqItems, parseCareFlowerTypes, parseCareSteps } from '~/lib/care/content'
import { useCareTipsPageContent } from '~/composables/useCareTipsPageContent'

describe('useCareTipsPageContent', () => {
  it('derives shell-ready care content from reactive settings fields', () => {
    const careTips = ref(JSON.stringify([
      { day: '1', title: 'Сразу после получения', text: 'Подрежьте стебли.' },
    ]))
    const flowerTypes = ref(JSON.stringify([
      { name: 'Розы', use: 'классика', care: 'Держите в прохладе.' },
    ]))
    const faqItems = ref(JSON.stringify([
      { q: 'Как оживить цветы?', a: 'Сменить воду.' },
      { q: 'Есть ли самовывоз?', a: 'Да.' },
    ]))

    const page = useCareTipsPageContent({
      careTips,
      flowerTypes,
      faqItems,
    })

    expect(page.careSteps.value).toEqual(parseCareSteps(careTips.value))
    expect(page.careFlowerTypes.value).toEqual(parseCareFlowerTypes(flowerTypes.value))
    expect(page.careFaq.value).toEqual(parseCareFaqItems(faqItems.value))
    expect(page.careFaqSchema.value).toEqual(buildCareFaqSchema(page.careFaq.value))
  })

  it('wires faq schema updates when faq content changes', async () => {
    const jsonLd = vi.fn()
    const careTips = ref<string | undefined>(undefined)
    const flowerTypes = ref<string | undefined>(undefined)
    const faqItems = ref(JSON.stringify([
      { q: 'Как ухаживать за цветами?', a: 'Обновляйте срез.' },
    ]))

    const scope = effectScope()
    let page: ReturnType<typeof useCareTipsPageContent> | undefined

    scope.run(() => {
      page = useCareTipsPageContent({
        careTips,
        flowerTypes,
        faqItems,
      }, {
        jsonLd,
      })
    })

    await nextTick()

    expect(jsonLd).toHaveBeenCalledTimes(1)
    expect(jsonLd).toHaveBeenLastCalledWith(buildCareFaqSchema(page!.careFaq.value))

    faqItems.value = JSON.stringify([
      { q: 'Как сохранить цветы свежими?', a: 'Не ставьте рядом с фруктами.' },
      { q: 'Оплата курьеру?', a: 'Нет.' },
    ])
    await nextTick()

    expect(jsonLd).toHaveBeenCalledTimes(2)
    expect(page!.careFaq.value).toEqual([
      { q: 'Как сохранить цветы свежими?', a: 'Не ставьте рядом с фруктами.' },
    ])
    expect(jsonLd).toHaveBeenLastCalledWith(buildCareFaqSchema(page!.careFaq.value))

    scope.stop()
  })

  it('falls back to defaults when care payload fragments are invalid', async () => {
    const careTips = ref('{ "broken": true }')
    const flowerTypes = ref('[{"name":"Розы","use":"классика","care":"..."}, ]')
    const faqItems = ref('{ "q": "Как?"]')

    const page = useCareTipsPageContent({ careTips, flowerTypes, faqItems })

    expect(page.careSteps.value).toEqual(parseCareSteps(undefined))
    expect(page.careFlowerTypes.value).toEqual(parseCareFlowerTypes(undefined))
    expect(page.careFaq.value).toEqual(parseCareFaqItems(undefined))
    expect(page.careFaqSchema.value).toEqual(buildCareFaqSchema(page.careFaq.value))
  })
})
