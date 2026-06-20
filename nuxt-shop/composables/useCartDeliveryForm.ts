import {
  computed,
  getCurrentInstance,
  onBeforeUnmount as vueOnBeforeUnmount,
  onMounted as vueOnMounted,
  onScopeDispose,
  reactive,
  ref,
  toValue,
  watch,
  watchEffect,
  type MaybeRefOrGetter,
} from 'vue'

import type { ShopUser } from '~/composables/useShopUser'

interface DeliveryZone {
  _id: string
  name: string
  keywords: string[]
  cost: number
}

interface CartDeliverySettings {
  storeCity?: string
  contactAddress?: string
  deliveryCost?: string | number
  deliveryCourierDesc?: string
  deliveryScheduledDesc?: string
  deliveryTimeSlots?: string
}

type ClickEventTarget = EventTarget | null
type DeliveryDocument = Pick<Document, 'addEventListener' | 'removeEventListener'>

export interface UseCartDeliveryFormOptions {
  deliveryZones: MaybeRefOrGetter<DeliveryZone[] | null | undefined>
  settings?: MaybeRefOrGetter<CartDeliverySettings | null | undefined>
  shopUser?: MaybeRefOrGetter<ShopUser | null | undefined>
  debounceMs?: number
  document?: DeliveryDocument | undefined
  setTimeout?: typeof globalThis.setTimeout
  clearTimeout?: typeof globalThis.clearTimeout
  onMounted?: (callback: () => void) => void
  onBeforeUnmount?: (callback: () => void) => void
}

const MONTHS_RU = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

function resolveDocument() {
  if (typeof document === 'undefined') return undefined
  return document as DeliveryDocument
}

function containsEventTarget(container: HTMLElement, target: EventTarget | null) {
  if (!target) return false

  try {
    return container.contains(target as Node)
  } catch {
    return false
  }
}

export function useCartDeliveryForm(options: UseCartDeliveryFormOptions) {
  const settingsSource = options.settings ?? useSettings()
  const shopUserSource = options.shopUser ?? useShopUser().user
  const settings = computed(() => toValue(settingsSource) ?? {})
  const shopUser = computed(() => toValue(shopUserSource) ?? null)
  const setTimer = options.setTimeout ?? globalThis.setTimeout.bind(globalThis)
  const clearTimer = options.clearTimeout ?? globalThis.clearTimeout.bind(globalThis)
  const documentTarget = options.document ?? resolveDocument()
  const debounceMs = options.debounceMs ?? 350
  const hasComponentInstance = !!getCurrentInstance()

  const form = reactive({
    name: '',
    phone: '',
    email: '',
    address: '',
    date: '',
    time: '',
    card: '',
    isAnonymous: false,
  })

  const formErrors = reactive({
    name: '',
    phone: '',
    address: '',
    date: '',
  })

  const todayStr = computed(() => new Date().toISOString().slice(0, 10))
  const dpOpen = ref(false)
  const dpFieldRef = ref<HTMLElement | null>(null)
  const dpYear = ref(new Date().getFullYear())
  const dpMonth = ref(new Date().getMonth())

  const dpMonthLabel = computed(() => `${MONTHS_RU[dpMonth.value]} ${dpYear.value}`)
  const dpCells = computed(() => {
    const first = new Date(dpYear.value, dpMonth.value, 1)
    const last = new Date(dpYear.value, dpMonth.value + 1, 0)
    const offset = (first.getDay() + 6) % 7
    const cells: { key: string; date: string | null; label: string }[] = []

    for (let index = 0; index < offset; index++) {
      cells.push({ key: `e${index}`, date: null, label: '' })
    }

    for (let day = 1; day <= last.getDate(); day++) {
      const month = String(dpMonth.value + 1).padStart(2, '0')
      const date = String(day).padStart(2, '0')
      cells.push({
        key: `d${day}`,
        date: `${dpYear.value}-${month}-${date}`,
        label: String(day),
      })
    }

    return cells
  })

  function dpPrevMonth() {
    if (dpMonth.value === 0) {
      dpMonth.value = 11
      dpYear.value -= 1
      return
    }

    dpMonth.value -= 1
  }

  function dpNextMonth() {
    if (dpMonth.value === 11) {
      dpMonth.value = 0
      dpYear.value += 1
      return
    }

    dpMonth.value += 1
  }

  function selectDate(dateStr: string) {
    form.date = dateStr
    dpOpen.value = false
  }

  function fmtDateRu(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const timeSlots = computed(() =>
    String(settings.value.deliveryTimeSlots || '')
      .split('\n')
      .map(slot => slot.trim())
      .filter(Boolean),
  )

  watchEffect(() => {
    const user = shopUser.value
    if (!user) return

    if (!form.name) {
      form.name = [user.firstName, user.lastName].filter(Boolean).join(' ')
    }

    if (!form.email) {
      form.email = user.email
    }

    if (!form.phone && user.phone) {
      form.phone = user.phone
    }

    if (!form.address) {
      const defaultAddress = user.addresses?.find(address => address.isDefault) ?? user.addresses?.[0]
      if (defaultAddress) {
        form.address = defaultAddress.address
      }
    }
  })

  const hasProfileAddress = computed(() => {
    const user = shopUser.value
    if (!user?.addresses?.length) return false
    const defaultAddress = user.addresses.find(address => address.isDefault) ?? user.addresses[0]
    return !!defaultAddress && form.address === defaultAddress.address
  })

  const DEFAULT_DELIVERY_COST = computed(() => Number(settings.value.deliveryCost) || 390)
  const deliveries = computed(() => [
    {
      label: 'Курьером',
      desc: settings.value.deliveryCourierDesc || 'за 2 часа',
      type: 'courier' as const,
    },
    {
      label: 'Ко времени',
      desc: settings.value.deliveryScheduledDesc || 'в удобный интервал',
      type: 'scheduled' as const,
    },
    {
      label: 'Самовывоз',
      desc: `${settings.value.contactAddress || ''} · бесплатно`,
      type: 'pickup' as const,
    },
  ])
  const activeDelivery = ref(0)
  const activeDeliveryType = computed(() => deliveries.value[activeDelivery.value]?.type ?? 'courier')

  const detectedZone = ref<DeliveryZone | null>(null)
  let zoneDetectTimer: ReturnType<typeof setTimeout> | null = null

  watch(() => form.address, (address) => {
    if (zoneDetectTimer) {
      clearTimer(zoneDetectTimer)
    }

    zoneDetectTimer = setTimer(() => {
      const zones = toValue(options.deliveryZones) ?? []
      if (!address?.trim() || !zones.length) {
        detectedZone.value = null
        return
      }

      const normalizedAddress = address.toLowerCase()
      detectedZone.value = zones.find(zone =>
        zone.keywords.some(keyword => normalizedAddress.includes(keyword.toLowerCase())),
      ) ?? null
    }, debounceMs)
  })

  function validateForm() {
    formErrors.name = form.name.trim() ? '' : 'Укажите имя получателя'
    formErrors.phone = form.phone.trim() ? '' : 'Укажите телефон'
    formErrors.address = (activeDeliveryType.value === 'pickup' || form.address.trim()) ? '' : 'Укажите адрес доставки'
    formErrors.date = form.date ? '' : 'Выберите дату доставки'
    return !Object.values(formErrors).some(Boolean)
  }

  function handleDocumentClick(event: Event) {
    const target = event.target as ClickEventTarget
    if (!dpOpen.value || !dpFieldRef.value) return
    if (containsEventTarget(dpFieldRef.value, target)) return
    dpOpen.value = false
  }

  if (options.onMounted) {
    options.onMounted(() => {
      documentTarget?.addEventListener('click', handleDocumentClick)
    })
  } else if (hasComponentInstance) {
    vueOnMounted(() => {
      documentTarget?.addEventListener('click', handleDocumentClick)
    })
  }

  if (options.onBeforeUnmount) {
    options.onBeforeUnmount(() => {
      documentTarget?.removeEventListener('click', handleDocumentClick)
    })
  } else if (hasComponentInstance) {
    vueOnBeforeUnmount(() => {
      documentTarget?.removeEventListener('click', handleDocumentClick)
    })
  }

  onScopeDispose(() => {
    if (zoneDetectTimer) {
      clearTimer(zoneDetectTimer)
    }

    documentTarget?.removeEventListener('click', handleDocumentClick)
  })

  return {
    DEFAULT_DELIVERY_COST,
    form,
    formErrors,
    hasProfileAddress,
    timeSlots,
    deliveries,
    activeDelivery,
    activeDeliveryType,
    detectedZone,
    validateForm,
    todayStr,
    dpOpen,
    dpFieldRef,
    dpYear,
    dpMonth,
    dpMonthLabel,
    dpCells,
    dpPrevMonth,
    dpNextMonth,
    selectDate,
    fmtDateRu,
  }
}
