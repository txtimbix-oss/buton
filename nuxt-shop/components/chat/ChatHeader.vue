<template>
  <div class="chat-box__head">
    <span class="chat-box__title">Чат с поддержкой</span>
    <button class="chat-box__close iconbtn" aria-label="Закрыть" @click="emit('close')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  close: []
}>()
</script>
