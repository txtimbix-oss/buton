import { nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { usePersistedResource } from '@/composables/usePersistedResource'

type NotificationPrefs = {
  email: boolean
}

function clonePrefs(value: NotificationPrefs): NotificationPrefs {
  return { ...value }
}

function samePrefs(a: NotificationPrefs, b: NotificationPrefs) {
  return a.email === b.email
}

function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

describe('usePersistedResource', () => {
  it('синхронизирует ресурс из source и не затирает локально грязное состояние', async () => {
    const source = ref<NotificationPrefs | null>({ email: false })
    const persist = vi.fn()
    const { resource, updateResource } = usePersistedResource({
      initial: { email: false },
      source,
      persist,
      clone: clonePrefs,
      equals: samePrefs,
    })

    expect(resource.value).toEqual({ email: false })

    source.value = { email: true }
    await nextTick()
    expect(resource.value).toEqual({ email: true })

    updateResource(() => ({ email: false }))
    await nextTick()

    source.value = { email: true }
    await nextTick()
    expect(resource.value).toEqual({ email: false })
  })

  it('сериализует повторные сохранения и применяет последний pending state', async () => {
    const source = ref<NotificationPrefs | null>({ email: false })
    const firstPersist = createDeferred<NotificationPrefs>()
    const secondPersist = createDeferred<NotificationPrefs>()
    const persist = vi.fn()
      .mockReturnValueOnce(firstPersist.promise)
      .mockReturnValueOnce(secondPersist.promise)

    const { resource, saveResource, updateResource } = usePersistedResource({
      initial: { email: false },
      source,
      persist,
      clone: clonePrefs,
      equals: samePrefs,
    })

    updateResource(() => ({ email: true }))
    await nextTick()
    const savePromise = saveResource()

    updateResource(() => ({ email: false }))
    await nextTick()
    await saveResource()

    firstPersist.resolve({ email: true })
    await Promise.resolve()
    expect(persist).toHaveBeenCalledTimes(2)

    secondPersist.resolve({ email: false })
    await savePromise
    await nextTick()

    expect(resource.value).toEqual({ email: false })
    expect(persist.mock.calls).toEqual([
      [{ email: true }],
      [{ email: false }],
    ])
  })

  it('откатывает ресурс к последнему synced state при неуспешном сохранении без новых изменений', async () => {
    const source = ref<NotificationPrefs | null>({ email: false })
    const persist = vi.fn().mockRejectedValueOnce(new Error('save failed'))
    const { resource, saveResource, updateResource } = usePersistedResource({
      initial: { email: false },
      source,
      persist,
      clone: clonePrefs,
      equals: samePrefs,
    })

    updateResource(() => ({ email: true }))
    await nextTick()
    await saveResource()
    await nextTick()

    expect(resource.value).toEqual({ email: false })
  })
})
