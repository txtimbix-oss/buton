import {
  getCurrentInstance,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
  type Ref,
} from 'vue'

export interface UseHeaderUiStateDeps {
  cartCount: Ref<number>
  navigate: (path: string) => Promise<void> | void
  getScrollY?: () => number
  focusSearch?: () => void
  setTimeoutFn?: (callback: () => void, ms: number) => unknown
}

export function useHeaderUiState(deps: UseHeaderUiStateDeps) {
  const getScrollY = deps.getScrollY ?? (() => (typeof window !== 'undefined' ? window.scrollY : 0))
  const setTimer = deps.setTimeoutFn ?? ((callback: () => void, ms: number) => setTimeout(callback, ms))

  const menuOpen = ref(false)
  const showSearch = ref(false)
  const searchQ = ref('')
  const cartBump = ref(false)
  const isStuck = ref(false)

  watch(deps.cartCount, () => {
    cartBump.value = true
    setTimer(() => { cartBump.value = false }, 500)
  })

  function handleScroll() {
    isStuck.value = getScrollY() > 8
  }

  function openSearch() {
    showSearch.value = true
    nextTick(() => deps.focusSearch?.())
  }

  function closeSearch() {
    showSearch.value = false
    searchQ.value = ''
  }

  function goSearch() {
    if (searchQ.value.trim().length < 2) return
    deps.navigate(`/catalog?q=${encodeURIComponent(searchQ.value.trim())}`)
    closeSearch()
  }

  if (getCurrentInstance()) {
    onMounted(() => {
      handleScroll()
      window.addEventListener('scroll', handleScroll, { passive: true })
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })
  }

  return {
    menuOpen,
    showSearch,
    searchQ,
    cartBump,
    isStuck,
    handleScroll,
    openSearch,
    closeSearch,
    goSearch,
  }
}
