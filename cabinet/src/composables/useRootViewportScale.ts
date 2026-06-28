import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const DESIGN_WIDTH_PX = 1320
const ZOOM_PROBE_LAYOUT_THRESHOLD_PX = 150
const ROOT_SCALE_CLASS = 'cb-root-scale'
const ROOT_SCALE_ZOOM_CLASS = 'cb-root-scale--zoom'
const ROOT_SCALE_TRANSFORM_CLASS = 'cb-root-scale--transform'
const ZOOM_PROBE_CLASS = 'cb-root-scale-probe'

let cachedZoomLayoutSupport: boolean | null = null

function resetDocumentRootStyles(root: HTMLElement) {
  root.classList.remove(ROOT_SCALE_CLASS, ROOT_SCALE_ZOOM_CLASS, ROOT_SCALE_TRANSFORM_CLASS)
}

function zoomAffectsLayout(): boolean {
  if (cachedZoomLayoutSupport !== null) return cachedZoomLayoutSupport

  const probe = document.createElement('div')
  probe.className = ZOOM_PROBE_CLASS
  document.body.appendChild(probe)

  cachedZoomLayoutSupport =
    probe.getBoundingClientRect().width > ZOOM_PROBE_LAYOUT_THRESHOLD_PX

  probe.remove()

  return cachedZoomLayoutSupport
}

function applyDocumentRootScale(root: HTMLElement, viewportWidth: number) {
  resetDocumentRootStyles(root)
  if (viewportWidth <= DESIGN_WIDTH_PX) return

  root.classList.add(ROOT_SCALE_CLASS)
  root.classList.add(zoomAffectsLayout() ? ROOT_SCALE_ZOOM_CLASS : ROOT_SCALE_TRANSFORM_CLASS)
}

export function useRootViewportScale() {
  const route = useRoute()

  // Страницы авторизации (meta.public) — полноэкранный дизайн на 100vh.
  // Зум фикс-макета 1320px их ломает (раздувает выше экрана), поэтому на них скейл выключаем.
  const isFullscreenRoute = () => Boolean(route?.meta?.public)

  const handleResize = () => {
    if (isFullscreenRoute()) {
      resetDocumentRootStyles(document.documentElement)
      return
    }
    applyDocumentRootScale(document.documentElement, window.innerWidth)
  }

  onMounted(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
  })

  // пересчитываем при переходе auth <-> кабинет
  watch(() => route?.fullPath, handleResize)

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    resetDocumentRootStyles(document.documentElement)
  })
}
