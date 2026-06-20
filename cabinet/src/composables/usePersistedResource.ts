import { ref, unref, watch, type ComputedRef, type Ref } from 'vue'

export type MaybeValue<T> = T | Ref<T> | ComputedRef<T>

type UsePersistedResourceOptions<T> = {
  initial: T
  source: MaybeValue<T | null>
  persist: (payload: T) => Promise<T>
  clone: (value: T) => T
  equals: (a: T, b: T) => boolean
}

export function usePersistedResource<T extends object>({
  initial,
  source,
  persist,
  clone,
  equals,
}: UsePersistedResourceOptions<T>) {
  const resource = ref<T>(clone(initial))
  const syncedResource = ref<T>(clone(initial))
  const resourceDirty = ref(false)
  const resourceSaving = ref(false)
  const pendingResource = ref<T | null>(null)

  watch(() => unref(source), (next) => {
    if (!next) return
    applySyncedResource(next)
  }, { immediate: true })

  watch(resource, (next) => {
    resourceDirty.value = !equals(next, syncedResource.value)
  }, { deep: true })

  function applySyncedResource(next: T, force = false) {
    syncedResource.value = clone(next)

    if (force || !resourceDirty.value) {
      resource.value = clone(next)
      resourceDirty.value = false
    }
  }

  async function saveResource() {
    pendingResource.value = clone(resource.value)
    if (resourceSaving.value) return

    resourceSaving.value = true
    try {
      while (pendingResource.value) {
        const payload = clone(pendingResource.value)
        pendingResource.value = null

        try {
          const next = await persist(payload)
          applySyncedResource(next, pendingResource.value === null)
        } catch {
          if (pendingResource.value || !equals(resource.value, payload)) {
            continue
          }

          resource.value = clone(syncedResource.value)
          resourceDirty.value = false
        }
      }
    } finally {
      resourceSaving.value = false
    }
  }

  function updateResource(update: (current: T) => T) {
    resource.value = update(clone(resource.value))
  }

  return {
    resource,
    saveResource,
    updateResource,
  }
}
