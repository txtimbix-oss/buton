import type { Product } from '~/composables/useShop'

export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    _id: overrides._id ?? `${overrides.slug ?? 'product'}-id`,
    name: overrides.name ?? 'Test Product',
    slug: overrides.slug ?? 'test-product',
    meta: overrides.meta ?? 'Розы, эвкалипт',
    description: overrides.description ?? 'Test description',
    price: overrides.price ?? 5000,
    bloom: overrides.bloom ?? 'rose',
    tag: overrides.tag,
    oldPrice: overrides.oldPrice,
    images: overrides.images ?? [],
    sizes: overrides.sizes ?? [
      { label: 'S', desc: 'Small', price: overrides.price ?? 5000 },
      { label: 'M', desc: 'Medium', price: (overrides.price ?? 5000) + 1000 },
    ],
    composition: overrides.composition ?? [],
    careInstructions: overrides.careInstructions ?? 'Change water daily',
    addons: overrides.addons ?? [],
    catalogAddonIds: overrides.catalogAddonIds,
    rating: overrides.rating ?? 4.9,
    reviewCount: overrides.reviewCount ?? 10,
    inStock: overrides.inStock ?? true,
    featured: overrides.featured ?? false,
  }
}
