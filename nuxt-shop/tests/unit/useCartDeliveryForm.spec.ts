import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'

import { useCartDeliveryForm } from '~/composables/useCartDeliveryForm'
import type { ShopUser } from '~/composables/useShopUser'

interface DeliveryZone {
  _id: string
  name: string
  keywords: string[]
  cost: number
}

interface ClickDocumentMock {
  addEventListener: ReturnType<typeof vi.fn>
  removeEventListener: ReturnType<typeof vi.fn>
}

function makeSettings(overrides: Record<string, string> = {}) {
  return {
    storeCity: 'Санкт-Петербург',
    contactAddress: 'Невский пр., 28',
    deliveryCost: '390',
    deliveryCourierDesc: 'за 2 часа',
    deliveryScheduledDesc: 'в удобный интервал',
    deliveryTimeSlots: '10:00 - 12:00\n 12:00 - 14:00 \n\n18:00 - 20:00',
    ...overrides,
  }
}

function makeUser(overrides: Partial<ShopUser> = {}): ShopUser {
  return {
    _id: 'user-1',
    firstName: 'Анна',
    lastName: 'Иванова',
    email: 'anna@example.com',
    phone: '+79990000000',
    bonusBalance: 0,
    addresses: [
      {
        _id: 'addr-1',
        label: 'Дом',
        address: 'Невский проспект, 10',
        isDefault: true,
      },
    ],
    ...overrides,
  }
}

function createLifecycleHooks() {
  let mounted: (() => void) | undefined
  let beforeUnmount: (() => void) | undefined

  return {
    onMounted(callback: () => void) {
      mounted = callback
    },
    onBeforeUnmount(callback: () => void) {
      beforeUnmount = callback
    },
    runMounted() {
      mounted?.()
    },
    runBeforeUnmount() {
      beforeUnmount?.()
    },
  }
}

function createDocumentMock(): ClickDocumentMock {
  return {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('useCartDeliveryForm', () => {
  it('prefills from user without overwriting already entered values', () => {
    const user = ref<ShopUser | null>(makeUser())
    const scope = effectScope()
    const formState = scope.run(() =>
      useCartDeliveryForm({
        deliveryZones: ref<DeliveryZone[]>([]),
        settings: ref(makeSettings()),
        shopUser: user,
      }),
    )

    expect(formState).toBeTruthy()
    expect(formState!.form.name).toBe('Анна Иванова')
    expect(formState!.form.email).toBe('anna@example.com')
    expect(formState!.form.phone).toBe('+79990000000')
    expect(formState!.form.address).toBe('Невский проспект, 10')

    formState!.form.name = 'Свое имя'
    formState!.form.email = 'custom@example.com'
    formState!.form.phone = '+78880000000'
    formState!.form.address = 'Своя улица, 15'

    user.value = makeUser({
      firstName: 'Мария',
      lastName: 'Петрова',
      email: 'maria@example.com',
      phone: '+77770000000',
      addresses: [
        {
          _id: 'addr-2',
          label: 'Офис',
          address: 'Лиговский проспект, 1',
          isDefault: true,
        },
      ],
    })

    expect(formState!.form.name).toBe('Свое имя')
    expect(formState!.form.email).toBe('custom@example.com')
    expect(formState!.form.phone).toBe('+78880000000')
    expect(formState!.form.address).toBe('Своя улица, 15')

    scope.stop()
  })

  it('parses delivery time slots from multiline settings', () => {
    const scope = effectScope()
    const formState = scope.run(() =>
      useCartDeliveryForm({
        deliveryZones: ref<DeliveryZone[]>([]),
        settings: ref(makeSettings()),
        shopUser: ref(null),
      }),
    )

    expect(formState!.timeSlots.value).toEqual([
      '10:00 - 12:00',
      '12:00 - 14:00',
      '18:00 - 20:00',
    ])

    scope.stop()
  })

  it('detects delivery zone by keyword and clears it when address becomes empty', async () => {
    vi.useFakeTimers()

    const scope = effectScope()
    const formState = scope.run(() =>
      useCartDeliveryForm({
        deliveryZones: ref<DeliveryZone[]>([
          { _id: 'zone-1', name: 'Центр', keywords: ['невский', 'литейный'], cost: 390 },
        ]),
        settings: ref(makeSettings()),
        shopUser: ref(null),
        debounceMs: 350,
        setTimeout,
        clearTimeout,
      }),
    )

    formState!.form.address = 'Санкт-Петербург, Невский проспект, 20'
    await nextTick()
    vi.advanceTimersByTime(349)
    expect(formState!.detectedZone.value).toBeNull()

    vi.advanceTimersByTime(1)
    expect(formState!.detectedZone.value?.name).toBe('Центр')

    formState!.form.address = '   '
    await nextTick()
    vi.advanceTimersByTime(350)
    expect(formState!.detectedZone.value).toBeNull()

    scope.stop()
  })

  it('validates address only for delivery methods that require it', () => {
    const scope = effectScope()
    const formState = scope.run(() =>
      useCartDeliveryForm({
        deliveryZones: ref<DeliveryZone[]>([]),
        settings: ref(makeSettings()),
        shopUser: ref(null),
      }),
    )

    formState!.form.name = 'Анна'
    formState!.form.phone = '+79990000000'
    formState!.form.date = '2026-06-10'
    formState!.form.address = ''
    formState!.activeDelivery.value = 0

    expect(formState!.validateForm()).toBe(false)
    expect(formState!.formErrors.address).toBe('Укажите адрес доставки')

    formState!.activeDelivery.value = 2
    expect(formState!.validateForm()).toBe(true)
    expect(formState!.formErrors.address).toBe('')

    scope.stop()
  })

  it('selects date, closes popup, and formats the chosen value', () => {
    const scope = effectScope()
    const formState = scope.run(() =>
      useCartDeliveryForm({
        deliveryZones: ref<DeliveryZone[]>([]),
        settings: ref(makeSettings()),
        shopUser: ref(null),
      }),
    )

    formState!.dpOpen.value = true
    formState!.selectDate('2026-06-15')

    expect(formState!.form.date).toBe('2026-06-15')
    expect(formState!.dpOpen.value).toBe(false)
    expect(formState!.fmtDateRu('2026-06-15')).toContain('2026')

    scope.stop()
  })

  it('closes the popup on outside click and removes the listener on cleanup', () => {
    const lifecycle = createLifecycleHooks()
    const documentMock = createDocumentMock()
    const scope = effectScope()
    const formState = scope.run(() =>
      useCartDeliveryForm({
        deliveryZones: ref<DeliveryZone[]>([]),
        settings: ref(makeSettings()),
        shopUser: ref(null),
        document: documentMock as unknown as Document,
        onMounted: lifecycle.onMounted,
        onBeforeUnmount: lifecycle.onBeforeUnmount,
      }),
    )

    lifecycle.runMounted()

    expect(documentMock.addEventListener).toHaveBeenCalledWith('click', expect.any(Function))

    const outsideClickHandler = documentMock.addEventListener.mock.calls[0]?.[1] as ((event: Event) => void)
    formState!.dpOpen.value = true
    formState!.dpFieldRef.value = {
      contains: vi.fn(() => false),
    } as unknown as HTMLElement

    outsideClickHandler({ target: {} } as Event)
    expect(formState!.dpOpen.value).toBe(false)

    lifecycle.runBeforeUnmount()

    expect(documentMock.removeEventListener).toHaveBeenCalledWith('click', outsideClickHandler)

    scope.stop()
  })
})
