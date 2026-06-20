import { normalizeCabinetApiError } from '@/api/errors'

function hasKnownErrorShape(error: unknown): boolean {
  if (error instanceof Error) return true
  if (typeof error !== 'object' || error === null) return false
  if ('message' in error) return typeof error.message === 'string'
  return 'response' in error || 'data' in error || 'status' in error || 'statusCode' in error
}

export function getErrorMessage(error: unknown, fallback = '') {
  if (!fallback && !hasKnownErrorShape(error)) return ''
  return normalizeCabinetApiError(error, fallback)
}
