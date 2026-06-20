<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="toast-pop">
        <div v-if="visible" class="toast is-show" role="status" aria-live="polite">
          <span class="toast__ico">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>
          </span>
          <p>{{ message }}</p>
          <NuxtLink to="/cart">В корзину</NuxtLink>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
const { message, visible } = useToast()
</script>

<style scoped>
.toast-pop-enter-active, .toast-pop-leave-active { transition: all .3s cubic-bezier(.2,.7,.3,1); }
.toast-pop-enter-from, .toast-pop-leave-to       { opacity: 0; transform: translateY(12px) scale(.97); }
</style>
