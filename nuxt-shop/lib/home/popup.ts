export const HOME_POPUP_SESSION_KEY = 'spb_popup_seen'
export const HOME_POPUP_TITLE_ID = 'home-popup-title'
export const HOME_POPUP_DELAY_MS = 1500
export const HOME_POPUP_FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export interface PopupStorageReader {
  getItem(key: string): string | null
}

export interface PopupStorageWriter {
  setItem(key: string, value: string): void
}

export interface PopupFocusableElement {
  focus(): void
}

export interface PopupDialogLike {
  querySelectorAll<T extends PopupFocusableElement = PopupFocusableElement>(selector: string): ArrayLike<T> | Iterable<T>
}

export type PopupFocusTarget = PopupFocusableElement | 'dialog' | null

export interface HomePopupKeydownInput {
  key: string
  shiftKey: boolean
  dialog: PopupDialogLike | null
  activeElement: unknown
}

export interface HomePopupKeydownResult {
  preventDefault: boolean
  shouldClose: boolean
  focusTarget: PopupFocusTarget
}

export function shouldShowHomePopup(
  popupBanner: { _id?: string } | null | undefined,
  popupSeen: boolean,
): boolean {
  return Boolean(popupBanner && !popupSeen)
}

export function hasSeenHomePopup(
  storage: PopupStorageReader,
  sessionKey = HOME_POPUP_SESSION_KEY,
): boolean {
  return storage.getItem(sessionKey) === '1'
}

export function markHomePopupSeen(
  storage: PopupStorageWriter,
  sessionKey = HOME_POPUP_SESSION_KEY,
): void {
  storage.setItem(sessionKey, '1')
}

export function getPopupFocusableElements(
  dialog: PopupDialogLike | null,
): PopupFocusableElement[] {
  if (!dialog) return []

  return Array.from(
    dialog.querySelectorAll<PopupFocusableElement>(HOME_POPUP_FOCUSABLE_SELECTOR),
  )
}

export function resolveHomePopupKeydown({
  key,
  shiftKey,
  dialog,
  activeElement,
}: HomePopupKeydownInput): HomePopupKeydownResult {
  if (key === 'Escape') {
    return {
      preventDefault: true,
      shouldClose: true,
      focusTarget: null,
    }
  }

  if (key !== 'Tab') {
    return {
      preventDefault: false,
      shouldClose: false,
      focusTarget: null,
    }
  }

  const focusableElements = getPopupFocusableElements(dialog)

  if (!focusableElements.length) {
    return {
      preventDefault: true,
      shouldClose: false,
      focusTarget: 'dialog',
    }
  }

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (shiftKey && activeElement === firstElement) {
    return {
      preventDefault: true,
      shouldClose: false,
      focusTarget: lastElement,
    }
  }

  if (!shiftKey && activeElement === lastElement) {
    return {
      preventDefault: true,
      shouldClose: false,
      focusTarget: firstElement,
    }
  }

  return {
    preventDefault: false,
    shouldClose: false,
    focusTarget: null,
  }
}

export function getPromoCopyMessage(code: string, copied: boolean): string {
  return copied ? `Промокод ${code} скопирован` : 'Не удалось скопировать промокод'
}
