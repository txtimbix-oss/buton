import { getCurrentInstance, onMounted, watch } from 'vue'

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

// storageKey, уже гидрированные из localStorage на клиенте (по разу за загрузку)
const hydratedKeys = new Set<string>()

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

  // SSR: useState-инициализатор отработал на сервере без localStorage → пустой дефолт,
  // а клиент берёт SSR-значение и НЕ перечитывает localStorage. Поэтому один раз после
  // mount перечитываем сохранённое (иначе избранное/черновики теряются при полной загрузке).
  if (import.meta.client && getCurrentInstance() && !hydratedKeys.has(storageKey)) {
    hydratedKeys.add(storageKey)
    onMounted(() => {
      state.value = storage.readJson(storageKey, resolveInitialValue(initialValue))
    })
  }

  watch(state, (value) => {
    storage.writeJson(storageKey, value)
  }, { deep: options.deep ?? true })

  return state
}
