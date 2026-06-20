<template>
  <div class="chat-box">
    <ChatHeader @close="emit('close')" />
    <slot />
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  close: []
}>()
</script>
