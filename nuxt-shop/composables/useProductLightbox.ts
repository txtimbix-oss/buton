import {
  onScopeDispose,
  ref,
  toValue,
  watchSyncEffect,
  type MaybeRefOrGetter,
} from 'vue'

import { stepProductGalleryIndex } from '~/lib/product/gallery'

type LightboxWindowTarget = Pick<Window, 'addEventListener' | 'removeEventListener'>
type LightboxDocumentTarget = Pick<Document, 'body'>

interface UseProductLightboxOptions {
  imageCount: MaybeRefOrGetter<number | undefined>
  window?: LightboxWindowTarget | undefined
  document?: LightboxDocumentTarget | undefined
}

export function useProductLightbox(options: UseProductLightboxOptions) {
  const LIGHTBOX_LOCK_CLASS = 'lightbox-scroll-lock'
  const isOpen = ref(false)
  const index = ref(0)

  const windowTarget = options.window ?? (typeof window !== 'undefined' ? window : undefined)
  const documentTarget = options.document ?? (typeof document !== 'undefined' ? document : undefined)

  function resolveImageCount() {
    const count = toValue(options.imageCount)
    return typeof count === 'number' && Number.isFinite(count) ? count : 1
  }

  function open(nextIndex: number) {
    index.value = nextIndex
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function step(direction: 1 | -1) {
    index.value = stepProductGalleryIndex(index.value, direction, resolveImageCount())
  }

  function onKeydown(event: KeyboardEvent) {
    if (!isOpen.value) return
    if (event.key === 'Escape') close()
    else if (event.key === 'ArrowLeft') step(-1)
    else if (event.key === 'ArrowRight') step(1)
  }

  windowTarget?.addEventListener('keydown', onKeydown)

  watchSyncEffect(() => {
    if (!documentTarget?.body) return
    documentTarget.body.classList.toggle(LIGHTBOX_LOCK_CLASS, isOpen.value)
  })

  onScopeDispose(() => {
    windowTarget?.removeEventListener('keydown', onKeydown)
    if (!documentTarget?.body) return
    documentTarget.body.classList.remove(LIGHTBOX_LOCK_CLASS)
  })

  return {
    isOpen,
    index,
    open,
    close,
    step,
  }
}
