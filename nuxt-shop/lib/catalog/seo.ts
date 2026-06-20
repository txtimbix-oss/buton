import type { Product } from '~/composables/useShop'

export function buildCatalogBreadcrumbSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${siteUrl}/catalog` },
    ],
  }
}

export function buildCatalogItemListSchema(siteUrl: string, products: Product[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Каталог букетов',
    numberOfItems: products.length,
    itemListElement: products.slice(0, 24).map((product, index) => {
      const url = `${siteUrl}/product/${product.slug}`

      return {
        '@type': 'ListItem',
        position: index + 1,
        name: product.name,
        url,
        item: {
          '@type': 'Product',
          name: product.name,
          image: product.images?.[0] ? `${siteUrl}${product.images[0]}` : undefined,
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
  }
}
