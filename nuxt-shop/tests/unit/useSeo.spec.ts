import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { useSeo } from '~/composables/useSeo'

describe('useSeo', () => {
  it('builds canonical links without trailing site slash or query parameters', () => {
    const useHead = vi.fn()

    vi.stubGlobal('computed', computed)
    vi.stubGlobal('useSettings', () => ref({
      siteUrl: 'https://shop.test/',
      storeName: 'spbshop',
      contactPhone: '+70000000000',
      contactEmail: 'hello@test.ru',
      contactAddress: 'Nevsky 1',
      storeCity: 'Санкт-Петербург',
      orgLat: '',
      orgLng: '',
      contactHours: '',
      socialVk: '',
      socialTg: '',
      socialInst: '',
    }))
    vi.stubGlobal('useRoute', () => ({ path: '/catalog' }))
    vi.stubGlobal('useHead', useHead)

    const seo = useSeo()
    seo.setCanonical('/catalog?season=rose')

    expect(useHead).toHaveBeenCalledWith({
      link: [{ rel: 'canonical', href: 'https://shop.test/catalog' }],
    })
  })

  it('builds organization schema with filtered socials and geo only when configured', () => {
    vi.stubGlobal('computed', computed)
    vi.stubGlobal('useSettings', () => ref({
      siteUrl: 'https://shop.test/',
      storeName: 'spbshop',
      contactPhone: '+70000000000',
      contactEmail: 'hello@test.ru',
      contactAddress: 'Nevsky 1',
      storeCity: 'Санкт-Петербург',
      orgLat: '59.93',
      orgLng: '30.33',
      contactHours: 'ежедневно 8:00–23:00',
      socialVk: 'https://vk.com/shop',
      socialTg: '',
      socialInst: 'https://instagram.com/shop',
    }))
    vi.stubGlobal('useRoute', () => ({ path: '/' }))
    vi.stubGlobal('useHead', vi.fn())

    const schema = useSeo().orgSchema()

    expect(schema.url).toBe('https://shop.test')
    expect(schema.sameAs).toEqual(['https://vk.com/shop', 'https://instagram.com/shop'])
    expect(schema.geo).toMatchObject({ latitude: '59.93', longitude: '30.33' })
  })
})
