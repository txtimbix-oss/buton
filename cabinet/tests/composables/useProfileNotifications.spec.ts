import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'
import { nextTick, ref, type Ref } from 'vue'
import { useProfileNotifications } from '@/composables/useProfileNotifications'
import type { ProfileNotifications } from '@/components/profile/types'

function makeSource(initial: ProfileNotifications | null): Ref<ProfileNotifications | null> {
  return ref(initial)
}

describe('useProfileNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('инициализирует дефолтный профиль уведомлений при null source', async () => {
    const source = makeSource(null)
    const persist = vi.fn().mockResolvedValue({ orderStatus: true, news: false })
    const { notif, toggleNotification } = useProfileNotifications(source, persist)

    expect(notif.value).toEqual({ orderStatus: true, news: false })

    toggleNotification('orderStatus')
    expect(notif.value.orderStatus).toBe(false)
    await nextTick()

    expect(persist).toHaveBeenCalledWith({ orderStatus: false, news: false })
  })

  it('обновляет локальное состояние из source и сохраняет новый профиль после тогла', async () => {
    const source = makeSource({ orderStatus: false, news: true })
    const persist = vi.fn().mockResolvedValue({ orderStatus: false, news: false })
    const { notif, toggleNotification } = useProfileNotifications(source, persist)

    expect(notif.value).toEqual({ orderStatus: false, news: true })

    source.value = { orderStatus: true, news: false }
    await nextTick()
    expect(notif.value).toEqual({ orderStatus: true, news: false })

    toggleNotification('news')
    expect(notif.value).toEqual({ orderStatus: true, news: true })
    await nextTick()
    expect(persist).toHaveBeenCalledWith({ orderStatus: true, news: true })
  })

  it('не ломается при неудачном сохранении и оставляет локальный флаг изменённым', async () => {
    const source = makeSource({ orderStatus: true, news: true })
    const persist = vi.fn().mockRejectedValue(new Error('network is down'))
    const { notif, toggleNotification } = useProfileNotifications(source, persist)

    toggleNotification('news')
    expect(notif.value.news).toBe(false)
    await Promise.resolve()

    expect(persist).toHaveBeenCalledWith({ orderStatus: true, news: false })
    expect(notif.value.news).toBe(true)
  })
})
