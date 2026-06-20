import { effectScope, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useCatalogCollectionPage } from '~/composables/useCatalogCollectionPage'

describe('useCatalogCollectionPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('passes the collection slug into the fetch url', async () => {
    const data = ref(null)
    const pending = ref(true)
    const useFetchMock = vi.fn((url: string) => ({ data, pending }))

    vi.stubGlobal('useFetch', useFetchMock)

    await useCatalogCollectionPage({
      collectionSlug: ref('summer-mood'),
      settings: ref({}),
      siteUrl: ref('https://buton.test'),
      setCanonical: vi.fn(),
      jsonLd: vi.fn(),
    })

    expect(useFetchMock).toHaveBeenCalledWith('/api/collections/slug/summer-mood')
  })

  it('derives shell-ready content and seo fields from collection data', async () => {
    const data = ref({
      collection: {
        name: 'Свадебные букеты',
        slug: 'wedding',
        tag: 'Свадьба',
        description: 'Нежные композиции для важного дня',
        metaTitle: 'Свадебные букеты в Buton',
        metaDescription: 'Авторские свадебные букеты с доставкой',
        priceMax: 15000,
      },
      products: [
        {
          slug: 'white-cloud',
          name: 'White Cloud',
          price: 8900,
          inStock: true,
          images: ['/img/white-cloud.jpg'],
        },
        {
          slug: 'pearl-touch',
          name: 'Pearl Touch',
          price: 9900,
          inStock: false,
          images: ['/img/pearl-touch.jpg'],
        },
      ],
    })
    const pending = ref(false)

    vi.stubGlobal('useFetch', vi.fn(() => ({ data, pending })))

    const page = await useCatalogCollectionPage({
      collectionSlug: ref('wedding'),
      settings: ref({
        storeName: 'Buton',
        storeCity: 'Москве',
        usp1Title: 'Фото до отправки',
        usp1Sub: 'Согласуем букет в чате.',
      }),
      siteUrl: ref('https://buton.test'),
      setCanonical: vi.fn(),
      jsonLd: vi.fn(),
    })

    expect(page.state.value).toBe('ready')
    expect(page.pageTitle.value).toBe('Свадебные букеты в Buton')
    expect(page.pageDesc.value).toBe('Авторские свадебные букеты с доставкой')
    expect(page.heroImage.value).toBe('/img/white-cloud.jpg')
    expect(page.heroThumbs.value).toEqual([
      {
        slug: 'white-cloud',
        name: 'White Cloud',
        src: '/img/white-cloud.jpg',
      },
      {
        slug: 'pearl-touch',
        name: 'Pearl Touch',
        src: '/img/pearl-touch.jpg',
      },
    ])
    expect(page.giftNowLink.value).toBe('/catalog?cat=wedding')
    expect(page.bouquetWord.value).toBe('букета')
    expect(page.collectionTrust.value[0]).toEqual({
      title: 'Фото до отправки',
      text: 'Согласуем букет в чате.',
    })
  })

  it('wires canonical and jsonLd updates from the collection slug and loaded data', async () => {
    const setCanonical = vi.fn()
    const jsonLd = vi.fn()
    const data = ref({
      collection: {
        name: 'Мини-букеты',
        slug: 'mini',
        description: 'Компактные букеты на каждый день',
      },
      products: [
        {
          slug: 'mini-rose',
          name: 'Mini Rose',
          price: 3900,
          inStock: true,
          images: ['/img/mini-rose.jpg'],
        },
      ],
    })
    const pending = ref(false)

    vi.stubGlobal('useFetch', vi.fn(() => ({ data, pending })))

    const scope = effectScope()
    let page: Awaited<ReturnType<typeof useCatalogCollectionPage>> | undefined

    await scope.run(async () => {
      page = await useCatalogCollectionPage({
        collectionSlug: ref('mini'),
        settings: ref({
          storeName: 'Buton',
          storeCity: 'Санкт-Петербургу',
        }),
        siteUrl: ref('https://buton.test'),
        setCanonical,
        jsonLd,
      })
    })

    await nextTick()

    expect(setCanonical).toHaveBeenCalledWith('/catalog/mini')
    expect(jsonLd).toHaveBeenCalledTimes(1)
    expect(jsonLd).toHaveBeenLastCalledWith([
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://buton.test/' },
          { '@type': 'ListItem', position: 2, name: 'Каталог', item: 'https://buton.test/catalog' },
          { '@type': 'ListItem', position: 3, name: 'Мини-букеты', item: 'https://buton.test/catalog/mini' },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Мини-букеты',
        description: 'Компактные букеты на каждый день',
        url: 'https://buton.test/catalog/mini',
        mainEntity: {
          '@type': 'ItemList',
          name: 'Мини-букеты',
          numberOfItems: 1,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              item: {
                '@type': 'Product',
                name: 'Mini Rose',
                image: 'https://buton.test/img/mini-rose.jpg',
                offers: {
                  '@type': 'Offer',
                  priceCurrency: 'RUB',
                  price: 3900,
                  availability: 'https://schema.org/InStock',
                  url: 'https://buton.test/product/mini-rose',
                },
              },
            },
          ],
        },
      },
    ])

    expect(page?.collectionPageSchema.value).toBeTruthy()
    scope.stop()
  })

  it('uses fallback content safely when collection trust fields are missing', async () => {
    const data = ref({
      collection: {
        name: 'Праздничные',
        slug: 'holiday',
      },
      products: [
        {
          slug: 'rose-charlie',
          name: 'Rose Charlie',
          price: 7900,
          inStock: true,
        },
      ],
    })
    const pending = ref(false)

    vi.stubGlobal('useFetch', vi.fn(() => ({ data, pending })))

    const page = await useCatalogCollectionPage({
      collectionSlug: ref('holiday'),
      settings: ref({
        storeName: 'Buton',
      }),
      siteUrl: ref('https://buton.test'),
      setCanonical: vi.fn(),
      jsonLd: vi.fn(),
    })

    expect(page.state.value).toBe('ready')
    expect(page.pageTitle.value).toBe('Праздничные — Buton')
    expect(page.pageDesc.value).toBe('Праздничные — авторские букеты с доставкой по Санкт-Петербургу за 2 часа')
    expect(page.collectionTrust.value).toEqual([
      {
        title: 'Фото букета перед отправкой',
        text: 'Согласуем фото в мессенджере до отправки.',
      },
      {
        title: 'Гарантия свежести 7 дней',
        text: 'При нарушении срока меняем композицию.',
      },
      {
        title: 'Доставка в день заказа',
        text: 'Точный интервал и координация с курьером.',
      },
      {
        title: 'Реальные отзывы',
        text: 'Подтвержденные заказы и фото с доставки.',
      },
    ])
  })

  it('exposes missing state when loading is finished without collection data', async () => {
    const data = ref(null)
    const pending = ref(false)

    vi.stubGlobal('useFetch', vi.fn(() => ({ data, pending })))

    const page = await useCatalogCollectionPage({
      collectionSlug: ref('missing-collection'),
      settings: ref({}),
      siteUrl: ref('https://buton.test'),
      setCanonical: vi.fn(),
      jsonLd: vi.fn(),
    })

    expect(page.state.value).toBe('missing')
    expect(page.pending.value).toBe(false)
    expect(page.data.value).toBeNull()
  })
})
