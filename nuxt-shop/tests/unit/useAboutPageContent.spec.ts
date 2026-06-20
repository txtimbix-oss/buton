import { ref } from 'vue'
import { describe, expect, it } from 'vitest'

import { useAboutPageContent } from '~/composables/useAboutPageContent'

describe('useAboutPageContent', () => {
  it('reactively derives about-page content buckets from storefront settings', () => {
    const settings = ref({
      timeline: JSON.stringify([{ year: '2017', text: 'Запуск мастерской' }]),
      team: JSON.stringify([{ name: 'Мария', role: 'Флорист', bloom: 'peach', bio: 'Собирает сезонные букеты' }]),
      values: JSON.stringify([{ icon: 'heart', title: 'Внимание к деталям', text: 'Подбираем упаковку вручную' }]),
      aboutHowWeChoose: JSON.stringify([{ title: 'Селекция', text: 'Берем только свежие партии' }]),
      aboutWhyUs: JSON.stringify([{ icon: 'truck', title: 'Доставка', text: 'Привозим день в день' }]),
    })

    const content = useAboutPageContent(settings)

    expect(content.timeline.value).toHaveLength(1)
    expect(content.team.value[0]?.name).toBe('Мария')
    expect(content.values.value[0]?.title).toBe('Внимание к деталям')

    settings.value = {
      ...settings.value,
      values: JSON.stringify([{ icon: 'leaf', title: 'Свежесть', text: 'Выбираем поставки утром' }]),
    }

    expect(content.values.value[0]?.title).toBe('Свежесть')
  })

  it('falls back to defaults when one of the settings fragments is malformed', () => {
    const settings = ref({
      timeline: '["2026"]',
      team: '[{ "name": "Мария", "role": "Флорист", "bloom": "peach", "bio": "Собирает сезонные букеты" }]',
      values: '[{ "icon": "heart", "title": "Внимание" ]',
      aboutHowWeChoose: '{ "broken": "json"',
      aboutWhyUs: '{"title":"text"}',
    })

    const content = useAboutPageContent(settings)

    expect(content.timeline.value).toHaveLength(1)
    expect(content.team.value).toHaveLength(1)
    expect(content.values.value).toEqual([])
    expect(content.howWeChoose.value).toEqual([])
    expect(content.whyUs.value).toEqual([])
  })
})
