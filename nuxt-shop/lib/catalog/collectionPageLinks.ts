export function buildCollectionGiftNowLink(collectionSlug: string) {
  return `/catalog?cat=${encodeURIComponent(collectionSlug)}`
}

export function buildCollectionCanonicalPath(collectionSlug: string) {
  return `/catalog/${collectionSlug}`
}
