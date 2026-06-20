import { computed } from 'vue'

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MIN_LENGTH_HINT = `(минимум ${PASSWORD_MIN_LENGTH} символов)`
export const PASSWORD_MIN_LENGTH_PLACEHOLDER = `Минимум ${PASSWORD_MIN_LENGTH} символов`

export type PasswordStrengthState = 'weak' | 'mid' | 'good'

export type PasswordStrength = {
  score: number
  pct: number
  state: PasswordStrengthState
  label: string
  hasValue: boolean
  meetsMinLength: boolean
}

type PasswordSource = () => string

function getPasswordScore(password: string) {
  if (password.length < PASSWORD_MIN_LENGTH) return 0

  let score = 1

  if (/[A-ZА-Я]/.test(password) && /[a-zа-я]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-zА-Яа-я0-9]/.test(password)) score++

  return score
}

export function getPasswordStrength(password: string): PasswordStrength {
  const normalizedPassword = password ?? ''
  const score = getPasswordScore(normalizedPassword)
  const meetsMinLength = normalizedPassword.length >= PASSWORD_MIN_LENGTH

  let pct = 20
  let state: PasswordStrengthState = 'weak'

  if (meetsMinLength) {
    if (score <= 1) {
      pct = 33
      state = 'weak'
    } else if (score <= 2) {
      pct = 66
      state = 'mid'
    } else {
      pct = 100
      state = 'good'
    }
  }

  const label = state === 'weak' ? 'Слабый' : state === 'mid' ? 'Средний' : 'Надёжный'

  return {
    score,
    pct,
    state,
    label,
    hasValue: normalizedPassword.length > 0,
    meetsMinLength,
  }
}

export function getPasswordMismatch(password: string, confirm: string) {
  return Boolean(confirm) && confirm !== password
}

export function usePasswordPolicy(password: PasswordSource, confirm?: PasswordSource) {
  const strength = computed(() => getPasswordStrength(password() ?? ''))
  const hasMismatch = computed(() => {
    if (!confirm) return false
    return getPasswordMismatch(password() ?? '', confirm() ?? '')
  })
  const meetsMinLength = computed(() => strength.value.meetsMinLength)

  return {
    minLength: PASSWORD_MIN_LENGTH,
    strength,
    hasMismatch,
    meetsMinLength,
  }
}
