import type { ProfileNotifications } from '@/components/profile/types'
import { usePersistedResource, type MaybeValue } from '@/composables/usePersistedResource'

const EMPTY_NOTIFICATIONS: ProfileNotifications = {
  orderStatus: true,
  news: false,
}

export function useProfileNotifications(
  source: MaybeValue<ProfileNotifications | null>,
  persist: (payload: ProfileNotifications) => Promise<ProfileNotifications>,
) {
  const {
    resource: notif,
    saveResource,
    updateResource,
  } = usePersistedResource({
    initial: EMPTY_NOTIFICATIONS,
    source,
    persist,
    clone: cloneNotifications,
    equals: sameNotifications,
  })

  function toggleNotification(key: keyof ProfileNotifications) {
    updateResource((current) => ({
      ...current,
      [key]: !current[key],
    }))

    void saveResource()
  }

  return {
    notif,
    toggleNotification,
  }
}

function cloneNotifications(value: ProfileNotifications): ProfileNotifications {
  return { ...value }
}

function sameNotifications(a: ProfileNotifications, b: ProfileNotifications): boolean {
  return a.orderStatus === b.orderStatus && a.news === b.news
}
