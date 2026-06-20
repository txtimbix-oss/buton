import { describe, expect, it } from 'vitest'

import { buildAboutPageContent } from '~/lib/about/content'

describe('buildAboutPageContent', () => {
  it('parses timeline, team, values, how-we-choose, and why-us blocks from settings JSON', () => {
    const content = buildAboutPageContent({
      timeline: JSON.stringify([{ year: '2024', text: 'Открыли новую студию' }]),
      team: JSON.stringify([{ name: 'Анна', role: 'Флорист', bloom: 'rose', bio: 'Собирает авторские букеты' }]),
      values: JSON.stringify([{ icon: 'leaf', title: 'Свежесть', text: 'Поставки дважды в неделю' }]),
      aboutHowWeChoose: JSON.stringify([{ title: 'Отбор', text: 'Проверяем стебли вручную' }]),
      aboutWhyUs: JSON.stringify([{ icon: 'clock', title: 'Фото до отправки', text: 'Согласуем букет в чате' }]),
    })

    expect(content.timeline).toEqual([{ year: '2024', text: 'Открыли новую студию' }])
    expect(content.team[0]).toMatchObject({ name: 'Анна', role: 'Флорист' })
    expect(content.values[0]).toMatchObject({ icon: 'leaf', title: 'Свежесть' })
    expect(content.howWeChoose[0]).toEqual({ title: 'Отбор', text: 'Проверяем стебли вручную' })
    expect(content.whyUs[0]).toMatchObject({ icon: 'clock', title: 'Фото до отправки' })
  })

  it('falls back to empty lists when the admin JSON payload is invalid', () => {
    const content = buildAboutPageContent({
      timeline: '{broken',
      team: '',
      values: 'null',
      aboutHowWeChoose: undefined,
      aboutWhyUs: '42',
    })

    expect(content.timeline).toEqual([])
    expect(content.team).toEqual([])
    expect(content.values).toEqual([])
    expect(content.howWeChoose).toEqual([])
    expect(content.whyUs).toEqual([])
  })
})
