import {
  nextTick as vueNextTick,
  onMounted as vueOnMounted,
  onScopeDispose,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'

import type {
  PopupDialogLike,
  PopupFocusableElement,
  PopupStorageReader,
  PopupStorageWriter,
} from '~/lib/home/popup'
import {
  HOME_POPUP_DELAY_MS,
  HOME_POPUP_TITLE_ID,
  hasSeenHomePopup,
  markHomePopupSeen,
  resolveHomePopupKeydown,
  shouldShowHomePopup,
} from '~/lib/home/popup'

type PopupBannerLike = { _id?: string } | null | undefined
type PopupStorage = PopupStorageReader & PopupStorageWriter
type HomePopupDocument = Pick<Document, 'activeElement'>

export interface UseHomePopupOptions {
  popupBanner: MaybeRefOrGetter<PopupBannerLike>
  storage?: PopupStorage | undefined
  document?: HomePopupDocument | undefined
  setTimeout?: typeof globalThis.setTimeout
  clearTimeout?: typeof globalThis.clearTimeout
  nextTick?: () => Promise<void>
  onMounted?: (callback: () => void) => void
}

function resolveClientStorage(): PopupStorage | undefined {
  if (typeof sessionStorage === 'undefined') return undefined
  return sessionStorage
}

function resolveClientDocument(): HomePopupDocument | undefined {
  if (typeof document === 'undefined') return undefined
  return document
}

function isFocusableElement(value: unknown): value is PopupFocusableElement {
  return typeof (value as PopupFocusableElement | null | undefined)?.focus === 'function'
}

export function useHomePopup(options: UseHomePopupOptions) {
  const popupVisible = ref(false)
  const popupDialog = ref<HTMLElement | null>(null)
  const popupCloseButton = ref<HTMLButtonElement | null>(null)
  const lastFocusedElement: Ref<PopupFocusableElement | null> = ref(null)
  const popupTitleId = HOME_POPUP_TITLE_ID

  const storage = options.storage ?? resolveClientStorage()
  const documentTarget = options.document ?? resolveClientDocument()
  const setTimer = options.setTimeout ?? globalThis.setTimeout.bind(globalThis)
  const clearTimer = options.clearTimeout ?? globalThis.clearTimeout.bind(globalThis)
  const nextTick = options.nextTick ?? vueNextTick
  const onMounted = options.onMounted ?? vueOnMounted
  let openTimer: ReturnType<typeof setTimeout> | null = null

  onMounted(() => {
    if (!storage) return

    if (shouldShowHomePopup(toValue(options.popupBanner), hasSeenHomePopup(storage))) {
      openTimer = setTimer(() => {
        popupVisible.value = true
      }, HOME_POPUP_DELAY_MS)
    }
  })

  watch(popupVisible, async (visible) => {
    if (visible) {
      lastFocusedElement.value = isFocusableElement(documentTarget?.activeElement)
        ? documentTarget.activeElement
        : null

      await nextTick()
      popupCloseButton.value?.focus()
      return
    }

    lastFocusedElement.value?.focus()
  })

  onScopeDispose(() => {
    if (openTimer !== null) {
      clearTimer(openTimer)
    }
  })

  function closePopup() {
    popupVisible.value = false

    if (storage) {
      markHomePopupSeen(storage)
    }
  }

  function handlePopupKeydown(event: KeyboardEvent) {
    const result = resolveHomePopupKeydown({
      key: event.key,
      shiftKey: event.shiftKey,
      dialog: popupDialog.value as PopupDialogLike | null,
      activeElement: documentTarget?.activeElement ?? null,
    })

    if (!result.preventDefault && !result.shouldClose && !result.focusTarget) return

    if (result.preventDefault) {
      event.preventDefault()
    }

    if (result.shouldClose) {
      closePopup()
      return
    }

    if (result.focusTarget === 'dialog') {
      popupDialog.value?.focus()
      return
    }

    result.focusTarget?.focus()
  }

  return {
    popupVisible,
    popupDialog,
    popupCloseButton,
    popupTitleId,
    closePopup,
    handlePopupKeydown,
  }
}
