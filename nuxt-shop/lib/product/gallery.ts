export function buildProductGalleryThumbKinds(activeBloom?: string | null): string[] {
  const bloom = activeBloom ?? 'cream'
  const fallbackKinds = ['rose', 'peach', 'cream', 'green']
  const others = fallbackKinds.filter(kind => kind !== bloom).slice(0, 3)
  return [bloom, ...others]
}

export function stepProductGalleryIndex(currentIndex: number, direction: 1 | -1, total: number): number {
  const safeTotal = Math.max(1, total)
  return (currentIndex + direction + safeTotal) % safeTotal
}
