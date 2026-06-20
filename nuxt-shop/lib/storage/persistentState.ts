import { watch } from 'vue'

import { createClientStorage, getClientStorage } from '~/lib/storage/clientStorage'
import type { ClientStorage } from '~/lib/storage/clientStorage'

type PersistentStateInit<T> = T | (() => T)

interface PersistentStateOptions {
  deep?: boolean
  storage?: ClientStorage
}

function resolveInitialValue<T>(value: PersistentStateInit<T>): T {
  return typeof value === 'function'
    ? (value as () => T)()
    : value
}

export function usePersistentState<T>(
  stateKey: string,
  storageKey: string,
  initialValue: PersistentStateInit<T>,
  options: PersistentStateOptions = {},
) {
  const storage = options.storage ?? createClientStorage(getClientStorage())
  const state = useState<T>(stateKey, () =>
    storage.readJson(storageKey, resolveInitialValue(initialValue)),
  )

  watch(state, (value) => {
    storage.writeJson(storageKey, value)
  }, { deep: options.deep ?? true })

  return state
}
