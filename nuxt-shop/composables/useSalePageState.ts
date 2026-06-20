import {
  computed,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  ref,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'

import type { Product } from '~/composables/useShop'
import {
  defaultSaleFilterChip,
  filterSaleProducts,
  saleFilterChips,
  type SaleFilterChip,
} from '~/lib/sale/filtering'
import {
  getSaleCountdownSegments,
  initialSaleTimerSegments,
} from '~/lib/sale/timer'

export interface UseSalePageStateOptions {
  allProducts: MaybeRefOrGetter<Product[] | null | undefined>
}

export interface UseSalePageStateDeps {
  now?: () => Date
  setInterval?: typeof globalThis.setInterval
  clearInterval?: typeof globalThis.clearInterval
}

const SALE_TIMER_TICK_MS = 1000

export function useSalePageState(
  options: UseSalePageStateOptions,
  deps: UseSalePageStateDeps = {},
) {
  const allProducts = computed(() => toValue(options.allProducts) ?? [])
  const activeChip = ref<SaleFilterChip>(defaultSaleFilterChip)
  const timer = ref(initialSaleTimerSegments)
  const resolveNow = deps.now ?? (() => new Date())
  const setIntervalFn = deps.setInterval ?? globalThis.setInterval?.bind(globalThis)
  const clearIntervalFn = deps.clearInterval ?? globalThis.clearInterval?.bind(globalThis)
  let timerInterval: ReturnType<typeof globalThis.setInterval> | null = null

  const saleProducts = computed(() => filterSaleProducts(allProducts.value, activeChip.value))
  const hasSaleProducts = computed(() => saleProducts.value.length > 0)

  function refreshTimer() {
    timer.value = getSaleCountdownSegments(resolveNow())
  }

  function selectChip(chip: SaleFilterChip) {
    activeChip.value = chip
  }

  function resetFilters() {
    activeChip.value = defaultSaleFilterChip
  }

  function startTimer() {
    refreshTimer()

    if (timerInterval || typeof window === 'undefined' || !setIntervalFn) return

    timerInterval = setIntervalFn(refreshTimer, SALE_TIMER_TICK_MS)
  }

  function stopTimer() {
    if (timerInterval && clearIntervalFn) {
      clearIntervalFn(timerInterval)
      timerInterval = null
    }
  }

  if (getCurrentInstance()) {
    onMounted(startTimer)
    onUnmounted(stopTimer)
  } else {
    refreshTimer()
  }

  return {
    chips: saleFilterChips,
    activeChip,
    saleProducts,
    hasSaleProducts,
    timer,
    selectChip,
    resetFilters,
    refreshTimer,
    startTimer,
    stopTimer,
  }
}
