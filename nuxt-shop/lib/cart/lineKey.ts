import type { CartLineIdentityInput } from './types'

export function normalizeCartLineAddons(addons: string[] | undefined): string[] {
  return Array.from(new Set(addons ?? [])).sort()
}

export function buildCartLineKey(input: CartLineIdentityInput): string {
  const normalizedAddons = normalizeCartLineAddons(input.addons)

  return [
    input.slug,
    input.sizeLabel,
    normalizedAddons.join('|'),
    input.mode ?? 'default',
  ].join('::')
}
