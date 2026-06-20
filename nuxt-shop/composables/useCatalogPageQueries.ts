import type { Ref } from 'vue'

import type { Category, Product } from '~/composables/useShop'
import { useStorefrontProductsQuery } from '~/composables/useStorefrontProductsQuery'
import type { CatalogCollectionSummary } from '~/constants/catalogCollections'

export interface UseCatalogPageQueriesResult {
  allProducts: Ref<Product[] | null>
  pending: Ref<boolean>
  categoriesData: Ref<Category[] | null>
  collectionsData: Ref<CatalogCollectionSummary[] | null>
}

export function useCatalogPageQueries(): UseCatalogPageQueriesResult {
  const { products: allProducts, pending } = useStorefrontProductsQuery()
  const { data: categoriesData } = useFetch<Category[]>('/api/categories')
  const { data: collectionsData } = useFetch<CatalogCollectionSummary[]>('/api/collections')

  return {
    allProducts,
    pending,
    categoriesData: categoriesData as Ref<Category[] | null>,
    collectionsData: collectionsData as Ref<CatalogCollectionSummary[] | null>,
  }
}
