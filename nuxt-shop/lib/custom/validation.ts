import type { CustomContactErrors, CustomContactInput } from './types'

export function normalizePhone(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

export function validateCustomContact(input: CustomContactInput): CustomContactErrors {
  return {
    name: input.name.trim().length === 0,
    phone: normalizePhone(input.phone).length === 0,
  }
}
