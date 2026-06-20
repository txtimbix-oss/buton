<template>
  <button
    class="chat"
    :class="{ 'chat--open': isOpen }"
    aria-label="Открыть чат"
    @click="emit('toggle')"
  >
    <svg v-if="!isOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
    <span v-if="unread > 0 && !isOpen" class="chat-badge">{{ unread > 9 ? '9+' : unread }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  unread: number
}>()

const emit = defineEmits<{
  toggle: []
}>()
</script>
