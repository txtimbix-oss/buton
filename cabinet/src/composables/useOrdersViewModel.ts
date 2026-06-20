import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { SHOP_URL } from '@/api'
import { isActiveCabinetOrder } from '@/composables/useCabinetOrders'
import { useCabinetOrdersResource } from '@/composables/useCabinetOrdersResource'
import { useAuthStore } from '@/stores/auth'
import type { CabinetOrder, OrderStatus } from '@/types/order'

const PAGE_SIZE = 10

export type OrdersFilterValue = 'all' | 'active' | Extract<OrderStatus, 'delivered' | 'cancelled'>

export interface OrdersFilterOption {
  label: string
  value: OrdersFilterValue
}

export const ORDER_FILTERS: OrdersFilterOption[] = [
  { label: 'Все', value: 'all' },
  { label: 'Активные', value: 'active' },
  { label: 'Доставлен', value: 'delivered' },
  { label: 'Отменён', value: 'cancelled' },
]

export function useOrdersViewModel() {
  const auth = useAuthStore()
  const router = useRouter()
  const { orders, loading, loadOrders } = useCabinetOrdersResource()
  const activeFilter = ref<OrdersFilterValue>('all')
  const searchQuery = ref('')
  const page = ref(1)

  const filtered = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    let list: CabinetOrder[] = orders.value

    if (activeFilter.value === 'active') {
      list = list.filter(isActiveCabinetOrder)
    } else if (activeFilter.value !== 'all') {
      list = list.filter(order => order.status === activeFilter.value)
    }

    if (query) {
      list = list.filter(order => order.orderNumber.toLowerCase().includes(query))
    }

    return list
  })

  watch([activeFilter, searchQuery], () => {
    page.value = 1
  })

  const totalPages = computed(() => Math.ceil(filtered.value.length / PAGE_SIZE))
  const paginated = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

  const pageNumbers = computed(() => {
    const total = totalPages.value
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

    const currentPage = page.value
    const pages: number[] = [1]
    if (currentPage > 3) pages.push(-1)
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(total - 1, currentPage + 1); i += 1) {
      pages.push(i)
    }
    if (currentPage < total - 2) pages.push(-1)
    pages.push(total)
    return pages
  })

  function selectFilter(filter: OrdersFilterValue) {
    activeFilter.value = filter
    page.value = 1
  }

  function selectPage(nextPage: number) {
    page.value = nextPage
  }

  function previousPage() {
    page.value -= 1
  }

  function nextPage() {
    page.value += 1
  }

  function openOrder(id: string) {
    void router.push(`/orders/${id}`)
  }

  function pluralOrders(count: number) {
    const units = count % 10
    const dozens = count % 100
    if (units === 1 && dozens !== 11) return 'заказ'
    if ([2, 3, 4].includes(units) && ![12, 13, 14].includes(dozens)) return 'заказа'
    return 'заказов'
  }

  onMounted(async () => {
    try {
      await loadOrders({ force: true, userId: auth.user?._id })
    } catch {}
  })

  return {
    SHOP_URL,
    activeFilter,
    filtered,
    filters: ORDER_FILTERS,
    loading,
    nextPage,
    openOrder,
    orders,
    page,
    pageNumbers,
    paginated,
    pluralOrders,
    previousPage,
    searchQuery,
    selectFilter,
    selectPage,
    totalPages,
  }
}
