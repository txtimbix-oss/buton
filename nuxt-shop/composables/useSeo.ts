// Хелпер для SEO: canonical URL, JSON-LD инъекция
export function useSeo() {
  const settings = useSettings()
  const route    = useRoute()

  const siteUrl = computed(() =>
    ((settings.value.seo?.siteUrl ?? settings.value.siteUrl) || '').replace(/\/$/, '')
  )

  // canonical всегда без query-параметров
  function setCanonical(path?: string) {
    const p = (path ?? route.path).split('?')[0]
    useHead({ link: [{ rel: 'canonical', href: siteUrl.value + p }] })
  }

  function jsonLd(schema: object | object[]) {
    const list = Array.isArray(schema) ? schema : [schema]
    useHead({
      script: list.map(s => ({
        type:      'application/ld+json',
        innerHTML: JSON.stringify(s),
      })),
    })
  }

  // Organization + LocalBusiness (используется на главной и странице «О нас»)
  function orgSchema() {
    const s = settings.value
    return {
      '@context': 'https://schema.org',
      '@type':    ['LocalBusiness', 'Florist'],
      name:       s.storeName,
      url:        siteUrl.value || undefined,
      telephone:  s.contactPhone,
      email:      s.contactEmail,
      address: {
        '@type':         'PostalAddress',
        streetAddress:   s.contactAddress,
        addressLocality: s.storeCity || 'Санкт-Петербург',
        addressRegion:   'Санкт-Петербург',
        postalCode:      '190000',
        addressCountry:  'RU',
      },
      geo: s.orgLat ? {
        '@type':    'GeoCoordinates',
        latitude:   s.orgLat,
        longitude:  s.orgLng,
      } : undefined,
      openingHoursSpecification: s.contactHours ? {
        '@type':     'OpeningHoursSpecification',
        description: s.contactHours,
      } : undefined,
      sameAs: [s.socialVk, s.socialTg, s.socialInst].filter(Boolean),
      priceRange: '₽₽',
    }
  }

  return { siteUrl, setCanonical, jsonLd, orgSchema }
}
