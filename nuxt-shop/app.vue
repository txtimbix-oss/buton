<template>
  <!-- Хром страницы: вне NuxtPage — не участвует в page transition -->
  <AppTopBar />
  <AppHeader />

  <!-- Только контент страниц переходит с анимацией -->
  <!-- page-host: position:relative нужен чтобы leave-active(absolute) не улетал за экран -->
  <div class="page-host">
    <NuxtPage :transition="transition" />
  </div>

  <AppFooter />
  <MobileBottomNav />
  <CartDrawer />
  <CartToast />
  <ChatWidget />
  <CookieBanner />
  <PushPrompt />
</template>

<script setup lang="ts">
const { fetchUser, user } = useShopUser()
const { syncFromApi } = useWishlist()
const settings = useSettings()
const { openProactive } = useChat()

const EASING: Record<string, string> = {
  ease:   'ease',
  spring: 'cubic-bezier(0.34,1.56,0.64,1)',
  linear: 'linear',
  sharp:  'cubic-bezier(0.4,0,0.2,1)',
}
const SLIDE_ENTER: Record<string, string> = {
  left:  'translateX(-24px)',
  right: 'translateX(24px)',
  up:    'translateY(24px)',
  down:  'translateY(-24px)',
}
const SLIDE_LEAVE: Record<string, string> = {
  left:  'translateX(24px)',
  right: 'translateX(-24px)',
  up:    'translateY(-24px)',
  down:  'translateY(24px)',
}

const pageTransition = computed(() => settings.value.ui.pageTransition)
const proactiveChat = computed(() => settings.value.chat.proactive)

const transition = computed(() => {
  const advanced = pageTransition.value.advanced
  const effect   = pageTransition.value.effect
  if (!advanced && effect === 'none') return false
  const modeVal = pageTransition.value.mode || 'default'
  // mode:'default' = undefined для Vue Transition (обе анимации одновременно)
  const mode = (modeVal === 'default' ? undefined : modeVal) as 'out-in' | 'in-out' | undefined
  return mode ? { name: 'page-t', mode } : { name: 'page-t' }
})

useHead(computed(() => {
  const advanced = pageTransition.value.advanced
  const dur  = String(pageTransition.value.durationMs || 220)
  const ease = EASING[pageTransition.value.easing] ?? 'var(--ease, ease)'
  let css: string

  if (advanced) {
    const fallbackActive  = pageTransition.value.activeCss || `transition:all ${dur}ms ${ease}`
    const enterActiveCss  = (pageTransition.value.activeCss || fallbackActive).replace(/\n/g, ' ')
    const leaveActiveCss  = (pageTransition.value.activeCss || fallbackActive).replace(/\n/g, ' ')
    const leaveCss        = (pageTransition.value.leaveCss  || 'opacity:0').replace(/\n/g, ' ')
    const enterCss        = (pageTransition.value.enterCss  || 'opacity:0').replace(/\n/g, ' ')
    css = `.page-t-enter-active{${enterActiveCss}}`
        + `.page-t-leave-active{${leaveActiveCss}}`
        + `.page-t-leave-to{${leaveCss}}`
        + `.page-t-enter-from{${enterCss}}`
  } else {
    const effect = pageTransition.value.effect
    const dir    = pageTransition.value.dir
    let enterFrom = 'translateY(8px)'
    let leaveTo   = 'translateY(-8px)'
    if (effect === 'fade')  { enterFrom = 'translateY(0)'; leaveTo = 'translateY(0)' }
    if (effect === 'rise')  { enterFrom = 'translateY(12px)'; leaveTo = 'translateY(-6px)' }
    if (effect === 'zoom')  { enterFrom = 'scale(0.97)'; leaveTo = 'scale(1.03)' }
    if (effect === 'slide') {
      enterFrom = SLIDE_ENTER[dir] ?? 'translateX(-24px)'
      leaveTo   = SLIDE_LEAVE[dir] ?? 'translateX(24px)'
    }
    css = `:root{--pt-dur:${dur}ms;--pt-ease:${ease};--pt-enter-from:${enterFrom};--pt-leave-to:${leaveTo}}`
  }

  return { style: [{ innerHTML: css, id: 'pt-vars' }] }
}))

let proactiveTimer:  ReturnType<typeof setTimeout> | null = null
let exitIntentBound: ((e: MouseEvent) => void) | null = null

function setupProactiveChat() {
  if (sessionStorage.getItem('chat_proactive')) return
  if (!proactiveChat.value.enabled) return
  const delay = Math.max(1, proactiveChat.value.delaySeconds || 30)
  const msg   = proactiveChat.value.message.trim() || undefined

  function fire() {
    if (sessionStorage.getItem('chat_proactive')) return
    sessionStorage.setItem('chat_proactive', '1')
    if (proactiveTimer) { clearTimeout(proactiveTimer); proactiveTimer = null }
    if (exitIntentBound) { document.removeEventListener('mouseleave', exitIntentBound); exitIntentBound = null }
    openProactive(msg)
  }

  proactiveTimer = setTimeout(fire, delay * 1000)

  exitIntentBound = (e: MouseEvent) => { if (e.clientY <= 0) fire() }
  document.addEventListener('mouseleave', exitIntentBound)
}

onMounted(async () => {
  await fetchUser()
  if (user.value) syncFromApi()
  setupProactiveChat()
})

onUnmounted(() => {
  if (proactiveTimer) clearTimeout(proactiveTimer)
  if (exitIntentBound) document.removeEventListener('mouseleave', exitIntentBound)
})
</script>
