import { describe, expect, it } from 'vitest'
import { getErrorMessage } from '@/composables/getErrorMessage'
import { getQueryString } from '@/composables/getQueryString'

describe('getQueryString', () => {
  it('returns unchanged string input', () => {
    expect(getQueryString('hello')).toBe('hello')
  })

  it('returns first item from string array', () => {
    expect(getQueryString(['a', 'b'])).toBe('a')
  })

  it('returns empty string for unsupported values', () => {
    expect(getQueryString(undefined)).toBe('')
    expect(getQueryString(null)).toBe('')
    expect(getQueryString(123)).toBe('')
    expect(getQueryString([2, 'a'])).toBe('')
    expect(getQueryString([])).toBe('')
  })
})

describe('getErrorMessage', () => {
  it('reads Error.message', () => {
    const error = new Error('boom')
    expect(getErrorMessage(error)).toBe('boom')
  })

  it('reads message property from plain object', () => {
    expect(
      getErrorMessage({
        message: 'plain-object-error',
      })
    ).toBe('plain-object-error')
  })

  it('returns empty string for unknown error shapes', () => {
    expect(getErrorMessage('boom')).toBe('')
    expect(getErrorMessage(0)).toBe('')
    expect(
      getErrorMessage({
        message: 42,
      } as { message: number })
    ).toBe('')
    expect(getErrorMessage(null)).toBe('')
  })
})
