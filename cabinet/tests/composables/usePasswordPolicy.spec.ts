import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_HINT,
  PASSWORD_MIN_LENGTH_PLACEHOLDER,
  getPasswordMismatch,
  getPasswordStrength,
  usePasswordPolicy,
} from '@/composables/usePasswordPolicy'

describe('usePasswordPolicy', () => {
  it('возвращает слабую силу для короткого пароля', () => {
    expect(PASSWORD_MIN_LENGTH).toBe(8)
    expect(PASSWORD_MIN_LENGTH_HINT).toContain('8')
    expect(PASSWORD_MIN_LENGTH_PLACEHOLDER).toContain('8')

    expect(getPasswordStrength('short')).toEqual({
      score: 0,
      pct: 20,
      state: 'weak',
      label: 'Слабый',
      hasValue: true,
      meetsMinLength: false,
    })
  })

  it('различает средний и надёжный пароль', () => {
    expect(getPasswordStrength('Password')).toMatchObject({
      score: 2,
      pct: 66,
      state: 'mid',
      label: 'Средний',
      meetsMinLength: true,
    })

    expect(getPasswordStrength('Password1!')).toMatchObject({
      score: 4,
      pct: 100,
      state: 'good',
      label: 'Надёжный',
      meetsMinLength: true,
    })
  })

  it('реактивно отслеживает минимальную длину и mismatch', () => {
    const password = ref('Password1!')
    const confirm = ref('Password1')
    const policy = usePasswordPolicy(() => password.value, () => confirm.value)

    expect(policy.minLength).toBe(8)
    expect(policy.meetsMinLength.value).toBe(true)
    expect(policy.strength.value.state).toBe('good')
    expect(policy.hasMismatch.value).toBe(true)
    expect(getPasswordMismatch(password.value, confirm.value)).toBe(true)

    confirm.value = 'Password1!'
    expect(policy.hasMismatch.value).toBe(false)

    password.value = 'short'
    expect(policy.meetsMinLength.value).toBe(false)
    expect(policy.strength.value.state).toBe('weak')
  })
})
