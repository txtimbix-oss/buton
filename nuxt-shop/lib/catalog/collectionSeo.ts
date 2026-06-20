import type { Product } from '~/composables/useShop'
import type { CatalogCollectionPageCollection } from '~/lib/catalog/types'

export function buildCollectionPageTitle(collection: Pick<CatalogCollectionPageCollection, 'name' | 'metaTitle'>, storeName: string) {
  return collection.metaTitle || `${collection.name} — ${storeName}`
}

export function buildCollectionPageDescription(
  collection: Pick<CatalogCollectionPageCollection, 'name' | 'description' | 'metaDescription'>,
  defaultDescriptionCity: string
) {
  return collection.metaDescription
    || collection.description
    || `${collection.name} — авторские букеты с доставкой по ${defaultDescriptionCity} за 2 часа`
}

export function buildCollectionSeoMeta(input: {
  collection: Pick<CatalogCollectionPageCollection, 'name' | 'description' | 'metaTitle' | 'metaDescription'>
  storeName: string
  defaultDescriptionCity: string
}) {
  const title = buildCollectionPageTitle(input.collection, input.storeName)
  const description = buildCollectionPageDescription(input.collection, input.defaultDescriptionCity)

  return {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
  }
}

export function buildCollectionBreadcrumbSchema(input: {
  siteUrl: string
  collectionName: string
  collectionSlug: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: `${input.siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${input.siteUrl}/catalog` },
      { '@type': 'ListItem', position: 3, name: input.collectionName, item: `${input.siteUrl}/catalog/${input.collectionSlug}` },
    ],
  }
}

export function buildCollectionPageSchema(input: {
  siteUrl: string
  collection: Pick<CatalogCollectionPageCollection, 'name' | 'slug'>
  pageDescription: string
  products: Product[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.collection.name,
    description: input.pageDescription,
    url: `${input.siteUrl}/catalog/${input.collection.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      name: input.collection.name,
      numberOfItems: input.products.length,
      itemListElement: input.products.slice(0, 24).map((product, index) => {
        const url = `${input.siteUrl}/product/${product.slug}`

        return {
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: product.name,
            image: product.images?.[0] ? `${input.siteUrl}${product.images[0]}` : undefined,
            offers: {
              '@type': 'Offer',
              priceCurrency: 'RUB',
              price: product.price,
              availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              url,
            },
          },
        }
      }),
    },
  }
}
