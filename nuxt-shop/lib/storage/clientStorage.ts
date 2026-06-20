export interface ClientStorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface ClientStorage {
  readJson<T>(key: string, fallback: T): T
  writeJson<T>(key: string, value: T): void
  remove(key: string): void
}

export function getClientStorage(): ClientStorageLike | null {
  if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) {
    return null
  }

  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')

  if (descriptor?.get && typeof window === 'undefined') {
    return null
  }

  try {
    return globalThis.localStorage
  } catch {
    return null
  }
}

export function createClientStorage(storage: ClientStorageLike | null): ClientStorage {
  return {
    readJson<T>(key: string, fallback: T): T {
      if (!storage) {
        return fallback
      }

      try {
        const value = storage.getItem(key)
        return value ? JSON.parse(value) as T : fallback
      } catch {
        return fallback
      }
    },

    writeJson<T>(key: string, value: T) {
      if (!storage) {
        return
      }

      try {
        storage.setItem(key, JSON.stringify(value))
      } catch {
      }
    },

    remove(key: string) {
      if (!storage) {
        return
      }

      try {
        storage.removeItem(key)
      } catch {
      }
    },
  }
}
