<template>
  <RouterView />

  <ChatWidget />

  <!-- Глобальные уведомления -->
  <div class="toasts">
    <div
      v-for="t in toastStore.toasts"
      :key="t.id"
      class="toast"
      :class="`toast--${t.type}`"
      @click="toastStore.remove(t.id)"
    >{{ t.message }}</div>
  </div>
</template>

<script setup lang="ts">
import { useRootViewportScale } from '@/composables/useRootViewportScale'
import { useToastStore } from '@/stores/toast'
import ChatWidget from '@/components/ChatWidget.vue'

const toastStore = useToastStore()
useRootViewportScale()
</script>
