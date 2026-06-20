<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="cookie-slide">
        <div
          v-if="show"
          class="cookie is-show"
          aria-live="polite"
        >
          <p>
            Продолжая пользоваться сайтом, вы соглашаетесь с использованием cookie и
            <a href="#">политикой конфиденциальности</a>.
          </p>
          <button class="btn btn--green btn--sm" @click="accept">
            {{ settings.ui.cookie.buttonText || settings.cookieBtnText || 'Принять' }}
          </button>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
const settings = useSettings()
const show = ref(false)

onMounted(() => {
  if (!settings.value.ui.cookie.enabled) return
  if (!localStorage.getItem('cookie_accepted')) {
    setTimeout(() => { show.value = true }, 900)
  }
})

function accept() {
  localStorage.setItem('cookie_accepted', '1')
  show.value = false
}
</script>

<style scoped>
.cookie-slide-enter-active { transition: transform .35s cubic-bezier(.22,1,.36,1); }
.cookie-slide-leave-active { transition: transform .25s ease-in; }
.cookie-slide-enter-from, .cookie-slide-leave-to { transform: translateY(100%); }
</style>
