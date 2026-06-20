<template>
  <div class="empty empty--center">
    <div v-if="$slots.icon" class="empty__icon">
      <slot name="icon" />
    </div>
    <h3 class="empty__title">{{ title }}</h3>
    <p v-if="text" class="empty__text">{{ text }}</p>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  text?: string
}>()
</script>
